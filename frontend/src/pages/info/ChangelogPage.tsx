import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Changelog page with version history
function ChangelogPage() {
    const releases = [
        {
            version: '2.0.0',
            date: 'January 14, 2026',
            type: 'major',
            title: 'The Dojo Update',
            changes: [
                { type: 'new', description: '10 new challenge types in The Dojo for deliberate practice' },
                { type: 'new', description: 'Code Visualizer with call graphs and execution tracing' },
                { type: 'new', description: 'Spaced Repetition System (SRS) for flashcard learning' },
                { type: 'new', description: 'Analytics Dashboard with skill radar and XP tracking' },
                { type: 'new', description: 'Gamification system with leagues and daily quests' },
                { type: 'improved', description: 'Completely redesigned Learning Hub with animated backgrounds' },
                { type: 'improved', description: 'Enhanced dark mode with better contrast ratios' },
                { type: 'fixed', description: 'TypeScript build errors for Vercel deployment' },
            ]
        },
        {
            version: '1.5.0',
            date: 'December 20, 2025',
            type: 'minor',
            title: 'Learning Mode Enhancements',
            changes: [
                { type: 'new', description: 'Project upload feature for codebase context' },
                { type: 'new', description: 'Dependency graph visualization for uploaded projects' },
                { type: 'improved', description: 'Better Socratic questioning prompts' },
                { type: 'improved', description: 'Code block syntax highlighting with Prism.js' },
                { type: 'fixed', description: 'Chat scroll behavior on new messages' },
            ]
        },
        {
            version: '1.4.0',
            date: 'December 10, 2025',
            type: 'minor',
            title: 'Monaco Editor Integration',
            changes: [
                { type: 'new', description: 'Monaco Editor for code input with IntelliSense' },
                { type: 'new', description: 'Multiple file support in project context' },
                { type: 'improved', description: 'File tree explorer with collapsible folders' },
                { type: 'fixed', description: 'Memory leaks in chat component' },
            ]
        },
        {
            version: '1.3.0',
            date: 'November 25, 2025',
            type: 'minor',
            title: 'Build Mode',
            changes: [
                { type: 'new', description: 'Build Mode for direct code generation' },
                { type: 'new', description: 'Mode toggle between Learning and Building' },
                { type: 'improved', description: 'Response formatting with markdown support' },
                { type: 'fixed', description: 'API key validation on startup' },
            ]
        },
        {
            version: '1.2.0',
            date: 'November 10, 2025',
            type: 'minor',
            title: 'Theme System',
            changes: [
                { type: 'new', description: 'Dark mode support with system preference detection' },
                { type: 'new', description: 'Custom cursor effects on desktop' },
                { type: 'improved', description: 'Animation performance with GSAP' },
                { type: 'fixed', description: 'Mobile navigation responsiveness' },
            ]
        },
        {
            version: '1.1.0',
            date: 'October 28, 2025',
            type: 'minor',
            title: 'Conversation History',
            changes: [
                { type: 'new', description: 'Conversation history with local storage persistence' },
                { type: 'new', description: 'Multiple conversation support' },
                { type: 'improved', description: 'Message loading states' },
                { type: 'fixed', description: 'Textarea auto-resize on long messages' },
            ]
        },
        {
            version: '1.0.0',
            date: 'October 15, 2025',
            type: 'major',
            title: 'Initial Release',
            changes: [
                { type: 'new', description: 'SocraticDev launched with Gemini AI integration' },
                { type: 'new', description: 'Learning Mode with Socratic questioning' },
                { type: 'new', description: 'Beautiful landing page with GSAP animations' },
                { type: 'new', description: 'Responsive design for all devices' },
            ]
        }
    ];

    const getChangeTypeStyle = (type: string) => {
        switch (type) {
            case 'new': return 'bg-green-500/20 text-green-400';
            case 'improved': return 'bg-blue-500/20 text-blue-400';
            case 'fixed': return 'bg-orange-500/20 text-orange-400';
            case 'removed': return 'bg-red-500/20 text-red-400';
            default: return 'bg-neutral-500/20 text-neutral-400';
        }
    };

    const getVersionTypeStyle = (type: string) => {
        switch (type) {
            case 'major': return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
            case 'minor': return 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30';
            default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom max-w-4xl">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Changelog
                        </h1>
                        <p className="text-lg text-[color:var(--color-text-secondary)]">
                            All notable changes to SocraticDev are documented here.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-8">
                        {releases.map((release) => (
                            <div key={release.version} className="relative pl-8 pb-8 border-l-2 border-[color:var(--color-border)] last:border-0 last:pb-0">
                                {/* Timeline dot */}
                                <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-4 ${release.type === 'major' ? 'bg-primary-500 border-primary-500/30' : 'bg-secondary-500 border-secondary-500/30'
                                    }`} />

                                {/* Release Header */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getVersionTypeStyle(release.type)}`}>
                                            v{release.version}
                                        </span>
                                        <span className="text-sm text-[color:var(--color-text-muted)]">{release.date}</span>
                                    </div>
                                    <h2 className="font-display text-xl font-semibold">{release.title}</h2>
                                </div>

                                {/* Changes */}
                                <div className="space-y-2">
                                    {release.changes.map((change, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getChangeTypeStyle(change.type)}`}>
                                                {change.type}
                                            </span>
                                            <span className="text-[color:var(--color-text-secondary)]">{change.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ChangelogPage;
