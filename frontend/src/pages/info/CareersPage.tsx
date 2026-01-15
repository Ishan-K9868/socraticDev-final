import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Careers page with job openings
function CareersPage() {
    const jobs = [
        {
            title: 'Senior Full-Stack Engineer',
            department: 'Engineering',
            location: 'Remote (US/EU)',
            type: 'Full-time',
            description: 'Build and scale our learning platform. Work with React, TypeScript, and AI/ML systems.',
            requirements: [
                '5+ years of full-stack development experience',
                'Strong TypeScript and React expertise',
                'Experience with AI/ML integration',
                'Passion for education technology'
            ]
        },
        {
            title: 'AI/ML Engineer',
            department: 'Engineering',
            location: 'Remote (Global)',
            type: 'Full-time',
            description: 'Improve our AI tutoring capabilities. Work on prompt engineering, fine-tuning, and evaluation.',
            requirements: [
                '3+ years of ML/AI experience',
                'Experience with LLMs and prompt engineering',
                'Python and PyTorch proficiency',
                'Background in NLP is a plus'
            ]
        },
        {
            title: 'Curriculum Designer',
            department: 'Content',
            location: 'Remote (US)',
            type: 'Full-time',
            description: 'Design learning paths and challenges for The Dojo. Create content that teaches real understanding.',
            requirements: [
                '3+ years of curriculum development experience',
                'Strong programming background',
                'Experience with online learning platforms',
                'Passion for pedagogy and learning science'
            ]
        },
        {
            title: 'Product Designer',
            department: 'Design',
            location: 'Remote (US/EU)',
            type: 'Full-time',
            description: 'Design beautiful, intuitive interfaces that make learning delightful. Shape the future of EdTech.',
            requirements: [
                '4+ years of product design experience',
                'Strong Figma skills',
                'Experience with design systems',
                'Portfolio demonstrating interaction design'
            ]
        },
        {
            title: 'Developer Advocate',
            department: 'Community',
            location: 'Remote (Global)',
            type: 'Full-time',
            description: 'Build our developer community. Create content, speak at conferences, and help developers succeed.',
            requirements: [
                '3+ years of DevRel or engineering experience',
                'Strong public speaking and writing skills',
                'Active in developer communities',
                'Experience creating technical content'
            ]
        }
    ];

    const perks = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Remote-First',
            description: 'Work from anywhere in the world'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            title: 'Learning Budget',
            description: '$3,000/year for courses and conferences'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            title: 'Unlimited PTO',
            description: 'Take time when you need it'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            title: 'Health & Wellness',
            description: 'Full medical, dental, and vision coverage'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Equity',
            description: 'Ownership stake in what you build'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: 'Equipment',
            description: '$2,500 for your home office setup'
        }
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                {/* Hero */}
                <section className="container-custom mb-16">
                    <div className="max-w-3xl">
                        <h1 className="font-display text-display-md font-bold mb-6">
                            Build the future of{' '}
                            <span className="text-primary-500">developer education</span>
                        </h1>
                        <p className="text-xl text-[color:var(--color-text-secondary)]">
                            We're on a mission to help developers truly understand code, not just generate it.
                            Join us and shape how the next generation of developers learns.
                        </p>
                    </div>
                </section>

                {/* Perks */}
                <section className="container-custom mb-16">
                    <h2 className="font-display text-2xl font-bold mb-8">Why Work With Us</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {perks.map((perk) => (
                            <div key={perk.title} className="p-5 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 mb-3">{perk.icon}</div>
                                <h3 className="font-semibold mb-1">{perk.title}</h3>
                                <p className="text-sm text-[color:var(--color-text-muted)]">{perk.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Open Positions */}
                <section className="container-custom mb-16">
                    <h2 className="font-display text-2xl font-bold mb-8">Open Positions</h2>
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div key={job.title} className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] hover:border-primary-500/50 transition-colors">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="font-display text-xl font-semibold mb-2">{job.title}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs bg-primary-500/20 text-primary-400">
                                                {job.department}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs bg-secondary-500/20 text-secondary-400">
                                                {job.location}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs bg-accent-500/20 text-accent-400">
                                                {job.type}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="px-5 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm transition-colors">
                                        Apply Now
                                    </button>
                                </div>
                                <p className="text-[color:var(--color-text-secondary)] mb-4">{job.description}</p>
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                                    <ul className="grid md:grid-cols-2 gap-1">
                                        {job.requirements.map((req, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
                                                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* No Match CTA */}
                <section className="container-custom">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-[color:var(--color-border)] text-center">
                        <h2 className="font-display text-2xl font-bold mb-4">Don't see a perfect fit?</h2>
                        <p className="text-[color:var(--color-text-secondary)] mb-6 max-w-xl mx-auto">
                            We're always looking for talented people who share our mission. Send us your resume
                            and tell us how you'd contribute to SocraticDev.
                        </p>
                        <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors">
                            Get in Touch
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default CareersPage;
