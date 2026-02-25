"""Code Parser Service using Tree-sitter for multi-language AST parsing.

This module provides functionality to parse source code files in multiple languages
(Python, JavaScript, TypeScript, Java) using Tree-sitter parsers and extract code
entities and relationships.

LAST UPDATED: 2026-01-24 14:38 - Fixed relationship ID generation
"""

import tree_sitter
from tree_sitter import Parser, Node, Tree, Language
from typing import List, Dict, Optional, Tuple, Any
from pathlib import Path
import logging
from enum import Enum
import hashlib

from ..models.base import (
    CodeEntity,
    CodeRelationship,
    ParseResult,
    EntityType,
    RelationshipType,
    Language as LanguageEnum,
)

logger = logging.getLogger(__name__)


class LanguageDetector:
    """Utility for detecting programming language from file extensions."""
    
    EXTENSION_MAP = {
        '.py': LanguageEnum.PYTHON,
        '.js': LanguageEnum.JAVASCRIPT,
        '.jsx': LanguageEnum.JAVASCRIPT,
        '.ts': LanguageEnum.TYPESCRIPT,
        '.tsx': LanguageEnum.TYPESCRIPT,
        '.java': LanguageEnum.JAVA,
    }
    
    @classmethod
    def detect_language(cls, file_path: str) -> Optional[LanguageEnum]:
        """Detect language from file extension.
        
        Args:
            file_path: Path to the source file
            
        Returns:
            Language enum if detected, None otherwise
        """
        path = Path(file_path)
        extension = path.suffix.lower()
        return cls.EXTENSION_MAP.get(extension)
    
    @classmethod
    def is_supported(cls, file_path: str) -> bool:
        """Check if file extension is supported.
        
        Args:
            file_path: Path to the source file
            
        Returns:
            True if language is supported, False otherwise
        """
        return cls.detect_language(file_path) is not None


class TreeSitterParserManager:
    """Manager for Tree-sitter parsers for multiple languages."""
    
    def __init__(self):
        """Initialize Tree-sitter parsers for all supported languages."""
        self._parsers: Dict[LanguageEnum, Parser] = {}
        self._languages: Dict[LanguageEnum, Language] = {}
        self._initialize_parsers()
    
    def _initialize_parsers(self):
        """Initialize Tree-sitter parsers for Python, JavaScript, TypeScript, and Java."""
        try:
            # Import language bindings
            import tree_sitter_python
            import tree_sitter_javascript
            import tree_sitter_typescript
            import tree_sitter_java
            
            # Create Language objects from capsules
            self._languages[LanguageEnum.PYTHON] = Language(tree_sitter_python.language(), "python")
            self._languages[LanguageEnum.JAVASCRIPT] = Language(tree_sitter_javascript.language(), "javascript")
            self._languages[LanguageEnum.TYPESCRIPT] = Language(tree_sitter_typescript.language_typescript(), "typescript")
            self._languages[LanguageEnum.JAVA] = Language(tree_sitter_java.language(), "java")
            
            # Create parsers for each language
            for lang, language in self._languages.items():
                parser = Parser()
                parser.set_language(language)
                self._parsers[lang] = parser
                logger.info(f"Initialized Tree-sitter parser for {lang.value}")
                
        except Exception as e:
            logger.error(f"Failed to initialize Tree-sitter parsers: {e}")
            raise
    
    def get_parser(self, language: LanguageEnum) -> Optional[Parser]:
        """Get parser for specified language.
        
        Args:
            language: Programming language
            
        Returns:
            Tree-sitter Parser instance or None if not available
        """
        return self._parsers.get(language)
    
    def parse(self, code: str, language: LanguageEnum) -> Optional[Tree]:
        """Parse source code into AST.
        
        Args:
            code: Source code string
            language: Programming language
            
        Returns:
            Tree-sitter Tree object or None if parsing fails
        """
        parser = self.get_parser(language)
        if not parser:
            logger.error(f"No parser available for language: {language}")
            return None
        
        try:
            tree = parser.parse(bytes(code, "utf8"))
            return tree
        except Exception as e:
            logger.error(f"Failed to parse code: {e}")
            return None


