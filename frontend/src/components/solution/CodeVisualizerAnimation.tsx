import { motion, MotionValue, useTransform } from 'framer-motion';

interface CodeVisualizerAnimationProps {
    progress: MotionValue<number>;
}

/**
 * Scroll-driven SVG animation illustrating the Code Visualizer:
 * Code snippet → analysis → node graph with function/class nodes and call edges.
 */
function CodeVisualizerAnimation({ progress }: CodeVisualizerAnimationProps) {
    // Code panel appears
    const codeOpacity = useTransform(progress, [0, 0.15], [0, 1]);
    const codeX = useTransform(progress, [0, 0.15], [-30, 0]);

    // Analysis arrow
    const arrowDash = useTransform(progress, [0.15, 0.35], [80, 0]);
    const arrowOpacity = useTransform(progress, [0.12, 0.2], [0, 1]);

    // Nodes appear one by one
    const node1Scale = useTransform(progress, [0.3, 0.42], [0, 1]);
    const node2Scale = useTransform(progress, [0.38, 0.5], [0, 1]);
    const node3Scale = useTransform(progress, [0.44, 0.56], [0, 1]);
    const node4Scale = useTransform(progress, [0.5, 0.62], [0, 1]);
    const node5Scale = useTransform(progress, [0.56, 0.68], [0, 1]);

    // Edges draw in after nodes
    const edge1Dash = useTransform(progress, [0.55, 0.7], [100, 0]);
    const edge2Dash = useTransform(progress, [0.6, 0.75], [100, 0]);
    const edge3Dash = useTransform(progress, [0.65, 0.8], [100, 0]);
    const edge4Dash = useTransform(progress, [0.7, 0.85], [100, 0]);

    // Status badge
    const statusOpacity = useTransform(progress, [0.8, 0.92], [0, 1]);
    const statusScale = useTransform(progress, [0.8, 0.92], [0.5, 1]);

    return (
        <svg
            viewBox="0 0 600 400"
            className="w-full h-full"
            fill="none"
        >
            <defs>
                <linearGradient id="viz-edge-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
                </linearGradient>
            </defs>

            {/* --- Code Panel (left side) --- */}
            <motion.g style={{ opacity: codeOpacity, x: codeX }}>
                <rect x="20" y="80" width="175" height="240" rx="12"
                    className="fill-[color:var(--color-bg-secondary)] stroke-[color:var(--color-border)]" strokeWidth="1.5" />
                {/* Terminal dots */}
                <circle cx="38" cy="97" r="4" className="fill-red-500/60" />
                <circle cx="50" cy="97" r="4" className="fill-yellow-500/60" />
                <circle cx="62" cy="97" r="4" className="fill-green-500/60" />
                <text x="95" y="100" className="fill-[color:var(--color-text-muted)]" fontSize="8" fontFamily="monospace">main.py</text>
                {/* Divider */}
                <line x1="20" y1="110" x2="195" y2="110" className="stroke-[color:var(--color-border)]" strokeWidth="1" />
                {/* Code lines */}
                <text x="32" y="128" className="fill-secondary-500/70" fontSize="9" fontFamily="monospace">def</text>
                <text x="52" y="128" className="fill-primary-500" fontSize="9" fontFamily="monospace">main():</text>
                <text x="42" y="143" className="fill-[color:var(--color-text-muted)]" fontSize="9" fontFamily="monospace">  data = load()</text>
                <text x="42" y="158" className="fill-[color:var(--color-text-muted)]" fontSize="9" fontFamily="monospace">  result = process(data)</text>
                <text x="42" y="173" className="fill-[color:var(--color-text-muted)]" fontSize="9" fontFamily="monospace">  save(result)</text>
                <rect x="30" y="185" width="158" height="1" className="fill-[color:var(--color-border)]/50" />
                <text x="32" y="200" className="fill-secondary-500/70" fontSize="9" fontFamily="monospace">def</text>
                <text x="52" y="200" className="fill-accent-500" fontSize="9" fontFamily="monospace">process(d):</text>
                <text x="42" y="215" className="fill-[color:var(--color-text-muted)]" fontSize="9" fontFamily="monospace">  return validate(d)</text>
                <rect x="30" y="227" width="158" height="1" className="fill-[color:var(--color-border)]/50" />
                <text x="32" y="242" className="fill-secondary-500/70" fontSize="9" fontFamily="monospace">def</text>
                <text x="52" y="242" className="fill-[color:var(--color-text-secondary)]" fontSize="9" fontFamily="monospace">validate(x):</text>
                <text x="42" y="257" className="fill-[color:var(--color-text-muted)]" fontSize="9" fontFamily="monospace">  ...</text>
                {/* Line numbers */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => (
                    <text key={n} x="25" y={128 + i * 13} className="fill-[color:var(--color-text-muted)]/40" fontSize="7" fontFamily="monospace" textAnchor="end">{n}</text>
                ))}
            </motion.g>

            {/* --- Analysis Arrow --- */}
            <motion.g style={{ opacity: arrowOpacity }}>
                <motion.path
                    d="M205 200 C240 200, 250 200, 270 180"
                    stroke="url(#viz-edge-grad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="80"
                    style={{ strokeDashoffset: arrowDash }}
                />
                <motion.text x="235" y="220" textAnchor="middle" className="fill-[color:var(--color-text-muted)]" fontSize="9" style={{ opacity: arrowOpacity }}>
                    analyze
                </motion.text>
            </motion.g>

            {/* --- Graph Nodes --- */}
            {/* Node 1: main (function - amber) */}
            <motion.g style={{ scale: node1Scale, transformOrigin: '380px 120px' }}>
                <circle cx="380" cy="120" r="24" className="fill-amber-500/15" />
                <circle cx="380" cy="120" r="16" className="fill-amber-500/30 stroke-amber-500" strokeWidth="1.5" />
                <text x="380" y="124" textAnchor="middle" className="fill-amber-500" fontSize="9" fontWeight="bold">main</text>
                <text x="380" y="155" textAnchor="middle" className="fill-[color:var(--color-text-muted)]" fontSize="7">function</text>
            </motion.g>

            {/* Node 2: load (function - amber) */}
            <motion.g style={{ scale: node2Scale, transformOrigin: '310px 220px' }}>
                <circle cx="310" cy="220" r="14" className="fill-amber-500/20 stroke-amber-400" strokeWidth="1.5" />
                <text x="310" y="224" textAnchor="middle" className="fill-amber-400" fontSize="8" fontWeight="bold">load</text>
            </motion.g>

            {/* Node 3: process (function - amber) */}
            <motion.g style={{ scale: node3Scale, transformOrigin: '420px 230px' }}>
                <circle cx="420" cy="230" r="18" className="fill-accent-500/15" />
                <circle cx="420" cy="230" r="14" className="fill-accent-500/25 stroke-accent-500" strokeWidth="1.5" />
                <text x="420" y="234" textAnchor="middle" className="fill-accent-500" fontSize="8" fontWeight="bold">process</text>
            </motion.g>

            {/* Node 4: save (function - blue) */}
            <motion.g style={{ scale: node4Scale, transformOrigin: '530px 190px' }}>
                <circle cx="530" cy="190" r="14" className="fill-blue-500/20 stroke-blue-400" strokeWidth="1.5" />
                <text x="530" y="194" textAnchor="middle" className="fill-blue-400" fontSize="8" fontWeight="bold">save</text>
            </motion.g>

            {/* Node 5: validate (function - purple) */}
            <motion.g style={{ scale: node5Scale, transformOrigin: '470px 310px' }}>
                <circle cx="470" cy="310" r="14" className="fill-violet-500/20 stroke-violet-400" strokeWidth="1.5" />
                <text x="470" y="314" textAnchor="middle" className="fill-violet-400" fontSize="8" fontWeight="bold">validate</text>
            </motion.g>

            {/* --- Edges (calls) --- */}
            {/* main → load */}
            <motion.path
                d="M365 135 Q335 170, 315 206"
                className="stroke-amber-500/50"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="100"
                style={{ strokeDashoffset: edge1Dash }}
            />
            {/* main → process */}
            <motion.path
                d="M390 135 Q410 175, 420 215"
                className="stroke-accent-500/50"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="100"
                style={{ strokeDashoffset: edge2Dash }}
            />
            {/* main → save */}
            <motion.path
                d="M396 125 Q465 140, 518 182"
                className="stroke-blue-500/50"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="100"
                style={{ strokeDashoffset: edge3Dash }}
            />
            {/* process → validate */}
            <motion.path
                d="M428 244 Q450 270, 465 296"
                className="stroke-violet-500/50"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="100"
                style={{ strokeDashoffset: edge4Dash }}
            />

            {/* Edge labels */}
            <motion.text x="332" y="165" className="fill-amber-500/60" fontSize="7" style={{ opacity: useTransform(progress, [0.6, 0.7], [0, 1]) }}>calls</motion.text>
            <motion.text x="415" y="178" className="fill-accent-500/60" fontSize="7" style={{ opacity: useTransform(progress, [0.65, 0.75], [0, 1]) }}>calls</motion.text>
            <motion.text x="460" y="152" className="fill-blue-500/60" fontSize="7" style={{ opacity: useTransform(progress, [0.7, 0.8], [0, 1]) }}>calls</motion.text>
            <motion.text x="455" y="278" className="fill-violet-500/60" fontSize="7" style={{ opacity: useTransform(progress, [0.72, 0.82], [0, 1]) }}>calls</motion.text>

            {/* --- Status Badge --- */}
            <motion.g style={{ opacity: statusOpacity, scale: statusScale, transformOrigin: '420px 365px' }}>
                <rect x="365" y="352" width="110" height="26" rx="13" className="fill-emerald-500/10 stroke-emerald-500/40" strokeWidth="1" />
                <circle cx="382" cy="365" r="4" className="fill-emerald-500" />
                <text x="425" y="369" textAnchor="middle" className="fill-emerald-500" fontSize="9" fontWeight="600">5 nodes · 4 edges</text>
            </motion.g>

            {/* --- Legend --- */}
            <motion.g style={{ opacity: useTransform(progress, [0.5, 0.65], [0, 1]) }}>
                <circle cx="310" cy="350" r="5" className="fill-amber-500/40" />
                <text x="320" y="354" className="fill-[color:var(--color-text-muted)]" fontSize="8">function</text>
                <circle cx="310" cy="368" r="5" className="fill-blue-500/40" />
                <text x="320" y="372" className="fill-[color:var(--color-text-muted)]" fontSize="8">I/O</text>
            </motion.g>
        </svg>
    );
}

export default CodeVisualizerAnimation;
