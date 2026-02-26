import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAnalytics } from '../analytics/useAnalytics';
import Badge from '../../ui/Badge';

function MetricsDashboard() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { mode } = useStore();
    const { metrics, isLoaded, getLevel } = useAnalytics();
    const level = getLevel();

    useGSAP(() => {
        gsap.from('.metric-card', {
            y: 16,
            opacity: 0,
            stagger: 0.08,
            duration: 0.45,
            ease: 'power3.out',
        });
    }, { scope: containerRef, dependencies: [isLoaded, metrics.totalXP] });

    if (!isLoaded) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const metricItems = [
        {
            label: 'Challenges',
            value: metrics.totalChallengesCompleted,
            color: 'text-cyan-400',
            description: 'Completed Dojo challenges',
        },
        {
            label: 'Flashcards',
            value: metrics.totalFlashcardsReviewed,
            color: 'text-violet-400',
            description: 'Cards reviewed in SRS',
        },
        {
            label: 'Time Spent',
            value: `${Math.max(0, Math.round(metrics.totalTimeSpent / 60))}h`,
            color: 'text-orange-400',
            description: 'Tracked challenge time',
        },
        {
            label: 'Avg Score',
            value: `${Math.max(0, metrics.averageScore).toFixed(0)}%`,
            color: 'text-green-400',
            description: 'Challenge performance',
        },
    ];

    return (
        <div ref={containerRef} className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-display text-xl font-bold">Learning Progress</h2>
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        Live summary from Analytics events
                    </p>
                </div>
                <Badge variant={mode === 'learning' ? 'accent' : 'secondary'}>
                    {mode === 'learning' ? 'Learning' : 'Build'} Mode
                </Badge>
            </div>

            <div className="metric-card p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/30 mb-5">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[color:var(--color-text-muted)]">Level {level.level}</p>
                    <p className="font-semibold">{level.xp} XP</p>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--color-bg-muted)] overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        style={{ width: `${level.progress}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {metricItems.map((metric) => (
                    <div
                        key={metric.label}
                        className="metric-card p-4 rounded-xl bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)]"
                    >
                        <p className="text-xs text-[color:var(--color-text-muted)] mb-1">{metric.label}</p>
                        <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                        <p className="text-xs text-[color:var(--color-text-muted)] mt-1">{metric.description}</p>
                    </div>
                ))}
            </div>

            <div className="metric-card p-4 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                <p className="text-sm font-medium mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-orange-400">{metrics.currentStreak} days</p>
                <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
                    Last activity: {metrics.lastActivityDate || 'No activity yet'}
                </p>
                <Link to="/analytics" className="inline-block mt-3 text-sm text-primary-400 hover:text-primary-300">
                    Open full Learning Analytics →
                </Link>
            </div>
        </div>
    );
}

export default MetricsDashboard;
