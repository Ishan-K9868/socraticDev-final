import { useNavigate } from 'react-router-dom';
import CouncilChallenge from '../features/dojo/CouncilChallenge';
import ThemeToggle from '../components/ThemeToggle';

export default function CouncilPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            {/* Minimal sticky header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[color:var(--color-bg-primary)]/80 border-b border-[color:var(--color-border)]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/learn')}
                            className="p-2 -ml-2 rounded-xl hover:bg-[color:var(--color-bg-muted)] transition-colors"
                        >
                            <svg className="w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <span className="text-sm text-[color:var(--color-text-muted)]">Developer Toolkit</span>
                        <svg className="w-3.5 h-3.5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-sm font-semibold text-amber-400">Council of Dead Engineers</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Challenge — pass noop for onBack so inner back button also goes to /learn */}
            <CouncilChallenge
                onBack={() => navigate('/learn')}
                onComplete={() => navigate('/learn')}
                useAI
            />
        </div>
    );
}
