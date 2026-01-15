import { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

interface OnboardingProps {
    onComplete: () => void;
}

const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to SocraticDev',
        description: 'The AI coding assistant that teaches you to think like a developer, not just copy code.',
        image: '🎓',
        tip: 'Built with the Socratic method at its core',
    },
    {
        id: 'modes',
        title: 'Two Powerful Modes',
        description: 'Switch between Learning Mode (guided questions) and Build Mode (direct code generation) based on your needs.',
        image: '🔄',
        features: [
            { emoji: '🎓', label: 'Learning Mode', desc: 'Asks guiding questions to help you understand' },
            { emoji: '🚀', label: 'Build Mode', desc: 'Generates production-ready code directly' },
        ],
    },
    {
        id: 'graphrag',
        title: 'Understand Your Codebase',
        description: 'GraphRAG visualization shows how your code is connected. See the impact of any change before you make it.',
        image: '🔗',
        tip: 'Click any node to see what it affects',
    },
    {
        id: 'upload',
        title: 'Upload Your Project',
        description: 'Drag and drop your project folder for context-aware assistance. The AI understands your entire codebase.',
        image: '📁',
        tip: 'Supports Python, JavaScript, TypeScript, Java, and more',
    },
    {
        id: 'ready',
        title: "You're All Set!",
        description: 'Start learning, building, and shipping faster with SocraticDev.',
        image: '✨',
    },
];

function Onboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const step = ONBOARDING_STEPS[currentStep];
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    useGSAP(() => {
        gsap.from(containerRef.current, {
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    // Animate content on step change
    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
            );
        }
    }, [currentStep]);

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
            <div className="w-full max-w-lg bg-[color:var(--color-bg-secondary)] rounded-2xl shadow-2xl overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-[color:var(--color-bg-muted)]">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div ref={contentRef} className="p-8">
                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-6">
                        <Badge variant="secondary">
                            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                        </Badge>
                        <button
                            onClick={handleSkip}
                            className="text-sm text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
                        >
                            Skip tour
                        </button>
                    </div>

                    {/* Icon */}
                    <div className="text-6xl mb-6 text-center">{step.image}</div>

                    {/* Title & Description */}
                    <h2 className="font-display text-2xl font-bold text-center mb-3">
                        {step.title}
                    </h2>
                    <p className="text-[color:var(--color-text-secondary)] text-center mb-6">
                        {step.description}
                    </p>

                    {/* Features (if present) */}
                    {step.features && (
                        <div className="grid gap-3 mb-6">
                            {step.features.map((feature) => (
                                <div
                                    key={feature.label}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[color:var(--color-bg-muted)]"
                                >
                                    <span className="text-2xl">{feature.emoji}</span>
                                    <div>
                                        <p className="font-medium">{feature.label}</p>
                                        <p className="text-sm text-[color:var(--color-text-muted)]">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tip (if present) */}
                    {step.tip && (
                        <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/30 mb-6">
                            <p className="text-sm text-center">
                                <span className="text-accent-500 mr-2">💡</span>
                                {step.tip}
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-4">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={isFirstStep}
                            className={isFirstStep ? 'opacity-0 pointer-events-none' : ''}
                        >
                            ← Back
                        </Button>

                        <div className="flex items-center gap-2">
                            {ONBOARDING_STEPS.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentStep(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentStep
                                        ? 'bg-primary-500 w-6'
                                        : 'bg-[color:var(--color-bg-elevated)] hover:bg-neutral-500'
                                        }`}
                                />
                            ))}
                        </div>

                        <Button onClick={handleNext}>
                            {isLastStep ? "Let's Go!" : 'Next →'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Onboarding;
