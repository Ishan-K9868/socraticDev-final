import { useState, useRef, useCallback } from 'react';
import { useStore } from '../../store/useStore';

interface CodeBlockProps {
    code: string;
    language: string;
    showLineNumbers?: boolean;
    showApplyButton?: boolean;
}

type InsertMode = 'insert_at_cursor' | 'replace_selection' | 'replace_all' | 'open_new_scratch';

const LANGUAGE_EXTENSIONS: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    javascriptreact: 'jsx',
    typescriptreact: 'tsx',
    java: 'java',
    go: 'go',
    rust: 'rs',
    c: 'c',
    cpp: 'cpp',
    json: 'json',
    markdown: 'md',
    sql: 'sql',
};

// Simple syntax highlighting (basic implementation)
const tokenize = (code: string, language: string): string => {
    const keywords: Record<string, string[]> = {
        javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'],
        typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'extends', 'implements'],
        python: ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'class', 'import', 'from', 'as', 'try', 'except', 'raise', 'with', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'pass', 'break', 'continue'],
        java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'int', 'String', 'boolean', 'return', 'if', 'else', 'for', 'while', 'new', 'try', 'catch', 'throw', 'throws', 'true', 'false', 'null', 'this', 'super'],
    };

    const langKeywords = keywords[language] || keywords.javascript || [];
    let result = code;

    result = result
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    result = result.replace(/(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="text-accent-500">$&</span>');
    result = result.replace(/(\/\/.*$|#.*$)/gm, '<span class="text-[color:var(--color-text-muted)] italic">$&</span>');
    result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-primary-400">$1</span>');

    langKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
        result = result.replace(regex, '<span class="text-secondary-400 font-medium">$1</span>');
    });

    return result;
};

function CodeBlock({ code, language, showLineNumbers = true, showApplyButton = true }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const [insertMode, setInsertMode] = useState<InsertMode>('insert_at_cursor');
    const [applyFeedback, setApplyFeedback] = useState<string | null>(null);
    const codeRef = useRef<HTMLPreElement>(null);
    const {
        activeDocumentId,
        editorDocuments,
        createScratchDocument,
        setActiveDocument,
        insertIntoDocument,
    } = useStore();

    const activeDocument = editorDocuments.find((doc) => doc.id === activeDocumentId) || null;

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [code]);

    const applyToDocument = useCallback((documentId: string, mode: InsertMode) => {
        if (mode === 'open_new_scratch') {
            const extension = LANGUAGE_EXTENSIONS[language] || 'txt';
            const scratchId = createScratchDocument({
                name: `scratch.${extension}`,
                languageMode: language || 'plaintext',
                content: code,
            });
            setActiveDocument(scratchId);
            setApplyFeedback(`Opened in scratch.${extension}`);
            return;
        }

        insertIntoDocument(documentId, code, mode);
        const targetName = editorDocuments.find((doc) => doc.id === documentId)?.name || 'document';
        setApplyFeedback(`Inserted into ${targetName}`);
    }, [code, language, createScratchDocument, setActiveDocument, insertIntoDocument, editorDocuments]);

    const handleApply = useCallback(() => {
        if (insertMode === 'open_new_scratch') {
            applyToDocument(activeDocumentId || '', 'open_new_scratch');
        } else if (activeDocumentId) {
            applyToDocument(activeDocumentId, insertMode);
        } else {
            const extension = LANGUAGE_EXTENSIONS[language] || 'txt';
            const scratchId = createScratchDocument({
                name: `scratch.${extension}`,
                languageMode: language || 'plaintext',
                content: '',
            });
            setActiveDocument(scratchId);
            insertIntoDocument(scratchId, code, insertMode === 'replace_selection' ? 'insert_at_cursor' : insertMode);
            setApplyFeedback(`Created scratch.${extension} and inserted code`);
        }

        setTimeout(() => setApplyFeedback(null), 2600);
    }, [insertMode, activeDocumentId, applyToDocument, language, createScratchDocument, setActiveDocument, insertIntoDocument, code]);

    const lines = code.split('\n');
    const canApply = showApplyButton;

    return (
        <div className="rounded-xl overflow-hidden bg-neutral-900 dark:bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-800/50 border-b border-neutral-700 gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-neutral-400 font-mono ml-2">
                        {language}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {canApply && (
                        <>
                            <select
                                value={insertMode}
                                onChange={(e) => setInsertMode(e.target.value as InsertMode)}
                                className="px-2 py-1 text-xs rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300"
                                title="Insert mode"
                            >
                                <option value="insert_at_cursor">Insert at cursor</option>
                                <option value="replace_selection">Replace selection</option>
                                <option value="replace_all">Replace whole file</option>
                                <option value="open_new_scratch">Open in new scratch</option>
                            </select>
                            <button
                                onClick={handleApply}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-neutral-300 hover:text-white hover:bg-neutral-700/60 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Insert</span>
                            </button>
                        </>
                    )}

                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
                        text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50
                        transition-colors"
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-green-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {canApply && (
                <div className="px-4 py-1.5 border-b border-neutral-800/70 text-[11px] text-neutral-400 flex items-center justify-between gap-2">
                    <span className="truncate">
                        Target: {insertMode === 'open_new_scratch' ? 'new scratch file' : (activeDocument?.name || 'scratch (auto)')}
                    </span>
                    {applyFeedback && <span className="text-green-400">{applyFeedback}</span>}
                </div>
            )}

            <div className="overflow-x-auto">
                <pre ref={codeRef} className="p-4 text-sm font-mono text-neutral-200 leading-relaxed">
                    {showLineNumbers ? (
                        <table className="w-full">
                            <tbody>
                                {lines.map((line, index) => (
                                    <tr key={index} className="hover:bg-neutral-800/30">
                                        <td className="pr-4 text-right text-neutral-600 select-none w-8">
                                            {index + 1}
                                        </td>
                                        <td
                                            className="whitespace-pre"
                                            dangerouslySetInnerHTML={{
                                                __html: tokenize(line, language) || '&nbsp;',
                                            }}
                                        />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <code dangerouslySetInnerHTML={{ __html: tokenize(code, language) }} />
                    )}
                </pre>
            </div>
        </div>
    );
}

export default CodeBlock;
