import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Press Kit page with brand assets and media info
function PressPage() {
    const pressReleases = [
        {
            date: 'January 14, 2026',
            title: 'SocraticDev Launches The Dojo: 10 New Challenge Types for Deliberate Practice',
            excerpt: 'Revolutionary learning platform introduces gamified coding challenges based on cognitive science research.'
        },
        {
            date: 'December 1, 2025',
            title: 'SocraticDev Raises $10M Series A to Transform Developer Education',
            excerpt: 'Funding led by a]a16z will accelerate product development and expand the team.'
        },
        {
            date: 'October 15, 2025',
            title: 'SocraticDev Launches: AI That Teaches, Not Just Answers',
            excerpt: 'New platform uses Socratic method to help developers build real understanding, not just copy code.'
        }
    ];

    const mediaContacts = [
        {
            name: 'Media Inquiries',
            email: 'press@socraticdev.com',
            description: 'For press releases, interviews, and media coverage'
        },
        {
            name: 'Partnership Inquiries',
            email: 'partners@socraticdev.com',
            description: 'For business development and partnership opportunities'
        }
    ];

    const brandAssets = [
        { name: 'Logo (Light)', format: 'SVG, PNG', size: '2.4 MB' },
        { name: 'Logo (Dark)', format: 'SVG, PNG', size: '2.4 MB' },
        { name: 'Icon Only', format: 'SVG, PNG', size: '1.2 MB' },
        { name: 'Brand Guidelines', format: 'PDF', size: '8.5 MB' },
        { name: 'Product Screenshots', format: 'PNG', size: '15.2 MB' },
        { name: 'Founder Headshots', format: 'JPG', size: '4.8 MB' }
    ];

    const stats = [
        { value: '50,000+', label: 'Active Users' },
        { value: '1M+', label: 'Learning Sessions' },
        { value: '10+', label: 'Challenge Types' },
        { value: '98%', label: 'User Satisfaction' }
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom">
                    {/* Header */}
                    <div className="max-w-3xl mb-12">
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Press Kit
                        </h1>
                        <p className="text-lg text-[color:var(--color-text-secondary)]">
                            Everything you need to write about SocraticDev. Brand assets, company information, and media resources.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <section className="mb-16">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat) => (
                                <div key={stat.label} className="text-center p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                    <div className="font-display text-3xl font-bold text-primary-500 mb-2">{stat.value}</div>
                                    <div className="text-sm text-[color:var(--color-text-muted)]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* About */}
                            <section>
                                <h2 className="font-display text-2xl font-bold mb-6">About SocraticDev</h2>
                                <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                    <p className="text-[color:var(--color-text-secondary)] mb-4">
                                        <strong className="text-[color:var(--color-text-primary)]">SocraticDev</strong> is an AI-powered learning platform that helps developers build real understanding, not just generate code. Using the Socratic method, cognitive science principles, and gamified challenges, we're transforming how developers learn.
                                    </p>
                                    <p className="text-[color:var(--color-text-secondary)] mb-4">
                                        Founded in 2025 by former Google engineer Alex Chen, SocraticDev was born from frustration with AI tools that make developers dependent rather than skilled. Our platform asks questions instead of giving answers, building lasting knowledge through deliberate practice.
                                    </p>
                                    <p className="text-[color:var(--color-text-secondary)]">
                                        Key features include Learning Mode (Socratic AI tutoring), The Dojo (10 types of coding challenges), Spaced Repetition flashcards, and comprehensive analytics. The platform is used by 50,000+ developers worldwide.
                                    </p>
                                </div>
                            </section>

                            {/* Brand Assets */}
                            <section>
                                <h2 className="font-display text-2xl font-bold mb-6">Brand Assets</h2>
                                <div className="space-y-3">
                                    {brandAssets.map((asset) => (
                                        <div key={asset.name} className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{asset.name}</h3>
                                                    <p className="text-xs text-[color:var(--color-text-muted)]">{asset.format} • {asset.size}</p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 rounded-lg text-sm bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)] transition-colors">
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-4 w-full py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors">
                                    Download All Assets (32.5 MB)
                                </button>
                            </section>

                            {/* Press Releases */}
                            <section>
                                <h2 className="font-display text-2xl font-bold mb-6">Press Releases</h2>
                                <div className="space-y-4">
                                    {pressReleases.map((release) => (
                                        <div key={release.title} className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] hover:border-primary-500/50 transition-colors cursor-pointer">
                                            <span className="text-sm text-[color:var(--color-text-muted)]">{release.date}</span>
                                            <h3 className="font-semibold mt-1 mb-2">{release.title}</h3>
                                            <p className="text-sm text-[color:var(--color-text-secondary)]">{release.excerpt}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Brand Colors */}
                            <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <h3 className="font-semibold mb-4">Brand Colors</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-500"></div>
                                        <div>
                                            <div className="text-sm font-medium">Terracotta</div>
                                            <div className="text-xs text-[color:var(--color-text-muted)]">#E07A5F</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-secondary-500"></div>
                                        <div>
                                            <div className="text-sm font-medium">Deep Ocean</div>
                                            <div className="text-xs text-[color:var(--color-text-muted)]">#3D5A80</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-accent-500"></div>
                                        <div>
                                            <div className="text-sm font-medium">Sage Green</div>
                                            <div className="text-xs text-[color:var(--color-text-muted)]">#81936A</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Media Contacts */}
                            <div className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <h3 className="font-semibold mb-4">Media Contacts</h3>
                                <div className="space-y-4">
                                    {mediaContacts.map((contact) => (
                                        <div key={contact.name}>
                                            <h4 className="font-medium text-sm">{contact.name}</h4>
                                            <a href={`mailto:${contact.email}`} className="text-sm text-primary-500 hover:underline">
                                                {contact.email}
                                            </a>
                                            <p className="text-xs text-[color:var(--color-text-muted)] mt-1">{contact.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Usage Guidelines */}
                            <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                                <h3 className="font-semibold mb-2 text-yellow-400">Usage Guidelines</h3>
                                <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-2">
                                    <li>• Don't modify the logo colors or proportions</li>
                                    <li>• Maintain clear space around the logo</li>
                                    <li>• Use approved brand colors only</li>
                                    <li>• Contact us before using for merchandise</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default PressPage;
