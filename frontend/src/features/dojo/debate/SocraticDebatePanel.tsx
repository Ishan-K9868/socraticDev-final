import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DebateMessage as DebateMessageType, DebatePhase, DebateMode, DebateContext } from './debateTypes';
import DebateMessage from './DebateMessage';

// ── Phase badge ──────────────────────────────────────────────────────────────

const PHASE_META: Record<DebatePhase, { label: string; color: string }> = {
    exploring: { label: 'Exploring', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
    proposing: { label: 'Proposing', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    defending: { label: 'Defending', color: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
    resolved: { label: 'Resolved', color: 'bg-green-500/15 text-green-400 border-green-500/25' },
};

// ── Props ────────────────────────────────────────────────────────────────────

interface SocraticDebatePanelProps {
    isOpen: boolean;
    messages: DebateMessageType[];
    phase: DebatePhase;
    debateMode: DebateMode;
    context: DebateContext;
    isLoading: boolean;
    error: string | null;
    onSendMessage: (content: string) => void;
    onClose: () => void;
    onReset: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

function SocraticDebatePanel({
    isOpen,
    messages,
    phase,
    debateMode,
    context,
    isLoading,
    error,
    onSendMessage,
    onClose,
    onReset,
}: SocraticDebatePanelProps) {
    const [input, setInput] = useState('');
    const [showContext, setShowContext] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus textarea when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        onSendMessage(trimmed);
        setInput('');
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [input, isLoading, onSendMessage]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend],
    );

    // Auto-resize textarea
    const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    }, []);

    const phaseMeta = PHASE_META[phase];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] md:w-[480px] flex flex-col bg-[color:var(--color-bg-primary)] border-l border-[color:var(--color-border)] shadow-2xl"
                    >
                        {/* ── Header ─────────────────────────────────── */}
                        <div className="flex-shrink-0 px-5 py-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    {/* Arena icon */}
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                                        <svg className="w-[18px] h-[18px] text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-[color:var(--color-text-primary)]">
                                            {debateMode === 'review' ? 'Answer Review' : 'Socratic Arena'}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${phaseMeta.color}`}>
                                                {phaseMeta.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {/* Reset */}
                                    <button
                                        onClick={onReset}
                                        className="p-1.5 rounded-lg text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-muted)] transition-colors"
                                        title="Reset debate"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
                                            <path d="M3 3v5h5" />
                                        </svg>
                                    </button>
                                    {/* Close */}
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-muted)] transition-colors"
                                        title="Close panel"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Context collapsible */}
                            <button
                                onClick={() => setShowContext(!showContext)}
                                className="w-full flex items-center justify-between text-[11px] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-secondary)] transition-colors"
                            >
                                <span>
                                    {context.challengeType} • {context.topic} • {context.language}
                                </span>
                                <svg
                                    className={`w-3 h-3 transition-transform ${showContext ? 'rotate-180' : ''}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            <AnimatePresence>
                                {showContext && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-2 p-2.5 rounded-lg bg-[color:var(--color-bg-muted)] text-[11px] text-[color:var(--color-text-secondary)] font-mono">
                                            {context.code ? (
                                                <pre className="whitespace-pre-wrap break-words max-h-32 overflow-y-auto">{context.code.slice(0, 500)}</pre>
                                            ) : (
                                                <span className="italic">No code context available</span>
                                            )}
                                            {context.userAnswer && (
                                                <div className="mt-2 pt-2 border-t border-[color:var(--color-border)]">
                                                    <span className="font-semibold">Your answer:</span> {context.userAnswer.slice(0, 200)}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Messages ────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                            {messages.length === 0 && !isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center mb-4">
                                        <svg className="w-7 h-7 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-1">
                                        Start the Debate
                                    </h3>
                                    <p className="text-xs text-[color:var(--color-text-muted)] max-w-[240px] leading-relaxed">
                                        Ask a question about this challenge. A <span className="text-blue-400 font-medium">Teacher</span> will guide you, while a <span className="text-orange-400 font-medium">Critic</span> challenges your thinking.
                                    </p>
                                    {/* Starter suggestions */}
                                    <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                                        {[
                                            'How should I approach this?',
                                            'What are the edge cases?',
                                            'I think the answer is...',
                                        ].map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => {
                                                    setInput(suggestion);
                                                    textareaRef.current?.focus();
                                                }}
                                                className="text-[11px] px-2.5 py-1 rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <DebateMessage
                                    key={msg.id}
                                    role={msg.role}
                                    content={msg.content}
                                    timestamp={msg.timestamp}
                                />
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[color:var(--color-text-muted)]">
                                        Agents are deliberating...
                                    </span>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mx-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                                    {error}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Input ───────────────────────────────────── */}
                        <div className="flex-shrink-0 px-4 py-3 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]/30">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={handleTextareaInput}
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        debateMode === 'review'
                                            ? 'Ask about your performance...'
                                            : 'Share your thinking or propose a solution...'
                                    }
                                    disabled={isLoading}
                                    rows={1}
                                    className="flex-1 resize-none bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 disabled:opacity-50 transition-all"
                                    style={{ maxHeight: '120px' }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-[10px] text-[color:var(--color-text-muted)] mt-1.5 text-center">
                                Enter to send · Shift+Enter for new line
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default SocraticDebatePanel;
