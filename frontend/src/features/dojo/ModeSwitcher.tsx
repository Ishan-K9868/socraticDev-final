import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface ModeSwitcherProps {
    useAI: boolean;
    onToggle: (value: boolean) => void;
}

/**
 * A creative mode switcher for Dojo challenges
 * Switches between Practice Mode (hardcoded examples) and AI Mode (API calls)
 */
function ModeSwitcher({ useAI, onToggle }: ModeSwitcherProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const practiceRef = useRef<HTMLDivElement>(null);
    const aiRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);

    // Animate on mode change
    useEffect(() => {
        if (!indicatorRef.current || !practiceRef.current || !aiRef.current) return;

        const indicator = indicatorRef.current;
        const practiceIcon = practiceRef.current;
        const aiIcon = aiRef.current;

        // Kill any existing animations
        gsap.killTweensOf([indicator, practiceIcon, aiIcon]);

        if (useAI) {
            // AI Mode animation
            const tl = gsap.timeline();
            tl.to(indicator, {
                x: 100,
                duration: 0.5,
                ease: 'power3.out'
            })
                .to(indicator, {
                    backgroundColor: 'rgb(147, 51, 234)', // purple
                    boxShadow: '0 0 20px rgba(147, 51, 234, 0.6), 0 0 40px rgba(147, 51, 234, 0.3)',
                    duration: 0.3
                }, 0)
                .to(practiceIcon, {
                    scale: 0.85,
                    opacity: 0.4,
                    duration: 0.3
                }, 0)
                .to(aiIcon, {
                    scale: 1.1,
                    opacity: 1,
                    duration: 0.4,
                    ease: 'back.out(1.7)'
                }, 0.1);

            // Pulse effect for AI mode
            gsap.to(indicator, {
                boxShadow: '0 0 25px rgba(147, 51, 234, 0.8), 0 0 50px rgba(147, 51, 234, 0.4)',
                repeat: -1,
                yoyo: true,
                duration: 1.5,
                ease: 'sine.inOut'
            });
        } else {
            // Practice Mode animation
            const tl = gsap.timeline();
            tl.to(indicator, {
                x: 0,
                duration: 0.5,
                ease: 'power3.out'
            })
                .to(indicator, {
                    backgroundColor: 'rgb(16, 185, 129)', // emerald
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.2)',
                    duration: 0.3
                }, 0)
                .to(aiIcon, {
                    scale: 0.85,
                    opacity: 0.4,
                    duration: 0.3
                }, 0)
                .to(practiceIcon, {
                    scale: 1.1,
                    opacity: 1,
                    duration: 0.4,
                    ease: 'back.out(1.7)'
                }, 0.1);
        }
    }, [useAI]);

    // Initial entrance animation
    useEffect(() => {
        if (!containerRef.current) return;

        gsap.fromTo(containerRef.current,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 }
        );
    }, []);

    // Create particle burst on toggle
    const createParticles = () => {
        if (!particlesRef.current) return;

        const container = particlesRef.current;
        const colors = useAI
            ? ['#9333ea', '#a855f7', '#c084fc', '#7c3aed']
            : ['#10b981', '#34d399', '#6ee7b7', '#059669'];

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-2 h-2 rounded-full';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = '50%';
            particle.style.top = '50%';
            container.appendChild(particle);

            const angle = (i / 12) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;

            gsap.fromTo(particle,
                { x: 0, y: 0, scale: 1, opacity: 1 },
                {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 0,
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    onComplete: () => particle.remove()
                }
            );
        }
    };

    const handleToggle = () => {
        createParticles();
        onToggle(!useAI);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Label */}
            <div className="text-xs text-[color:var(--color-text-muted)] mb-2 text-center font-medium uppercase tracking-wider">
                Challenge Source
            </div>

            {/* Main Toggle Container */}
            <div
                className="relative flex items-center bg-[color:var(--color-bg-tertiary)] rounded-full p-1 cursor-pointer border border-[color:var(--color-border)] backdrop-blur-sm"
                onClick={handleToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
            >
                {/* Sliding Indicator */}
                <div
                    ref={indicatorRef}
                    className="absolute w-[100px] h-10 rounded-full transition-transform"
                    style={{
                        backgroundColor: useAI ? 'rgb(147, 51, 234)' : 'rgb(16, 185, 129)',
                        boxShadow: useAI
                            ? '0 0 20px rgba(147, 51, 234, 0.6), 0 0 40px rgba(147, 51, 234, 0.3)'
                            : '0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.2)',
                        left: '4px',
                        transform: `translateX(${useAI ? 100 : 0}px)`
                    }}
                />

                {/* Particle Container */}
                <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-visible" />

                {/* Practice Mode Option */}
                <div
                    ref={practiceRef}
                    className={`relative z-10 w-[100px] h-10 flex items-center justify-center gap-2 transition-all ${!useAI ? 'text-white' : 'text-[color:var(--color-text-muted)]'
                        }`}
                    style={{
                        transform: !useAI ? 'scale(1.1)' : 'scale(0.85)',
                        opacity: !useAI ? 1 : 0.4
                    }}
                >
                    {/* Book/Practice Icon */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                        <path d="M8 7h8M8 11h6" />
                    </svg>
                    <span className="text-sm font-semibold">Practice</span>
                </div>

                {/* AI Mode Option */}
                <div
                    ref={aiRef}
                    className={`relative z-10 w-[100px] h-10 flex items-center justify-center gap-2 transition-all ${useAI ? 'text-white' : 'text-[color:var(--color-text-muted)]'
                        }`}
                    style={{
                        transform: useAI ? 'scale(1.1)' : 'scale(0.85)',
                        opacity: useAI ? 1 : 0.4
                    }}
                >
                    {/* AI/Brain Icon */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a4 4 0 014 4v1a4 4 0 01-4 4 4 4 0 01-4-4V6a4 4 0 014-4z" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <circle cx="9" cy="8" r="1" fill="currentColor" />
                        <circle cx="15" cy="8" r="1" fill="currentColor" />
                        <path d="M3 21c0-3.866 4.03-7 9-7s9 3.134 9 7" />
                        <path d="M12 11v3M8 21v-2M16 21v-2" />
                    </svg>
                    <span className="text-sm font-semibold">AI Mode</span>
                </div>
            </div>

            {/* Description */}
            <div className="text-xs text-center mt-2 text-[color:var(--color-text-muted)] max-w-[200px]">
                {useAI
                    ? 'Uses API credits for unique challenges'
                    : 'Instant practice with built-in examples'
                }
            </div>
        </div>
    );
}

export default ModeSwitcher;
