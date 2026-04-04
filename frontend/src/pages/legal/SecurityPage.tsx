import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

/* ── Custom SVG Icons (no emojis) ──────────────────────────── */

const ShieldIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const SandboxIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2" />
        <path d="M12 12v4" />
        <path d="M8 12h8" />
    </svg>
);

const CorsIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        <path d="M7 4l2 2-2 2" />
    </svg>
);

const TraceIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const ErrorHandleIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const NginxIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M2 9h7" />
        <path d="M2 15h7" />
        <circle cx="16" cy="12" r="2" />
        <path d="M14 12h-3" />
    </svg>
);

const UploadIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
        <path d="M4 19h16" />
    </svg>
);

const JwtIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <circle cx="12" cy="16" r="1" />
    </svg>
);

const RateLimitIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
        <path d="M4.93 4.93l2.12 2.12" />
    </svg>
);

const RbacIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const SanitizeIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
        <path d="M8 12l2 2" />
        <path d="M16 10l-6 6" />
    </svg>
);

/* ── Animation config ───────────────────────────────────────── */

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease },
    },
};

const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease },
    },
};

/* ── Data ───────────────────────────────────────────────────── */

interface SecurityFeature {
    icon: React.ReactNode;
    title: string;
    description: string;
    details: string[];
    accent: string;
}

const implementedFeatures: SecurityFeature[] = [
    {
        icon: <SandboxIcon />,
        title: 'Sandboxed Code Execution',
        description: 'User-submitted code runs in a fully isolated subprocess with restricted capabilities.',
        details: [
            'Python builtins restricted to a safe whitelist — no os, subprocess, sys, or socket access',
            'Import allow-list: only math, itertools, functools, collections, statistics, random',
            'CPU time caps, 256 MB memory ceiling, 1 MB file write limit via resource.setrlimit',
            'Separate subprocess per execution — host filesystem completely inaccessible',
        ],
        accent: '#10B981',
    },
    {
        icon: <CorsIcon />,
        title: 'CORS Origin Policy',
        description: 'Strict Cross-Origin Resource Sharing locks API access to whitelisted domains only.',
        details: [
            'Explicit origin whitelist — not wildcard (*) in production',
            'Regex-validated origin matching for flexible subdomain support',
            'Credentials restricted to trusted origins only',
            'Prevents cross-site request forgery from unauthorized domains',
        ],
        accent: '#3B82F6',
    },
    {
        icon: <TraceIcon />,
        title: 'Request Tracing (X-Request-ID)',
        description: 'Every API request is assigned a unique UUID that propagates through the entire system.',
        details: [
            'UUID v4 assigned via FastAPI middleware on every inbound request',
            'Propagates through FastAPI, Celery, Neo4j, and ChromaDB logging',
            'Returned in X-Request-ID response header for client-side correlation',
            'Enables full audit trail and incident reconstruction',
        ],
        accent: '#8B5CF6',
    },
    {
        icon: <ErrorHandleIcon />,
        title: 'Structured Error Handling',
        description: 'Internal details are never leaked to the client. Production responses are sanitized.',
        details: [
            'Typed error codes: PARSE_ERROR, RATE_LIMIT_EXCEEDED, DB_CONNECTION_ERROR, etc.',
            'Each code mapped to the correct HTTP status (400, 429, 503, 504)',
            'Stack traces suppressed in production — debug details only when debug flag is on',
            'Global exception handler catches all unhandled errors with safe fallback responses',
        ],
        accent: '#F59E0B',
    },
    {
        icon: <NginxIcon />,
        title: 'Infrastructure-Level Security',
        description: 'Traffic is routed through Nginx with HTTPS enforced via Certbot SSL certificates.',
        details: [
            'Nginx reverse proxy — backend API is not directly exposed to the internet',
            'HTTPS enforced via Let\'s Encrypt Certbot with auto-renewal',
            'All API traffic proxied through /api path — clean separation of frontend and backend',
            'Production deployment on AWS EC2 with Docker Compose orchestration',
        ],
        accent: '#06B6D4',
    },
    {
        icon: <UploadIcon />,
        title: 'Upload Protection',
        description: 'File size limits and maximum file counts are enforced server-side to prevent abuse.',
        details: [
            'Max file size: 100 MB per file — configurable via environment variables',
            'Max files per project: 10,000 — prevents storage exhaustion',
            'Upload temp directory isolated from production data paths',
            'Batch processing limits on parsing and embedding pipelines',
        ],
        accent: '#EC4899',
    },
];

