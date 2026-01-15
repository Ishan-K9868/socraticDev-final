import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useStore } from '../../store/useStore';

interface ModeToggleProps {
    size?: 'sm' | 'md' | 'lg';
    showLabels?: boolean;
}

function ModeToggle({ size = 'md', showLabels = true }: ModeToggleProps) {
    const { mode, toggleMode } = useStore();
    const thumbRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (thumbRef.current) {
            gsap.to(thumbRef.current, {
                x: mode === 'building' ? '100%' : '0%',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    }, { dependencies: [mode] });

    const sizes = {
        sm: {
            track: 'w-12 h-6',
            thumb: 'w-5 h-5',
            text: 'text-xs',
            gap: 'gap-2',
        },
        md: {
            track: 'w-14 h-7',
            thumb: 'w-6 h-6',
            text: 'text-sm',
            gap: 'gap-3',
        },
        lg: {
            track: 'w-16 h-8',
            thumb: 'w-7 h-7',
            text: 'text-base',
            gap: 'gap-4',
        },
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex items-center ${currentSize.gap}`}>
            {showLabels && (
                <button
                    onClick={() => mode !== 'learning' && toggleMode()}
                    className={`flex items-center gap-1.5 ${currentSize.text} font-medium transition-colors ${mode === 'learning'
                            ? 'text-accent-600 dark:text-accent-400'
                            : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-secondary)]'
                        }`}
                >
                    <span className="text-base">🎓</span>
                    Learn
                </button>
            )}

            <button
                onClick={toggleMode}
                className={`relative ${currentSize.track} rounded-full p-0.5 cursor-pointer transition-colors ${mode === 'learning'
                        ? 'bg-accent-500'
                        : 'bg-secondary-500'
                    }`}
                aria-label={`Switch to ${mode === 'learning' ? 'build' : 'learning'} mode`}
            >
                <div
                    ref={thumbRef}
                    className={`${currentSize.thumb} rounded-full bg-white shadow-md transition-none`}
                    style={{ marginLeft: '2px' }}
                />
            </button>

            {showLabels && (
                <button
                    onClick={() => mode !== 'building' && toggleMode()}
                    className={`flex items-center gap-1.5 ${currentSize.text} font-medium transition-colors ${mode === 'building'
                            ? 'text-secondary-600 dark:text-secondary-400'
                            : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-secondary)]'
                        }`}
                >
                    <span className="text-base">🚀</span>
                    Build
                </button>
            )}
        </div>
    );
}

export default ModeToggle;
