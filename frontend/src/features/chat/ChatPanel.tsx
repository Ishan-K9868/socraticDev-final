import { useRef, useEffect } from 'react';
import { useChat } from './useChat';
import { useStore } from '../../store/useStore';
import { getModelName } from '../../services/gemini';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import Badge from '../../ui/Badge';

function ChatPanel() {
    const { messages, isLoading, sendMessage, isConfigured } = useChat();
    const { mode } = useStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const quickPrompts = mode === 'learning' ? [
        'How do I implement binary search?',
        'Explain async/await in JavaScript',
        'What\'s the difference between BFS and DFS?',
    ] : [
        'Generate a REST API endpoint',
        'Create a React component for a form',
        'Write unit tests for this function',
    ];

    return (
        <div className="h-full flex flex-col">
            {/* API Status Banner */}
            {!isConfigured && (
                <div className="px-4 py-3 bg-warning/10 border-b border-warning/30 flex items-center gap-3">
                    <svg className="w-5 h-5 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-warning">API Key Required</p>
                        <p className="text-xs text-[color:var(--color-text-secondary)]">
                            Add your Gemini API key to <code className="px-1 py-0.5 rounded bg-[color:var(--color-bg-muted)]">.env.local</code>
                        </p>
                    </div>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-500 hover:underline flex-shrink-0"
                    >
                        Get API Key →
                    </a>
                </div>
            )}

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    /* Welcome State */
                    <div className="h-full flex items-center justify-center">
                        <div className="max-w-md text-center">
                            {/* Logo */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>

                            {/* Title */}
                            <h2 className="font-display text-2xl font-bold mb-3">
                                {mode === 'learning'
                                    ? 'Ready to Learn?'
                                    : 'Ready to Build?'}
                            </h2>

                            {/* Description */}
                            <p className="text-[color:var(--color-text-secondary)] mb-6">
                                {mode === 'learning'
                                    ? "I'm here to help you learn through questions. Ask me anything and I'll guide you to understanding."
                                    : "I'll help you build fast with direct code generation. What would you like to create?"}
                            </p>

                            {/* Model Info */}
                            {isConfigured && (
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <Badge variant="accent">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Powered by {getModelName()}
                                    </Badge>
                                </div>
                            )}

                            {/* Quick Prompts */}
                            <div className="space-y-2">
                                <p className="text-sm text-[color:var(--color-text-muted)] mb-3">
                                    Try asking:
                                </p>
                                {quickPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => sendMessage(prompt)}
                                        disabled={isLoading}
                                        className="block w-full p-3 rounded-lg text-left text-sm 
                              bg-[color:var(--color-bg-muted)] 
                              hover:bg-[color:var(--color-bg-elevated)] 
                              border border-transparent hover:border-[color:var(--color-border)]
                              transition-all disabled:opacity-50"
                                    >
                                        "{prompt}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Messages List */
                    <div className="space-y-1">
                        {messages.map((message, index) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                isLatest={index === messages.length - 1}
                            />
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-sm bg-[color:var(--color-bg-muted)]">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${mode === 'learning' ? 'bg-accent-500/20' : 'bg-secondary-500/20'
                                            }`}>
                                            <svg
                                                className={`w-3.5 h-3.5 animate-pulse ${mode === 'learning' ? 'text-accent-500' : 'text-secondary-500'
                                                    }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-[color:var(--color-text-muted)]">
                                            {mode === 'learning'
                                                ? 'Crafting thought-provoking questions...'
                                                : 'Generating code...'}
                                        </span>
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
    );
}

export default ChatPanel;
