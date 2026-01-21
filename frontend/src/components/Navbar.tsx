import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Button from '../ui/Button';
import ThemeToggle from './ThemeToggle';

function Navbar() {
    const { mode } = useStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Demo', href: '#demo' },
        { label: 'Tech Stack', href: '#tech' },
        { label: 'Learning Hub', href: '/learn', isRoute: true },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 glass-strong animate-fade-in-down">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
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
                        {navLinks.map((link, index) => (
                            link.isRoute ? (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    className="text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors flex items-center gap-1"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <span className="text-primary-400">🥋</span>
                                    {link.label}
                                </Link>
                            ) : (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {link.label}
                                </a>
                            )
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {/* Mode Badge */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--color-bg-muted)] text-xs font-medium">
                            <span className={mode === 'learning' ? 'text-accent-500' : 'text-secondary-500'}>
                                {mode === 'learning' ? '🎓' : '🚀'}
                            </span>
                            <span className="text-[color:var(--color-text-secondary)]">
                                {mode === 'learning' ? 'Learning Mode' : 'Build Mode'}
                            </span>
                        </div>

                        {/* CTA */}
                        <Link to="/app" className="hidden sm:block">
                            <Button size="sm">
                                Launch App
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Button>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-[color:var(--color-bg-muted)] transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-[color:var(--color-border)] animate-fade-in">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                link.isRoute ? (
                                    <Link
                                        key={link.label}
                                        to={link.href}
                                        className="px-4 py-2 text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-muted)] rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ) : (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="px-4 py-2 text-sm font-medium text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-muted)] rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </a>
                                )
                            ))}
                            <Link to="/app" className="mt-2 mx-4">
                                <Button className="w-full">Launch App</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