class CodeParserService:
    """Service for parsing source code files and extracting entities and relationships."""
    
    def __init__(self):
        """Initialize the code parser service."""
        self.parser_manager = TreeSitterParserManager()
        self.language_detector = LanguageDetector()

    def build_entity_id(
        self,
        project_id: str,
        entity_type: EntityType,
        name: str,
        start_line: int,
        file_path: str,
    ) -> str:
        """Build a deterministic entity ID that avoids cross-file collisions."""
        normalized_path = file_path.replace("\\", "/")
        path_hash = hashlib.sha1(normalized_path.encode("utf-8")).hexdigest()[:10]
        safe_name = "".join(ch if ch.isalnum() or ch in {"_", "-"} else "_" for ch in name)[:80]
        return f"{project_id}_{entity_type.value}_{safe_name}_{start_line}_{path_hash}"
    
    def parse_file(
        self, 
        file_path: str, 
        content: str,
        project_id: str = "",
        language: Optional[LanguageEnum] = None
    ) -> ParseResult:
        """Parse a single file and extract entities and relationships.
        
        Args:
            file_path: Path to the source file
            content: File content as string
            project_id: Project identifier for the entities
            language: Optional language override (auto-detected if not provided)
            
        Returns:
            ParseResult containing entities, relationships, and any errors
        """
        import time
        start_time = time.time()
        
        errors = []
        entities = []
        relationships = []
        
        # Detect language if not provided
        if language is None:
            language = self.language_detector.detect_language(file_path)
            if language is None:
                error_msg = f"Unsupported file type: {file_path}"
                logger.warning(error_msg)
                errors.append(error_msg)
                return ParseResult(
                    file_path=file_path,
                    entities=[],
                    relationships=[],
                    errors=errors,
                    parse_time_ms=(time.time() - start_time) * 1000
                )
        
        # Parse the file
        tree = self.parser_manager.parse(content, language)
        if tree is None or tree.root_node is None:
            error_msg = f"Failed to parse file: {file_path}"
            logger.error(error_msg)
            errors.append(error_msg)
            return ParseResult(
                file_path=file_path,
                entities=[],
                relationships=[],
                errors=errors,
                parse_time_ms=(time.time() - start_time) * 1000
            )
        
        # Check for syntax errors
        if tree.root_node.has_error:
            error_msg = f"Syntax errors found in file: {file_path}"
            logger.warning(error_msg)
            errors.append(error_msg)
            # Continue parsing valid portions
        
        # Extract entities and relationships based on language
        try:
            entities = self.extract_entities(tree, file_path, language, content)
            
            # Create a FILE entity for this file (used for relationships/storage).
            file_entity = CodeEntity(
                project_id=project_id,
                entity_type=EntityType.FILE,
                name=Path(file_path).name,  # Just the filename
                file_path=file_path,
                start_line=1,
                end_line=len(content.split('\n')),
                signature=None,
                docstring=None,
                body=None,
                language=language,
                metadata={'full_path': file_path}
            )
            # Generate ID for file entity
            file_entity.id = self.build_entity_id(
                project_id=project_id,
                entity_type=file_entity.entity_type,
                name=file_entity.name,
                start_line=file_entity.start_line,
                file_path=file_path,
            )

            # Set project_id and generate IDs for extracted entities.
            for entity in entities:
                entity.project_id = project_id
                # Generate consistent ID format that matches graph service
                if not entity.id:
                    entity.id = self.build_entity_id(
                        project_id=project_id,
                        entity_type=entity.entity_type,
                        name=entity.name,
                        start_line=entity.start_line,
                        file_path=entity.file_path,
                    )

            entities_for_relationships = [file_entity] + entities
            relationships = self.extract_relationships(tree, file_path, language, entities_for_relationships)
            # Ensure File->Entity ownership relationships exist for graph completeness.
            if file_entity and file_entity.id:
                for entity in entities:
                    if entity.id:
                        relationships.append(
                            CodeRelationship(
                                source_id=file_entity.id,
                                target_id=entity.id,
                                relationship_type=RelationshipType.DEFINES,
                                metadata={"file_path": file_path},
                            )
                        )
        except Exception as e:
            error_msg = f"Error extracting entities/relationships from {file_path}: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)
        
        parse_time_ms = (time.time() - start_time) * 1000
        
        return ParseResult(
            file_path=file_path,
            entities=entities,
            relationships=relationships,
            errors=errors,
            parse_time_ms=parse_time_ms
        )
    
    def _disambiguate_overloaded_functions(self, entities: List[CodeEntity]) -> List[CodeEntity]:
        """Disambiguate functions with the same name by appending parameter types or line numbers.
        
        When multiple functions have the same name (overloading), this method creates unique
        identifiers by appending parameter information or line numbers to the function name.
        
        Args:
            entities: List of extracted code entities
            
        Returns:
            List of entities with disambiguated function names
        """
        # Group functions by name and file path
        function_groups: Dict[Tuple[str, str], List[CodeEntity]] = {}
        
        for entity in entities:
            if entity.entity_type == EntityType.FUNCTION:
                key = (entity.file_path, entity.name)
                if key not in function_groups:
                    function_groups[key] = []
                function_groups[key].append(entity)
        
        # Disambiguate functions that appear multiple times
        disambiguated_entities = []
        
        for entity in entities:
            if entity.entity_type == EntityType.FUNCTION:
                key = (entity.file_path, entity.name)
                group = function_groups[key]
                
                # If there's only one function with this name, no disambiguation needed
                if len(group) == 1:
                    disambiguated_entities.append(entity)
                else:
                    # Multiple functions with same name - disambiguate
                    disambiguated_name = self._create_unique_function_name(entity, group)
                    
                    # Create a new entity with the disambiguated name
                    disambiguated_entity = CodeEntity(
                        id=entity.id,
                        project_id=entity.project_id,
                        entity_type=entity.entity_type,
                        name=disambiguated_name,
                        file_path=entity.file_path,
                        start_line=entity.start_line,
                        end_line=entity.end_line,
                        signature=entity.signature,
                        docstring=entity.docstring,
                        body=entity.body,
                        language=entity.language,
                        metadata={
                            **entity.metadata,
                            'original_name': entity.name,
                            'is_overloaded': True
                        }
                    )
                    disambiguated_entities.append(disambiguated_entity)
            else:
                # Non-function entities don't need disambiguation
                disambiguated_entities.append(entity)
        
        return disambiguated_entities
    
    def _create_unique_function_name(
        self, 
        entity: CodeEntity, 
        group: List[CodeEntity]
    ) -> str:
        """Create a unique name for an overloaded function.
        
        Strategy:
        1. Try to extract parameter types from signature and append them
        2. If parameter types can't be extracted, append line number
        
        Args:
            entity: The function entity to disambiguate
            group: List of all functions with the same name
            
        Returns:
            Unique function name
        """
        base_name = entity.name
        
        # Try to extract parameter types from signature
        param_types = self._extract_parameter_types(entity)
        
        if param_types:
            # Create name with parameter types: function_name(int,str)
            unique_name = f"{base_name}({','.join(param_types)})"
        else:
            # Fall back to line number: function_name_L42
            unique_name = f"{base_name}_L{entity.start_line}"
        
        # Ensure uniqueness (in case of collision)
        if any(e.name == unique_name for e in group if e != entity):
            # Add line number as additional disambiguator
            unique_name = f"{unique_name}_L{entity.start_line}"
        
        return unique_name
    
    def _extract_parameter_types(self, entity: CodeEntity) -> List[str]:
        """Extract parameter types from function signature.
        
        Args:
            entity: Function entity
            
        Returns:
            List of parameter type strings (empty if types can't be extracted)
        """
        if not entity.signature:
            return []
        
        param_types = []
        signature = entity.signature
        
        # Language-specific parameter extraction
        if entity.language == LanguageEnum.PYTHON:
            # Python: def func(x: int, y: str) -> bool
            # Extract types from type annotations
            import re
            # Match parameter patterns like "name: type"
            param_pattern = r'\w+\s*:\s*([^,\)]+)'
            matches = re.findall(param_pattern, signature)
            param_types = [m.strip() for m in matches]
            
        elif entity.language in [LanguageEnum.JAVASCRIPT, LanguageEnum.TYPESCRIPT]:
            # TypeScript: function func(x: number, y: string): boolean
            # JavaScript may not have types
            import re
            if entity.language == LanguageEnum.TYPESCRIPT:
                param_pattern = r'\w+\s*:\s*([^,\)]+)'
                matches = re.findall(param_pattern, signature)
                param_types = [m.strip() for m in matches]
            
        elif entity.language == LanguageEnum.JAVA:
            # Java: public void func(int x, String y)
            # Extract types from parameter list
            import re
            # Match parameter patterns like "Type name"
            param_pattern = r'\(([^\)]*)\)'
            match = re.search(param_pattern, signature)
            if match:
                params_str = match.group(1).strip()
                if params_str:
                    # Split by comma and extract type (first word of each parameter)
                    params = params_str.split(',')
                    for param in params:
                        param = param.strip()
                        if param:
                            # Type is the first word
                            type_match = re.match(r'^(\S+)', param)
                            if type_match:
                                param_types.append(type_match.group(1))
        
        return param_types
    
    def extract_entities(
        self, 
        tree: Tree, 
        file_path: str, 
        language: LanguageEnum,
        content: str
    ) -> List[CodeEntity]:
        """Extract code entities from AST.
        
        Args:
            tree: Tree-sitter Tree object
            file_path: Path to the source file
            language: Programming language
            content: Source code content
            
        Returns:
            List of CodeEntity objects
        """
        entities = []
        
        # Language-specific extraction
        if language == LanguageEnum.PYTHON:
            entities = self._extract_python_entities(tree, file_path, content)
        elif language in [LanguageEnum.JAVASCRIPT, LanguageEnum.TYPESCRIPT]:
            entities = self._extract_javascript_entities(tree, file_path, content, language)
        elif language == LanguageEnum.JAVA:
            entities = self._extract_java_entities(tree, file_path, content)
        
        # Disambiguate function overloading
        entities = self._disambiguate_overloaded_functions(entities)
        
        return entities
    
    def extract_relationships(
        self, 
        tree: Tree, 
        file_path: str, 
        language: LanguageEnum,
        entities: List[CodeEntity]
    ) -> List[CodeRelationship]:
        """Extract relationships between code entities from AST.
        
        Args:
            tree: Tree-sitter Tree object
            file_path: Path to the source file
            language: Programming language
            entities: List of extracted entities
            
        Returns:
            List of CodeRelationship objects
        """
        relationships = []
        
        # Language-specific extraction
        if language == LanguageEnum.PYTHON:
            relationships = self._extract_python_relationships(tree, file_path, entities)
        elif language in [LanguageEnum.JAVASCRIPT, LanguageEnum.TYPESCRIPT]:
            relationships = self._extract_javascript_relationships(tree, file_path, entities, language)
        elif language == LanguageEnum.JAVA:
            relationships = self._extract_java_relationships(tree, file_path, entities)
        
        return relationships
    
    def _extract_python_entities(
        self, 
        tree: Tree, 
        file_path: str, 
        content: str
    ) -> List[CodeEntity]:
        """Extract entities from Python AST.
        
        Extracts functions, classes, variables, and imports from Python code.
        Handles decorators, async functions, class methods, and nested definitions.
        """
        entities = []
        content_lines = content.split('\n')
        
        def get_text(node: Node) -> str:
            """Extract text from a node."""
            return content[node.start_byte:node.end_byte]
        
        def get_docstring(node: Node) -> Optional[str]:
            """Extract docstring from a function or class node."""
            # Look for expression_statement with string as first child in body
            for child in node.children:
                if child.type == 'block':
                    for stmt in child.children:
                        if stmt.type == 'expression_statement':
                            for expr_child in stmt.children:
                                if expr_child.type == 'string':
                                    # Remove quotes and clean up
                                    doc = get_text(expr_child)
                                    # Remove triple quotes or single quotes
                                    if doc.startswith('"""') or doc.startswith("'''"):
                                        doc = doc[3:-3]
                                    elif doc.startswith('"') or doc.startswith("'"):
                                        doc = doc[1:-1]
                                    return doc.strip()
                            return None
            return None
        
        def extract_function_signature(node: Node) -> str:
            """Extract function signature including parameters and return type."""
            name_node = None
            params_node = None
            return_type = None
            
            for child in node.children:
                if child.type == 'identifier':
                    name_node = child
                elif child.type == 'parameters':
                    params_node = child
                elif child.type == 'type':
                    return_type = get_text(child)
            
            if name_node and params_node:
                sig = f"{get_text(name_node)}{get_text(params_node)}"
                if return_type:
                    sig += f" -> {return_type}"
                return sig
            return ""
        
        def extract_class_signature(node: Node) -> str:
            """Extract class signature including base classes."""
            name_node = None
            bases_node = None
            
            for child in node.children:
                if child.type == 'identifier':
                    name_node = child
                elif child.type == 'argument_list':
                    bases_node = child
            
            if name_node:
                sig = get_text(name_node)
                if bases_node:
                    sig += get_text(bases_node)
                return sig
            return ""
        
        def traverse(node: Node, project_id: str = ""):
            """Recursively traverse AST and extract entities."""
            
            # Extract function definitions
            if node.type == 'function_definition':
                name_node = None
                for child in node.children:
                    if child.type == 'identifier':
                        name_node = child
                        break
                
                if name_node:
                    name = get_text(name_node)
                    signature = extract_function_signature(node)
                    docstring = get_docstring(node)
                    
                    # Get function body (limit to first 500 chars)
                    body = get_text(node)
                    if len(body) > 500:
                        body = body[:500]
                    
                    entity = CodeEntity(
                        project_id=project_id,
                        entity_type=EntityType.FUNCTION,
                        name=name,
                        file_path=file_path,
                        start_line=node.start_point[0] + 1,
                        end_line=node.end_point[0] + 1,
                        signature=signature,
                        docstring=docstring,
                        body=body,
                        language=LanguageEnum.PYTHON,
                        metadata={
                            'is_async': any(c.type == 'async' for c in node.children),
                            'decorators': [get_text(c) for c in node.children if c.type == 'decorator']
                        }
                    )
                    entities.append(entity)
            
            # Extract class definitions
            elif node.type == 'class_definition':
                name_node = None
                for child in node.children:
                    if child.type == 'identifier':
                        name_node = child
                        break
                
                if name_node:
                    name = get_text(name_node)
                    signature = extract_class_signature(node)
                    docstring = get_docstring(node)
                    
                    # Extract method names for metadata
                    methods = []
                    for child in node.children:
                        if child.type == 'block':
                            for stmt in child.children:
                                if stmt.type == 'function_definition':
                                    for func_child in stmt.children:
                                        if func_child.type == 'identifier':
                                            methods.append(get_text(func_child))
                                            break
                    
                    entity = CodeEntity(
                        project_id=project_id,
                        entity_type=EntityType.CLASS,
                        name=name,
                        file_path=file_path,
                        start_line=node.start_point[0] + 1,
                        end_line=node.end_point[0] + 1,
                        signature=signature,
                        docstring=docstring,
                        body=None,
                        language=LanguageEnum.PYTHON,
                        metadata={
                            'methods': methods,
                            'decorators': [get_text(c) for c in node.children if c.type == 'decorator']
                        }
                    )
                    entities.append(entity)
            
            # Extract import statements
            elif node.type in ['import_statement', 'import_from_statement']:
                import_text = get_text(node)
                
                # Extract module name
                module_name = ""
                imported_names = []
                
                if node.type == 'import_statement':
                    # import module or import module as alias
                    for child in node.children:
                        if child.type == 'dotted_name':
                            module_name = get_text(child)
                        elif child.type == 'aliased_import':
                            for alias_child in child.children:
                                if alias_child.type == 'dotted_name':
                                    imported_names.append(get_text(alias_child))
                    
                    if not imported_names and module_name:
                        imported_names = [module_name]
                
                elif node.type == 'import_from_statement':
                    # from module import name
                    for child in node.children:
                        if child.type == 'dotted_name':
                            module_name = get_text(child)
                        elif child.type == 'wildcard_import':
                            imported_names = ['*']
                        elif child.type in ['dotted_name', 'identifier']:
                            if get_text(child) not in ['from', 'import']:
                                imported_names.append(get_text(child))
                        elif child.type == 'aliased_import':
                            for alias_child in child.children:
                                if alias_child.type in ['dotted_name', 'identifier']:
                                    imported_names.append(get_text(alias_child))
                
                entity = CodeEntity(
                    project_id=project_id,
                    entity_type=EntityType.IMPORT,
                    name=module_name or import_text,
                    file_path=file_path,
                    start_line=node.start_point[0] + 1,
                    end_line=node.end_point[0] + 1,
                    signature=import_text,
                    docstring=None,
                    body=None,
                    language=LanguageEnum.PYTHON,
                    metadata={
                        'module_name': module_name,
                        'imported_names': imported_names
                    }
                )
                entities.append(entity)
            
            # Extract global/module-level variable assignments
            elif node.type == 'assignment' and node.parent and node.parent.type == 'module':
                # Only extract top-level assignments
                for child in node.children:
                    if child.type == 'identifier':
                        var_name = get_text(child)
                        
                        entity = CodeEntity(
                            project_id=project_id,
                            entity_type=EntityType.VARIABLE,
                            name=var_name,
                            file_path=file_path,
                            start_line=node.start_point[0] + 1,
                            end_line=node.end_point[0] + 1,
                            signature=get_text(node),
                            docstring=None,
                            body=None,
                            language=LanguageEnum.PYTHON,
                            metadata={'scope': 'module'}
                        )
                        entities.append(entity)
                        break  # Only take the first identifier (left side of assignment)
            
            # Recursively traverse children
            for child in node.children:
                traverse(child, project_id)
        
        # Start traversal from root
        traverse(tree.root_node)
        
        return entities
    
    def _extract_javascript_entities(
        self, 
        tree: Tree, 
        file_path: str, 
        content: str,
        language: LanguageEnum
    ) -> List[CodeEntity]:
        """Extract entities from JavaScript/TypeScript AST.
        
        Extracts functions, classes, variables, and imports from JavaScript/TypeScript code.
        Handles arrow functions, class methods, interfaces (TypeScript), and ES6 imports/exports.
        """
        entities = []
        
        def get_text(node: Node) -> str:
            """Extract text from a node."""
            return content[node.start_byte:node.end_byte]
        
        def get_comment_docstring(node: Node) -> Optional[str]:
            """Extract JSDoc comment if present before the node."""
            # Look for comment in previous siblings or parent
            if node.prev_sibling and node.prev_sibling.type == 'comment':
                comment = get_text(node.prev_sibling)
                # Clean up JSDoc comments
                if comment.startswith('/**'):
                    return comment[3:-2].strip()
                elif comment.startswith('//'):
                    return comment[2:].strip()
            return None
        
        def extract_function_signature(node: Node, name: str) -> str:
            """Extract function signature including parameters and return type."""
            params_node = None
            return_type = None
            is_async = False
            
            # Check for async keyword
            for child in node.children:
                if child.type == 'async':
                    is_async = True
                elif child.type == 'formal_parameters':
                    params_node = child
                elif child.type == 'type_annotation':
                    return_type = get_text(child)
            
            sig = ""
            if is_async:
                sig += "async "
            sig += name
            if params_node:
                sig += get_text(params_node)
            if return_type:
                sig += f": {return_type}"
            
            return sig
        
        def extract_class_signature(node: Node, name: str) -> str:
            """Extract class signature including extends/implements."""
            extends = None
            implements = []
            
            for child in node.children:
                if child.type == 'class_heritage':
                    for heritage_child in child.children:
                        if heritage_child.type == 'extends_clause':
                            for ext_child in heritage_child.children:
                                if ext_child.type == 'identifier':
                                    extends = get_text(ext_child)
                        elif heritage_child.type == 'implements_clause':
                            for impl_child in heritage_child.children:
                                if impl_child.type == 'identifier':
                                    implements.append(get_text(impl_child))
            
            sig = name
            if extends:
                sig += f" extends {extends}"
            if implements:
                sig += f" implements {', '.join(implements)}"
            
            return sig
        
        def traverse(node: Node, project_id: str = ""):
            """Recursively traverse AST and extract entities."""
            
            # Extract function declarations
            if node.type == 'function_declaration':
                name_node = None
                for child in node.children:
                    if child.type == 'identifier':
                        name_node = child
                        break
                
                if name_node:
                    name = get_text(name_node)
                    signature = extract_function_signature(node, name)
                    docstring = get_comment_docstring(node)
                    
                    # Get function body (limit to first 500 chars)
                    body = get_text(node)
                    if len(body) > 500:
                        body = body[:500]
                    
                    entity = CodeEntity(
                        project_id=project_id,
                        entity_type=EntityType.FUNCTION,
                        name=name,
                        file_path=file_path,
                        start_line=node.start_point[0] + 1,
                        end_line=node.end_point[0] + 1,
                        signature=signature,
                        docstring=docstring,
                        body=body,
                        language=language,
                        metadata={
                            'is_async': any(c.type == 'async' for c in node.children),
                            'is_generator': any(c.type == 'generator' for c in node.children)
                        }
                    )
                    entities.append(entity)
            
            # Extract arrow functions assigned to variables
            elif node.type == 'lexical_declaration' or node.type == 'variable_declaration':
                for child in node.children:
                    if child.type == 'variable_declarator':
                        name_node = None
                        is_arrow_func = False
                        
                        for decl_child in child.children:
                            if decl_child.type == 'identifier':
                                name_node = decl_child
                            elif decl_child.type == 'arrow_function':
                                is_arrow_func = True
                        
                        if name_node and is_arrow_func:
                            name = get_text(name_node)
                            signature = f"{name} = {get_text(child)[:100]}"
                            
                            entity = CodeEntity(
                                project_id=project_id,
                                entity_type=EntityType.FUNCTION,
                                name=name,
                                file_path=file_path,
                                start_line=node.start_point[0] + 1,
                                end_line=node.end_point[0] + 1,
                                signature=signature,
                                docstring=get_comment_docstring(node),
                                body=get_text(child)[:500],
                                language=language,
                                metadata={'is_arrow_function': True}
                            )
                            entities.append(entity)
            
            # Extract class declarations
            elif node.type == 'class_declaration':
                name_node = None
                for child in node.children:
                    if child.type == 'identifier' or child.type == 'type_identifier':
                        name_node = child
                        break
                
                if name_node:
                    name = get_text(name_node)
                    signature = extract_class_signature(node, name)
                    docstring = get_comment_docstring(node)
                    
                    # Extract method names
                    methods = []
                    for child in node.children:
                        if child.type == 'class_body':
                            for body_child in child.children:
                                if body_child.type == 'method_definition':
                                    for method_child in body_child.children:
                                        if method_child.type == 'property_identifier':
                                            methods.append(get_text(method_child))
                                            break
                    
                    entity = CodeEntity(
                        project_id=project_id,
                        entity_type=EntityType.CLASS,
                        name=name,
                        file_path=file_path,
                        start_line=node.start_point[0] + 1,
                        end_line=node.end_point[0] + 1,
                        signature=signature,
                        docstring=docstring,
                        body=None,
                        language=language,
                        metadata={'methods': methods}
                    )
                    entities.append(entity)
            
            # Extract TypeScript interfaces
            elif node.type == 'interface_declaration' and language == LanguageEnum.TYPESCRIPT:
                name_node = None
                for child in node.children:
                    if child.type == 'type_identifier':
                        name_node = child
                        break
                
                if name_node:
                    name = get_text(name_node)
                    
                    # Extract property names
                    properties = []
                    for child in node.children:
                        if child.type == 'object_type':
                            for prop_child in child.children:
                                if prop_child.type == 'property_signature':
                                    for sig_child in prop_child.children:
                                        if sig_child.type == 'property_identifier':
                                            properties.append(get_text(sig_child))
                                            break
                    
                    entity = CodeEntity(
                        project_id=project_id,
                        entity_type=EntityType.CLASS,  # Treat interfaces as classes
                        name=name,
                        file_path=file_path,
                        start_line=node.start_point[0] + 1,
                        end_line=node.end_point[0] + 1,
                        signature=get_text(node)[:200],
                        docstring=get_comment_docstring(node),
                        body=None,
                        language=language,
                        metadata={
                            'is_interface': True,
                            'properties': properties
                        }
                    )
                    entities.append(entity)
            
            # Extract import statements
            elif node.type == 'import_statement':
                import_text = get_text(node)
                module_name = ""
                imported_names = []
                
                for child in node.children:
                    if child.type == 'string':
                        # Extract module path from string
                        module_name = get_text(child).strip('"\'')
                    elif child.type == 'import_clause':
                        for clause_child in child.children:
                            if clause_child.type == 'identifier':
                                imported_names.append(get_text(clause_child))
                            elif clause_child.type == 'named_imports':
                                for import_child in clause_child.children:
                                    if import_child.type == 'import_specifier':
                                        for spec_child in import_child.children:
                                            if spec_child.type == 'identifier':
                                                imported_names.append(get_text(spec_child))
                                                break
                            elif clause_child.type == 'namespace_import':
                                for ns_child in clause_child.children:
                                    if ns_child.type == 'identifier':
                                        imported_names.append(get_text(ns_child))
                
                entity = CodeEntity(
                    project_id=project_id,
                    entity_type=EntityType.IMPORT,
                    name=module_name or import_text,
                    file_path=file_path,
                    start_line=node.start_point[0] + 1,
                    end_line=node.end_point[0] + 1,
                    signature=import_text,
                    docstring=None,
                    body=None,
                    language=language,
                    metadata={
                        'module_name': module_name,
                        'imported_names': imported_names
                    }
                )
                entities.append(entity)
            
            # Extract top-level variable declarations
            elif node.type in ['lexical_declaration', 'variable_declaration']:
                # Only extract if at program level
                if node.parent and node.parent.type == 'program':
                    for child in node.children:
                        if child.type == 'variable_declarator':
                            name_node = None
                            is_function = False
                            
                            for decl_child in child.children:
                                if decl_child.type == 'identifier':
                                    name_node = decl_child
                                elif decl_child.type in ['arrow_function', 'function']:
                                    is_function = True
                            
                            # Only extract non-function variables
                            if name_node and not is_function:
                                var_name = get_text(name_node)
                                
                                entity = CodeEntity(
                                    project_id=project_id,
                                    entity_type=EntityType.VARIABLE,
                                    name=var_name,
                                    file_path=file_path,
                                    start_line=node.start_point[0] + 1,
                                    end_line=node.end_point[0] + 1,
                                    signature=get_text(child)[:200],
                                    docstring=None,
                                    body=None,
                                    language=language,
                                    metadata={'scope': 'module'}
                                )
                                entities.append(entity)
            
            # Recursively traverse children
            for child in node.children:
                traverse(child, project_id)
        
        # Start traversal from root
        traverse(tree.root_node)
        
        return entities
    
    def _extract_java_entities(
        self, 
        tree: Tree, 
        file_path: str, 
        content: str
    ) -> List[CodeEntity]:
        """Extract entities from Java AST.

        Extracts classes, methods, fields, and imports from Java code.
        """
        entities = []

        def get_text(node: Node) -> str:
            return content[node.start_byte:node.end_byte]

        def traverse(node: Node, project_id: str = ""):
            # Class declarations
            if node.type == "class_declaration":
                class_name = None
                for child in node.children:
                    if child.type == "identifier":
                        class_name = get_text(child)
                        break

                if class_name:
                    entities.append(
                        CodeEntity(
                            project_id=project_id,
                            entity_type=EntityType.CLASS,
                            name=class_name,
                            file_path=file_path,
                            start_line=node.start_point[0] + 1,
                            end_line=node.end_point[0] + 1,
                            signature=get_text(node)[:200],
                            docstring=None,
                            body=None,
                            language=LanguageEnum.JAVA,
                            metadata={},
                        )
                    )

            # Method declarations
            elif node.type == "method_declaration":
                method_name = None
                for child in node.children:
                    if child.type == "identifier":
                        method_name = get_text(child)
                        break

                if method_name:
                    entities.append(
                        CodeEntity(
                            project_id=project_id,
                            entity_type=EntityType.FUNCTION,
                            name=method_name,
                            file_path=file_path,
                            start_line=node.start_point[0] + 1,
                            end_line=node.end_point[0] + 1,
                            signature=get_text(node)[:200],
                            docstring=None,
                            body=get_text(node)[:500],
                            language=LanguageEnum.JAVA,
                            metadata={},
                        )
                    )

            # Field declarations (class-level variables)
            elif node.type == "field_declaration":
                declarator = None
                for child in node.children:
                    if child.type == "variable_declarator":
                        declarator = child
                        break

                if declarator:
                    field_name = None
                    for d_child in declarator.children:
                        if d_child.type == "identifier":
                            field_name = get_text(d_child)
                            break
                    if field_name:
                        entities.append(
                            CodeEntity(
                                project_id=project_id,
                                entity_type=EntityType.VARIABLE,
                                name=field_name,
                                file_path=file_path,
                                start_line=node.start_point[0] + 1,
                                end_line=node.end_point[0] + 1,
                                signature=get_text(node)[:200],
                                docstring=None,
                                body=None,
                                language=LanguageEnum.JAVA,
                                metadata={"scope": "class"},
                            )
                        )

            # Imports as entities
            elif node.type == "import_declaration":
                import_path = ""
                for child in node.children:
                    if child.type in ["scoped_identifier", "identifier"]:
                        import_path = get_text(child)
                        break
                if import_path:
                    entities.append(
                        CodeEntity(
                            project_id=project_id,
                            entity_type=EntityType.IMPORT,
                            name=import_path,
                            file_path=file_path,
                            start_line=node.start_point[0] + 1,
                            end_line=node.end_point[0] + 1,
                            signature=get_text(node),
                            docstring=None,
                            body=None,
                            language=LanguageEnum.JAVA,
                            metadata={"import_path": import_path},
                        )
                    )

            for child in node.children:
                traverse(child, project_id)

        traverse(tree.root_node)
        return entities
    
    def _extract_python_relationships(
        self, 
        tree: Tree, 
        file_path: str, 
        entities: List[CodeEntity]
    ) -> List[CodeRelationship]:
        """Extract relationships from Python AST.
        
        Extracts CALLS, IMPORTS, EXTENDS, and USES relationships.
        """
        relationships = []
        content = tree.text.decode('utf8')
        
        # Create entity lookup by name for quick reference
        entity_by_name = {e.name: e for e in entities if e.file_path == file_path}
        
        def get_text(node: Node) -> str:
            """Extract text from a node."""
            return content[node.start_byte:node.end_byte]
        
        def find_containing_entity(node: Node) -> Optional[CodeEntity]:
            """Find the entity that contains this node."""
            for entity in entities:
                if (entity.file_path == file_path and 
                    entity.start_line <= node.start_point[0] + 1 <= entity.end_line):
                    return entity
            return None
        
        def traverse(node: Node):
            """Recursively traverse AST and extract relationships."""
            
            # Extract CALLS relationships from function/method calls
            if node.type == 'call':
                # Find the function being called
                function_node = None
                for child in node.children:
                    if child.type in ['identifier', 'attribute']:
                        function_node = child
                        break
                
                if function_node:
                    called_name = get_text(function_node)
                    # Handle attribute access (e.g., obj.method())
                    if '.' in called_name:
                        called_name = called_name.split('.')[-1]
                    
                    # Find the containing entity (caller)
                    caller_entity = find_containing_entity(node)
                    
                    if caller_entity and called_name in entity_by_name:
                        called_entity = entity_by_name[called_name]
                        relationships.append(CodeRelationship(
                            source_id=caller_entity.id,
                            target_id=called_entity.id,
                            relationship_type=RelationshipType.CALLS,
                            metadata={
                                'line': node.start_point[0] + 1,
                                'caller': caller_entity.name,
                                'callee': called_name
                            }
                        ))
            
            # Extract EXTENDS relationships from class inheritance
            elif node.type == 'class_definition':
                class_name = None
                base_classes = []
                
                for child in node.children:
                    if child.type == 'identifier':
                        class_name = get_text(child)
                    elif child.type == 'argument_list':
                        # Extract base class names
                        for arg_child in child.children:
                            if arg_child.type == 'identifier':
                                base_classes.append(get_text(arg_child))
                
                if class_name and class_name in entity_by_name:
                    class_entity = entity_by_name[class_name]
                    for base_class in base_classes:
                        if base_class in entity_by_name:
                            base_entity = entity_by_name[base_class]
                            relationships.append(CodeRelationship(
                                source_id=class_entity.id,
                                target_id=base_entity.id,
                                relationship_type=RelationshipType.EXTENDS,
                                metadata={
                                    'line': node.start_point[0] + 1,
                                    'subclass': class_name,
                                    'superclass': base_class
                                }
                            ))
            
            # Extract IMPORTS relationships
            elif node.type in ['import_statement', 'import_from_statement']:
                import_text = get_text(node)
                module_name = ""
                imported_names = []
                
                if node.type == 'import_statement':
                    for child in node.children:
                        if child.type == 'dotted_name':
                            module_name = get_text(child)
                            imported_names.append(module_name)
                
                elif node.type == 'import_from_statement':
                    for child in node.children:
                        if child.type == 'dotted_name':
                            module_name = get_text(child)
                        elif child.type in ['dotted_name', 'identifier']:
                            text = get_text(child)
                            if text not in ['from', 'import']:
                                imported_names.append(text)
                
                # Find the FILE entity for this file to use as source
                file_entity = None
                for entity in entities:
                    if entity.entity_type == EntityType.FILE and entity.file_path == file_path:
                        file_entity = entity
                        break
                
                # Create IMPORTS relationship for each imported name
                # Note: Import relationships use special IDs since they reference external modules
                if file_entity:
                    for imported_name in imported_names:
                        relationships.append(CodeRelationship(
                            source_id=file_entity.id,
                            target_id=f"external:{imported_name}",
                            relationship_type=RelationshipType.IMPORTS,
                            metadata={
                                'line': node.start_point[0] + 1,
                                'module': module_name,
                                'imported': imported_name
                            }
                        ))
            
            # Recursively traverse children
            for child in node.children:
                traverse(child)
        
        # Start traversal from root
        traverse(tree.root_node)
        
        return relationships
    
    def _extract_javascript_relationships(
        self, 
        tree: Tree, 
        file_path: str, 
        entities: List[CodeEntity],
        language: LanguageEnum
    ) -> List[CodeRelationship]:
        """Extract relationships from JavaScript/TypeScript AST.
        
        Extracts CALLS, IMPORTS, EXTENDS, IMPLEMENTS, and USES relationships.
        """
        relationships = []
        content = tree.text.decode('utf8')
        
        # Create entity lookup
        entity_by_name = {e.name: e for e in entities if e.file_path == file_path}
        
        def get_text(node: Node) -> str:
            """Extract text from a node."""
            return content[node.start_byte:node.end_byte]
        
        def find_containing_entity(node: Node) -> Optional[CodeEntity]:
            """Find the entity that contains this node."""
            for entity in entities:
                if (entity.file_path == file_path and 
                    entity.start_line <= node.start_point[0] + 1 <= entity.end_line):
                    return entity
            return None
        
        def traverse(node: Node):
            """Recursively traverse AST and extract relationships."""
            
            # Extract CALLS relationships from function calls
            if node.type == 'call_expression':
                function_node = None
                for child in node.children:
                    if child.type in ['identifier', 'member_expression']:
                        function_node = child
                        break
                
                if function_node:
                    called_name = get_text(function_node)
                    if '.' in called_name:
                        called_name = called_name.split('.')[-1]
                    
                    caller_entity = find_containing_entity(node)
                    
                    if caller_entity and called_name in entity_by_name:
                        called_entity = entity_by_name[called_name]
                        relationships.append(CodeRelationship(
                            source_id=caller_entity.id,
                            target_id=called_entity.id,
                            relationship_type=RelationshipType.CALLS,
                            metadata={
                                'line': node.start_point[0] + 1,
                                'caller': caller_entity.name,
                                'callee': called_name
                            }
                        ))
            
            # Extract EXTENDS relationships from class inheritance
            elif node.type == 'class_declaration':
                class_name = None
                extends_class = None
                implements_interfaces = []
                
                for child in node.children:
                    if child.type in ['identifier', 'type_identifier']:
                        if class_name is None:
                            class_name = get_text(child)
                    elif child.type == 'class_heritage':
                        for heritage_child in child.children:
                            if heritage_child.type == 'extends_clause':
                                for ext_child in heritage_child.children:
                                    if ext_child.type in ['identifier', 'type_identifier']:
                                        extends_class = get_text(ext_child)
                            elif heritage_child.type == 'implements_clause':
                                for impl_child in heritage_child.children:
                                    if impl_child.type in ['identifier', 'type_identifier']:
                                        implements_interfaces.append(get_text(impl_child))
                
                if class_name and class_name in entity_by_name:
                    class_entity = entity_by_name[class_name]
                    if extends_class and extends_class in entity_by_name:
                        extends_entity = entity_by_name[extends_class]
                        relationships.append(CodeRelationship(
                            source_id=class_entity.id,
                            target_id=extends_entity.id,
                            relationship_type=RelationshipType.EXTENDS,
                            metadata={
                                'line': node.start_point[0] + 1,
                                'subclass': class_name,
                                'superclass': extends_class
                            }
                        ))
                    
                    for interface in implements_interfaces:
                        if interface in entity_by_name:
                            interface_entity = entity_by_name[interface]
                            relationships.append(CodeRelationship(
                                source_id=class_entity.id,
                                target_id=interface_entity.id,
                                relationship_type=RelationshipType.IMPLEMENTS,
                                metadata={
                                    'line': node.start_point[0] + 1,
                                    'class': class_name,
                                    'interface': interface
                                }
                            ))
            
            # Extract IMPORTS relationships
            elif node.type == 'import_statement':
                module_name = ""
                imported_names = []
                
                for child in node.children:
                    if child.type == 'string':
                        module_name = get_text(child).strip('"\'')
                    elif child.type == 'import_clause':
                        for clause_child in child.children:
                            if clause_child.type == 'identifier':
                                imported_names.append(get_text(clause_child))
                            elif clause_child.type == 'named_imports':
                                for import_child in clause_child.children:
                                    if import_child.type == 'import_specifier':
                                        for spec_child in import_child.children:
                                            if spec_child.type == 'identifier':
                                                imported_names.append(get_text(spec_child))
                                                break
                
                # Find the FILE entity for this file to use as source
                file_entity = None
                for entity in entities:
                    if entity.entity_type == EntityType.FILE and entity.file_path == file_path:
                        file_entity = entity
                        break
                
                # Note: Import relationships use special IDs since they reference external modules
                if file_entity:
                    for imported_name in imported_names:
                        relationships.append(CodeRelationship(
                            source_id=file_entity.id,
                            target_id=f"external:{imported_name}",
                            relationship_type=RelationshipType.IMPORTS,
                            metadata={
                                'line': node.start_point[0] + 1,
                                'module': module_name,
                                'imported': imported_name
                            }
                        ))
            
            # Recursively traverse children
            for child in node.children:
                traverse(child)
        
        # Start traversal from root
        traverse(tree.root_node)
        
        return relationships
    
    def _extract_java_relationships(
        self, 
        tree: Tree, 
        file_path: str, 
        entities: List[CodeEntity]
    ) -> List[CodeRelationship]:
        """Extract relationships from Java AST.
        
        Extracts CALLS, IMPORTS, EXTENDS, IMPLEMENTS, and USES relationships.
        """
        relationships = []
        content = tree.text.decode('utf8')
        
        # Create entity lookup
        entity_by_name = {e.name: e for e in entities if e.file_path == file_path}
        
        def get_text(node: Node) -> str:
            """Extract text from a node."""
            return content[node.start_byte:node.end_byte]
        
        def find_containing_entity(node: Node) -> Optional[CodeEntity]:
            """Find the entity that contains this node."""
            for entity in entities:
                if (entity.file_path == file_path and 
                    entity.start_line <= node.start_point[0] + 1 <= entity.end_line):
                    return entity
            return None
        
        def traverse(node: Node):
            """Recursively traverse AST and extract relationships."""
            
            # Extract CALLS relationships from method invocations
            if node.type == 'method_invocation':
                method_name = None
                for child in node.children:
                    if child.type == 'identifier':
                        method_name = get_text(child)
                        break
                
                if method_name:
                    caller_entity = find_containing_entity(node)
                    
                    if caller_entity and method_name in entity_by_name:
                        method_entity = entity_by_name[method_name]
                        relationships.append(CodeRelationship(
                            source_id=caller_entity.id,
                            target_id=method_entity.id,
                            relationship_type=RelationshipType.CALLS,
                            metadata={
                                'line': node.start_point[0] + 1,
                                'caller': caller_entity.name,
                                'callee': method_name
                            }
                        ))
            
            # Extract EXTENDS and IMPLEMENTS relationships from class declarations
            elif node.type == 'class_declaration':
                class_name = None
                extends_class = None
                implements_interfaces = []
                
                for child in node.children:
                    if child.type == 'identifier':
                        if class_name is None:
                            class_name = get_text(child)
                    elif child.type == 'superclass':
                        for super_child in child.children:
                            if super_child.type == 'type_identifier':
                                extends_class = get_text(super_child)
                    elif child.type == 'super_interfaces':
                        for interface_child in child.children:
                            if interface_child.type == 'type_list':
                                for type_child in interface_child.children:
                                    if type_child.type == 'type_identifier':
                                        implements_interfaces.append(get_text(type_child))
                
                if class_name and class_name in entity_by_name:
                    class_entity = entity_by_name[class_name]
                    if extends_class and extends_class in entity_by_name:
                        extends_entity = entity_by_name[extends_class]
                        relationships.append(CodeRelationship(
                            source_id=class_entity.id,
                            target_id=extends_entity.id,
                            relationship_type=RelationshipType.EXTENDS,
                            metadata={
                                'line': node.start_point[0] + 1,
                                'subclass': class_name,
                                'superclass': extends_class
                            }
                        ))
                    
                    for interface in implements_interfaces:
                        if interface in entity_by_name:
                            interface_entity = entity_by_name[interface]
                            relationships.append(CodeRelationship(
                                source_id=class_entity.id,
                                target_id=interface_entity.id,
                                relationship_type=RelationshipType.IMPLEMENTS,
                                metadata={
                                    'line': node.start_point[0] + 1,
                                    'class': class_name,
                                    'interface': interface
                                }
                            ))
            
            # Extract IMPORTS relationships
            elif node.type == 'import_declaration':
                import_path = ""
                for child in node.children:
                    if child.type in ['scoped_identifier', 'identifier']:
                        import_path = get_text(child)
                        break
                
                if import_path:
                    # Extract the class name from the import path
                    imported_name = import_path.split('.')[-1]
                    
                    # Find the FILE entity for this file to use as source
                    file_entity = None
                    for entity in entities:
                        if entity.entity_type == EntityType.FILE and entity.file_path == file_path:
                            file_entity = entity
                            break
                    
                    # Note: Import relationships use special IDs since they reference external modules
                    if file_entity:
                        relationships.append(CodeRelationship(
                            source_id=file_entity.id,
                            target_id=f"external:{imported_name}",
                            relationship_type=RelationshipType.IMPORTS,
                            metadata={
                                'line': node.start_point[0] + 1,
                                'import_path': import_path,
                                'imported': imported_name
                            }
                        ))
            
            # Recursively traverse children
            for child in node.children:
                traverse(child)
        
        # Start traversal from root
        traverse(tree.root_node)
        
        return relationships

    
    def parse_project(
        self,
        project_files: List[Tuple[str, str]],
        project_id: str = ""
    ) -> Dict[str, Any]:
        """Parse multiple files in a project and return aggregated results.
        
        Args:
            project_files: List of (file_path, content) tuples
            project_id: Optional project identifier
            
        Returns:
            Dictionary containing:
                - results: List of ParseResult objects
                - statistics: Aggregated statistics
                - errors: List of all errors encountered
        """
        results = []
        total_entities = 0
        total_relationships = 0
        total_errors = []
        files_with_errors = 0
        
        logger.info(f"Starting batch parsing of {len(project_files)} files")
        
        for file_path, content in project_files:
            try:
                result = self.parse_file(file_path, content)
                results.append(result)
                
                total_entities += len(result.entities)
                total_relationships += len(result.relationships)
                
                if result.errors:
                    files_with_errors += 1
                    total_errors.extend([f"{file_path}: {err}" for err in result.errors])
                
            except Exception as e:
                error_msg = f"Critical error parsing {file_path}: {str(e)}"
                logger.error(error_msg)
                total_errors.append(error_msg)
                files_with_errors += 1
                # Continue with next file
        
        statistics = {
            'total_files': len(project_files),
            'files_parsed': len(results),
            'files_with_errors': files_with_errors,
            'total_entities': total_entities,
            'total_relationships': total_relationships,
            'total_errors': len(total_errors)
        }
        
        logger.info(
            f"Batch parsing complete: {statistics['files_parsed']}/{statistics['total_files']} files, "
            f"{total_entities} entities, {total_relationships} relationships, "
            f"{files_with_errors} files with errors"
        )
        
        return {
            'results': results,
            'statistics': statistics,
            'errors': total_errors
        }
