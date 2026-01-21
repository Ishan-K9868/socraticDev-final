import { Link } from 'react-router-dom';
import Button from '../ui/Button';

// Floating CTA elements
const FloatingCTA = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-500/20 via-primary-500/5 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-accent-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-gradient-to-tl from-secondary-500/15 to-transparent rounded-full blur-3xl" />

        {/* Floating rocket icons */}
        <svg className="absolute top-[20%] left-[10%] w-10 h-10 text-primary-500/20 animate-float" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.5c-3.905 0-7.5 3.155-7.5 8.5 0 3.273 1.527 6.206 4.5 8.5v2c0 .276.224.5.5.5h5c.276 0 .5-.224.5-.5v-2c2.973-2.294 4.5-5.227 4.5-8.5 0-5.345-3.595-8.5-7.5-8.5zm0 12c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
        </svg>

        <svg className="absolute bottom-[25%] right-[15%] w-12 h-12 text-accent-500/15 animate-float" style={{ animationDelay: '2s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>

        <svg className="absolute top-[35%] right-[8%] w-8 h-8 text-secondary-500/20 animate-float" style={{ animationDelay: '1s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6L12 2z" />
        </svg>

        {/* Sparkles */}
        <div className="absolute top-[15%] right-[25%] w-3 h-3">
            <div className="w-full h-full bg-accent-400/40 rounded-full animate-ping" />
        </div>
        <div className="absolute bottom-[30%] left-[20%] w-2 h-2">
            <div className="w-full h-full bg-primary-400/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-[40%] left-[30%] w-2 h-2">
            <div className="w-full h-full bg-secondary-400/40 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        </div>

        {/* Decorative arrows pointing to center */}
        <svg className="absolute top-1/2 left-[5%] -translate-y-1/2 w-16 h-16 text-primary-500/10" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 32 L48 32 M40 24 L52 32 L40 40" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <svg className="absolute top-1/2 right-[5%] -translate-y-1/2 w-16 h-16 text-primary-500/10 rotate-180" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 32 L48 32 M40 24 L52 32 L40 40" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

function CTASection() {
    return (
        <section className="section-padding relative overflow-hidden bg-gradient-to-b from-[color:var(--color-bg-primary)] to-[color:var(--color-bg-secondary)]">
            {/* Top border with gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

            {/* Floating elements */}
            <FloatingCTA />

            <div className="container-custom relative z-10">
                {/* Main CTA Card */}
                <div className="max-w-4xl mx-auto relative">
                    {/* Glow behind card */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-secondary-500/20 blur-2xl rounded-3xl" />

                    <div className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-[color:var(--color-bg-secondary)] to-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] shadow-elevated overflow-hidden">
                        {/* Corner decorations */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary-500/10 to-transparent" />

                        {/* Content */}
                        <div className="text-center relative">
                            {/* Decorative badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="text-sm font-medium text-primary-500">Limited time: Free access to The Dojo</span>
                            </div>

                            <h2 className="font-display text-display-md font-bold mb-4">
                                Ready to actually{' '}
                                <span className="relative">
                                    <span className="text-gradient-primary">understand</span>
                                    {/* Underline decoration */}
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary-500/40" viewBox="0 0 200 12" preserveAspectRatio="none">
                                        <path d="M0 6 Q50 12, 100 6 T200 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </span>
                                {' '}your code?
                            </h2>

                            <p className="text-lg text-[color:var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
                                Join thousands of developers who've transformed their learning with SocraticDev.
                                Start for free, upgrade when you're ready.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                                <Link to="/app">
                                    <Button size="lg" className="group relative overflow-hidden">
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                        <span className="relative flex items-center gap-2">
                                            Get Started Free
                                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </Button>
                                </Link>
                                <Link to="/demo">
                                    <Button variant="secondary" size="lg" className="group">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Watch Demo
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[color:var(--color-text-muted)]">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    No credit card required
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    14-day free trial
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Cancel anytime
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social proof stats */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { value: '50,000+', label: 'Developers' },
                        { value: '1M+', label: 'Questions Answered' },
                        { value: '4.9/5', label: 'Average Rating' },
                        { value: '95%', label: 'Would Recommend' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center group">
                            <div className="font-display text-3xl lg:text-4xl font-bold text-gradient-primary mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-text-secondary)] transition-colors">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CTASection;
