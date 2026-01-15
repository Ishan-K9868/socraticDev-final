import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function Loader() {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!containerRef.current || !progressRef.current || !textRef.current) return;

        const tl = gsap.timeline();

        // Animate progress bar
        tl.to(progressRef.current, {
            scaleX: 1,
            duration: 1.8,
            ease: 'power2.inOut',
            onUpdate: function () {
                if (textRef.current) {
                    const progress = Math.round(this.progress() * 100);
                    textRef.current.textContent = `${progress}%`;
                }
            },
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="loader-container"
        >
            <div className="flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <svg
                            className="w-7 h-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                    </div>
                    <span className="font-display text-2xl font-bold">SocraticDev</span>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1.5 bg-[color:var(--color-bg-muted)] rounded-full overflow-hidden">
                    <div
                        ref={progressRef}
                        className="loader-progress h-full"
                    />
                </div>

                {/* Percentage */}
                <span
                    ref={textRef}
                    className="font-mono text-sm text-[color:var(--color-text-secondary)]"
                >
                    0%
                </span>

                {/* Loading text */}
                <p className="text-sm text-[color:var(--color-text-muted)]">
                    Preparing your learning environment...
                </p>
            </div>
        </div>
    );
}

export default Loader;
