import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { staggerContainer } from '../utils/animationVariants';

interface FooterLink {
    label: string;
    href: string;
    isRoute?: boolean;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

const footerSections: FooterSection[] = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Demo', href: '#demo' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Documentation', href: '/docs', isRoute: true },
            { label: 'API Reference', href: '/api', isRoute: true },
            { label: 'Blog', href: '/blog', isRoute: true },
            { label: 'Changelog', href: '/changelog', isRoute: true },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about', isRoute: true },
            { label: 'Careers', href: '/careers', isRoute: true },
            { label: 'Contact', href: '/contact', isRoute: true },
            { label: 'Press', href: '/press', isRoute: true },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy', href: '/privacy', isRoute: true },
            { label: 'Terms', href: '/terms', isRoute: true },
            { label: 'Security', href: '/security', isRoute: true },
        ],
    },
];

const socialLinks = [
    {
        name: 'GitHub',
        href: 'https://github.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
        ),
    },
    {
        name: 'Twitter',
        href: 'https://twitter.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        name: 'Discord',
        href: 'https://discord.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
        ),
    },
    {
        name: 'LinkedIn',
        href: 'https://linkedin.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
];

function Footer() {
    const prefersReducedMotion = useReducedMotion();
    const footerRef = useRef(null);
    const footerInView = useInView(footerRef, { once: true, amount: 0.1, margin: "0px 0px -150px 0px" });
    
    return (
        <footer className="relative overflow-hidden bg-[color:var(--color-bg-secondary)] border-t border-[color:var(--color-border)]">
            {/* Decorative top gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Subtle gradient blobs */}
                <div className="absolute bottom-0 left-[10%] w-[300px] h-[300px] bg-gradient-to-tr from-primary-500/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-[10%] w-[250px] h-[250px] bg-gradient-to-tl from-secondary-500/5 to-transparent rounded-full blur-3xl" />

                {/* Code bracket decorations */}
                <svg className="absolute top-16 left-[5%] w-8 h-12 text-[color:var(--color-border)]" viewBox="0 0 32 48" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M24 4 L8 4 L8 44 L24 44" strokeLinecap="round" />
                </svg>
                <svg className="absolute top-16 right-[5%] w-8 h-12 text-[color:var(--color-border)]" viewBox="0 0 32 48" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 4 L24 4 L24 44 L8 44" strokeLinecap="round" />
                </svg>
            </div>

            <div className="container-custom relative z-10 py-16">
                {/* Main Footer Content */}
                <motion.div 
                    ref={footerRef}
                    variants={staggerContainer}
                    initial="hidden"
                    animate={footerInView ? "visible" : "hidden"}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12"
                >
                    {/* Brand Column */}
                    <motion.div 
                        variants={{
                            hidden: { opacity: 0, y: prefersReducedMotion ? 10 : 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { 
                                    duration: prefersReducedMotion ? 0.3 : 0.5,
                                    type: "tween",
                                    ease: [0.25, 0.1, 0.25, 1]
                                }
                            }
                        }}
                        className="col-span-2"
                    >
                        <Link to="/" className="flex items-center gap-2.5 mb-4 group">
                            {/* Logo */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <svg
                                    className="w-10 h-10 text-primary-500 relative"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
                                    <path
                                        d="M15 25 L20 15 L25 25"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <circle cx="20" cy="28" r="2" fill="currentColor" />
                                </svg>
                            </div>
                            <span className="font-display text-xl font-bold">SocraticDev</span>
                        </Link>
                        <p className="text-sm text-[color:var(--color-text-secondary)] mb-6 max-w-xs">
                            The AI coding assistant that teaches you through questions.
                            Learn to think, not just to copy.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={footerInView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 15,
                                        delay: 0.2 + index * 0.08
                                    }}
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] flex items-center justify-center text-[color:var(--color-text-muted)] hover:text-primary-500 hover:border-primary-500/30 transition-colors"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Link Columns */}
                    {footerSections.map((section, index) => (
                        <motion.div 
                            key={section.title}
                            variants={{
                                hidden: { opacity: 0, y: prefersReducedMotion ? 10 : 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: prefersReducedMotion ? 0.3 : 0.5,
                                        delay: (index + 1) * 0.08,
                                        type: "tween",
                                        ease: [0.25, 0.1, 0.25, 1]
                                    }
                                }
                            }}
                        >
                            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-[color:var(--color-text-muted)]">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        {link.isRoute ? (
                                            <Link
                                                to={link.href}
                                                className="text-sm text-[color:var(--color-text-secondary)] hover:text-primary-500 transition-colors flex items-center gap-1 group"
                                            >
                                                {link.label}
                                                <svg className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        ) : (
                                            <a
                                                href={link.href}
                                                className="text-sm text-[color:var(--color-text-secondary)] hover:text-primary-500 transition-colors flex items-center gap-1 group"
                                            >
                                                {link.label}
                                                <svg className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Newsletter */}
                <motion.div 
                    initial={{ opacity: 0, y: prefersReducedMotion ? 10 : 20 }}
                    animate={footerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ 
                        duration: prefersReducedMotion ? 0.3 : 0.5,
                        delay: 0.3,
                        type: "tween",
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="p-6 rounded-2xl bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-secondary-500/5 border border-[color:var(--color-border)] mb-12"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-display font-semibold mb-1">Stay in the loop</h4>
                            <p className="text-sm text-[color:var(--color-text-secondary)]">
                                Get product updates, tips, and learning resources.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-[color:var(--color-bg-primary)] border border-[color:var(--color-border)] text-sm focus:outline-none focus:border-primary-500/50"
                            />
                            <button className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[color:var(--color-border)]">
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                        © {new Date().getFullYear()} SocraticDev. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            All systems operational
                        </div>
                        <span className="text-[color:var(--color-border)]">|</span>
                        <span className="text-xs text-[color:var(--color-text-muted)]">
                            Made with ❤️ for developers
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
