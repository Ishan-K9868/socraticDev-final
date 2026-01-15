import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useStore } from '../../store/useStore';
import Badge from '../../ui/Badge';

function MetricsDashboard() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { metrics, mode } = useStore();

    useGSAP(() => {
        gsap.from('.metric-card', {
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    const metricItems = [
        {
            label: 'Questions Asked',
            value: metrics.questionsAsked,
            icon: '❓',
            color: 'primary',
            description: 'Guiding questions that helped you understand',
        },
        {
            label: 'Code Explanations',
            value: metrics.codeExplanations,
            icon: '💡',
            color: 'accent',
            description: 'Code snippets explained step by step',
        },
        {
            label: 'Bugs Caught',
            value: metrics.bugsCaught,
            icon: '🐛',
            color: 'error',
            description: 'Potential issues identified before shipping',
        },
        {
            label: 'Learning Time',
            value: `${metrics.learningModeTime}m`,
            icon: '⏱️',
            color: 'secondary',
            description: 'Time spent in learning mode',
        },
    ];

    return (
        <div ref={containerRef} className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-display text-xl font-bold">Your Progress</h2>
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        Track your learning and building journey
                    </p>
                </div>
                <Badge variant={mode === 'learning' ? 'accent' : 'secondary'}>
                    {mode === 'learning' ? '🎓 Learning' : '🚀 Building'}
                </Badge>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {metricItems.map((metric) => (
                    <div
                        key={metric.label}
                        className="metric-card p-4 rounded-xl bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)]"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-2xl">{metric.icon}</span>
                            <span className="font-display text-2xl font-bold">
                                {metric.value}
                            </span>
                        </div>
                        <p className="font-medium text-sm">{metric.label}</p>
                        <p className="text-xs text-[color:var(--color-text-muted)]">
                            {metric.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Achievement Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/30">
                <div className="flex items-center gap-4">
                    <div className="text-3xl">🏆</div>
                    <div>
                        <p className="font-display font-semibold">Keep Going!</p>
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                            {metrics.questionsAsked >= 10
                                ? "You're becoming a true learner! Keep asking great questions."
                                : `Ask ${10 - metrics.questionsAsked} more questions to earn the Curious Coder badge!`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Learning Tips */}
            <div className="mt-6 space-y-3">
                <h3 className="font-medium text-sm text-[color:var(--color-text-secondary)]">
                    Learning Tips
                </h3>
                <div className="space-y-2">
                    {[
                        'Try explaining the code back to the AI in your own words',
                        'When stuck, ask "why" before asking "how"',
                        'Use Build Mode for quick prototyping, Learning Mode for deep understanding',
                    ].map((tip, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2 p-3 rounded-lg bg-[color:var(--color-bg-elevated)]"
                        >
                            <span className="text-accent-500">→</span>
                            <p className="text-sm">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MetricsDashboard;
