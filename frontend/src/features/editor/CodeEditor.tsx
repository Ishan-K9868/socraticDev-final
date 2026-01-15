import { useRef, useState, useEffect } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import Badge from '../../ui/Badge';

interface CodeEditorProps {
    initialValue?: string;
    language?: string;
    filename?: string;
    onChange?: (value: string | undefined) => void;
    readOnly?: boolean;
}

function CodeEditor({
    initialValue = '',
    language = 'python',
    filename = 'untitled.py',
    onChange,
    readOnly = false,
}: CodeEditorProps) {
    const editorRef = useRef<any>(null);
    const [value, setValue] = useState(initialValue);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const { theme } = useStore();

    // Verification status (simulated)
    const [verification, setVerification] = useState<{
        status: 'idle' | 'checking' | 'valid' | 'warning' | 'error';
        message?: string;
    }>({ status: 'idle' });

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        setIsEditorReady(true);

        // Configure Monaco
        monaco.editor.defineTheme('socraticDark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0F0E0D',
                'editor.foreground': '#FAFAFA',
                'editorLineNumber.foreground': '#57534E',
                'editorLineNumber.activeForeground': '#A8A29E',
                'editor.selectionBackground': '#3D5A8040',
                'editor.lineHighlightBackground': '#1C191710',
            },
        });

        monaco.editor.defineTheme('socraticLight', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#FAFAF9',
                'editor.foreground': '#1C1917',
                'editorLineNumber.foreground': '#A8A29E',
                'editorLineNumber.activeForeground': '#57534E',
                'editor.selectionBackground': '#3D5A8020',
                'editor.lineHighlightBackground': '#F5F5F410',
            },
        });

        monaco.editor.setTheme(theme === 'dark' ? 'socraticDark' : 'socraticLight');
    };

    // Update theme when it changes
    useEffect(() => {
        if (isEditorReady && editorRef.current) {
            const monaco = (window as any).monaco;
            if (monaco) {
                monaco.editor.setTheme(theme === 'dark' ? 'socraticDark' : 'socraticLight');
            }
        }
    }, [theme, isEditorReady]);

    const handleChange: OnChange = (newValue) => {
        setValue(newValue || '');
        onChange?.(newValue);

        // Simulate verification
        setVerification({ status: 'checking' });
        setTimeout(() => {
            // Simple validation simulation
            const hasError = newValue?.includes('error') || newValue?.includes('ERROR');
            const hasWarning = newValue?.includes('TODO') || newValue?.includes('FIXME');

            if (hasError) {
                setVerification({ status: 'error', message: 'Syntax error detected' });
            } else if (hasWarning) {
                setVerification({ status: 'warning', message: 'Code needs review' });
            } else {
                setVerification({ status: 'valid', message: 'Code verified' });
            }
        }, 500);
    };

    const getLanguageFromFilename = (fname: string): string => {
        const ext = fname.split('.').pop()?.toLowerCase();
        const langMap: Record<string, string> = {
            py: 'python',
            js: 'javascript',
            ts: 'typescript',
            tsx: 'typescriptreact',
            jsx: 'javascriptreact',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            go: 'go',
            rs: 'rust',
            rb: 'ruby',
            php: 'php',
            html: 'html',
            css: 'css',
            json: 'json',
            md: 'markdown',
            sql: 'sql',
            sh: 'shell',
            yaml: 'yaml',
            yml: 'yaml',
        };
        return langMap[ext || ''] || language;
    };

    return (
        <div className="h-full flex flex-col bg-[color:var(--color-bg-muted)]">
            {/* Editor Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                <div className="flex items-center gap-3">
                    {/* Window controls */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
                    </div>

                    {/* Filename */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-[color:var(--color-text-muted)]">
                            {filename}
                        </span>
                        {value !== initialValue && !readOnly && (
                            <span className="w-2 h-2 rounded-full bg-primary-500" title="Unsaved changes" />
                        )}
                    </div>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-2">
                    {verification.status === 'checking' && (
                        <Badge>
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Checking...
                        </Badge>
                    )}
                    {verification.status === 'valid' && (
                        <Badge variant="success">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                        </Badge>
                    )}
                    {verification.status === 'warning' && (
                        <Badge variant="warning">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Warning
                        </Badge>
                    )}
                    {verification.status === 'error' && (
                        <Badge variant="error">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Error
                        </Badge>
                    )}

                    {/* Language indicator */}
                    <span className="text-xs text-[color:var(--color-text-muted)] font-mono">
                        {getLanguageFromFilename(filename)}
                    </span>
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={getLanguageFromFilename(filename)}
                    value={value}
                    onChange={handleChange}
                    onMount={handleEditorDidMount}
                    theme={theme === 'dark' ? 'socraticDark' : 'socraticLight'}
                    loading={
                        <div className="h-full flex items-center justify-center">
                            <div className="flex items-center gap-2 text-[color:var(--color-text-muted)]">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Loading editor...</span>
                            </div>
                        </div>
                    }
                    options={{
                        readOnly,
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        fontLigatures: true,
                        lineNumbers: 'on',
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'line',
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        bracketPairColorization: { enabled: true },
                        autoIndent: 'full',
                        formatOnPaste: true,
                        formatOnType: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        suggest: {
                            showMethods: true,
                            showFunctions: true,
                            showConstructors: true,
                            showFields: true,
                            showVariables: true,
                            showClasses: true,
                            showInterfaces: true,
                        },
                    }}
                />
            </div>

            {/* Status Bar */}
            <div className="h-6 px-4 flex items-center justify-between text-xs border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                <div className="flex items-center gap-4">
                    <span className="text-[color:var(--color-text-muted)]">
                        {getLanguageFromFilename(filename).charAt(0).toUpperCase() + getLanguageFromFilename(filename).slice(1)}
                    </span>
                    <span className="text-[color:var(--color-text-muted)]">
                        UTF-8
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[color:var(--color-text-muted)]">
                        Ln 1, Col 1
                    </span>
                    <span className="text-[color:var(--color-text-muted)]">
                        Spaces: 2
                    </span>
                </div>
            </div>
        </div>
    );
}

export default CodeEditor;
