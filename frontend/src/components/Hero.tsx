import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Set initial states for FOUC prevention
        gsap.set('.hero-content > *', { autoAlpha: 0, y: 30 });
        gsap.set('.floating-card', { autoAlpha: 0, x: 100, rotation: 10 });

        // Main entrance timeline
        tl.to('.hero-badge', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.3)
            .to('.hero-headline', { autoAlpha: 1, y: 0, duration: 1 }, 0.5)
            .to('.hero-subtitle', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.8)
            .to('.hero-ctas', { autoAlpha: 1, y: 0, duration: 0.6 }, 1)
            .to('.floating-card', {
                autoAlpha: 1,
                x: 0,
                rotation: 0,
                stagger: 0.15,
                duration: 1,
                ease: 'back.out(1.4)',
            }, 0.8);

        // Continuous floating animation for cards
        gsap.to('.floating-card', {
            y: '+=15',
            rotation: '+=3',
            duration: 3,
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
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15;

        gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    };

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute inset-0 grid-pattern opacity-30 dark:opacity-20" />

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl" />

            <div className="container-custom relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <div className="hero-content text-center lg:text-left">
                        {/* Badge */}
                        <div className="hero-badge inline-block mb-6">
                            <Badge variant="primary" icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            }>
                                AI + Socratic Method
                            </Badge>
                        </div>

                        {/* Headline */}
                        <h1 className="hero-headline font-display text-display-xl font-bold mb-6">
                            Stop Copying Code.{' '}
                            <span className="text-gradient-primary">
                                Start Understanding It.
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="hero-subtitle text-lg lg:text-xl text-[color:var(--color-text-secondary)] mb-8 max-w-xl mx-auto lg:mx-0">
                            The AI coding assistant that teaches you through questions,
                            understands your entire codebase, and catches bugs before they ship.
                        </p>

                        {/* CTAs */}
                        <div className="hero-ctas flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link to="/app">
                                <Button
                                    size="lg"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    Start Learning
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                            <Button
                                variant="secondary"
                                size="lg"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Watch Demo
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="hero-stats mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                            {[
                                { value: '10x', label: 'Faster Learning' },
                                { value: '90%', label: 'Bug Detection' },
                                { value: '50k+', label: 'Developers' },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center lg:text-left">
                                    <div className="font-display text-2xl lg:text-3xl font-bold text-primary-500">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-[color:var(--color-text-muted)]">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Floating Cards */}
                    <div className="relative hidden lg:block h-[600px]">
                        {/* Code Card */}
                        <div className="floating-card absolute top-0 right-0 w-80">
                            <Card variant="terminal" padding="none">
                                <Card.TerminalHeader title="binary_search.py" />
                                <div className="p-4">
                                    <pre className="font-mono text-sm text-[color:var(--color-text-secondary)]">
                                        <code>{`def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`}</code>
                                    </pre>
                                </div>
                            </Card>
                        </div>

                        {/* Question Card */}
                        <div className="floating-card absolute top-40 left-0 w-72">
                            <Card className="bg-accent-500/10 border-accent-500/30">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-1">SocraticDev asks:</p>
                                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                                            "What property of the data makes binary search possible?
                                            What's required for it to work?"
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Graph Card */}
                        <div className="floating-card absolute bottom-20 right-20 w-64">
                            <Card className="bg-secondary-500/10 border-secondary-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Dependency Graph</span>
                                </div>
                                {/* Mini graph visualization */}
                                <div className="flex items-center justify-center h-24">
                                    <svg viewBox="0 0 120 60" className="w-full h-full">
                                        <circle cx="60" cy="30" r="8" className="fill-secondary-500" />
                                        <circle cx="20" cy="15" r="6" className="fill-secondary-400" />
                                        <circle cx="100" cy="15" r="6" className="fill-secondary-400" />
                                        <circle cx="30" cy="50" r="5" className="fill-secondary-300" />
                                        <circle cx="90" cy="50" r="5" className="fill-secondary-300" />
                                        <line x1="60" y1="30" x2="20" y2="15" className="stroke-secondary-400" strokeWidth="1" />
                                        <line x1="60" y1="30" x2="100" y2="15" className="stroke-secondary-400" strokeWidth="1" />
                                        <line x1="20" y1="15" x2="30" y2="50" className="stroke-secondary-300" strokeWidth="1" />
                                        <line x1="100" y1="15" x2="90" y2="50" className="stroke-secondary-300" strokeWidth="1" />
                                    </svg>
                                </div>
                            </Card>
                        </div>

                        {/* Mode Toggle Card */}
                        <div className="floating-card absolute bottom-0 left-10 w-56">
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium">Learning Mode</span>
                                    </div>
                                    <div className="w-10 h-5 rounded-full bg-accent-500 relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <span className="text-xs text-[color:var(--color-text-muted)]">Scroll to explore</span>
                <div className="w-6 h-10 rounded-full border-2 border-[color:var(--color-border)] flex justify-center pt-2">
                    <div className="w-1.5 h-3 rounded-full bg-primary-500 animate-bounce" />
                </div>
            </div>
        </section>
    );
}

export default Hero;