const futureFeatures: SecurityFeature[] = [
    {
        icon: <JwtIcon />,
        title: 'JWT Authentication',
        description: 'User registration and login with industry-standard token-based authentication.',
        details: [
            'JWT configuration already scaffolded — HS256 algorithm, configurable secret and expiration',
            'bcrypt password hashing — never plaintext storage',
            'httpOnly cookie-based token storage — not localStorage (XSS-resistant)',
            'Refresh token rotation for session persistence without re-login',
        ],
        accent: '#10B981',
    },
    {
        icon: <RateLimitIcon />,
        title: 'Per-User Rate Limiting',
        description: 'Tiered credit system with Redis-backed sliding window rate limiting per user.',
        details: [
            'Redis already in stack — sliding window rate limiter per user ID is a natural extension',
            'RATE_LIMIT_EXCEEDED error class and HTTP 429 mapping already built',
            'Free tier: fixed AI calls/day. Premium: higher limits. Enterprise: unlimited',
            'Rate headers (X-RateLimit-Remaining, X-RateLimit-Reset) returned on every response',
        ],
        accent: '#F59E0B',
    },
    {
        icon: <RbacIcon />,
        title: 'Role-Based Access Control',
        description: 'Admin, free, and premium tiers unlock different feature sets and usage limits.',
        details: [
            'Dojo remains free for all users — learning should never be paywalled',
            'AI chat credits scale with subscription tier',
            'Project upload limits and graph complexity tied to plan level',
            'Admin dashboard for usage monitoring and manual override',
        ],
        accent: '#8B5CF6',
    },
    {
        icon: <SanitizeIcon />,
        title: 'Input Sanitization and CSP',
        description: 'Content Security Policy headers and OWASP-standard input validation across all endpoints.',
        details: [
            'CSP headers to prevent XSS, clickjacking, and code injection',
            'Input validation on all user-facing text fields and code inputs',
            'OWASP Top 10 coverage — SQL injection, XSS, CSRF protection',
            'Automated security scanning in CI/CD pipeline before every deployment',
        ],
        accent: '#3B82F6',
    },
];

/* ── Feature Card Component ─────────────────────────────────── */

