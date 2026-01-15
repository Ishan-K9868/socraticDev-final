import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Message } from '../../store/useStore';
import CodeBlock from './CodeBlock';

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
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
            </div>
        </div>
    );
}

export default ChatMessage;
