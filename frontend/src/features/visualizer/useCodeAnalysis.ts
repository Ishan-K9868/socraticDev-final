import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CallGraph, ExecutionTrace, GraphNode, GraphEdge, ExecutionStep } from './types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

function getGenAI(): GoogleGenerativeAI {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
    }
    return new GoogleGenerativeAI(GEMINI_API_KEY);
}

const CALL_GRAPH_PROMPT = `Analyze the following {language} code and extract its structure as a call graph.
Return ONLY valid JSON with this exact structure:
{
  "nodes": [
    {"id": "unique_id", "name": "function_or_class_name", "type": "function|class|method|variable", "line": 1}
  ],
  "edges": [
    {"from": "caller_id", "to": "callee_id", "type": "calls|imports|extends|uses"}
  ]
}

Rules:
- Include all functions, classes, and methods
- Create edges for function calls, imports, and class inheritance
- Use unique IDs based on the name
- Include the starting line number for each node

Code:
\`\`\`{language}
{code}
\`\`\``;

const EXECUTION_TRACE_PROMPT = `Trace the step-by-step execution of this {language} code.
Return ONLY valid JSON with this exact structure:
{
  "steps": [
    {
      "line": 1,
      "action": "execute|call|return|assign|condition|loop",
      "description": "Brief explanation of what happens",
      "variables": {"var_name": "value"},
      "callStack": ["function_names"],
      "output": "any printed output"
    }
  ],
  "finalOutput": "complete program output"
}

Rules:
- Trace every significant step
- Show variable values at each step
- Track the call stack for function calls
- Include any console/print output
- Maximum 50 steps for complex code

Code:
\`\`\`{language}
{code}
\`\`\``;

function parseJSONSafely<T>(text: string): T | null {
    try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : text;

        // Clean up common issues
        const cleaned = jsonStr
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .trim();

        return JSON.parse(cleaned);
    } catch (e) {
        console.error('JSON parse error:', e);
        return null;
    }
}

export function useCodeAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [callGraph, setCallGraph] = useState<CallGraph | null>(null);
    const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(null);
    const [error, setError] = useState<string | null>(null);

    const analyzeCallGraph = useCallback(async (code: string, language: string): Promise<CallGraph | null> => {
        if (!code.trim()) {
            setError('Please enter some code');
            return null;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const genAI = getGenAI();
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

            const prompt = CALL_GRAPH_PROMPT
                .replace(/{language}/g, language)
                .replace(/{code}/g, code);

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            const graph = parseJSONSafely<CallGraph>(response);

            if (!graph || !graph.nodes || !graph.edges) {
                throw new Error('Invalid response format');
            }

            // Validate and clean the graph
            const validNodes = graph.nodes.filter((n: GraphNode) => n.id && n.name);
            const nodeIds = new Set(validNodes.map((n: GraphNode) => n.id));
            const validEdges = graph.edges.filter((e: GraphEdge) =>
                nodeIds.has(e.from) && nodeIds.has(e.to)
            );

            const cleanGraph: CallGraph = {
                nodes: validNodes,
                edges: validEdges
            };

            setCallGraph(cleanGraph);
            return cleanGraph;
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'Failed to analyze code';
            setError(errorMsg);
            return null;
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const analyzeExecution = useCallback(async (code: string, language: string): Promise<ExecutionTrace | null> => {
        if (!code.trim()) {
            setError('Please enter some code');
            return null;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const genAI = getGenAI();
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

            const prompt = EXECUTION_TRACE_PROMPT
                .replace(/{language}/g, language)
                .replace(/{code}/g, code);

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            const trace = parseJSONSafely<ExecutionTrace>(response);

            if (!trace || !trace.steps) {
                throw new Error('Invalid response format');
            }

            // Validate steps
            const validSteps = trace.steps.filter((s: ExecutionStep) =>
                typeof s.line === 'number' && s.action && s.description
            );

            const cleanTrace: ExecutionTrace = {
                steps: validSteps,
                finalOutput: trace.finalOutput || ''
            };

            setExecutionTrace(cleanTrace);
            return cleanTrace;
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'Failed to trace execution';
            setError(errorMsg);
            return null;
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setCallGraph(null);
        setExecutionTrace(null);
        setError(null);
    }, []);

    return {
        isAnalyzing,
        callGraph,
        executionTrace,
        error,
        analyzeCallGraph,
        analyzeExecution,
        reset
    };
}
