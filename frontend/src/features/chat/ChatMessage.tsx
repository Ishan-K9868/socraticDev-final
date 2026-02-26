import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Message } from '../../store/useStore';
import CodeBlock from './CodeBlock';

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
    onGenerateFlashcards?: (message: Message) => void;
    canGenerateFlashcards?: boolean;
    isGeneratingFlashcards?: boolean;
}

function ChatMessage({
    message,
    isLatest = false,
    onGenerateFlashcards,
    canGenerateFlashcards = false,
    isGeneratingFlashcards = false,
}: ChatMessageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isUser = message.role === 'user';

    useGSAP(() => {
        if (isLatest) {
            gsap.from(containerRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.4,
                ease: 'power3.out',
            });
        }
    }, { scope: containerRef, dependencies: [isLatest] });

    // Parse message content for code blocks
    const parseContent = (content: string) => {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.slice(lastIndex, match.index),
                });
            }

            // Add code block
            parts.push({
                type: 'code',
                content: match[2].trim(),
                language: match[1] || 'plaintext',
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex),
            });
        }

        return parts.length > 0 ? parts : [{ type: 'text' as const, content }];
    };

    const contentParts = parseContent(message.content);

    return (
        <div
            ref={containerRef}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div
                className={`max-w-[85%] ${isUser
                    ? 'bg-primary-500 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-[color:var(--color-bg-muted)] rounded-2xl rounded-tl-sm'
                    }`}
            >
                {/* AI Header (for assistant messages) */}
                {!isUser && (
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${message.mode === 'learning'
                            ? 'bg-accent-500/20'
                            : 'bg-secondary-500/20'
                            }`}>
                            <svg
                                className={`w-3.5 h-3.5 ${message.mode === 'learning' ? 'text-accent-500' : 'text-secondary-500'
                                    }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className={`text-xs font-medium ${message.mode === 'learning' ? 'text-accent-500' : 'text-secondary-500'
                            }`}>
                            {message.mode === 'learning' ? 'Learning Mode' : 'Build Mode'}
                        </span>
                    </div>
                )}

                {/* Message Content */}
                <div className={`px-4 ${isUser ? 'py-4' : 'pb-4'}`}>
                    {contentParts.map((part, index) => (
                        <div key={index}>
                            {part.type === 'text' ? (
                                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? '' : 'text-[color:var(--color-text-primary)]'
                                    }`}>
                                    {part.content}
                                </div>
                            ) : (
                                <div className="my-3 -mx-2">
                                    <CodeBlock
                                        code={part.content}
                                        language={part.language || 'plaintext'}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Timestamp */}
                <div className={`px-4 pb-3 text-[10px] ${isUser ? 'text-white/60' : 'text-[color:var(--color-text-muted)]'
                    }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                {!isUser && canGenerateFlashcards && onGenerateFlashcards && (
                    <div className="px-4 pb-4">
                        {isLatest && (
                            <div className="relative mb-1 h-10 w-full text-primary-400 translate-y-2">
                                <span className="absolute right-0 top-1 text-[11px] font-medium italic whitespace-nowrap">
                                    Need a quick revision set?
                                </span>
                                <svg
                                    className="absolute inset-0 h-full w-full pointer-events-none"
                                    viewBox="0 0 320 40"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M308 7 C252 7, 190 30, 26 33"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeDasharray="3.5 5"
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="18"
                                            to="0"
                                            dur="1.4s"
                                            repeatCount="indefinite"
                                        />
                                    </path>
                                    <path d="M30 29 L24 33 L31 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                        <button
                            onClick={() => onGenerateFlashcards(message)}
                            disabled={isGeneratingFlashcards}
                            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isGeneratingFlashcards && (
                                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            )}
                            {isGeneratingFlashcards ? 'Generating...' : 'Generate Flashcards'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatMessage;
