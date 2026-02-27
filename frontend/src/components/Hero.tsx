import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

// Floating decorative shapes component
const FloatingShapes = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/30 via-primary-400/20 to-transparent rounded-full blur-2xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-secondary-500/25 via-accent-500/15 to-transparent rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Floating geometric shapes */}
        <svg className="absolute top-20 left-[10%] w-16 h-16 text-primary-500/20 animate-float" viewBox="0 0 64 64" fill="currentColor">
            <rect x="8" y="8" width="48" height="48" rx="8" transform="rotate(15 32 32)" />
        </svg>

        <svg className="absolute top-1/4 right-[15%] w-12 h-12 text-secondary-500/25 animate-float" style={{ animationDelay: '1s' }} viewBox="0 0 48 48" fill="currentColor">
            <circle cx="24" cy="24" r="20" />
        </svg>

        <svg className="absolute bottom-1/4 left-[8%] w-20 h-20 text-accent-500/15 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="40,8 72,60 8,60" />
        </svg>

        <svg className="absolute top-1/2 right-[5%] w-14 h-14 text-primary-400/20 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 56 56" fill="currentColor">
            <path d="M28 4 L52 28 L28 52 L4 28 Z" />
        </svg>

        <svg className="absolute bottom-[15%] right-[20%] w-10 h-10 text-secondary-400/25 animate-float" style={{ animationDelay: '4s' }} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="4" width="32" height="32" rx="4" />
        </svg>

        {/* Decorative dots pattern */}
        <div className="absolute top-40 left-[25%] grid grid-cols-4 gap-2">
            {[...Array(16)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary-500/20" />
            ))}
        </div>

        <div className="absolute bottom-40 right-[30%] grid grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-secondary-500/15" />
            ))}
        </div>

        {/* Curved lines */}
        <svg className="absolute top-1/3 left-[5%] w-40 h-40 text-primary-500/10" viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 140 Q80 20 140 80" strokeLinecap="round" />
            <path d="M30 130 Q90 30 140 90" strokeLinecap="round" />
        </svg>

        <svg className="absolute bottom-1/3 right-[8%] w-32 h-32 text-secondary-500/10" viewBox="0 0 128 128" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 64 Q64 10 118 64 Q64 118 10 64" strokeLinecap="round" />
        </svg>
    </div>
);

// Code snippet decoration
const CodeDecoration = () => (
    <div className="absolute -bottom-4 -right-4 w-32 h-24 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-lg -rotate-6 border border-primary-500/10" />
);

