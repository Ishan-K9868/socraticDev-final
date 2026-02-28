import { AgentRole } from './debateTypes';

interface DebateMessageProps {
    role: AgentRole | 'student';
    content: string;
    timestamp: number;
}

// ── Agent configs ────────────────────────────────────────────────────────────

const AGENT_CONFIG: Record<
    AgentRole | 'student',
    { label: string; bgClass: string; textClass: string; borderClass: string; align: 'left' | 'right' }
> = {
    teacher: {
        label: 'Teacher',
        bgClass: 'bg-blue-500/10 dark:bg-blue-500/15',
        textClass: 'text-blue-500',
        borderClass: 'border-blue-500/20',
        align: 'left',
    },
    critic: {
        label: 'Critic',
        bgClass: 'bg-orange-500/10 dark:bg-orange-500/15',
        textClass: 'text-orange-500',
        borderClass: 'border-orange-500/20',
        align: 'left',
    },
    dispatcher: {
        label: 'System',
        bgClass: 'bg-gray-500/10',
        textClass: 'text-gray-400',
        borderClass: 'border-gray-500/20',
        align: 'left',
    },
    student: {
        label: 'You',
        bgClass: 'bg-indigo-500/10 dark:bg-indigo-500/15',
        textClass: 'text-indigo-500',
        borderClass: 'border-indigo-500/20',
        align: 'right',
    },
};

// ── SVG Avatars ──────────────────────────────────────────────────────────────

function TeacherAvatar() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10L12 5 2 10l10 5 10-5z" />
            <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
            <line x1="22" y1="10" x2="22" y2="16" />
        </svg>
    );
}

function CriticAvatar() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4M12 16h.01" />
        </svg>
    );
}

function StudentAvatar() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function getAvatar(role: AgentRole | 'student') {
    switch (role) {
        case 'teacher': return <TeacherAvatar />;
        case 'critic': return <CriticAvatar />;
        case 'student': return <StudentAvatar />;
        default: return null;
    }
}

// ── Simple markdown renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string): string {
    return text
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-neutral-900 text-neutral-100 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono"><code>$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="bg-neutral-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
        // Italic
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Numbered lists
        .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
        // Bullet lists
        .replace(/^[-•]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
        // Line breaks
        .replace(/\n/g, '<br/>');
}

// ── Component ────────────────────────────────────────────────────────────────

function DebateMessage({ role, content, timestamp }: DebateMessageProps) {
    const config = AGENT_CONFIG[role];
    const timeStr = new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    const isRight = config.align === 'right';

    return (
        <div className={`flex gap-2.5 ${isRight ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {/* Avatar */}
            <div
                className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    border ${config.borderClass} ${config.bgClass} ${config.textClass}
                `}
            >
                {getAvatar(role)}
            </div>

            {/* Bubble */}
            <div className={`flex-1 max-w-[85%] ${isRight ? 'text-right' : 'text-left'}`}>
                {/* Header */}
                <div className={`flex items-center gap-2 mb-1 text-xs ${isRight ? 'justify-end' : 'justify-start'}`}>
                    <span className={`font-semibold ${config.textClass}`}>{config.label}</span>
                    <span className="text-[color:var(--color-text-muted)]">{timeStr}</span>
                </div>

                {/* Content */}
                <div
                    className={`
                        inline-block text-left px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                        border ${config.borderClass} ${config.bgClass}
                        text-[color:var(--color-text-primary)]
                        ${isRight ? 'rounded-tr-md' : 'rounded-tl-md'}
                    `}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
            </div>
        </div>
    );
}

export default DebateMessage;
