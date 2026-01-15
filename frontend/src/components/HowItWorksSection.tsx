import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const steps = [
    {
        number: '01',
        title: 'Ask a Question',
        description: 'Start by asking anything about coding. Whether you\'re learning a new concept or debugging existing code.',
        visual: 'ask',
        color: 'primary',
    },
    {
        number: '02',
        title: 'AI Responds with Questions',
        description: 'Instead of giving you the answer, SocraticDev asks guiding questions to help you think through the problem.',
        visual: 'respond',
        color: 'accent',
    },
    {
        number: '03',
        title: 'You Think & Learn',
        description: 'Work through the questions with scaffolded support. If you struggle, the AI provides more direct guidance.',
        visual: 'think',
        color: 'secondary',
    },
    {
        number: '04',
        title: 'Build with Confidence',
        description: 'When you understand the concept, you can toggle to Build Mode for fast code generation - now you actually know what you\'re building.',
        visual: 'build',
        color: 'success',
    },
];

function HowItWorksSection() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        // Animate header
        gsap.from('.how-header', {
            opacity: 0,
            y: 40,
            scrollTrigger: {
                trigger: '.how-header',
                start: 'top 80%',
                end: 'top 60%',
                scrub: 1,
            },
        });

        // Animate each step
        gsap.utils.toArray<HTMLElement>('.how-step').forEach((step, i) => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: step,
                    start: 'top 70%',
                    end: 'center center',
                    scrub: 1,
                },
            });

            tl.from(step.querySelector('.step-number'), {
                scale: 0,
                rotation: -180,
                duration: 0.3,
                ease: 'back.out(2)',
            })
                .from(step.querySelector('.step-content'), {
                    x: i % 2 === 0 ? -60 : 60,
                    opacity: 0,
                    duration: 0.5,
                }, '-=0.1')
                .from(step.querySelector('.step-visual'), {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.4,
                }, '-=0.3');
        });

        // Animate the connecting line
        gsap.from('.connecting-line', {
            scaleY: 0,
            transformOrigin: 'top',
            scrollTrigger: {
                trigger: '.how-steps',
                start: 'top 60%',
                end: 'bottom 60%',
                scrub: 1,
            },
        });

    }, { scope: containerRef });

    const renderVisual = (visual: string) => {
        switch (visual) {
            case 'ask':
                return (
                    <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <span className="text-sm">👤</span>
                            </div>
                            <div className="flex-1 h-2 bg-primary-500/30 rounded animate-pulse" />
                        </div>
                        <p className="text-sm font-mono bg-[color:var(--color-bg-muted)] p-3 rounded-lg">
                            "How do I implement a debounce function?"
                        </p>
                    </div>
                );

            case 'respond':
                return (
                    <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/30">
                            <p className="text-sm font-medium text-accent-600 dark:text-accent-400 mb-2">
                                💡 SocraticDev asks:
                            </p>
                            <ul className="text-sm space-y-2">
                                <li>1. When should debounce trigger - immediately or after waiting?</li>
                                <li>2. What happens to multiple rapid calls?</li>
                            </ul>
                        </div>
                    </div>
                );

            case 'think':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                            <span>Scaffolding Level 2</span>
                        </div>
                        <div className="p-4 rounded-xl bg-[color:var(--color-bg-muted)]">
                            <p className="text-sm mb-2">Here's the pseudocode to guide you:</p>
                            <pre className="text-xs font-mono text-[color:var(--color-text-secondary)]">
                                {`function debounce(fn, delay):
  timer = null
  return function(...args):
    // What should happen here?
    // Hint: cancel + reschedule`}
                            </pre>
                        </div>
                    </div>
                );

            case 'build':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Badge variant="success">Build Mode Active</Badge>
                            <span className="text-success text-xl">🚀</span>
                        </div>
                        <div className="p-4 rounded-xl bg-[color:var(--color-bg-muted)]">
                            <pre className="text-xs font-mono text-[color:var(--color-text-secondary)]">
                                {`function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`}
                            </pre>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-success">
                            <span>✓</span>
                            <span>You understand this code!</span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <section
            ref={containerRef}
            id="how-it-works"
            className="section-padding relative overflow-hidden"
        >
            <div className="container-custom">
                {/* Header */}
                <div className="how-header text-center max-w-3xl mx-auto mb-20">
                    <Badge variant="secondary" className="mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        How It Works
                    </Badge>

                    <h2 className="font-display text-display-md font-bold mb-6">
                        Four steps to{' '}
                        <span className="text-gradient-primary">deeper understanding</span>
                    </h2>

                    <p className="text-lg text-[color:var(--color-text-secondary)]">
                        A simple process that transforms how you learn and write code.
                    </p>
                </div>

                {/* Steps */}
                <div className="how-steps relative">
                    {/* Connecting Line */}
                    <div className="connecting-line absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-accent-500 to-success -translate-x-1/2 hidden md:block" />

                    <div className="space-y-12 lg:space-y-24">
                        {steps.map((step, index) => (
                            <div
                                key={step.number}
                                className={`how-step grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:text-right' : ''
                                    }`}
                            >
                                {/* Content */}
                                <div className={`step-content ${index % 2 === 1 ? 'lg:order-2 lg:text-left' : ''}`}>
                                    <div className={`flex items-center gap-4 mb-4 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                                        <div
                                            className={`step-number w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-white
                                ${step.color === 'primary' ? 'bg-primary-500' : ''}
                                ${step.color === 'accent' ? 'bg-accent-500' : ''}
                                ${step.color === 'secondary' ? 'bg-secondary-500' : ''}
                                ${step.color === 'success' ? 'bg-success' : ''}`}
                                        >
                                            {step.number}
                                        </div>
                                        <h3 className="font-display text-xl lg:text-2xl font-bold">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="text-[color:var(--color-text-secondary)] lg:text-lg leading-relaxed max-w-md">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Visual */}
                                <div className={`step-visual ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                                    <Card padding="lg">
                                        {renderVisual(step.visual)}
                                    </Card>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorksSection;
