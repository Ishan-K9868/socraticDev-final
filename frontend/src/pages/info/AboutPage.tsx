import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function AboutPage() {
    const team = [
        {
            name: 'Ishan Kumar',
            role: 'Lead Developer, Frontend and Backend',
            bio: 'Led the product build end to end, shaping the interface, application flow, and core implementation across the stack.',
            iconBg: 'from-primary-500/30 to-primary-600/30'
        },
        {
            name: 'Hemant Singh',
            role: 'Testing and Feedback Support',
            bio: 'Helped review flows, test interactions, and tighten the product through practical feedback during development.',
            iconBg: 'from-secondary-500/30 to-secondary-600/30'
        },
        {
            name: 'Hassan',
            role: 'Research and Content Support',
            bio: 'Contributed research input and helped refine the product messaging so the experience stayed useful and focused.',
            iconBg: 'from-accent-500/30 to-accent-600/30'
        },
        {
            name: 'Ishu',
            role: 'UI Review and Presentation Support',
            bio: 'Supported visual review and presentation readiness, helping the project communicate clearly during the hackathon build.',
            iconBg: 'from-violet-500/30 to-violet-600/30'
        }
    ];

    const values = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
            ),
            title: 'Learning First',
            description: 'SocraticDev is designed to slow the developer down in the right places so the why behind the code is not lost to automation.'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H9m10 8H7m-4 4h18" />
                </svg>
            ),
            title: 'Clarity Over Noise',
            description: 'The project focuses on breaking problems into understandable pieces instead of hiding complexity behind generic AI answers.'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.868v4.264a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Hands-On Practice',
            description: 'Interactive tools, guided exploration, and developer workflows matter more here than polished slogans or passive consumption.'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            ),
            title: 'AI That Builds Independence',
            description: 'The aim is not to replace developer judgment. The aim is to help people reason better, inspect better, and ship with confidence.'
        }
    ];

    const highlights = [
        { value: '2026', label: 'Built for AI for Bharat Hackathon' },
        { value: 'AI', label: 'Guided learning and developer workflows' },
        { value: 'Code', label: 'Understanding, practice, and exploration' },
        { value: 'Team', label: 'Built by a small focused student crew' }
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <section className="container-custom mb-20">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm text-primary-500 mb-6">
                            AI for Bharat Hackathon 2026
                        </div>
                        <h1 className="font-display text-display-md font-bold mb-6">
                            Built to make AI a better{' '}
                            <span className="text-primary-500">learning partner</span> for developers
                        </h1>
                        <p className="text-xl text-[color:var(--color-text-secondary)] max-w-3xl">
                            SocraticDev is a project about using AI to help developers understand code, inspect systems,
                            and learn by doing. Instead of pushing generic output, it aims to turn AI into a guide that
                            supports real thinking.
                        </p>
                    </div>
                </section>

                <section className="container-custom mb-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {highlights.map((item) => (
                            <div key={item.label} className="text-center p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <div className="font-display text-3xl font-bold text-primary-500 mb-2">{item.value}</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="container-custom mb-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-3xl font-bold mb-6">Why This Project Exists</h2>
                            <div className="space-y-4 text-[color:var(--color-text-secondary)]">
                                <p>
                                    A lot of AI tooling makes it easy to move quickly, but it also makes it easy to stop
                                    thinking. Developers can end up copying outputs, shipping blindly, and struggling the
                                    moment something breaks or needs to be explained.
                                </p>
                                <p>
                                    SocraticDev was built as a response to that pattern. The project explores how AI can
                                    support understanding through guided learning, code exploration, and practice-oriented
                                    workflows instead of becoming a black box that developers depend on.
                                </p>
                                <p>
                                    This version of the project was created for <span className="font-medium text-[color:var(--color-text-primary)]">AI for Bharat Hackathon 2026</span>,
                                    with a focus on making the experience useful, direct, and grounded in what developers
                                    actually need while learning or building.
                                </p>
                                <p className="font-medium text-[color:var(--color-text-primary)]">
                                    The goal is simple: AI should make developers sharper, not more passive.
                                </p>
                            </div>
                        </div>
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-[color:var(--color-border)]">
                            <p className="text-sm uppercase tracking-[0.24em] text-primary-500 mb-4">Project Note</p>
                            <blockquote className="text-lg italic mb-4 text-[color:var(--color-text-primary)]">
                                "SocraticDev is not about asking AI to do the work for you. It is about building a system
                                that helps you understand the work well enough to own it."
                            </blockquote>
                            <p className="text-sm text-[color:var(--color-text-secondary)]">
                                Designed as a practical hackathon build with a clear point of view: useful AI should
                                improve developer judgment, not replace it.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="container-custom mb-20">
                    <h2 className="font-display text-3xl font-bold mb-8 text-center">What Shapes the Product</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {values.map((value) => (
                            <div key={value.title} className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 mb-4">{value.icon}</div>
                                <h3 className="font-display text-xl font-semibold mb-2">{value.title}</h3>
                                <p className="text-[color:var(--color-text-secondary)]">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="container-custom mb-20">
                    <h2 className="font-display text-3xl font-bold mb-8 text-center">The Team Behind It</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member) => (
                            <div key={member.name} className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] text-center">
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.iconBg} flex items-center justify-center mx-auto mb-4`}>
                                    <svg className="w-10 h-10 text-[color:var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-1">{member.name}</h3>
                                <p className="text-sm text-primary-500 mb-3">{member.role}</p>
                                <p className="text-sm text-[color:var(--color-text-muted)]">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="container-custom">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-[color:var(--color-border)] text-center">
                        <h2 className="font-display text-2xl font-bold mb-4">Explore the project in action</h2>
                        <p className="text-[color:var(--color-text-secondary)] mb-6 max-w-2xl mx-auto">
                            Dive into the product, inspect the experience, and see how SocraticDev approaches AI-assisted
                            learning through tools built for understanding instead of shortcuts.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link to="/app" className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors">
                                Open the App
                            </Link>
                            <Link to="/docs" className="px-6 py-3 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] hover:border-primary-500/50 font-medium transition-colors">
                                View Docs
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default AboutPage;
