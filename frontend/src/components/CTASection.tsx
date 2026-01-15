import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Button from '../ui/Button';

function CTASection() {
    const containerRef = useRef<HTMLElement>(null);
    const gradientRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Animate gradient continuously
        gsap.to(gradientRef.current, {
            filter: 'hue-rotate(360deg)',
            duration: 20,
            repeat: -1,
            ease: 'none',
        });

        // Animate content on scroll
        gsap.from('.cta-content > *', {
            opacity: 0,
            y: 40,
            stagger: 0.15,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 70%',
                end: 'top 40%',
                scrub: 1,
            },
        });

        // Floating shapes animation
        gsap.to('.cta-shape', {
            y: '+=20',
            rotation: '+=10',
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            stagger: 0.5,
        });

    }, { scope: containerRef });

    // Magnetic button effect
    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;

        gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    };

    return (
        <section
            ref={containerRef}
            className="relative py-24 lg:py-32 overflow-hidden"
        >
            {/* Background gradient */}
            <div
                ref={gradientRef}
                className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-accent-500/20"
            />

            {/* Grid pattern */}
            <div className="absolute inset-0 grid-pattern opacity-20" />

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="cta-shape absolute top-20 left-[10%] w-20 h-20 rounded-2xl bg-primary-500/10 rotate-12" />
                <div className="cta-shape absolute top-40 right-[15%] w-16 h-16 rounded-full bg-secondary-500/10" />
                <div className="cta-shape absolute bottom-20 left-[20%] w-24 h-24 rounded-3xl bg-accent-500/10 -rotate-12" />
                <div className="cta-shape absolute bottom-40 right-[10%] w-14 h-14 rounded-xl bg-primary-500/10 rotate-45" />
            </div>

            <div className="container-custom relative z-10">
                <div className="cta-content max-w-3xl mx-auto text-center">
                    {/* Heading */}
                    <h2 className="font-display text-display-lg font-bold mb-6">
                        Ready to code{' '}
                        <span className="text-gradient-primary">smarter</span>?
                    </h2>

                    {/* Subheading */}
                    <p className="text-lg lg:text-xl text-[color:var(--color-text-secondary)] mb-10 max-w-2xl mx-auto">
                        Join thousands of developers who are learning, not just copying.
                        Start your journey to deeper code understanding today.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Link to="/app">
                            <Button
                                size="lg"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                Get Started Free
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Button>
                        </Link>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                            <Button
                                variant="secondary"
                                size="lg"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                View on GitHub
                            </Button>
                        </a>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[color:var(--color-text-muted)]">
                        <div className="flex items-center gap-2">
                            <span className="text-success">✓</span>
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-success">✓</span>
                            <span>Free tier includes 100 questions/month</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-success">✓</span>
                            <span>Works with any codebase</span>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="mt-16 max-w-xl mx-auto">
                        <div className="p-6 rounded-2xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                            <div className="flex items-center justify-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <blockquote className="text-lg italic mb-4">
                                "Finally, an AI that helps me understand code instead of making me dependent on it.
                                My debugging skills have improved dramatically."
                            </blockquote>
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                                    JD
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">Jane Doe</p>
                                    <p className="text-sm text-[color:var(--color-text-muted)]">Senior Developer @ TechCorp</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CTASection;
