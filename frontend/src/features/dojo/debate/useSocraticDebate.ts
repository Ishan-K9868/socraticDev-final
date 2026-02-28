import { useState, useCallback, useRef } from 'react';
import { sendMessageToGemini, ChatMessage } from '../../../services/gemini';
import {
    DebateContext,
    DebateMessage,
    DebateMode,
    DebatePhase,
    AgentRole,
} from './debateTypes';
import {
    buildTeacherPrompt,
    buildCriticPrompt,
    buildReviewPrompt,
    buildDispatcherPrompt,
    parseDispatcherResult,
} from './agentPrompts';

// ── Helpers ──────────────────────────────────────────────────────────────────

let _nextId = 0;
function debateId(): string {
    return `dbm_${Date.now()}_${++_nextId}`;
}

function toGeminiHistory(messages: DebateMessage[]): ChatMessage[] {
    return messages.map((m) => ({
        role: m.role === 'student' ? ('user' as const) : ('assistant' as const),
        content: m.content,
    }));
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSocraticDebate(context: DebateContext) {
    const [messages, setMessages] = useState<DebateMessage[]>([]);
    const [phase, setPhase] = useState<DebatePhase>('exploring');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debateMode, setDebateMode] = useState<DebateMode>('challenge');
    const abortRef = useRef(false);

    // Always keep latest context in a ref so agent calls never use stale data
    const contextRef = useRef(context);
    contextRef.current = context;

    // ── Call a single agent ──────────────────────────────────────────────

    const callAgent = useCallback(
        async (
            role: AgentRole,
            history: DebateMessage[],
            ctx: DebateContext,
        ): Promise<string> => {
            let systemPrompt: string;
            switch (role) {
                case 'teacher':
                    systemPrompt = buildTeacherPrompt(ctx);
                    break;
                case 'critic':
                    systemPrompt = buildCriticPrompt(ctx);
                    break;
                default:
                    systemPrompt = buildTeacherPrompt(ctx);
            }

            const geminiMessages: ChatMessage[] = [
                ...toGeminiHistory(history),
            ];

            // We use the system prompt as a "project context" param since
            // sendMessageToGemini supports it and this avoids needing a new
            // API surface. The agent prompt goes into projectContext.
            if (geminiMessages.length === 0) {
                geminiMessages.push({
                    role: 'user',
                    content: 'Begin the discussion.',
                });
            }

            const response = await sendMessageToGemini(
                geminiMessages,
                'learning', // Use learning mode for Socratic temperature
                systemPrompt,
            );

            return response;
        },
        [],
    );

    // ── Send user message ────────────────────────────────────────────────

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;
            abortRef.current = false;
            setError(null);
            setIsLoading(true);

            const studentMsg: DebateMessage = {
                id: debateId(),
                role: 'student',
                content: content.trim(),
                timestamp: Date.now(),
            };

            const updatedMessages = [...messages, studentMsg];
            setMessages(updatedMessages);

            try {
                // 1) Dispatch: decide who responds
                const dispatcherRaw = await sendMessageToGemini(
                    [
                        {
                            role: 'user',
                            content: buildDispatcherPrompt(
                                updatedMessages,
                                content,
                                phase,
                            ),
                        },
                    ],
                    'building', // Low temperature for structured output
                );

                if (abortRef.current) return;

                const routing = parseDispatcherResult(dispatcherRaw, phase);
                setPhase(routing.nextPhase);

                // 2) Call the appropriate agent(s)
                const agentMessages: DebateMessage[] = [];

                if (routing.routeTo === 'both') {
                    const [teacherRes, criticRes] = await Promise.all([
                        callAgent('teacher', updatedMessages, contextRef.current),
                        callAgent('critic', updatedMessages, contextRef.current),
                    ]);

                    if (abortRef.current) return;

                    agentMessages.push({
                        id: debateId(),
                        role: 'teacher',
                        content: teacherRes,
                        timestamp: Date.now(),
                    });
                    agentMessages.push({
                        id: debateId(),
                        role: 'critic',
                        content: criticRes,
                        timestamp: Date.now(),
                    });
                } else {
                    const agentRole = routing.routeTo;
                    const response = await callAgent(
                        agentRole,
                        updatedMessages,
                        contextRef.current,
                    );

                    if (abortRef.current) return;

                    agentMessages.push({
                        id: debateId(),
                        role: agentRole,
                        content: response,
                        timestamp: Date.now(),
                    });
                }

                setMessages((prev) => [...prev, ...agentMessages]);
            } catch (err) {
                if (!abortRef.current) {
                    const msg =
                        err instanceof Error
                            ? err.message
                            : 'Debate agent failed';
                    setError(msg);
                }
            } finally {
                if (!abortRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [messages, phase, isLoading, callAgent],
    );

    // ── Open debate panel ────────────────────────────────────────────────

    const openDebate = useCallback(
        (mode: DebateMode = 'challenge') => {
            setDebateMode(mode);
            setIsOpen(true);

            // If opening in review mode with no messages, auto-send a review
            if (mode === 'review' && messages.length === 0) {
                setIsLoading(true);
                setError(null);

                const reviewCtx = { ...contextRef.current };
                sendMessageToGemini(
                    [{ role: 'user', content: 'Review my attempt at this challenge.' }],
                    'learning',
                    buildReviewPrompt(reviewCtx),
                )
                    .then((reviewResponse) => {
                        if (!abortRef.current) {
                            setMessages([
                                {
                                    id: debateId(),
                                    role: 'teacher',
                                    content: reviewResponse,
                                    timestamp: Date.now(),
                                },
                            ]);
                        }
                    })
                    .catch((err) => {
                        if (!abortRef.current) {
                            setError(
                                err instanceof Error
                                    ? err.message
                                    : 'Review failed',
                            );
                        }
                    })
                    .finally(() => {
                        if (!abortRef.current) setIsLoading(false);
                    });
            }
        },
        [messages.length, callAgent],
    );

    // ── Close / Reset ────────────────────────────────────────────────────

    const closeDebate = useCallback(() => {
        setIsOpen(false);
    }, []);

    const resetDebate = useCallback(() => {
        abortRef.current = true;
        setMessages([]);
        setPhase('exploring');
        setIsLoading(false);
        setError(null);
        setDebateMode('challenge');
    }, []);

    return {
        messages,
        phase,
        debateMode,
        isOpen,
        isLoading,
        error,
        sendMessage,
        openDebate,
        closeDebate,
        resetDebate,
    };
}
