import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useStore } from '../store/useStore';
import Button from '../ui/Button';
import ThemeToggle from './ThemeToggle';

function Navbar() {
    const containerRef = useRef<HTMLElement>(null);
    const { mode } = useStore();

    useGSAP(() => {
        // Simple entrance animation - content is always visible
        // Use fromTo to ensure we don't rely on initial hidden states
        gsap.fromTo('.nav-item',
            { y: -15, opacity: 0.3 },
            {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power3.out',
                delay: 0.3
            }
        );
    }, { scope: containerRef });

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Demo', href: '#demo' },
        { label: 'Tech Stack', href: '#tech' },
        { label: 'Learning Hub', href: '/learn', isRoute: true },
    ];

    return (
        <nav
            ref={containerRef}
            className="fixed top-0 left-0 right-0 z-40 glass-strong"
        >
            <div className="container-custom">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link to="/" className="nav-item flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center transition-transform group-hover:scale-110">
                            <svg
                                className="w-5 h-5 text-white"
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
                        <span className="font-display text-xl font-bold">SocraticDev</span>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            link.isRoute ? (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    className="nav-item text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors flex items-center gap-1"
                                >
                                    <span className="text-primary-400">🥋</span>
                                    {link.label}
                                </Link>
                            ) : (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="nav-item text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                                >
                                    {link.label}
                                </a>
                            )
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <div className="nav-item">
                            <ThemeToggle />
                        </div>

                        {/* Mode Indicator */}
                        <div className="nav-item hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--color-bg-muted)]">
                            <div
                                className={`w-2 h-2 rounded-full ${mode === 'learning' ? 'bg-accent-500' : 'bg-secondary-500'
                                    }`}
                            />
                            <span className="text-xs font-medium capitalize">{mode} Mode</span>
                        </div>

                        {/* CTA Button */}
                        <Link to="/app" className="nav-item">
                            <Button size="sm">
                                Launch App
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
