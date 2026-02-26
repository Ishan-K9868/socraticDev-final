import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ChatContextSnippet, useStore } from '../../store/useStore';
import Button from '../../ui/Button';

interface ChatInputProps {
    onSendMessage: (content: string, opts?: { contextSnippets?: ChatContextSnippet[] }) => void | Promise<void>;
    isLoading?: boolean;
}

function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [clearAfterSend, setClearAfterSend] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        mode,
        chatContextSnippets,
        removeChatContextSnippet,
        clearChatContextSnippets,
    } = useStore();

    useGSAP(() => {
        gsap.from(containerRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    const handleSubmit = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const snippets = chatContextSnippets.length > 0 ? chatContextSnippets : undefined;
        onSendMessage(inputValue.trim(), { contextSnippets: snippets });
        setInputValue('');

        if (clearAfterSend && snippets?.length) {
            clearChatContextSnippets();
        }

        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }
    }, [inputValue, isLoading, onSendMessage, chatContextSnippets, clearAfterSend, clearChatContextSnippets]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);

        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, []);

    return (
        <div
            ref={containerRef}
            className="p-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]"
        >
            {chatContextSnippets.length > 0 && (
                <div className="mb-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-2.5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-xs text-[color:var(--color-text-secondary)]">
                            Context snippets attached ({chatContextSnippets.length}/4)
                        </p>
                        <button
                            type="button"
                            onClick={() => clearChatContextSnippets()}
                            className="text-xs text-primary-400 hover:text-primary-300"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {chatContextSnippets.map((snippet) => (
                            <div
                                key={snippet.id}
                                className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-primary-500/30 bg-primary-500/10 text-xs text-primary-300 max-w-full"
                                title={snippet.text}
                            >
                                <span className="truncate max-w-[220px]">
                                    {snippet.documentName}:{snippet.startLine}-{snippet.endLine}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeChatContextSnippet(snippet.id)}
                                    className="text-primary-300/80 hover:text-primary-200"
                                    aria-label="Remove snippet"
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                    <label className="mt-2 inline-flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
                        <input
                            type="checkbox"
                            checked={clearAfterSend}
                            onChange={(e) => setClearAfterSend(e.target.checked)}
                            className="rounded border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]"
                        />
                        Clear snippets after send
                    </label>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                mode === 'learning'
                                    ? 'Ask me anything... I\'ll help you understand'
                                    : 'What should I help you build?'
                            }
                            rows={1}
                            disabled={isLoading}
                            className="w-full px-4 py-3 pr-12 rounded-xl resize-none
                        bg-[color:var(--color-bg-muted)]
                        border border-[color:var(--color-border)]
                        focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                        placeholder:text-[color:var(--color-text-muted)]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all"
                            style={{ minHeight: '48px', maxHeight: '200px' }}
                        />

                        {inputValue.length > 0 && (
                            <span className="absolute right-3 bottom-3 text-xs text-[color:var(--color-text-muted)]">
                                {inputValue.length}
                            </span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        isLoading={isLoading}
                        className="self-end"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </Button>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-[color:var(--color-text-muted)]">
                    <div className={`w-2 h-2 rounded-full ${mode === 'learning' ? 'bg-accent-500' : 'bg-secondary-500'}`} />
                    <span>
                        {mode === 'learning'
                            ? 'Learning Mode: I\'ll ask questions to help you understand'
                            : 'Build Mode: Direct answers and code generation'}
                    </span>
                </div>
            </form>
        </div>
    );
}

export default ChatInput;
