import { useRef, useState, useEffect, useMemo } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useStore, CodeSelectionRange } from '../../store/useStore';
import Badge from '../../ui/Badge';

interface SelectionContextDraft {
    text: string;
    startLine: number;
    endLine: number;
}

interface CodeEditorProps {
    value?: string;
    initialValue?: string;
    filename?: string;
    languageMode?: string;
    onChange?: (value: string) => void;
    onRename?: (filename: string) => void;
    onLanguageModeChange?: (languageMode: string) => void;
    onSelectionContextAdd?: (snippet: SelectionContextDraft) => void;
    onSelectionChange?: (selection?: CodeSelectionRange) => void;
    readOnly?: boolean;
}

const LANGUAGE_OPTIONS = [
    { value: 'python', label: 'Python', extension: 'py' },
    { value: 'javascript', label: 'JavaScript', extension: 'js' },
    { value: 'typescript', label: 'TypeScript', extension: 'ts' },
    { value: 'typescriptreact', label: 'TypeScript React', extension: 'tsx' },
    { value: 'javascriptreact', label: 'JavaScript React', extension: 'jsx' },
    { value: 'java', label: 'Java', extension: 'java' },
    { value: 'c', label: 'C', extension: 'c' },
    { value: 'cpp', label: 'C++', extension: 'cpp' },
    { value: 'go', label: 'Go', extension: 'go' },
    { value: 'rust', label: 'Rust', extension: 'rs' },
    { value: 'ruby', label: 'Ruby', extension: 'rb' },
    { value: 'php', label: 'PHP', extension: 'php' },
    { value: 'html', label: 'HTML', extension: 'html' },
    { value: 'css', label: 'CSS', extension: 'css' },
    { value: 'json', label: 'JSON', extension: 'json' },
    { value: 'markdown', label: 'Markdown', extension: 'md' },
    { value: 'sql', label: 'SQL', extension: 'sql' },
    { value: 'shell', label: 'Shell', extension: 'sh' },
    { value: 'yaml', label: 'YAML', extension: 'yml' },
    { value: 'plaintext', label: 'Plain Text', extension: 'txt' },
];

