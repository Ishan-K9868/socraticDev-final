import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../ui/Button';
import { ChallengeIcons, DojoIcon } from '../features/dojo/ChallengeIcons';

gsap.registerPlugin(ScrollTrigger);

interface Challenge {
    id: keyof typeof ChallengeIcons;
    name: string;
    tagline: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

const CHALLENGES: Challenge[] = [
    { id: 'parsons', name: 'Parsons Problem', tagline: 'Drag. Drop. Debug.', description: 'Arrange scrambled code blocks into working solutions', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
    { id: 'surgery', name: 'Code Surgery', tagline: 'Find the bugs.', description: 'Hunt down hidden bugs and fix them under pressure', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
    { id: 'eli5', name: 'ELI5 Mode', tagline: 'Explain simply.', description: 'Explain complex code so anyone can understand', color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
    { id: 'mental', name: 'Mental Compiler', tagline: 'Be the machine.', description: 'Predict code output without running it', color: 'text-violet-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
    { id: 'bigo', name: 'Big O Battle', tagline: 'Know complexity.', description: 'Race to identify algorithm time complexity', color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
    { id: 'rubber-duck', name: 'Rubber Duck', tagline: 'Talk it out.', description: 'Debug by explaining your code step-by-step', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
    { id: 'translation', name: 'Code Translator', tagline: 'Speak all tongues.', description: 'Convert code between programming languages', color: 'text-teal-500', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30' },
    { id: 'tdd', name: 'TDD Arena', tagline: 'Test first.', description: 'Write code to pass progressively harder tests', color: 'text-lime-500', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/30' },
    { id: 'pattern', name: 'Pattern Detective', tagline: 'Spot patterns.', description: 'Identify design patterns and code smells', color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30' },
    { id: 'faded', name: 'Fill the Blanks', tagline: 'Complete the puzzle.', description: 'Fill in missing parts of working code', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
];

const BENEFITS = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Active Recall',
        description: 'Learn by doing, not just reading. Each challenge forces you to actively engage with concepts.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        title: 'Deliberate Practice',
        description: 'Targeted exercises that push your skills just beyond your comfort zone.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: 'Track Progress',
        description: 'Watch your skills grow with points, streaks, and earned badges.'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'Instant Feedback',
        description: 'Know immediately what you got right and learn from mistakes in real-time.'
    },
];

function DojoSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const ringsContainerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const challengeGridRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);
    const [activeChallenge, setActiveChallenge] = useState(0);

    // Auto-rotate featured challenge
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveChallenge(prev => (prev + 1) % CHALLENGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!sectionRef.current || !ringsContainerRef.current) return;

        const ctx = gsap.context(() => {
            // SATURN RINGS - Scroll-driven fall animation
            const ringsTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'top 20%',
                    scrub: 1.5,
                }
            });

            // Ring 1 (outer) - starts tilted and spinning, falls into place
            ringsTimeline.fromTo('.saturn-ring-1',
                {
                    rotateX: 75,
                    rotateZ: 30,
                    scale: 2,
                    opacity: 0.3,
                    y: -200,
                },
                {
                    rotateX: 0,
                    rotateZ: 0,
                    scale: 1,
                    opacity: 0.4,
                    y: 0,
                    ease: 'power2.out'
                },
                0
            );

            // Ring 2 (middle) - different timing
            ringsTimeline.fromTo('.saturn-ring-2',
                {
                    rotateX: -60,
                    rotateZ: -45,
                    scale: 2.5,
                    opacity: 0.2,
                    y: -300,
                },
                {
                    rotateX: 0,
                    rotateZ: 0,
                    scale: 1,
                    opacity: 0.3,
                    y: 0,
                    ease: 'power2.out'
                },
                0.1
            );

            // Ring 3 (inner) - arrives last
            ringsTimeline.fromTo('.saturn-ring-3',
                {
                    rotateX: 85,
                    rotateZ: 60,
                    scale: 1.8,
                    opacity: 0.4,
                    y: -150,
                },
                {
                    rotateX: 0,
                    rotateZ: 0,
                    scale: 1,
                    opacity: 0.5,
                    y: 0,
                    ease: 'power2.out'
                },
                0.2
            );

            // Central orb - scales up as rings settle
            ringsTimeline.fromTo('.central-orb',
                {
                    scale: 0,
                    opacity: 0,
                },
                {
                    scale: 1,
                    opacity: 1,
                    ease: 'back.out(1.7)'
                },
                0.3
            );

            // Continuous ring rotation after settling
            gsap.to('.saturn-ring-1', {
                rotateZ: '+=360',
                duration: 60,
                repeat: -1,
                ease: 'none'
            });
            gsap.to('.saturn-ring-2', {
                rotateZ: '-=360',
                duration: 80,
                repeat: -1,
                ease: 'none'
            });
            gsap.to('.saturn-ring-3', {
                rotateZ: '+=360',
                duration: 100,
                repeat: -1,
                ease: 'none'
            });

            // Header reveal
            gsap.fromTo('.dojo-badge',
                { scale: 0, rotation: -180 },
                {
                    scale: 1,
                    rotation: 0,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)',
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Title words stagger
            gsap.fromTo('.title-word',
                { y: 80, opacity: 0, rotationX: -90 },
                {
                    y: 0,
                    opacity: 1,
                    rotationX: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Subtitle
            gsap.fromTo('.dojo-subtitle',
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    delay: 0.4,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Challenge cards cascade
            const cards = gsap.utils.toArray('.challenge-card');
            cards.forEach((card, i) => {
                const fromLeft = i % 2 === 0;
                gsap.fromTo(card as Element,
                    { x: fromLeft ? -100 : 100, opacity: 0, scale: 0.8 },
                    {
                        x: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        delay: i * 0.08,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: challengeGridRef.current,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });

            // Benefits pop in
            gsap.fromTo('.benefit-card',
                { y: 60, opacity: 0, scale: 0.9 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.12,
                    ease: 'back.out(1.4)',
                    scrollTrigger: {
                        trigger: benefitsRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const featured = CHALLENGES[activeChallenge];
    const FeaturedIcon = ChallengeIcons[featured.id];

    return (
        <section
            ref={sectionRef}
            id="dojo"
            className="relative py-24 lg:py-32 bg-[color:var(--color-bg-secondary)] overflow-hidden"
        >
            {/* Saturn Rings Container - The WOW factor */}
            <div
                ref={ringsContainerRef}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ perspective: '1000px' }}
            >
                {/* Outer Ring */}
                <div
                    className="saturn-ring-1 absolute w-[700px] h-[700px] rounded-full border-4 border-dashed"
                    style={{
                        borderColor: 'rgba(var(--color-primary-rgb, 249, 115, 22), 0.3)',
                        transformStyle: 'preserve-3d'
                    }}
                />

                {/* Middle Ring */}
                <div
                    className="saturn-ring-2 absolute w-[500px] h-[500px] rounded-full border-[3px]"
                    style={{
                        borderColor: 'rgba(var(--color-secondary-rgb, 6, 182, 212), 0.25)',
                        borderStyle: 'dotted',
                        transformStyle: 'preserve-3d'
                    }}
                />

                {/* Inner Ring */}
                <div
                    className="saturn-ring-3 absolute w-[300px] h-[300px] rounded-full border-2 border-dashed"
                    style={{
                        borderColor: 'rgba(var(--color-primary-rgb, 249, 115, 22), 0.4)',
                        transformStyle: 'preserve-3d'
                    }}
                />

                {/* Central Glowing Orb */}
                <div className="central-orb absolute">
                    <div className="relative">
                        <div className="absolute inset-0 w-28 h-28 bg-primary-500/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-2 border-primary-500/40 flex items-center justify-center backdrop-blur-sm">
                            <DojoIcon size={48} className="text-primary-400" />
                        </div>
                    </div>
                </div>

                {/* Orbiting particles */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-primary-400/60"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: `rotate(${i * 45}deg) translateX(${150 + (i % 3) * 100}px)`,
                            animation: `orbit ${20 + i * 5}s linear infinite${i % 2 === 1 ? ' reverse' : ''}`
                        }}
                    />
                ))}
            </div>

            {/* Grid pattern background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(128, 128, 128, 0.6) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(128, 128, 128, 0.6) 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px'
                    }}
                />

                {/* Gradient orbs */}
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header Section */}
                <div ref={headerRef} className="text-center mb-16 lg:mb-20">
                    <div className="dojo-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
                        <DojoIcon size={20} className="text-primary-500" />
                        <span className="text-sm font-semibold text-primary-500 tracking-wide uppercase">
                            The Dojo
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6 perspective-500">
                        <span className="title-word inline-block">Train</span>{' '}
                        <span className="title-word inline-block">Your</span>{' '}
                        <span className="title-word inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                            Coding
                        </span>{' '}
                        <span className="title-word inline-block text-transparent bg-clip-text bg-gradient-to-r from-secondary-500 to-primary-500">
                            Skills
                        </span>
                    </h2>

                    <p className="dojo-subtitle text-lg lg:text-xl text-[color:var(--color-text-muted)] max-w-2xl mx-auto">
                        Master programming through <strong className="text-[color:var(--color-text-primary)]">10 unique interactive challenges</strong>.
                        <br className="hidden sm:block" />
                        Earn points, unlock badges, and level up your problem-solving abilities.
                    </p>
                </div>

                {/* Featured Challenge Showcase */}
                <div className="mb-16 lg:mb-20">
                    <div className="relative max-w-4xl mx-auto">
                        <div className={`relative p-8 rounded-3xl ${featured.bgColor} border-2 ${featured.borderColor} transition-all duration-500 backdrop-blur-sm`}>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className={`w-20 h-20 rounded-2xl ${featured.bgColor} border ${featured.borderColor} flex items-center justify-center ${featured.color}`}>
                                    {FeaturedIcon && <FeaturedIcon size={40} />}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                        <h3 className="text-2xl font-bold">{featured.name}</h3>
                                        <span className={`text-sm px-2 py-0.5 rounded-full ${featured.bgColor} ${featured.color} font-medium`}>
                                            {featured.tagline}
                                        </span>
                                    </div>
                                    <p className="text-[color:var(--color-text-muted)]">{featured.description}</p>
                                </div>

                                <div className="flex gap-1.5">
                                    {CHALLENGES.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveChallenge(i)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeChallenge
                                                ? 'w-6 bg-primary-500'
                                                : 'bg-[color:var(--color-border)] hover:bg-[color:var(--color-text-muted)]'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Challenge Grid */}
                <div ref={challengeGridRef} className="mb-16 lg:mb-20">
                    <h3 className="text-center text-lg font-semibold text-[color:var(--color-text-muted)] mb-8">
                        All 10 Challenges
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {CHALLENGES.map((challenge, i) => {
                            const IconComponent = ChallengeIcons[challenge.id];
                            const isActive = i === activeChallenge;

                            return (
                                <button
                                    key={challenge.id}
                                    onClick={() => setActiveChallenge(i)}
                                    className={`
                                        challenge-card group relative p-4 rounded-2xl border-2 transition-all duration-300
                                        ${isActive
                                            ? `${challenge.bgColor} ${challenge.borderColor} scale-105 shadow-lg`
                                            : 'bg-[color:var(--color-bg-primary)] border-[color:var(--color-border)] hover:border-primary-500/50 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className={`mb-3 ${challenge.color} transition-transform group-hover:scale-110`}>
                                        {IconComponent && <IconComponent size={32} />}
                                    </div>
                                    <div className="font-semibold text-sm leading-tight">{challenge.name}</div>
                                    {isActive && (
                                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${challenge.color.replace('text-', 'bg-')} animate-pulse`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Benefits Section */}
                <div ref={benefitsRef} className="mb-16 lg:mb-20">
                    <h3 className="text-center text-2xl font-bold mb-8">
                        Why Train in The Dojo?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {BENEFITS.map((benefit, i) => (
                            <div
                                key={i}
                                className="benefit-card p-6 rounded-2xl bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] hover:border-primary-500/30 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="text-4xl mb-4">{benefit.icon}</div>
                                <h4 className="font-bold text-lg mb-2">{benefit.title}</h4>
                                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap justify-center gap-8 lg:gap-16 mb-16">
                    {[
                        { value: '10', label: 'Challenge Types' },
                        { value: '∞', label: 'Practice Sessions' },
                        { value: '7', label: 'Languages Supported' },
                        { value: '🏆', label: 'Badges to Earn' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-4xl lg:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-secondary-500">
                                {stat.value}
                            </div>
                            <div className="text-sm text-[color:var(--color-text-muted)] mt-1 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link to="/dojo">
                        <Button size="lg" className="group text-lg px-8 py-4">
                            <span className="flex items-center gap-3">
                                <DojoIcon size={24} />
                                Enter The Dojo
                                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </Button>
                    </Link>
                    <p className="text-sm text-[color:var(--color-text-muted)] mt-4 max-w-md mx-auto">
                        Free to use. No account required. Start training immediately.
                    </p>
                </div>
            </div>

            {/* Keyframes for orbiting particles */}
            <style>{`
                @keyframes orbit {
                    from { transform: rotate(0deg) translateX(200px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(200px) rotate(-360deg); }
                }
            `}</style>
        </section>
    );
}

export default DojoSection;
