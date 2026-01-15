import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// About page with company story and mission
function AboutPage() {

    const team = [
        {
            name: 'Alex Chen',
            role: 'Founder & CEO',
            bio: 'Former Google engineer passionate about education technology. Built learning tools used by 50M+ students.',
            iconBg: 'from-primary-500/30 to-primary-600/30'
        },
        {
            name: 'Dr. Sarah Miller',
            role: 'Chief Learning Officer',
            bio: 'PhD in Cognitive Science from Stanford. 15 years researching how humans learn best.',
            iconBg: 'from-secondary-500/30 to-secondary-600/30'
        },
        {
            name: 'Marcus Johnson',
            role: 'Head of Engineering',
            bio: 'Ex-Meta engineer. Led teams building real-time systems at scale.',
            iconBg: 'from-accent-500/30 to-accent-600/30'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Head of Content',
            bio: 'Former educator and curriculum designer. Created coding bootcamp curricula for 10,000+ students.',
            iconBg: 'from-violet-500/30 to-violet-600/30'
        }
    ];

    const values = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Understanding Over Speed',
            description: 'We believe true mastery comes from deep understanding, not quick fixes. Every feature is designed to build lasting knowledge.'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            title: 'Science-Based Learning',
            description: 'Our methods are grounded in cognitive science research. Spaced repetition, deliberate practice, and the Socratic method aren\'t buzzwords—they\'re proven.'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'Deliberate Practice',
            description: 'Growth happens at the edge of your comfort zone. The Dojo challenges are designed to push you just enough to learn without overwhelming.'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: 'Community First',
            description: 'Learning is better together. We\'re building a community of curious developers who help each other grow.'
        }
    ];

    const stats = [
        { value: '50,000+', label: 'Active Learners' },
        { value: '1M+', label: 'Challenges Completed' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '4.9', label: 'App Store Rating' }
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                {/* Hero */}
                <section className="container-custom mb-20">
                    <div className="max-w-3xl">
                        <h1 className="font-display text-display-md font-bold mb-6">
                            Teaching developers to{' '}
                            <span className="text-primary-500">think</span>, not just code
                        </h1>
                        <p className="text-xl text-[color:var(--color-text-secondary)]">
                            We started SocraticDev because we were tired of AI tools that make developers dependent,
                            not better. Our mission is to use AI to teach understanding, not just generate solutions.
                        </p>
                    </div>
                </section>

                {/* Stats */}
                <section className="container-custom mb-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <div className="font-display text-3xl font-bold text-primary-500 mb-2">{stat.value}</div>
                                <div className="text-sm text-[color:var(--color-text-muted)]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Story */}
                <section className="container-custom mb-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-3xl font-bold mb-6">Our Story</h2>
                            <div className="space-y-4 text-[color:var(--color-text-secondary)]">
                                <p>
                                    In 2024, we watched as AI coding assistants became ubiquitous. Developers were shipping
                                    faster than ever—but understanding less and less. "Vibe coding" became the norm: accept
                                    the AI's suggestion, hope it works, move on.
                                </p>
                                <p>
                                    The problem? When things broke (and they always do), developers couldn't debug code they
                                    didn't understand. Knowledge atrophied. The gap between "using AI" and "understanding AI output"
                                    grew into a chasm.
                                </p>
                                <p>
                                    We built SocraticDev to fix this. Instead of just giving you the answer, we ask you questions.
                                    Instead of generating code you copy-paste, we help you understand why the code works. The AI
                                    becomes a teacher, not a crutch.
                                </p>
                                <p className="font-medium text-[color:var(--color-text-primary)]">
                                    The result? Developers who use SocraticDev don't just ship faster—they understand what they're shipping.
                                </p>
                            </div>
                        </div>
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-[color:var(--color-border)]">
                            <blockquote className="text-lg italic mb-4">
                                "The one who does the thinking does the learning. Our job isn't to give developers answers—it's
                                to help them find answers themselves."
                            </blockquote>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-semibold">Alex Chen</div>
                                    <div className="text-sm text-[color:var(--color-text-muted)]">Founder & CEO</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="container-custom mb-20">
                    <h2 className="font-display text-3xl font-bold mb-8 text-center">What We Believe</h2>
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

                {/* Team */}
                <section className="container-custom mb-20">
                    <h2 className="font-display text-3xl font-bold mb-8 text-center">Meet the Team</h2>
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

                {/* CTA */}
                <section className="container-custom">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-[color:var(--color-border)] text-center">
                        <h2 className="font-display text-2xl font-bold mb-4">Ready to learn differently?</h2>
                        <p className="text-[color:var(--color-text-secondary)] mb-6 max-w-xl mx-auto">
                            Join thousands of developers who are building real understanding, not just shipping code.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/app" className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors">
                                Start Learning
                            </Link>
                            <Link to="/careers" className="px-6 py-3 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] hover:border-primary-500/50 font-medium transition-colors">
                                Join Our Team
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
