import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Documentation page with comprehensive guides and tutorials
function DocsPage() {
    const sections = [
        {
            title: 'Getting Started',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            items: [
                { title: 'Quick Start Guide', description: 'Get up and running in 5 minutes', href: '#quick-start' },
                { title: 'Installation', description: 'Set up your development environment', href: '#installation' },
                { title: 'Your First Session', description: 'Learn the basics of Socratic learning', href: '#first-session' },
            ]
        },
        {
            title: 'Core Concepts',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            items: [
                { title: 'Learning Mode', description: 'How Socratic questioning works', href: '#learning-mode' },
                { title: 'Building Mode', description: 'Direct code generation explained', href: '#building-mode' },
                { title: 'The Dojo', description: 'Deliberate practice challenges', href: '#dojo-challenges' },
            ]
        },
        {
            title: 'Features',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            items: [
                { title: 'Code Visualizer', description: 'Understand code flow visually', href: '#visualizer' },
                { title: 'Spaced Repetition', description: 'Retain what you learn with flashcards', href: '#srs' },
                { title: 'Analytics Dashboard', description: 'Track your learning progress', href: '#analytics' },
            ]
        },
        {
            title: 'Advanced',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            items: [
                { title: 'API Integration', description: 'Connect your own Gemini API key', href: '#api-key' },
                { title: 'Project Context', description: 'Upload your codebase for context', href: '#project-context' },
                { title: 'Custom Challenges', description: 'Create your own Dojo challenges', href: '#custom-challenges' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom">
                    {/* Header */}
                    <div className="max-w-3xl mb-16">
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Documentation
                        </h1>
                        <p className="text-lg text-[color:var(--color-text-secondary)]">
                            Everything you need to master SocraticDev and become a better developer through deliberate practice.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-2xl mb-12">
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            className="w-full px-5 py-4 pl-12 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Documentation Sections */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {sections.map((section) => (
                            <div key={section.title} className="p-6 rounded-2xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
                                        {section.icon}
                                    </div>
                                    <h2 className="font-display text-xl font-semibold">{section.title}</h2>
                                </div>
                                <div className="space-y-4">
                                    {section.items.map((item) => (
                                        <a
                                            key={item.title}
                                            href={item.href}
                                            className="block p-4 rounded-lg bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)] transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium group-hover:text-primary-500 transition-colors">{item.title}</h3>
                                                    <p className="text-sm text-[color:var(--color-text-muted)]">{item.description}</p>
                                                </div>
                                                <svg className="w-5 h-5 text-[color:var(--color-text-muted)] group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Help Section */}
                    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-[color:var(--color-border)] text-center">
                        <h2 className="font-display text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
                        <p className="text-[color:var(--color-text-secondary)] mb-6 max-w-xl mx-auto">
                            Our team is here to help. Reach out and we'll get back to you as soon as possible.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                        >
                            Contact Support
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default DocsPage;