function FeatureCard({ feature, index }: { feature: SecurityFeature; index: number }) {
    return (
        <motion.div
            variants={cardVariants}
            className="group relative rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 transition-all duration-300 hover:border-[color:var(--color-border-hover)]"
            style={{ '--card-accent': feature.accent } as React.CSSProperties}
        >
            {/* Accent glow on hover */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at top left, ${feature.accent}08 0%, transparent 70%)`,
                }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{
                            backgroundColor: `${feature.accent}12`,
                            color: feature.accent,
                        }}
                    >
                        {feature.icon}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold text-[color:var(--color-text-primary)] mb-1">
                            {feature.title}
                        </h3>
                        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                </div>

                {/* Details list */}
                <ul className="space-y-2.5 mt-4 pl-1">
                    {feature.details.map((detail, i) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 + i * 0.06, duration: 0.35, ease }}
                            className="flex items-start gap-3 text-sm text-[color:var(--color-text-secondary)] leading-relaxed"
                        >
                            <span
                                className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                                style={{ backgroundColor: feature.accent }}
                            />
                            {detail}
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

/* ── Status Indicator ───────────────────────────────────────── */

function StatusBadge({ status }: { status: 'live' | 'planned' }) {
    const isLive = status === 'live';
    return (
        <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                isLive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={isLive ? { animation: 'pulse 2s ease-in-out infinite' } : {}}
            />
            {isLive ? 'Implemented' : 'Future Scope'}
        </span>
    );
}

/* ── Main Page ──────────────────────────────────────────────── */

function SecurityPage() {
    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom max-w-6xl">

                    {/* ── Hero ─────────────────────────────── */}
                    <motion.div
                        variants={headerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                        >
                            <ShieldIcon />
                        </div>
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Security at SocraticDev
                        </h1>
                        <p className="text-lg text-[color:var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                            Security is a design priority, not an afterthought. From sandboxed code execution
                            to infrastructure-level TLS enforcement, every layer is built with
                            defense in depth.
                        </p>
                    </motion.div>

                    {/* ── Architecture Summary ─────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5, ease }}
                        className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-8 mb-16"
                    >
                        <h2 className="font-display text-xl font-bold mb-6 text-[color:var(--color-text-primary)]">
                            Defense-in-Depth Architecture
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { layer: 'Edge', items: ['HTTPS / TLS 1.3', 'Nginx Reverse Proxy', 'SSL via Certbot'], color: '#06B6D4' },
                                { layer: 'Application', items: ['CORS Whitelist', 'Request ID Tracing', 'Error Sanitization'], color: '#3B82F6' },
                                { layer: 'Execution', items: ['Sandboxed Subprocess', 'Import Restriction', 'Resource Limits'], color: '#10B981' },
                                { layer: 'Data', items: ['Neo4j Auth', 'Env-based Secrets', 'No Hardcoded Keys'], color: '#8B5CF6' },
                            ].map((col, i) => (
                                <motion.div
                                    key={col.layer}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08, duration: 0.45, ease }}
                                    className="rounded-xl p-4 border border-[color:var(--color-border)]"
                                    style={{ backgroundColor: `${col.color}06` }}
                                >
                                    <div
                                        className="text-xs font-bold uppercase tracking-widest mb-3"
                                        style={{ color: col.color }}
                                    >
                                        {col.layer} Layer
                                    </div>
                                    <ul className="space-y-2">
                                        {col.items.map(item => (
                                            <li key={item} className="flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
                                                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Implemented Section ─────────────── */}
                    <div className="mb-16">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <StatusBadge status="live" />
                            <h2 className="font-display text-2xl font-bold text-[color:var(--color-text-primary)]">
                                Current Security Measures
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >
                            {implementedFeatures.map((feature, i) => (
                                <FeatureCard key={feature.title} feature={feature} index={i} />
                            ))}
                        </motion.div>
                    </div>

                    {/* ── Divider ──────────────────────────── */}
                    <div className="relative my-16">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[color:var(--color-border)]" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-[color:var(--color-bg-primary)] text-sm text-[color:var(--color-text-muted)] font-medium">
                                Scaling toward production
                            </span>
                        </div>
                    </div>

                    {/* ── Future Scope Section ─────────────── */}
                    <div className="mb-16">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <StatusBadge status="planned" />
                            <h2 className="font-display text-2xl font-bold text-[color:var(--color-text-primary)]">
                                Production Roadmap
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >
                            {futureFeatures.map((feature, i) => (
                                <FeatureCard key={feature.title} feature={feature} index={i} />
                            ))}
                        </motion.div>
                    </div>

                    {/* ── Footer note ──────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease }}
                        className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 text-center"
                    >
                        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto">
                            Security is never finished. If you discover a vulnerability or have concerns,
                            reach out at{' '}
                            <a href="mailto:security@socraticdev.com" className="text-primary-500 hover:underline">
                                security@socraticdev.com
                            </a>.
                            We take every report seriously and respond within 24 hours.
                        </p>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default SecurityPage;
