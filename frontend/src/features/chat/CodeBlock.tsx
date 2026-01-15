import { useState, useRef, useCallback } from 'react';
import { useStore } from '../../store/useStore';

interface CodeBlockProps {
    code: string;
    language: string;
    showLineNumbers?: boolean;
    showApplyButton?: boolean;
}

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

    // Escape HTML
    result = result
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Highlight strings (simple approach)
    result = result.replace(/(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g,
        '<span class="text-accent-500">$&</span>');

    // Highlight comments
    result = result.replace(/(\/\/.*$|#.*$)/gm,
        '<span class="text-[color:var(--color-text-muted)] italic">$&</span>');

    // Highlight numbers
    result = result.replace(/\b(\d+\.?\d*)\b/g,
        '<span class="text-primary-400">$1</span>');

    // Highlight keywords
    langKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
        result = result.replace(regex,
            '<span class="text-secondary-400 font-medium">$1</span>');
    });

    return result;
};

function CodeBlock({ code, language, showLineNumbers = true, showApplyButton = true }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const [applied, setApplied] = useState(false);
    const codeRef = useRef<HTMLPreElement>(null);
    const { selectedFile, projectFiles, updateFileContent } = useStore();

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [code]);

    const handleApply = useCallback(() => {
        console.log('Apply clicked', { selectedFile, code: code.substring(0, 50) });

        if (!selectedFile?.id) {
            // No file selected, just copy to clipboard
            console.log('No file selected, copying to clipboard');
            navigator.clipboard.writeText(code);
            setApplied(true);
            setTimeout(() => setApplied(false), 2000);
            alert('No file selected - code copied to clipboard. Select a file first to apply changes.');
            return;
        }

        // Update the file content in the store
        console.log('Updating file content for:', selectedFile.name);
        updateFileContent(selectedFile.id, code);
        setApplied(true);

        // Also copy to clipboard as backup
        navigator.clipboard.writeText(code);

        setTimeout(() => setApplied(false), 3000);
        alert(`Applied to ${selectedFile.name}! Refresh the file tab to see changes.`);
    }, [code, selectedFile, updateFileContent]);

    const lines = code.split('\n');

    // Show apply button when a project is loaded (regardless of mode for now)
    const canApply = showApplyButton && projectFiles.length > 0;

    return (
        <div className="rounded-xl overflow-hidden bg-neutral-900 dark:bg-neutral-950 border border-neutral-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-800/50 border-b border-neutral-700">
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

                <div className="flex items-center gap-1">
                    {/* Apply Button */}
                    {canApply && (
                        <button
                            onClick={handleApply}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${applied
                                ? 'text-green-400 bg-green-500/10'
                                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50'
                                }`}
                        >
                            {applied ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Applied!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Apply</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Target File Indicator */}
                    {canApply && selectedFile && (
                        <span className="px-2 py-1 text-xs text-neutral-500">
                            → {selectedFile.name}
                        </span>
                    )}

                    {/* Copy Button */}
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

            {/* Code Content */}
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
                                                __html: tokenize(line, language) || '&nbsp;'
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
