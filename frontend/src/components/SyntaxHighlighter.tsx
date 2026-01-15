import { useEffect, useRef } from 'react';
import Prism from 'prismjs';

// Import languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';

// Import theme - we'll use a dark theme
import 'prismjs/themes/prism-tomorrow.css';

interface SyntaxHighlighterProps {
    code: string;
    language: string;
    showLineNumbers?: boolean;
    className?: string;
}

// Map common language names to Prism language identifiers
const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'shell': 'bash',
    'c++': 'cpp',
    'c#': 'csharp',
};

export function SyntaxHighlighter({
    code,
    language,
    showLineNumbers = true,
    className = ''
}: SyntaxHighlighterProps) {
    const codeRef = useRef<HTMLElement>(null);

    // Normalize language name
    const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase();
    const prismLang = Prism.languages[normalizedLang] ? normalizedLang : 'javascript';

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [code, prismLang]);

    const lines = code.split('\n');

    if (showLineNumbers) {
        return (
            <div className={`syntax-highlighter ${className}`}>
                <pre className="!bg-neutral-900 !m-0 !p-0 !overflow-visible">
                    <div className="flex">
                        {/* Line numbers */}
                        <div className="select-none text-neutral-500 text-right pr-4 border-r border-neutral-700 mr-4">
                            {lines.map((_, idx) => (
                                <div key={idx} className="leading-6 text-sm font-mono">
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                        {/* Code */}
                        <code
                            ref={codeRef}
                            className={`language-${prismLang} !bg-transparent !text-sm !leading-6`}
                        >
                            {code}
                        </code>
                    </div>
                </pre>
            </div>
        );
    }

    return (
        <pre className={`!bg-neutral-900 !m-0 ${className}`}>
            <code
                ref={codeRef}
                className={`language-${prismLang} !bg-transparent !text-sm`}
            >
                {code}
            </code>
        </pre>
    );
}

// Simple inline code highlighter for single lines
interface CodeLineProps {
    code: string;
    language: string;
    lineNumber?: number;
    onClick?: () => void;
    isHighlighted?: boolean;
    highlightColor?: 'green' | 'red' | 'yellow';
    className?: string;
}

export function CodeLine({
    code,
    language,
    lineNumber,
    onClick,
    isHighlighted = false,
    highlightColor = 'green',
    className = ''
}: CodeLineProps) {
    const codeRef = useRef<HTMLElement>(null);

    const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase();
    const prismLang = Prism.languages[normalizedLang] ? normalizedLang : 'javascript';

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [code, prismLang]);

    const highlightClasses = {
        green: 'bg-green-500/20 border-l-4 border-green-500',
        red: 'bg-red-500/20 border-l-4 border-red-500',
        yellow: 'bg-yellow-500/20 border-l-4 border-yellow-500',
    };

    return (
        <div
            onClick={onClick}
            className={`
                flex items-start gap-4 px-2 py-1 rounded cursor-pointer
                transition-all duration-150
                ${isHighlighted ? highlightClasses[highlightColor] : 'hover:bg-neutral-800'}
                ${className}
            `}
        >
            {lineNumber !== undefined && (
                <span className="text-neutral-500 text-sm w-6 text-right select-none font-mono">
                    {lineNumber}
                </span>
            )}
            <code
                ref={codeRef}
                className={`language-${prismLang} !bg-transparent font-mono text-sm flex-1 whitespace-pre`}
            >
                {code || ' '}
            </code>
        </div>
    );
}

export default SyntaxHighlighter;
