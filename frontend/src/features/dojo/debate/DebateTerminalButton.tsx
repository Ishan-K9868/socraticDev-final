import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface DebateTerminalButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
}

/**
 * A massive, beautiful floating button that visually explains its purpose:
 * Two distinct AI entities (Teacher & Critic) analyzing/debating over code.
 * Matches the app's sleek, modern glassmorphism aesthetic.
 */
function DebateTerminalButton({ onClick, isActive = false, disabled = false }: DebateTerminalButtonProps) {
    const btnRef = useRef<HTMLButtonElement>(null);
    const codeDocRef = useRef<SVGRectElement>(null);
    const teacherDroneRef = useRef<SVGGElement>(null);
    const criticDroneRef = useRef<SVGGElement>(null);
    const teacherBeamRef = useRef<SVGPathElement>(null);
    const criticBeamRef = useRef<SVGPathElement>(null);
    const ambientGlowRef = useRef<SVGCircleElement>(null);

    // Continuous narrative animation loop: The Debate
    useEffect(() => {
        if (isActive) return; // Pause story animation when active (we show a different steady state)

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

            // Initial state
            gsap.set([teacherBeamRef.current, criticBeamRef.current], { strokeDasharray: '0, 100', opacity: 0 });
            gsap.set(teacherDroneRef.current, { y: 0 });
            gsap.set(criticDroneRef.current, { y: 0 });
            gsap.set(codeDocRef.current, { fillOpacity: 0.1 });

            tl.addLabel('start')
                // 1. Teacher floats up, analyzes (Blue Beam)
                .to(teacherDroneRef.current, { y: -4, duration: 1 })
                .to(ambientGlowRef.current, { fill: '#3b82f6', opacity: 0.2, duration: 0.5 }, '<')
                .to(teacherBeamRef.current, { opacity: 0.8, strokeDasharray: '100, 0', duration: 0.6 })
                .to(codeDocRef.current, { fillOpacity: 0.6, stroke: '#60a5fa', duration: 0.5 }, '<0.2')
                .to(teacherBeamRef.current, { opacity: 0, duration: 0.4 }, '+=0.5')

                // 2. Critic floats up, scrutinizes (Orange Beam)
                .to(teacherDroneRef.current, { y: 2, duration: 1 }, '+=0.2')
                .to(criticDroneRef.current, { y: -4, duration: 1 }, '<')
                .to(ambientGlowRef.current, { fill: '#f97316', opacity: 0.2, duration: 0.5 }, '<')
                .to(criticBeamRef.current, { opacity: 0.8, strokeDasharray: '100, 0', duration: 0.6 })
                .to(codeDocRef.current, { fillOpacity: 0.6, stroke: '#fb923c', duration: 0.5 }, '<0.2')
                .to(criticBeamRef.current, { opacity: 0, duration: 0.4 }, '+=0.5')

                // 3. Both clash/debate (Both Beams)
                .to([teacherDroneRef.current, criticDroneRef.current], { y: -2, duration: 0.6 })
                .to(ambientGlowRef.current, { fill: '#a855f7', opacity: 0.3, duration: 0.5 }, '<') // Purple clash
                .to([teacherBeamRef.current, criticBeamRef.current], { opacity: 0.8, strokeDasharray: '100, 0', duration: 0.4, strokeDashoffset: -20 }, '<')
                .to(codeDocRef.current, { fillOpacity: 0.9, stroke: '#c084fc', duration: 0.4 }, '<')

                // 4. Resolve down
                .to([teacherBeamRef.current, criticBeamRef.current], { opacity: 0, duration: 0.5 }, '+=1')
                .to([teacherDroneRef.current, criticDroneRef.current], { y: 0, duration: 1 })
                .to(codeDocRef.current, { fillOpacity: 0.1, stroke: 'currentColor', duration: 1 }, '<')
                .to(ambientGlowRef.current, { opacity: 0, duration: 1 }, '<');

            // Floating effect for the document
            gsap.to(codeDocRef.current, {
                y: -3,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

        });
        return () => ctx.revert();
    }, [isActive]);

    // Active state steady animation
    useEffect(() => {
        if (!isActive) return;
        const ctx = gsap.context(() => {
            gsap.to(ambientGlowRef.current, {
                opacity: 0.4,
                fill: '#6366f1',
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
            gsap.to([teacherDroneRef.current, criticDroneRef.current], {
                y: -3,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.75
            });
            gsap.set([teacherBeamRef.current, criticBeamRef.current], { opacity: 0 });
            gsap.to(codeDocRef.current, { stroke: '#a5b4fc', fillOpacity: 0.4, duration: 0.5 });
        });
        return () => ctx.revert();
    }, [isActive]);

    // Entrance animation
    useEffect(() => {
        if (!btnRef.current) return;
        gsap.fromTo(
            btnRef.current,
            { scale: 0, opacity: 0, x: -50 },
            { scale: 1, opacity: 1, x: 0, duration: 0.8, ease: 'elastic.out(1, 0.7)', delay: 0.2 },
        );
    }, []);

    return (
        <button
            ref={btnRef}
            onClick={onClick}
            disabled={disabled}
            aria-label={isActive ? 'Close Socratic Debate' : 'Open Socratic Debate'}
            className={`
                group relative w-[180px] h-[180px] rounded-[40px] flex items-center justify-center
                transition-all duration-400 outline-none
                focus-visible:ring-4 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)]
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${isActive
                    ? 'scale-105 shadow-[0_0_40px_rgba(99,102,241,0.4)] border-primary-500/50'
                    : 'hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_40px_rgba(99,102,241,0.2)]'
                }
                bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50
            `}
        >
            {/* The SVG narrative canvas */}
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full p-2 text-slate-800 dark:text-slate-200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background ambient glow emitted by the debate */}
                <circle ref={ambientGlowRef} cx="50" cy="50" r="30" fill="transparent" style={{ filter: 'blur(10px)' }} />

                {/* Central Focus: The Code Document */}
                <g className="drop-shadow-sm">
                    <rect ref={codeDocRef} x="41" y="40" width="18" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" className="fill-slate-100 dark:fill-slate-800" />
                    <line x1="45" y1="46" x2="55" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                    <line x1="45" y1="52" x2="51" y2="52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                    <line x1="45" y1="58" x2="55" y2="58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                </g>

                {/* Beams (initially hidden by GSAP) */}
                <path ref={teacherBeamRef} d="M30 45 C 35 45, 40 45, 41 45" stroke="#3b82f6" strokeWidth="2" strokeDasharray="100" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px #60a5fa)' }} />
                <path ref={criticBeamRef} d="M70 45 C 65 45, 60 45, 59 45" stroke="#f97316" strokeWidth="2" strokeDasharray="100" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px #fb923c)' }} />

                {/* Left Entity: Teacher Drone (Smooth, curved, blue aura) */}
                <g ref={teacherDroneRef}>
                    <circle cx="24" cy="45" r="8" className="fill-blue-100 dark:fill-blue-900/40" stroke="#3b82f6" strokeWidth="1.5" />
                    <circle cx="24" cy="45" r="3" fill="#60a5fa" className="animate-[pulse_2s_ease-in-out_infinite]" />
                    {/* Tiny orbit particle */}
                    <circle cx="24" cy="33" r="1.5" fill="#93c5fd" className="origin-[24px_45px] animate-[spin_4s_linear_infinite]" />
                </g>

                {/* Right Entity: Critic Drone (Sharp, angular, orange aura) */}
                <g ref={criticDroneRef}>
                    <polygon points="76,37 84,45 76,53 68,45" className="fill-orange-100 dark:fill-orange-900/40" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="76" cy="45" r="2.5" fill="#fb923c" className="animate-[pulse_1.5s_ease-in-out_infinite]" />
                    {/* Tiny orbit particle */}
                    <circle cx="76" cy="34" r="1.5" fill="#fdba74" className="origin-[76px_45px] animate-[spin_3s_linear_infinite_reverse]" />
                </g>

                {/* Communication network arcs mapping them together */}
                <path d="M 28 62 Q 50 75 72 62" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" fill="none" />
                <path d="M 28 28 Q 50 15 72 28" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" fill="none" />

                {/* Network nodes */}
                <circle cx="50" cy="71.5" r="2" fill="currentColor" opacity="0.4" />
                <circle cx="50" cy="18.5" r="2" fill="currentColor" opacity="0.4" />
            </svg>

            {/* Context Tooltip on the right side */}
            <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 flex flex-col px-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -translate-x-3 group-hover:translate-x-0 z-50">
                <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {isActive ? 'Close Arena' : 'Socratic Multi-Agent Arena'}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                    Teacher & Critic analyze your code
                </span>
                {/* Pointer Arrow */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-slate-200 dark:border-r-slate-700" />
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[7px] border-r-white dark:border-r-slate-800 translate-x-[1px]" />
            </div>
        </button>
    );
}

export default DebateTerminalButton;
