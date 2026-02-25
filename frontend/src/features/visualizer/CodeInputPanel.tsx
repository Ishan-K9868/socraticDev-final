import Editor from '@monaco-editor/react';

interface CodeInputPanelProps {
    code: string;
    language: string;
    onCodeChange: (code: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

const PYTHON_SAMPLE_CODE = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = factorial(5)
fib_result = fibonacci(6)
print(f"Factorial: {result}, Fibonacci: {fib_result}")`;

function CodeInputPanel({
    code,
    language,
    onCodeChange,
    onAnalyze,
    isAnalyzing,
}: CodeInputPanelProps) {
    const loadSampleCode = () => {
        onCodeChange(PYTHON_SAMPLE_CODE);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-border)]">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold">Code Input</h3>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-blue-500/40 text-blue-300 bg-blue-500/10">
                        {language.toUpperCase()} only
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadSampleCode}
                        className="px-3 py-1.5 text-sm text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
                    >
                        Load Sample
                    </button>

                    <button
                        onClick={onAnalyze}
                        disabled={isAnalyzing || !code.trim()}
                        className={`
                            px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all
                            ${isAnalyzing || !code.trim()
                                ? 'bg-primary-500/50 cursor-not-allowed'
                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                            }
                        `}
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Visualize
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language="python"
                    value={code}
                    onChange={(value) => onCodeChange(value || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                    }}
                />
            </div>
        </div>
    );
}

export default CodeInputPanel;
