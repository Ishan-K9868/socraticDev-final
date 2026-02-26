"""Deterministic Python code analysis for visualizer modes."""

from __future__ import annotations

import ast
import json
import logging
import subprocess
import sys
import textwrap
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Literal, Optional, Tuple

from ..config.settings import settings

AnalyzerMode = Literal["graph", "execution"]

VALID_NODE_TYPES = {"function", "class", "method", "variable", "module"}
VALID_EDGE_TYPES = {"calls", "imports", "extends", "uses"}
VALID_ACTIONS = {"execute", "call", "return", "assign", "condition", "loop"}

logger = logging.getLogger(__name__)


@dataclass
class AnalysisMeta:
    engine: str
    truncated: bool
    limits: Dict[str, int]
    duration_ms: int


class _DefinitionCollector(ast.NodeVisitor):
    def __init__(self) -> None:
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.name_to_ids: Dict[str, List[str]] = {}
        self.scope: List[Tuple[str, str, str]] = []
        self._add_node("module:main", "main", "module", 1)
        self.scope.append(("module", "main", "module:main"))

    def _add_node(self, node_id: str, name: str, node_type: str, line: int) -> None:
        if node_id in self.nodes:
            return
        self.nodes[node_id] = {
            "id": node_id,
            "name": name,
            "type": node_type if node_type in VALID_NODE_TYPES else "function",
            "line": max(int(line), 1),
        }
        short_name = name.split(".")[-1]
        self.name_to_ids.setdefault(short_name, []).append(node_id)

    def _qualified(self, name: str) -> str:
        parts = [entry[1] for entry in self.scope if entry[0] != "module"]
        parts.append(name)
        return ".".join(parts)

    def visit_ClassDef(self, node: ast.ClassDef) -> Any:
        qname = self._qualified(node.name)
        node_id = f"class:{qname}"
        self._add_node(node_id, qname, "class", getattr(node, "lineno", 1))

        self.scope.append(("class", node.name, node_id))
        self.generic_visit(node)
        self.scope.pop()

    def visit_FunctionDef(self, node: ast.FunctionDef) -> Any:
        self._visit_function(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> Any:
        self._visit_function(node)

    def _visit_function(self, node: ast.AST) -> None:
        name = getattr(node, "name", "function")
        qname = self._qualified(name)
        in_class = any(kind == "class" for kind, _, _ in self.scope)
        node_type = "method" if in_class else "function"
        prefix = "method" if in_class else "func"
        node_id = f"{prefix}:{qname}"
        self._add_node(node_id, qname, node_type, getattr(node, "lineno", 1))

        self.scope.append(("function", name, node_id))
        self.generic_visit(node)
        self.scope.pop()


class _EdgeCollector(ast.NodeVisitor):
    def __init__(self, definitions: _DefinitionCollector) -> None:
        self.nodes = definitions.nodes
        self.name_to_ids = definitions.name_to_ids
        self.edges: set[Tuple[str, str, str]] = set()
        self.scope: List[str] = ["module:main"]
        self.import_aliases: Dict[str, str] = {}
        self.class_names = {
            str(node.get("name", "")): node_id
            for node_id, node in self.nodes.items()
            if node_id.startswith("class:")
        }

    def _current_scope(self) -> str:
        return self.scope[-1]

    def _ensure_external(self, raw_name: str, node_type: str = "function") -> str:
        clean = raw_name.strip() or "unknown"
        if node_type == "module":
            node_id = f"module:{clean}"
            display = clean
        elif node_type == "class":
            node_id = f"external_class:{clean}"
            display = clean
        else:
            node_id = f"external_func:{clean}"
            display = clean

        if node_id not in self.nodes:
            self.nodes[node_id] = {
                "id": node_id,
                "name": display,
                "type": node_type if node_type in VALID_NODE_TYPES else "function",
                "line": 0,
            }
        return node_id

    def _add_edge(self, source: str, target: str, edge_type: str) -> None:
        et = edge_type if edge_type in VALID_EDGE_TYPES else "calls"
        if source and target and source in self.nodes and target in self.nodes:
            self.edges.add((source, target, et))

    def _current_class_id(self) -> Optional[str]:
        for sid in reversed(self.scope):
            if sid.startswith("class:"):
                return sid
        return None

    def _resolve_name(self, name: str) -> Optional[str]:
        candidates = self.name_to_ids.get(name, [])
        if not candidates:
            return None

        reverse_scope = list(reversed(self.scope))
        current_class_id = self._current_class_id()
        current_class_name = self.nodes.get(current_class_id, {}).get("name", "") if current_class_id else ""
        ranked: List[Tuple[int, int, str]] = []
        for candidate_id in candidates:
            candidate_name = str(self.nodes.get(candidate_id, {}).get("name", ""))
            lexical_score = -1
            for idx, scope_id in enumerate(reverse_scope):
                scope_name = str(self.nodes.get(scope_id, {}).get("name", ""))
                if candidate_name == f"{scope_name}.{name}":
                    lexical_score = max(lexical_score, len(reverse_scope) - idx)
            if candidate_name == name:
                lexical_score = max(lexical_score, 0)

            class_bonus = 0
            if current_class_name and candidate_id.startswith("method:") and candidate_name.startswith(f"{current_class_name}."):
                class_bonus = 100

            ranked.append((lexical_score + class_bonus, -len(candidate_name.split(".")), candidate_id))

        ranked.sort(reverse=True)
        return ranked[0][2]

    def _resolve_attribute_call(self, root: str, tail: str) -> Optional[str]:
        """Resolve dotted call targets with conservative scope-aware rules."""
        short = tail.split(".")[-1]

        # ClassName.method() where ClassName is known in graph.
        class_id = self.class_names.get(root)
        if class_id:
            class_name = str(self.nodes.get(class_id, {}).get("name", root))
            method_id = f"method:{class_name}.{short}"
            if method_id in self.nodes:
                return method_id

        # Imported module or symbol aliases.
        if root in self.import_aliases:
            alias_target = self.import_aliases[root]
            return self._ensure_external(f"{alias_target}.{tail}", "function")

        # Unknown attribute roots are treated as unresolved external calls
        # instead of guessing a local symbol by tail name.
        return None

    def _call_name(self, func: ast.AST) -> Optional[str]:
        if isinstance(func, ast.Name):
            return func.id
        if isinstance(func, ast.Attribute):
            parts: List[str] = []
            cur: ast.AST = func
            while isinstance(cur, ast.Attribute):
                parts.append(cur.attr)
                cur = cur.value
            if isinstance(cur, ast.Name):
                parts.append(cur.id)
                return ".".join(reversed(parts))
        return None

    def visit_Import(self, node: ast.Import) -> Any:
        source = self._current_scope()
        for alias in node.names:
            module_name = alias.name
            target = self._ensure_external(module_name, "module")
            self._add_edge(source, target, "imports")
            local_alias = alias.asname or module_name.split(".")[0]
            self.import_aliases[local_alias] = module_name

    def visit_ImportFrom(self, node: ast.ImportFrom) -> Any:
        source = self._current_scope()
        module_name = node.module or ""
        if module_name:
            target = self._ensure_external(module_name, "module")
            self._add_edge(source, target, "imports")
        for alias in node.names:
            local_alias = alias.asname or alias.name
            if module_name:
                self.import_aliases[local_alias] = f"{module_name}.{alias.name}"

    def visit_ClassDef(self, node: ast.ClassDef) -> Any:
        qname_parts = []
        for sid in self.scope[1:]:
            if sid.startswith("class:") or sid.startswith("func:") or sid.startswith("method:"):
                qname_parts.append(self.nodes[sid]["name"].split(".")[-1])
        qname_parts.append(node.name)
        current_id = f"class:{'.'.join(qname_parts)}"

        if current_id in self.nodes:
            for base in node.bases:
                base_name = None
                if isinstance(base, ast.Name):
                    base_name = base.id
                elif isinstance(base, ast.Attribute):
                    base_name = self._call_name(base)
                if not base_name:
                    continue
                target_id = self._resolve_name(base_name.split(".")[-1])
                if not target_id:
                    target_id = self._ensure_external(base_name, "class")
                self._add_edge(current_id, target_id, "extends")

        self.scope.append(current_id)
        self.generic_visit(node)
        self.scope.pop()

    def visit_FunctionDef(self, node: ast.FunctionDef) -> Any:
        self._visit_function(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> Any:
        self._visit_function(node)

    def _visit_function(self, node: ast.AST) -> None:
        name = getattr(node, "name", "function")
        parent = self._current_scope()
        if parent.startswith("class:"):
            current_id = f"method:{self.nodes[parent]['name']}.{name}"
        else:
            prefix = "func"
            parent_name = self.nodes[parent]["name"]
            if parent.startswith("func:") or parent.startswith("method:"):
                current_id = f"func:{parent_name}.{name}"
            else:
                current_id = f"{prefix}:{name}"

        if current_id in self.nodes:
            self.scope.append(current_id)
            self.generic_visit(node)
            self.scope.pop()
        else:
            self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> Any:
        source = self._current_scope()
        call_name = self._call_name(node.func)
        if call_name:
            target_id: Optional[str] = None

            if "." in call_name:
                root = call_name.split(".", 1)[0]
                tail = call_name.split(".", 1)[1]
                if root in {"self", "cls"}:
                    current_class_id = self._current_class_id()
                    if current_class_id:
                        class_name = str(self.nodes[current_class_id]["name"])
                        method_id = f"method:{class_name}.{tail.split('.')[-1]}"
                        if method_id in self.nodes:
                            target_id = method_id
                    if not target_id:
                        target_id = self._resolve_name(tail.split(".")[-1])
                else:
                    target_id = self._resolve_attribute_call(root, tail)
            else:
                if call_name in self.import_aliases:
                    target_id = self._ensure_external(self.import_aliases[call_name], "function")
                else:
                    target_id = self._resolve_name(call_name)

            if not target_id:
                target_id = self._ensure_external(call_name, "function")

            self._add_edge(source, target_id, "calls")

        self.generic_visit(node)


def _build_line_actions(code: str) -> Dict[int, str]:
    tree = ast.parse(code)
    line_actions: Dict[int, str] = {}
    priorities = {
        "execute": 0,
        "call": 1,
        "assign": 2,
        "condition": 3,
        "loop": 4,
        "return": 5,
    }

    def set_action(line: int, action: str) -> None:
        if line <= 0:
            return
        prev = line_actions.get(line, "execute")
        if priorities[action] >= priorities.get(prev, 0):
            line_actions[line] = action

    for node in ast.walk(tree):
        line = getattr(node, "lineno", 0)
        if not line:
            continue

        if isinstance(node, (ast.Assign, ast.AugAssign, ast.AnnAssign, ast.NamedExpr)):
            set_action(line, "assign")
        elif isinstance(node, (ast.If, ast.IfExp, ast.Compare, ast.BoolOp, ast.Match)):
            set_action(line, "condition")
        elif isinstance(node, (ast.For, ast.AsyncFor, ast.While, ast.comprehension)):
            set_action(line, "loop")
        elif isinstance(node, ast.Return):
            set_action(line, "return")
        elif isinstance(node, ast.Call):
            set_action(line, "call")
        else:
            set_action(line, "execute")

    return line_actions


_TRACE_RUNNER_SCRIPT = textwrap.dedent(
    """
    import io
    import json
    import sys
    import traceback
    from contextlib import redirect_stdout, redirect_stderr

    try:
        import resource
    except Exception:
        resource = None

    payload = json.loads(sys.stdin.read())
    code = payload["code"]
    max_steps = int(payload.get("max_steps", 1000))
    line_actions = {int(k): str(v) for k, v in payload.get("line_actions", {}).items()}
    timeout_ms = int(payload.get("timeout_ms", 3000))

    if resource is not None:
        try:
            cpu_limit = max(1, timeout_ms // 1000 + 1)
            resource.setrlimit(resource.RLIMIT_CPU, (cpu_limit, cpu_limit + 1))
            mem_limit = 256 * 1024 * 1024
            resource.setrlimit(resource.RLIMIT_AS, (mem_limit, mem_limit))
            resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024))
        except Exception:
            pass

    allowed_imports = {
        "math", "itertools", "functools", "collections", "statistics", "random"
    }

    def restricted_import(name, globals=None, locals=None, fromlist=(), level=0):
        root = name.split(".")[0]
        if root not in allowed_imports:
            raise ImportError(f"Import '{root}' is blocked in visualizer sandbox")
        return __import__(name, globals, locals, fromlist, level)

    safe_builtins = {
        "abs": abs,
        "all": all,
        "any": any,
        "bool": bool,
        "__build_class__": __build_class__,
        "getattr": getattr,
        "hasattr": hasattr,
        "dict": dict,
        "enumerate": enumerate,
        "float": float,
        "int": int,
        "isinstance": isinstance,
        "issubclass": issubclass,
        "len": len,
        "list": list,
        "map": map,
        "max": max,
        "min": min,
        "object": object,
        "print": print,
        "range": range,
        "reversed": reversed,
        "round": round,
        "set": set,
        "sorted": sorted,
        "str": str,
        "sum": sum,
        "tuple": tuple,
        "type": type,
        "zip": zip,
        "Exception": Exception,
        "ValueError": ValueError,
        "TypeError": TypeError,
        "KeyError": KeyError,
        "IndexError": IndexError,
        "ZeroDivisionError": ZeroDivisionError,
        "__import__": restricted_import,
    }

    def safe_repr(value, max_len=200):
        try:
            text = repr(value)
        except Exception:
            text = f"<{type(value).__name__}>"
        if len(text) > max_len:
            return text[:max_len] + "..."
        return text

    def snapshot_locals(locals_map, limit=50):
        out = {}
        count = 0
        for key, value in locals_map.items():
            if str(key).startswith("__"):
                continue
            out[str(key)] = safe_repr(value)
            count += 1
            if count >= limit:
                break
        return out

    step_descriptions = {
        "execute": "Execute statement",
        "call": "Call function",
        "return": "Return from function",
        "assign": "Assign value",
        "condition": "Evaluate condition",
        "loop": "Iterate loop",
    }

    steps = []
    call_stack = []
    truncated = False
    error = None
    error_code = None
    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()
    output_len = 0

    def append_step(frame, action, description):
        global truncated, output_len
        if len(steps) >= max_steps:
            truncated = True
            return False

        line = int(getattr(frame, "f_lineno", 1))
        variables = snapshot_locals(frame.f_locals)
        out = stdout_buffer.getvalue()
        delta = out[output_len:] if len(out) > output_len else ""
        output_len = len(out)

        step = {
            "line": max(line, 1),
            "action": action,
            "description": description,
            "variables": variables,
            "callStack": list(call_stack),
        }
        if delta.strip():
            step["output"] = delta.rstrip("\\n")
        steps.append(step)
        return True

    def tracer(frame, event, arg):
        global truncated, error, error_code

        if frame.f_code.co_filename != "<user_code>":
            return tracer

        if truncated:
            return None

        if event == "call":
            fn = frame.f_code.co_name
            call_stack.append(fn)
            append_step(frame, "call", f"Call {fn}()")
            return tracer

        if event == "line":
            line = int(getattr(frame, "f_lineno", 1))
            action = line_actions.get(line, "execute")
            if action not in {"execute", "call", "return", "assign", "condition", "loop"}:
                action = "execute"
            append_step(frame, action, step_descriptions.get(action, "Execute statement"))
            return tracer

        if event == "return":
            fn = frame.f_code.co_name
            append_step(frame, "return", f"Return from {fn}()")
            if call_stack:
                call_stack.pop()
            return tracer

        if event == "exception":
            exc_type, exc_value, _ = arg
            append_step(frame, "execute", f"Exception {exc_type.__name__}: {exc_value}")
            error = f"{exc_type.__name__}: {exc_value}"
            error_code = "runtime_error"
            return tracer

        return tracer

    globals_env = {"__builtins__": safe_builtins, "__name__": "__main__"}

    try:
        compiled = compile(code, "<user_code>", "exec")
        sys.settrace(tracer)
        with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
            exec(compiled, globals_env, globals_env)
    except Exception as exc:
        if not error:
            error = f"{type(exc).__name__}: {exc}"
            error_code = "runtime_error"
    finally:
        sys.settrace(None)

    stderr_text = stderr_buffer.getvalue().strip()
    if stderr_text and not error:
        error = stderr_text
        error_code = "runtime_error"

    print(json.dumps({
        "steps": steps,
        "finalOutput": stdout_buffer.getvalue(),
        "error": error,
        "error_code": error_code,
        "truncated": truncated,
    }))
    """
)


class VisualizerAIService:
    """Deterministic visualizer service (name kept for compatibility)."""

    engine_name = "python_deterministic"

    async def analyze(
        self,
        mode: AnalyzerMode,
        code: str,
        language: str,
        max_steps: int = settings.visualizer_default_max_steps,
        timeout_ms: int = settings.visualizer_default_timeout_ms,
    ) -> Dict[str, Any]:
        started = time.perf_counter()

        normalized_language = (language or "").strip().lower()
        if normalized_language != "python":
            raise ValueError("Visualizer currently supports only Python")
        if mode not in {"graph", "execution"}:
            raise ValueError("Invalid mode")
        if not code.strip():
            raise ValueError("Code is required")
        if len(code) > settings.visualizer_max_code_chars:
            raise ValueError(f"Code exceeds maximum size ({settings.visualizer_max_code_chars} characters)")

        max_steps = max(1, min(int(max_steps), settings.visualizer_max_steps_cap))
        timeout_ms = max(100, min(int(timeout_ms), settings.visualizer_max_timeout_ms))

        try:
            if mode == "graph":
                payload = self._analyze_call_graph(code)
                meta = AnalysisMeta(
                    engine=self.engine_name,
                    truncated=False,
                    limits={"max_steps": max_steps, "timeout_ms": timeout_ms},
                    duration_ms=int((time.perf_counter() - started) * 1000),
                )
                payload["meta"] = {
                    "engine": meta.engine,
                    "truncated": meta.truncated,
                    "limits": meta.limits,
                    "duration_ms": meta.duration_ms,
                }
                return payload

            payload = self._analyze_execution_trace(code, max_steps=max_steps, timeout_ms=timeout_ms)
            meta = AnalysisMeta(
                engine=self.engine_name,
                truncated=bool(payload.get("truncated", False)),
                limits={"max_steps": max_steps, "timeout_ms": timeout_ms},
                duration_ms=int((time.perf_counter() - started) * 1000),
            )
            payload["meta"] = {
                "engine": meta.engine,
                "truncated": meta.truncated,
                "limits": meta.limits,
                "duration_ms": meta.duration_ms,
            }
            return payload
        except SyntaxError as exc:
            line = exc.lineno or 1
            message = exc.msg or "invalid syntax"
            raise ValueError(f"Syntax error at line {line}: {message}") from exc
        except Exception:
            logger.exception("Visualizer analysis failed")
            raise

    def _analyze_call_graph(self, code: str) -> Dict[str, Any]:
        tree = ast.parse(code)

        defs = _DefinitionCollector()
        defs.visit(tree)

        edge_collector = _EdgeCollector(defs)
        edge_collector.visit(tree)

        nodes = sorted(edge_collector.nodes.values(), key=lambda n: (int(n.get("line", 0)), str(n.get("id", ""))))
        edges = [
            {"from": source, "to": target, "type": edge_type}
            for source, target, edge_type in sorted(edge_collector.edges, key=lambda e: (e[0], e[1], e[2]))
        ]

        return {"nodes": nodes, "edges": edges}

    def _analyze_execution_trace(self, code: str, max_steps: int, timeout_ms: int) -> Dict[str, Any]:
        line_actions = _build_line_actions(code)
        payload = {
            "code": code,
            "line_actions": line_actions,
            "max_steps": max_steps,
            "timeout_ms": timeout_ms,
        }

        process = subprocess.Popen(
            [sys.executable, "-I", "-c", _TRACE_RUNNER_SCRIPT],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        try:
            stdout, stderr = process.communicate(json.dumps(payload), timeout=timeout_ms / 1000.0)
        except subprocess.TimeoutExpired:
            process.kill()
            return {
                "steps": [],
                "finalOutput": "",
                "error": f"Execution timed out after {timeout_ms} ms",
                "error_code": "timeout",
                "truncated": True,
            }

        if process.returncode != 0 and not stdout.strip():
            return {
                "steps": [],
                "finalOutput": "",
                "error": (stderr or "Execution subprocess failed").strip(),
                "error_code": "runtime_error",
                "truncated": False,
            }

        try:
            raw = json.loads(stdout)
        except json.JSONDecodeError:
            return {
                "steps": [],
                "finalOutput": "",
                "error": "Failed to decode execution trace output",
                "error_code": "internal_error",
                "truncated": False,
            }

        raw_steps = raw.get("steps") if isinstance(raw.get("steps"), list) else []
        steps: List[Dict[str, Any]] = []
        for item in raw_steps:
            if not isinstance(item, dict):
                continue
            try:
                line = int(item.get("line", 1))
            except (TypeError, ValueError):
                continue
            action = str(item.get("action", "execute")).strip().lower()
            if action not in VALID_ACTIONS:
                action = "execute"
            description = str(item.get("description", "")).strip()
            if not description:
                description = "Execute statement"
            variables = item.get("variables") if isinstance(item.get("variables"), dict) else {}
            call_stack = item.get("callStack") if isinstance(item.get("callStack"), list) else []
            step: Dict[str, Any] = {
                "line": max(line, 1),
                "action": action,
                "description": description,
                "variables": variables,
                "callStack": [str(frame) for frame in call_stack],
            }
            output = item.get("output")
            if output is not None and str(output).strip():
                step["output"] = str(output)
            steps.append(step)

        return {
            "steps": steps,
            "finalOutput": str(raw.get("finalOutput", "")),
            "error": raw.get("error"),
            "error_code": raw.get("error_code"),
            "truncated": bool(raw.get("truncated", False) or len(steps) >= max_steps),
        }


_visualizer_ai_service: Optional[VisualizerAIService] = None


def get_visualizer_ai_service() -> VisualizerAIService:
    global _visualizer_ai_service
    if _visualizer_ai_service is None:
        _visualizer_ai_service = VisualizerAIService()
    return _visualizer_ai_service