function Hero() {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as const
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        visible: (custom: number) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.8,
                delay: custom * 0.2,
                ease: [0.22, 1, 0.36, 1] as const
            }
        })
    };

    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Elements */}
            <motion.div
                className="absolute inset-0 hero-gradient"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            />
            <div className="absolute inset-0 grid-pattern" />

            {/* Floating decorative elements */}
            <FloatingShapes />

            <div className="container-custom relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <motion.div
                        className="hero-content text-center lg:text-left"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Badge with glow */}
                        <motion.div
                            className="inline-block mb-6 relative"
                            variants={itemVariants}
                        >
                            <motion.div
                                className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <Badge variant="primary" icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            }>
                                AI + Socratic Method
                            </Badge>
                        </motion.div>

                        {/* Headline with gradient underline */}
                        <h1 className="font-display text-display-xl font-bold mb-6 relative">
                            <motion.span
                                className="inline-block"
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                Stop Copying Code.{' '}
                            </motion.span>
                            <span className="text-gradient-primary relative inline-block">
                                <span className="inline-block">
                                    Start Understanding It.
                                </span>
                                <motion.svg
                                    className="absolute -bottom-2 left-0 w-full h-3 text-primary-500/30"
                                    viewBox="0 0 200 12"
                                    preserveAspectRatio="none"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                                >
                                    <motion.path
                                        d="M0 6 Q50 0, 100 6 T200 6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </motion.svg>
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <motion.p
                            className="text-lg lg:text-xl text-[color:var(--color-text-secondary)] mb-8 max-w-xl mx-auto lg:mx-0"
                            variants={itemVariants}
                        >
                            The AI coding assistant that teaches through questions,
                            maps your entire codebase, visualizes code architecture, and turns every session into lasting knowledge.
                        </motion.p>

                        {/* CTAs with decoration */}
                        <motion.div
                            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start relative"
                            variants={itemVariants}
                        >
                            <Link to="/app">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button size="lg" className="group relative overflow-hidden">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Start Learning
                                            <motion.svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </motion.svg>
                                        </span>
                                    </Button>
                                </motion.div>
                            </Link>
                            <motion.a
                                href="https://www.youtube.com/watch?v=RUr-bRbWn4c"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button variant="secondary" size="lg" className="group">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Watch Demo
                                </Button>
                            </motion.a>
                        </motion.div>

                        {/* Stats with visual enhancement */}
                        <motion.div
                            className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0"
                            variants={containerVariants}
                        >
                            {[
                                { value: '10x', label: 'Faster Learning', color: 'primary' },
                                { value: '90%', label: 'Bug Detection', color: 'secondary' },
                                { value: '50k+', label: 'Developers', color: 'accent' },
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    className="text-center lg:text-left relative group"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className={`absolute -inset-2 rounded-lg bg-${stat.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                    <motion.div
                                        className={`font-display text-2xl lg:text-3xl font-bold text-${stat.color}-500 relative`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            delay: 1 + index * 0.1
                                        }}
                                    >
                                        {stat.value}
                                    </motion.div>
                                    <div className="text-sm text-[color:var(--color-text-muted)] relative">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right - Enhanced Floating Cards */}
                    <div className="relative hidden lg:block h-[600px]">
                        {/* Background glow for cards */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-primary-500/10 via-secondary-500/5 to-transparent rounded-full blur-2xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        {/* Code Card with decoration */}
                        <motion.div
                            className="absolute top-0 right-0 w-80"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <CodeDecoration />
                            <Card variant="terminal" padding="none" className="relative">
                                <Card.TerminalHeader title="binary_search.py" />
                                <div className="p-4">
                                    <pre className="font-mono text-sm text-[color:var(--color-text-secondary)]">
                                        <code>{`def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`}</code>
                                    </pre>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Question Card with pulse ring */}
                        <motion.div
                            className="absolute top-40 left-0 w-72"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <motion.div
                                className="absolute -inset-1 bg-accent-500/20 rounded-2xl blur-md"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <Card className="bg-accent-500/10 border-accent-500/30 relative">
                                <div className="flex items-start gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-accent-500/30 rounded-full animate-ping" />
                                        <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0 relative">
                                            <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-1">SocraticDev asks:</p>
                                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                                            "What property of the data makes binary search possible?"
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Graph Card with animated connections */}
                        <motion.div
                            className="absolute bottom-20 right-20 w-64"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Card className="bg-secondary-500/10 border-secondary-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Knowledge Graph</span>
                                </div>
                                {/* Enhanced graph visualization */}
                                <div className="flex items-center justify-center h-24 relative">
                                    <svg viewBox="0 0 120 60" className="w-full h-full">
                                        {/* Animated connection lines */}
                                        <line x1="60" y1="30" x2="20" y2="15" className="stroke-secondary-400" strokeWidth="1.5" strokeDasharray="4 2">
                                            <animate attributeName="stroke-dashoffset" from="6" to="0" dur="1s" repeatCount="indefinite" />
                                        </line>
                                        <line x1="60" y1="30" x2="100" y2="15" className="stroke-secondary-400" strokeWidth="1.5" strokeDasharray="4 2">
                                            <animate attributeName="stroke-dashoffset" from="6" to="0" dur="1s" repeatCount="indefinite" />
                                        </line>
                                        <line x1="20" y1="15" x2="30" y2="50" className="stroke-secondary-300" strokeWidth="1" strokeDasharray="4 2">
                                            <animate attributeName="stroke-dashoffset" from="6" to="0" dur="1.5s" repeatCount="indefinite" />
                                        </line>
                                        <line x1="100" y1="15" x2="90" y2="50" className="stroke-secondary-300" strokeWidth="1" strokeDasharray="4 2">
                                            <animate attributeName="stroke-dashoffset" from="6" to="0" dur="1.5s" repeatCount="indefinite" />
                                        </line>
                                        {/* Nodes with glow */}
                                        <circle cx="60" cy="30" r="8" className="fill-secondary-500" />
                                        <circle cx="60" cy="30" r="12" className="fill-secondary-500/20" />
                                        <circle cx="20" cy="15" r="6" className="fill-secondary-400" />
                                        <circle cx="100" cy="15" r="6" className="fill-secondary-400" />
                                        <circle cx="30" cy="50" r="5" className="fill-secondary-300" />
                                        <circle cx="90" cy="50" r="5" className="fill-secondary-300" />
                                    </svg>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Mode Toggle Card */}
                        <motion.div
                            className="absolute bottom-0 left-10 w-56"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={3}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium">Learning Mode</span>
                                    </div>
                                    <div className="w-10 h-5 rounded-full bg-gradient-to-r from-accent-500 to-accent-400 relative shadow-lg shadow-accent-500/30">
                                        <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white shadow" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Extra floating code snippet */}
                        <motion.div
                            className="absolute top-[45%] right-[60%] w-48"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1.5}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="p-3 rounded-lg bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)] shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-success" />
                                    <span className="text-xs font-mono text-success">Verified</span>
                                </div>
                                <code className="text-xs font-mono text-[color:var(--color-text-muted)]">
                                    O(log n) complexity
                                </code>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
            >
                <span className="text-xs text-[color:var(--color-text-muted)]">Scroll to explore</span>
                <div className="w-6 h-10 rounded-full border-2 border-[color:var(--color-border)] flex justify-center pt-2">
                    <motion.div
                        className="w-1.5 h-3 rounded-full bg-primary-500"
                        animate={{ y: [0, 12, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.div>

            {/* Wave divider to next section */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
                <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.38,118.92,150.43,94.81,321.39,56.44Z"
                        className="fill-[color:var(--color-bg-secondary)]"
                    />
                </svg>
            </div>
        </section>
    );
}

export default Hero;
