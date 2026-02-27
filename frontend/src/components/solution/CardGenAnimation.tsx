import { motion, MotionValue, useTransform } from 'framer-motion';

interface CardGenAnimationProps {
    progress: MotionValue<number>;
}

/**
 * Scroll-driven SVG animation illustrating AI Card Generation:
 * Message bubble → AI sparkle → Flashcard deck fanning out.
 */
function CardGenAnimation({ progress }: CardGenAnimationProps) {
    // Map panel progress (0→1) to individual element progress
    const bubbleOpacity = useTransform(progress, [0, 0.15], [0, 1]);
    const bubbleY = useTransform(progress, [0, 0.15], [30, 0]);

    const sparkleOpacity = useTransform(progress, [0.15, 0.35], [0, 1]);
    const sparkleScale = useTransform(progress, [0.15, 0.35], [0, 1]);
    const sparkleRotate = useTransform(progress, [0.15, 0.35], [-90, 0]);

    const arrowDash = useTransform(progress, [0.2, 0.45], [60, 0]);

    const card1Opacity = useTransform(progress, [0.4, 0.55], [0, 1]);
    const card1X = useTransform(progress, [0.4, 0.55], [40, 0]);
    const card1Rotate = useTransform(progress, [0.4, 0.7], [15, -8]);

    const card2Opacity = useTransform(progress, [0.5, 0.65], [0, 1]);
    const card2X = useTransform(progress, [0.5, 0.65], [40, 0]);

    const card3Opacity = useTransform(progress, [0.6, 0.75], [0, 1]);
    const card3X = useTransform(progress, [0.6, 0.75], [40, 0]);
    const card3Rotate = useTransform(progress, [0.6, 0.8], [-15, 8]);

    const checkOpacity = useTransform(progress, [0.75, 0.9], [0, 1]);
    const checkScale = useTransform(progress, [0.75, 0.9], [0, 1]);

    return (
        <svg
            viewBox="0 0 600 400"
            className="w-full h-full"
            fill="none"
        >
            {/* Subtle grid background */}
            <defs>
                <linearGradient id="cardgen-flow" x1="0" y1="0.5" x2="1" y2="0.5">
                    <stop offset="0%" stopColor="rgb(var(--color-accent-rgb, 129 147 106))" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="rgb(var(--color-primary-rgb, 224 122 95))" stopOpacity="0.6" />
                </linearGradient>
            </defs>

            {/* --- Message Bubble --- */}
            <motion.g style={{ opacity: bubbleOpacity, y: bubbleY }}>
                <rect x="40" y="120" width="160" height="90" rx="16"
                    className="fill-[color:var(--color-bg-secondary)] stroke-[color:var(--color-border)]" strokeWidth="1.5" />
                {/* Chat lines */}
                <rect x="60" y="142" width="100" height="6" rx="3" className="fill-primary-500/30" />
                <rect x="60" y="156" width="80" height="6" rx="3" className="fill-primary-500/20" />
                <rect x="60" y="170" width="110" height="6" rx="3" className="fill-primary-500/15" />
                {/* Tail */}
                <path d="M60 210 L50 225 L80 210" className="fill-[color:var(--color-bg-secondary)] stroke-[color:var(--color-border)]" strokeWidth="1.5" />
                {/* User avatar */}
                <circle cx="58" y="132" r="8" className="fill-primary-500/20" />
                <circle cx="58" cy="130" r="3" className="fill-primary-500" />
            </motion.g>

            {/* --- AI Sparkle --- */}
            <motion.g style={{ opacity: sparkleOpacity, scale: sparkleScale, rotate: sparkleRotate, transformOrigin: '275px 165px' }}>
                <circle cx="275" cy="165" r="28" className="fill-accent-500/15" />
                <circle cx="275" cy="165" r="18" className="fill-accent-500/25" />
                {/* 4-point sparkle */}
                <path d="M275 140 L278 158 L296 165 L278 172 L275 190 L272 172 L254 165 L272 158 Z"
                    className="fill-accent-500" />
                {/* Small secondary sparkles */}
                <path d="M255 145 L256 150 L261 151 L256 152 L255 157 L254 152 L249 151 L254 150 Z"
                    className="fill-accent-400/70" />
                <path d="M295 180 L296 184 L300 185 L296 186 L295 190 L294 186 L290 185 L294 184 Z"
                    className="fill-accent-400/70" />
            </motion.g>

            {/* --- Flow Arrow --- */}
            <motion.path
                d="M210 165 Q245 165 275 140 M275 190 Q305 215 340 190"
                stroke="url(#cardgen-flow)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="60"
                style={{ strokeDashoffset: arrowDash }}
            />

            {/* --- Flashcard Deck (3 fanning cards) --- */}
            {/* Card 3 (back) */}
            <motion.g style={{ opacity: card3Opacity, x: card3X, rotate: card3Rotate, transformOrigin: '460px 170px' }}>
                <rect x="380" y="110" width="160" height="100" rx="12"
                    className="fill-[color:var(--color-bg-secondary)]" opacity="0.7" />
                <rect x="380" y="110" width="160" height="100" rx="12"
                    className="stroke-secondary-500/30" strokeWidth="1.5" fill="none" />
            </motion.g>

            {/* Card 1 (back-middle) */}
            <motion.g style={{ opacity: card1Opacity, x: card1X, rotate: card1Rotate, transformOrigin: '460px 165px' }}>
                <rect x="375" y="115" width="160" height="100" rx="12"
                    className="fill-[color:var(--color-bg-secondary)]" opacity="0.85" />
                <rect x="375" y="115" width="160" height="100" rx="12"
                    className="stroke-accent-500/30" strokeWidth="1.5" fill="none" />
            </motion.g>

            {/* Card 2 (front) */}
            <motion.g style={{ opacity: card2Opacity, x: card2X }}>
                <rect x="370" y="120" width="160" height="100" rx="12"
                    className="fill-[color:var(--color-bg-secondary)] stroke-[color:var(--color-border)]" strokeWidth="1.5" />
                {/* Card content: Q badge */}
                <rect x="385" y="133" width="22" height="14" rx="4" className="fill-accent-500/20" />
                <text x="396" y="143" textAnchor="middle" className="fill-accent-500" fontSize="9" fontWeight="bold">Q</text>
                {/* Front text lines */}
                <rect x="414" y="135" width="80" height="5" rx="2.5" className="fill-[color:var(--color-text-muted)]/20" />
                <rect x="414" y="145" width="60" height="5" rx="2.5" className="fill-[color:var(--color-text-muted)]/15" />
                {/* Divider */}
                <line x1="385" y1="162" x2="520" y2="162" className="stroke-[color:var(--color-border)]" strokeWidth="1" />
                {/* A badge */}
                <rect x="385" y="170" width="22" height="14" rx="4" className="fill-primary-500/20" />
                <text x="396" y="180" textAnchor="middle" className="fill-primary-500" fontSize="9" fontWeight="bold">A</text>
                {/* Back text lines */}
                <rect x="414" y="172" width="90" height="5" rx="2.5" className="fill-[color:var(--color-text-muted)]/20" />
                <rect x="414" y="182" width="70" height="5" rx="2.5" className="fill-[color:var(--color-text-muted)]/15" />
                {/* Tags */}
                <rect x="385" y="197" width="36" height="12" rx="6" className="fill-secondary-500/15" />
                <rect x="426" y="197" width="28" height="12" rx="6" className="fill-accent-500/15" />
            </motion.g>

            {/* --- Save Checkmark --- */}
            <motion.g style={{ opacity: checkOpacity, scale: checkScale, transformOrigin: '460px 260px' }}>
                <circle cx="460" cy="260" r="16" className="fill-emerald-500/15" />
                <path d="M452 260 L458 266 L470 254" className="stroke-emerald-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <text x="460" y="290" textAnchor="middle" className="fill-[color:var(--color-text-muted)]" fontSize="10">Saved to deck</text>
            </motion.g>

            {/* --- Labels --- */}
            <motion.text x="120" y="250" textAnchor="middle" className="fill-[color:var(--color-text-muted)]" fontSize="11" style={{ opacity: bubbleOpacity }}>
                Chat or Dojo
            </motion.text>
            <motion.text x="275" y="210" textAnchor="middle" className="fill-accent-500" fontSize="11" fontWeight="600" style={{ opacity: sparkleOpacity }}>
                AI Generates
            </motion.text>
            <motion.text x="460" y="240" textAnchor="middle" className="fill-[color:var(--color-text-muted)]" fontSize="11" style={{ opacity: card2Opacity }}>
                Review & Edit
            </motion.text>
        </svg>
    );
}

export default CardGenAnimation;