function sanitizeFilename(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return 'untitled.txt';
    return trimmed.replace(/[\\/:*?"<>|]/g, '_');
}

function getExtension(filename: string): string {
    const ext = filename.split('.').pop();
    return (ext || '').toLowerCase();
}

function syncFilenameExtension(filename: string, extension: string): string {
    const cleanExt = extension.replace(/^\./, '');
    const parts = filename.split('.');
    if (parts.length <= 1) return `${filename}.${cleanExt}`;
    parts[parts.length - 1] = cleanExt;
    return parts.join('.');
}

function CodeEditor({
    value,
    initialValue = '',
    filename = 'untitled.py',
    languageMode = 'python',
    onChange,
    onRename,
    onLanguageModeChange,
    onSelectionContextAdd,
    onSelectionChange,
    readOnly = false,
}: CodeEditorProps) {
    const editorRef = useRef<any>(null);
    const [internalValue, setInternalValue] = useState(initialValue);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
    const [selection, setSelection] = useState<SelectionContextDraft | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftFilename, setDraftFilename] = useState(filename);
    const { theme } = useStore();

    const effectiveValue = typeof value === 'string' ? value : internalValue;
    const hasExternalValue = typeof value === 'string';

    useEffect(() => {
        setDraftFilename(filename);
    }, [filename]);

    const selectedLanguageOption = useMemo(
        () => LANGUAGE_OPTIONS.find((option) => option.value === languageMode),
        [languageMode],
    );
    const expectedExt = selectedLanguageOption?.extension || '';
    const currentExt = getExtension(filename);
    const hasExtensionMismatch = Boolean(expectedExt) && Boolean(currentExt) && expectedExt !== currentExt;

    // Verification status (simulated)
    const [verification, setVerification] = useState<{
        status: 'idle' | 'checking' | 'valid' | 'warning' | 'error';
        message?: string;
    }>({ status: 'idle' });

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        setIsEditorReady(true);

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

        editor.onDidChangeCursorPosition((event: any) => {
            setCursorPosition({
                line: event.position.lineNumber,
                col: event.position.column,
            });
        });

        editor.onDidChangeCursorSelection((event: any) => {
            const range: CodeSelectionRange = {
                startLineNumber: event.selection.startLineNumber,
                startColumn: event.selection.startColumn,
                endLineNumber: event.selection.endLineNumber,
                endColumn: event.selection.endColumn,
            };
            onSelectionChange?.(range);

            const model = editor.getModel();
            if (!model) return;
            const selectedText = model.getValueInRange(event.selection);
            if (selectedText.trim()) {
                setSelection({
                    text: selectedText,
                    startLine: range.startLineNumber,
                    endLine: range.endLineNumber,
                });
            } else {
                setSelection(null);
            }
        });
    };

    useEffect(() => {
        if (isEditorReady && editorRef.current) {
            const monaco = (window as any).monaco;
            if (monaco) {
                monaco.editor.setTheme(theme === 'dark' ? 'socraticDark' : 'socraticLight');
            }
        }
    }, [theme, isEditorReady]);

    const handleChange: OnChange = (newValue) => {
        const safeValue = newValue || '';
        if (!hasExternalValue) {
            setInternalValue(safeValue);
        }
        onChange?.(safeValue);

        setVerification({ status: 'checking' });
        setTimeout(() => {
            const hasError = safeValue.includes('error') || safeValue.includes('ERROR');
            const hasWarning = safeValue.includes('TODO') || safeValue.includes('FIXME');

            if (hasError) {
                setVerification({ status: 'error', message: 'Syntax error detected' });
            } else if (hasWarning) {
                setVerification({ status: 'warning', message: 'Code needs review' });
            } else {
                setVerification({ status: 'valid', message: 'Code verified' });
            }
        }, 500);
    };

    const commitRename = () => {
        setIsRenaming(false);
        const next = sanitizeFilename(draftFilename);
        setDraftFilename(next);
        if (next !== filename) {
            onRename?.(next);
        }
    };

    const handleAddSelectionContext = () => {
        if (!selection || !selection.text.trim()) return;
        onSelectionContextAdd?.({
            text: selection.text,
            startLine: selection.startLine,
            endLine: selection.endLine,
        });
    };

    const handleSyncFilenameToMode = () => {
        if (!expectedExt) return;
        const next = syncFilenameExtension(filename, expectedExt);
        onRename?.(sanitizeFilename(next));
    };

    const humanLanguageLabel = selectedLanguageOption?.label || languageMode;

    return (
        <div className="h-full flex flex-col bg-[color:var(--color-bg-muted)]">
            <div className="min-h-10 px-4 py-2 flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                        {isRenaming ? (
                            <input
                                autoFocus
                                value={draftFilename}
                                onChange={(e) => setDraftFilename(e.target.value)}
                                onBlur={commitRename}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitRename();
                                    if (e.key === 'Escape') {
                                        setDraftFilename(filename);
                                        setIsRenaming(false);
                                    }
                                }}
                                className="text-sm font-mono px-2 py-1 rounded bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:border-primary-500 focus:outline-none min-w-0 max-w-[260px]"
                            />
                        ) : (
                            <button
                                onClick={() => !readOnly && setIsRenaming(true)}
                                className={`text-sm font-mono truncate max-w-[260px] ${
                                    readOnly
                                        ? 'text-[color:var(--color-text-muted)]'
                                        : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]'
                                }`}
                                title={readOnly ? filename : 'Rename file'}
                            >
                                {filename}
                            </button>
                        )}
                        {!readOnly && (
                            <span className="w-2 h-2 rounded-full bg-primary-500" title="Editable document" />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {verification.status === 'checking' && (
                        <Badge>
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Checking...
                        </Badge>
                    )}
                    {verification.status === 'valid' && (
                        <Badge variant="success">Verified</Badge>
                    )}
                    {verification.status === 'warning' && (
                        <Badge variant="warning">Warning</Badge>
                    )}
                    {verification.status === 'error' && (
                        <Badge variant="error">Error</Badge>
                    )}

                    {!readOnly && (
                        <button
                            onClick={handleAddSelectionContext}
                            disabled={!selection}
                            className="px-2.5 py-1 text-xs rounded-md border border-primary-500/30 text-primary-400 hover:bg-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Selection to Chat
                        </button>
                    )}

                    <select
                        value={languageMode}
                        onChange={(e) => onLanguageModeChange?.(e.target.value)}
                        className="text-xs px-2 py-1 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]"
                        disabled={readOnly}
                        title="Editor language mode"
                    >
                        {LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {hasExtensionMismatch && (
                        <button
                            onClick={handleSyncFilenameToMode}
                            className="text-xs px-2 py-1 rounded-md border border-warning/40 text-warning hover:bg-warning/10"
                            title={`Sync filename extension to .${expectedExt}`}
                        >
                            Sync .{expectedExt}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={languageMode}
                    value={effectiveValue}
                    onChange={handleChange}
                    onMount={handleEditorDidMount}
                    theme={theme === 'dark' ? 'socraticDark' : 'socraticLight'}
                    loading={
                        <div className="h-full flex items-center justify-center">
                            <div className="flex items-center gap-2 text-[color:var(--color-text-muted)]">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
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
                    }}
                />
            </div>

            <div className="h-6 px-4 flex items-center justify-between text-xs border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]">
                <div className="flex items-center gap-4">
                    <span className="text-[color:var(--color-text-muted)]">{humanLanguageLabel}</span>
                    <span className="text-[color:var(--color-text-muted)]">UTF-8</span>
                    {selection && (
                        <span className="text-[color:var(--color-text-muted)]">
                            Sel {selection.startLine}-{selection.endLine}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[color:var(--color-text-muted)]">
                        Ln {cursorPosition.line}, Col {cursorPosition.col}
                    </span>
                    <span className="text-[color:var(--color-text-muted)]">Spaces: 2</span>
                </div>
            </div>
        </div>
    );
}

export default CodeEditor;
