import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

/* ═══════════════════════════════════════════════════════════════
   CUSTOM SVG ILLUSTRATIONS — no emojis, no placeholders
   ═══════════════════════════════════════════════════════════════ */

/* -- Illustration: Hiring assessment flow -- */
const AssessmentIllustration = () => (
    <svg viewBox="0 0 320 200" fill="none" className="w-full h-auto">
        {/* Candidate coding */}
        <rect x="10" y="40" width="90" height="70" rx="6" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
        <rect x="18" y="52" width="40" height="3" rx="1.5" fill="#8B5CF6" opacity="0.6" />
        <rect x="18" y="59" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
        <rect x="18" y="66" width="30" height="3" rx="1.5" fill="#10B981" opacity="0.5" />
        <rect x="18" y="73" width="48" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
        <rect x="18" y="80" width="36" height="3" rx="1.5" fill="#3B82F6" opacity="0.5" />
        <rect x="18" y="87" width="50" height="3" rx="1.5" fill="currentColor" opacity="0.15" />
        {/* Person icon below code */}
        <circle cx="55" cy="125" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        <path d="M55 133 C45 133 40 140 40 145 L70 145 C70 140 65 133 55 133Z" stroke="currentColor" strokeWidth="1.2" opacity="0.4" fill="none" />
        <text x="55" y="160" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5" fontWeight="600">Candidate</text>

        {/* Arrow from candidate to engine */}
        <path d="M105 80 L130 80" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <polygon points="130,76 138,80 130,84" fill="#F59E0B" opacity="0.5" />

        {/* SocraticDev Engine (center) */}
        <rect x="140" y="25" width="100" height="110" rx="8" stroke="#10B981" strokeWidth="1.5" opacity="0.4" fill="#10B98108" />
        <text x="190" y="42" textAnchor="middle" fontSize="7.5" fill="#10B981" fontWeight="700" letterSpacing="0.5">SOCRATICDEV</text>
        {/* Dojo icon */}
        <rect x="155" y="50" width="70" height="16" rx="3" fill="#8B5CF612" stroke="#8B5CF6" strokeWidth="0.8" opacity="0.6" />
        <text x="190" y="61" textAnchor="middle" fontSize="7" fill="#8B5CF6" opacity="0.8">Dojo Challenges</text>
        {/* Execution trace */}
        <rect x="155" y="72" width="70" height="16" rx="3" fill="#3B82F612" stroke="#3B82F6" strokeWidth="0.8" opacity="0.6" />
        <text x="190" y="83" textAnchor="middle" fontSize="7" fill="#3B82F6" opacity="0.8">Execution Trace</text>
        {/* Big-O grading */}
        <rect x="155" y="94" width="70" height="16" rx="3" fill="#F59E0B12" stroke="#F59E0B" strokeWidth="0.8" opacity="0.6" />
        <text x="190" y="105" textAnchor="middle" fontSize="7" fill="#F59E0B" opacity="0.8">Big-O Grading</text>
        {/* Graph analysis */}
        <rect x="155" y="116" width="70" height="12" rx="3" fill="#EC489912" stroke="#EC4899" strokeWidth="0.8" opacity="0.4" />
        <text x="190" y="125" textAnchor="middle" fontSize="6.5" fill="#EC4899" opacity="0.7">Dependency Graph</text>

        {/* Arrow from engine to report */}
        <path d="M244 80 L268 80" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <polygon points="268,76 276,80 268,84" fill="#10B981" opacity="0.5" />

        {/* Skill Report card */}
        <rect x="278" y="35" width="36" height="48" rx="4" stroke="#F59E0B" strokeWidth="1.2" opacity="0.5" fill="#F59E0B08" />
        <rect x="284" y="43" width="24" height="2.5" rx="1" fill="#F59E0B" opacity="0.4" />
        <rect x="284" y="49" width="18" height="2" rx="1" fill="currentColor" opacity="0.15" />
        <rect x="284" y="54" width="22" height="2" rx="1" fill="currentColor" opacity="0.15" />
        <rect x="284" y="59" width="12" height="2" rx="1" fill="#10B981" opacity="0.5" />
        <rect x="284" y="64" width="16" height="2" rx="1" fill="#10B981" opacity="0.4" />
        <rect x="284" y="69" width="20" height="2" rx="1" fill="#10B981" opacity="0.3" />

        {/* Hiring manager */}
        <circle cx="296" cy="105" r="8" stroke="#F59E0B" strokeWidth="1.2" opacity="0.5" />
        <path d="M296 113 C286 113 281 120 281 125 L311 125 C311 120 306 113 296 113Z" stroke="#F59E0B" strokeWidth="1.2" opacity="0.5" fill="none" />
        {/* Badge/star on manager */}
        <path d="M306 98 L308 102 L312 103 L309 106 L310 110 L306 108 L302 110 L303 106 L300 103 L304 102Z" fill="#F59E0B" opacity="0.3" />
        <text x="296" y="140" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5" fontWeight="600">Hiring Mgr</text>

        {/* Arrow from report to manager */}
        <path d="M296 83 L296 95" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />

        {/* Bottom label */}
        <text x="190" y="185" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.35" fontWeight="500">No private code leaves the platform</text>
    </svg>
);

/* -- Illustration: Corporate bootcamp flow -- */
const BootcampIllustration = () => (
    <svg viewBox="0 0 320 200" fill="none" className="w-full h-auto">
        {/* Instructor */}
        <circle cx="40" cy="50" r="10" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.5" />
        <path d="M40 60 C28 60 22 68 22 74 L58 74 C58 68 52 60 40 60Z" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.5" fill="none" />
        <text x="40" y="88" textAnchor="middle" fontSize="7" fill="#8B5CF6" opacity="0.7" fontWeight="600">Instructor</text>

        {/* Arrow to platform */}
        <path d="M58 55 L85 55" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.4" />
        <polygon points="85,51.5 91,55 85,58.5" fill="#8B5CF6" opacity="0.4" />

        {/* SocraticDev Platform */}
        <rect x="95" y="15" width="130" height="130" rx="8" stroke="#10B981" strokeWidth="1.5" opacity="0.3" fill="#10B98106" />
        <text x="160" y="32" textAnchor="middle" fontSize="7.5" fill="#10B981" fontWeight="700" letterSpacing="0.5">TRAINING PLATFORM</text>

        {/* Assigned tasks */}
        <rect x="107" y="40" width="106" height="18" rx="4" fill="#8B5CF612" stroke="#8B5CF6" strokeWidth="0.8" opacity="0.5" />
        <text x="160" y="52" textAnchor="middle" fontSize="7" fill="#8B5CF6" opacity="0.8">Assigned Dojo Tasks</text>

        {/* Cohort of 3 learners */}
        {[125, 160, 195].map((cx, i) => (
            <g key={i}>
                <circle cx={cx} cy="80" r="6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                <path d={`M${cx} 86 C${cx-7} 86 ${cx-10} 91 ${cx-10} 94 L${cx+10} 94 C${cx+10} 91 ${cx+7} 86 ${cx} 86Z`} stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
            </g>
        ))}
        <text x="160" y="106" textAnchor="middle" fontSize="6.5" fill="currentColor" opacity="0.4">Cohort (20-50 learners)</text>

        {/* Progress bars */}
        <rect x="112" y="113" width="96" height="6" rx="3" fill="currentColor" opacity="0.08" />
        <rect x="112" y="113" width="72" height="6" rx="3" fill="#10B981" opacity="0.3" />
        <rect x="112" y="123" width="96" height="6" rx="3" fill="currentColor" opacity="0.08" />
        <rect x="112" y="123" width="48" height="6" rx="3" fill="#F59E0B" opacity="0.3" />
        <rect x="112" y="133" width="96" height="6" rx="3" fill="currentColor" opacity="0.08" />
        <rect x="112" y="133" width="88" height="6" rx="3" fill="#3B82F6" opacity="0.3" />

        {/* Arrow to dashboard */}
        <path d="M229 75 L255 75" stroke="#10B981" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.4" />
        <polygon points="255,71.5 261,75 255,78.5" fill="#10B981" opacity="0.4" />

        {/* Analytics Dashboard */}
        <rect x="264" y="30" width="50" height="90" rx="5" stroke="#F59E0B" strokeWidth="1.2" opacity="0.4" fill="#F59E0B06" />
        <text x="289" y="44" textAnchor="middle" fontSize="6" fill="#F59E0B" fontWeight="600" opacity="0.7">Analytics</text>
        {/* Mini bar chart */}
        <rect x="272" y="90" width="6" height="20" rx="1" fill="#10B981" opacity="0.3" />
        <rect x="281" y="80" width="6" height="30" rx="1" fill="#3B82F6" opacity="0.3" />
        <rect x="290" y="85" width="6" height="25" rx="1" fill="#F59E0B" opacity="0.3" />
        <rect x="299" y="95" width="6" height="15" rx="1" fill="#EC4899" opacity="0.3" />
        {/* Struggling indicator */}
        <rect x="272" y="52" width="34" height="12" rx="2" fill="#EF444412" stroke="#EF4444" strokeWidth="0.6" opacity="0.4" />
        <text x="289" y="60" textAnchor="middle" fontSize="5" fill="#EF4444" opacity="0.6">Struggling</text>
        <rect x="272" y="67" width="34" height="12" rx="2" fill="#10B98112" stroke="#10B981" strokeWidth="0.6" opacity="0.4" />
        <text x="289" y="75" textAnchor="middle" fontSize="5" fill="#10B981" opacity="0.6">On Track</text>

        {/* Bottom labels */}
        <text x="160" y="170" textAnchor="middle" fontSize="7.5" fill="currentColor" opacity="0.35" fontWeight="500">Replaces Zoom + Google Docs + random sandboxes</text>
        {/* Flywheel arrow */}
        <path d="M160 180 C100 185 70 175 60 155" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 2" opacity="0.25" />
        <text x="160" y="195" textAnchor="middle" fontSize="6" fill="#8B5CF6" opacity="0.3">Each cohort drives organic user acquisition</text>
    </svg>
);

/* ═══════════════════════════════════════════════════════════════
   CUSTOM SVG ICONS
   ═══════════════════════════════════════════════════════════════ */

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.9">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const InfinityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
    </svg>
);

const BuildingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
);

const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const ClipboardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
    </svg>
);

const GraduationIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
    </svg>
);

/* ═══════════════════════════════════════════════════════════════
   PITCH SVG ILLUSTRATIONS
   ═══════════════════════════════════════════════════════════════ */

const ImpactSVG = () => (
    <svg viewBox="0 0 400 280" fill="none" className="w-full h-auto">
        <path d="M180 30 C210 28,240 35,255 50 C270 65,275 85,280 105 C285 125,290 145,285 165 C280 185,270 200,255 215 C240 230,225 245,210 255 C200 260,190 258,185 250 C175 235,165 225,155 215 C145 205,135 195,128 180 C120 165,115 145,118 125 C120 105,130 85,140 70 C150 55,165 35,180 30Z"
            stroke="currentColor" strokeWidth="1.5" opacity="0.15" className="fill-primary-500/5" />
        {[
            { cx: 170, cy: 85, r: 8, label: 'Delhi NCR', color: '#3B82F6' },
            { cx: 235, cy: 120, r: 5, label: 'Kolkata', color: '#8B5CF6' },
            { cx: 155, cy: 155, r: 6, label: 'Mumbai', color: '#F59E0B' },
            { cx: 190, cy: 180, r: 5, label: 'Pune', color: '#10B981' },
            { cx: 185, cy: 210, r: 9, label: 'Bengaluru', color: '#EC4899' },
            { cx: 210, cy: 200, r: 6, label: 'Hyderabad', color: '#3B82F6' },
            { cx: 220, cy: 225, r: 5, label: 'Chennai', color: '#F59E0B' },
        ].map(({ cx, cy, r, label, color }) => (
            <g key={label}>
                <circle cx={cx} cy={cy} r={r + 6} fill={color} opacity="0.08" />
                <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.35" />
                <circle cx={cx} cy={cy} r={r * 0.4} fill={color} opacity="0.7" />
                <text x={cx + r + 6} y={cy + 3} fontSize="8" fill="currentColor" opacity="0.45" fontWeight="500">{label}</text>
            </g>
        ))}
        <text x="320" y="75" textAnchor="middle" fontSize="36" fontWeight="800" className="fill-primary-500" opacity="0.9">1.5M</text>
        <text x="320" y="95" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.45" fontWeight="500">graduates / year</text>
        <line x1="295" y1="115" x2="345" y2="115" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        <text x="320" y="165" textAnchor="middle" fontSize="36" fontWeight="800" className="fill-amber-500" opacity="0.9">83%</text>
        <text x="320" y="185" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.45" fontWeight="500">unemployed or</text>
        <text x="320" y="197" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.45" fontWeight="500">without internships</text>
    </svg>
);

const MarketSVG = () => (
    <svg viewBox="0 0 480 200" fill="none" className="w-full h-auto">
        <defs>
            <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
        </defs>
        {[160, 130, 100, 70, 40].map((y, i) => (
            <line key={i} x1="60" y1={y} x2="420" y2={y} stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
        ))}
        <text x="50" y="163" textAnchor="end" fontSize="8" fill="currentColor" opacity="0.3">$0B</text>
        <text x="50" y="103" textAnchor="end" fontSize="8" fill="currentColor" opacity="0.3">$15B</text>
        <text x="50" y="43" textAnchor="end" fontSize="8" fill="currentColor" opacity="0.3">$30B</text>
        <path d="M80 155 C120 150,160 145,200 138 C240 130,280 115,320 90 C360 65,400 42,420 35 L420 160 L80 160Z"
            fill="url(#marketGrad)" opacity="0.15" />
        <path d="M80 155 C120 150,160 145,200 138 C240 130,280 115,320 90 C360 65,400 42,420 35"
            stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="80" cy="155" r="5" fill="#10B981" opacity="0.3" />
        <circle cx="80" cy="155" r="3" fill="#10B981" />
        <text x="80" y="175" textAnchor="middle" fontSize="11" fill="#10B981" fontWeight="700">$7.5B</text>
        <text x="80" y="187" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.35">2024</text>
        <circle cx="420" cy="35" r="6" fill="#10B981" opacity="0.3" />
        <circle cx="420" cy="35" r="3.5" fill="#10B981" />
        <text x="420" y="25" textAnchor="middle" fontSize="14" fill="#10B981" fontWeight="800">$29B</text>
        <text x="420" y="55" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.35">2030</text>
        <rect x="220" y="70" width="60" height="22" rx="11" fill="#10B981" opacity="0.12" stroke="#10B981" strokeWidth="0.8" />
        <text x="250" y="84" textAnchor="middle" fontSize="9" fill="#10B981" fontWeight="700">25% CAGR</text>
    </svg>
);

const PlatformEdgeSVG = () => (
    <svg viewBox="0 0 420 240" fill="none" className="w-full h-auto">
        {/* Phone body - landscape */}
        <rect x="20" y="20" width="380" height="200" rx="20" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <rect x="30" y="35" width="360" height="170" rx="4" className="fill-[color:var(--color-bg-primary)]" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        {/* Notch (side) */}
        <rect x="24" y="95" width="6" height="50" rx="3" fill="currentColor" opacity="0.08" />
        {/* Status bar */}
        <text x="45" y="48" fontSize="9" fill="currentColor" opacity="0.35" fontWeight="600">4G</text>
        {/* Signal bars - weak */}
        <rect x="370" y="42" width="3.5" height="5" rx="0.5" fill="#F59E0B" opacity="0.7" />
        <rect x="375.5" y="40" width="3.5" height="7" rx="0.5" fill="currentColor" opacity="0.1" />
        <rect x="381" y="38" width="3.5" height="9" rx="0.5" fill="currentColor" opacity="0.1" />
        {/* App header */}
        <rect x="45" y="55" width="150" height="22" rx="5" className="fill-primary-500/8" />
        <text x="120" y="70" textAnchor="middle" fontSize="10" className="fill-primary-500" fontWeight="700" opacity="0.8">SocraticDev</text>
        {/* Dojo challenge card */}
        <rect x="45" y="85" width="165" height="55" rx="6" fill="currentColor" opacity="0.04" stroke="currentColor" strokeWidth="0.5" />
        <text x="55" y="100" fontSize="8" fill="currentColor" opacity="0.45" fontWeight="600">Dojo Challenge</text>
        <rect x="55" y="107" width="90" height="3.5" rx="1.5" fill="#8B5CF6" opacity="0.35" />
        <rect x="55" y="114" width="130" height="3.5" rx="1.5" fill="currentColor" opacity="0.08" />
        <rect x="55" y="121" width="70" height="3.5" rx="1.5" fill="currentColor" opacity="0.06" />
        <rect x="55" y="128" width="110" height="3.5" rx="1.5" fill="#10B981" opacity="0.3" />
        {/* Flashcard card */}
        <rect x="45" y="148" width="165" height="45" rx="6" fill="currentColor" opacity="0.04" stroke="currentColor" strokeWidth="0.5" />
        <text x="55" y="165" fontSize="8" fill="currentColor" opacity="0.45" fontWeight="600">Flashcard (Offline)</text>
        <rect x="55" y="172" width="120" height="3.5" rx="1.5" fill="#F59E0B" opacity="0.35" />
        <rect x="55" y="179" width="80" height="3.5" rx="1.5" fill="currentColor" opacity="0.08" />
        {/* Offline badge */}
        <rect x="150" y="155" width="50" height="14" rx="7" fill="#10B981" opacity="0.12" stroke="#10B981" strokeWidth="0.7" />
        <text x="175" y="165" textAnchor="middle" fontSize="7" fill="#10B981" fontWeight="600">OFFLINE</text>
        {/* Right panel - stats */}
        <rect x="225" y="55" width="155" height="140" rx="8" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.5" />
        <text x="302" y="78" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.35" fontWeight="600">Performance</text>
        {/* Size badge */}
        <rect x="255" y="90" width="95" height="32" rx="16" className="fill-primary-500/10" stroke="currentColor" strokeWidth="0.5" />
        <text x="302" y="111" textAnchor="middle" fontSize="13" className="fill-primary-500" fontWeight="800">&lt;400 KB</text>
        {/* Mini stats */}
        <text x="258" y="140" fontSize="8" fill="currentColor" opacity="0.3" fontWeight="500">Load time</text>
        <rect x="258" y="145" width="80" height="5" rx="2.5" fill="currentColor" opacity="0.06" />
        <rect x="258" y="145" width="60" height="5" rx="2.5" fill="#10B981" opacity="0.3" />
        <text x="342" y="150" fontSize="7" fill="#10B981" fontWeight="600">1.2s</text>
        <text x="258" y="165" fontSize="8" fill="currentColor" opacity="0.3" fontWeight="500">Memory</text>
        <rect x="258" y="170" width="80" height="5" rx="2.5" fill="currentColor" opacity="0.06" />
        <rect x="258" y="170" width="35" height="5" rx="2.5" fill="#3B82F6" opacity="0.3" />
        <text x="342" y="175" fontSize="7" fill="#3B82F6" fontWeight="600">12MB</text>
        {/* Bottom label */}
        <text x="210" y="210" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.2" fontWeight="500">Runs on ₹8,000 Android phones over patchy 4G</text>
    </svg>
);

const FunnelSVG = () => (
    <svg viewBox="0 0 520 180" fill="none" className="w-full h-auto">
        {[
            { x: 10, w: 100, h: 100, y: 40, label: 'Free Dojo', sub: 'No signup', count: '100K+', color: '#64748B' },
            { x: 120, w: 90, h: 85, y: 48, label: 'First Challenge', sub: 'Activated', count: '60K', color: '#3B82F6' },
            { x: 220, w: 80, h: 70, y: 55, label: 'Save Cards', sub: 'Engaged', count: '25K', color: '#8B5CF6' },
            { x: 310, w: 70, h: 55, y: 63, label: 'Student Plan', sub: '₹299/mo', count: '5K', color: '#F59E0B' },
            { x: 390, w: 60, h: 40, y: 70, label: 'Pro / Instit.', sub: '₹599+/mo', count: '1.5K', color: '#10B981' },
        ].map(({ x, w, h, y, label, sub, count, color }) => (
            <g key={label}>
                <rect x={x} y={y} width={w} height={h} rx="8" fill={color} opacity="0.08" stroke={color} strokeWidth="1" />
                <text x={x + w / 2} y={y + 20} textAnchor="middle" fontSize="9" fill={color} fontWeight="700">{count}</text>
                <text x={x + w / 2} y={y + 34} textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5" fontWeight="600">{label}</text>
                <text x={x + w / 2} y={y + 46} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.3">{sub}</text>
            </g>
        ))}
        {[112, 212, 302, 382].map((x, i) => (
            <g key={i}>
                <path d={`M${x} 85 L${x + 6} 85`} stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
                <polygon points={`${x + 6},82 ${x + 10},85 ${x + 6},88`} fill="currentColor" opacity="0.15" />
            </g>
        ))}
        <text x="260" y="168" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.3" fontWeight="500">Conversion triggers: save flashcards → upload project → unlock full Dojo</text>
    </svg>
);

const GTMTimelineSVG = () => (
    <svg viewBox="0 0 520 140" fill="none" className="w-full h-auto">
        <line x1="30" y1="60" x2="490" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
        <rect x="20" y="5" width="290" height="120" rx="12" stroke="#3B82F6" strokeWidth="1" opacity="0.12" strokeDasharray="4 3" />
        <text x="165" y="22" textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="700" opacity="0.6">PHASE 1 — First 1,000 Users (Zero Paid Ads)</text>
        <rect x="320" y="5" width="190" height="120" rx="12" stroke="#10B981" strokeWidth="1" opacity="0.12" strokeDasharray="4 3" />
        <text x="415" y="22" textAnchor="middle" fontSize="8" fill="#10B981" fontWeight="700" opacity="0.6">PHASE 2 — Scale</text>
        {[
            { cx: 70, label: 'WhatsApp &', sub: 'Discord', color: '#25D366' },
            { cx: 155, label: 'Coding', sub: 'Clubs', color: '#8B5CF6' },
            { cx: 240, label: '50 Colleges', sub: 'in 90 Days', color: '#F59E0B' },
            { cx: 340, label: 'YouTube &', sub: 'LinkedIn', color: '#EF4444' },
            { cx: 450, label: 'Institutional', sub: 'Sales Pipeline', color: '#10B981' },
        ].map(({ cx, label, sub, color }) => (
            <g key={label}>
                <circle cx={cx} cy={60} r={16} fill={color} opacity="0.1" />
                <circle cx={cx} cy={60} r={10} fill={color} opacity="0.25" />
                <circle cx={cx} cy={60} r={4} fill={color} opacity="0.7" />
                <text x={cx} y={95} textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5" fontWeight="600">{label}</text>
                <text x={cx} y={106} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.35">{sub}</text>
            </g>
        ))}
    </svg>
);

/* ═══════════════════════════════════════════════════════════════
   ANIMATION CONFIG
   ═══════════════════════════════════════════════════════════════ */

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease },
    }),
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardReveal = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

interface PricingTier {
    name: string;
    price: string;
    period: string;
    annual?: string;
    description: string;
    features: string[];
    accent: string;
    badge?: string;
    cta: string;
    popular?: boolean;
}

const tiers: PricingTier[] = [
    {
        name: 'Free',
        price: '0',
        period: 'forever',
        description: 'Full Dojo access, limited AI chat. Zero signup friction.',
        features: [
            'All 5 Dojo challenge modes',
            'Interactive landing page demos',
            'Basic flashcard creation',
            '5 AI chat sessions / day',
            'Code Visualizer (limited)',
            'Community support',
        ],
        accent: '#64748B',
        cta: 'Get Started Free',
    },
    {
        name: 'Student',
        price: '299',
        period: '/month',
        annual: '2,499/year (save 30%)',
        description: 'For learners building real skills. Unlimited AI guidance.',
        features: [
            'Everything in Free',
            'Unlimited AI chat (Socratic mode)',
            'Full SRS flashcard system',
            'Learning analytics dashboard',
            'Code Visualizer (full)',
            'Spaced repetition scheduling',
            'Progress export & certificates',
        ],
        accent: '#3B82F6',
        cta: 'Start Learning',
        badge: 'Best for Students',
    },
    {
        name: 'Pro Developer',
        price: '599',
        period: '/month',
        annual: '4,999/year (save 30%)',
        description: 'For engineers who build and learn at the same time.',
        features: [
            'Everything in Student',
            'Build mode (direct code generation)',
            'Project upload & Graph Intelligence',
            'Neo4j code relationship mapping',
            'Priority AI response queue',
            'Advanced analytics & insights',
            'Multi-Persona AI Council access',
            'API access for integrations',
        ],
        accent: '#8B5CF6',
        cta: 'Go Pro',
        popular: true,
        badge: 'Most Popular',
    },
    {
        name: 'Institutional',
        price: '50–100',
        period: '/student/mo',
        description: 'For colleges, bootcamps, and placement cells. Bulk pricing.',
        features: [
            'Everything in Pro',
            'Bulk seat management dashboard',
            'Cohort progress analytics',
            'Instructor assignment tools',
            'Custom challenge creation',
            'White-label branding option',
            'Dedicated support channel',
            'SSO & LMS integration',
        ],
        accent: '#10B981',
        cta: 'Contact Sales',
        badge: 'Volume Pricing',
    },
];

interface B2BStream {
    title: string;
    subtitle: string;
    pricing: string;
    target: string;
    icon: React.ReactNode;
    illustration: React.ReactNode;
    valueProps: string[];
    workflow: string[];
    accent: string;
    revenue: string;
}

const b2bStreams: B2BStream[] = [
    {
        title: 'Hiring Manager & Candidate Assessment',
        subtitle: 'Replace HackerRank with real-world workflow evidence',
        pricing: '$5-10 / candidate assessed  or  $500-1,000+ / month (unlimited)',
        target: 'HR teams, engineering managers, recruitment firms',
        icon: <ClipboardIcon />,
        illustration: <AssessmentIllustration />,
        valueProps: [
            'Every candidate generates a comprehensive Dojo profile with deterministic execution traces, dependency analysis, and Big-O grading',
            'Automated "Candidate Skill Report" packages structured performance data — not just pass/fail, but HOW they solve problems',
            'No private code ever leaves the platform. You provide the sandbox, return the signal',
            'Tests real engineering workflows, not isolated toy puzzles',
        ],
        workflow: [
            'Candidate enters the Dojo sandbox',
            'SocraticDev traces execution, graphs dependencies, grades complexity',
            'Structured Skill Report is auto-generated',
            'Hiring manager reviews evidence-based performance data',
        ],
        accent: '#F59E0B',
        revenue: '10 companies x $600/mo = $6K MRR at launch; scales with platform user base',
    },
    {
        title: 'Corporate Bootcamp Hosting',
        subtitle: 'One platform replaces Zoom + Docs + random sandboxes',
        pricing: 'Custom per cohort (per-seat fee + platform hosting)',
        target: 'IT services firms, GCCs onboarding freshers, ed-tech providers',
        icon: <GraduationIcon />,
        illustration: <BootcampIllustration />,
        valueProps: [
            'Companies run structured cohort bootcamps entirely on SocraticDev — consolidates 3-4 disconnected tools into one analytical platform',
            'Instructor assigns Dojo tasks as homework. Platform auto-tracks progression and surfaces who is struggling vs. breezing through',
            'Live Analytics Dashboard shows per-learner topic mastery in real time',
            'Highly sticky: bootcamps run quarterly. Each cohort brings 20-50 new users organically',
        ],
        workflow: [
            'Trainer creates cohort and assigns Dojo challenge sets',
            'Learners complete tasks between sessions',
            'Analytics dashboard surfaces struggling vs. on-track learners',
            'Instructor adjusts curriculum in real time based on data',
        ],
        accent: '#8B5CF6',
        revenue: 'Cohorts repeat quarterly; each drives organic acquisition alongside direct B2B revenue',
    },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function BillingToggle({ annual, onToggle }: { annual: boolean; onToggle: () => void }) {
    return (
        <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm font-medium transition-colors ${!annual ? 'text-[color:var(--color-text-primary)]' : 'text-[color:var(--color-text-muted)]'}`}>
                Monthly
            </span>
            <button
                onClick={onToggle}
                className="relative w-14 h-7 rounded-full bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] transition-colors"
                aria-label="Toggle billing period"
            >
                <motion.div
                    className="absolute top-0.5 w-6 h-6 rounded-full bg-primary-500"
                    animate={{ left: annual ? '1.75rem' : '0.125rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </button>
            <span className={`text-sm font-medium transition-colors ${annual ? 'text-[color:var(--color-text-primary)]' : 'text-[color:var(--color-text-muted)]'}`}>
                Annual
            </span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Save 30%
            </span>
        </div>
    );
}

function TierCard({ tier, annual, index }: { tier: PricingTier; annual: boolean; index: number }) {
    return (
        <motion.div
            custom={index}
            variants={fadeUp}
            className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                tier.popular
                    ? 'border-primary-500/40 bg-[color:var(--color-bg-secondary)] shadow-lg shadow-primary-500/5'
                    : 'border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] hover:border-[color:var(--color-border-hover)]'
            }`}
        >
            {/* Popular badge */}
            {tier.badge && (
                <div
                    className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: tier.accent }}
                >
                    {tier.badge}
                </div>
            )}

            {/* Accent glow */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top, ${tier.accent}08 0%, transparent 70%)` }}
            />

            <div className="relative z-10 flex flex-col flex-1">
                {/* Header */}
                <h3 className="font-display text-lg font-bold mb-1">{tier.name}</h3>
                <p className="text-xs text-[color:var(--color-text-muted)] mb-4 leading-relaxed">{tier.description}</p>

                {/* Price */}
                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        {tier.price !== '0' && <span className="text-sm text-[color:var(--color-text-muted)]">INR</span>}
                        <span className="font-display text-4xl font-bold" style={{ color: tier.accent }}>
                            {tier.price === '0' ? 'Free' : `${tier.price}`}
                        </span>
                        {tier.price !== '0' && (
                            <span className="text-sm text-[color:var(--color-text-muted)]">{tier.period}</span>
                        )}
                    </div>
                    <AnimatePresence mode="wait">
                        {annual && tier.annual && (
                            <motion.p
                                key="annual"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-xs text-emerald-400 mt-1 font-medium"
                            >
                                or INR {tier.annual}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                    {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[color:var(--color-text-secondary)]">
                            <span className="mt-0.5 flex-shrink-0" style={{ color: tier.accent }}>
                                <CheckIcon />
                            </span>
                            {f}
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <button
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        tier.popular
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'border border-[color:var(--color-border)] text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-muted)]'
                    }`}
                >
                    {tier.cta}
                </button>
            </div>
        </motion.div>
    );
}

function B2BCard({ stream, index }: { stream: B2BStream; index: number }) {
    return (
        <motion.div
            variants={cardReveal}
            className="group rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] overflow-hidden transition-all duration-300 hover:border-[color:var(--color-border-hover)]"
        >
            {/* Accent top bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${stream.accent}, ${stream.accent}60)` }} />

            <div className="p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${stream.accent}12`, color: stream.accent }}
                    >
                        {stream.icon}
                    </div>
                    <div>
                        <h3 className="font-display text-xl font-bold text-[color:var(--color-text-primary)] mb-1">
                            {stream.title}
                        </h3>
                        <p className="text-sm text-[color:var(--color-text-muted)]">{stream.subtitle}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Illustration */}
                    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-4 text-[color:var(--color-text-secondary)]">
                        {stream.illustration}
                    </div>

                    {/* Right: Details */}
                    <div>
                        {/* Pricing */}
                        <div className="mb-5 p-3 rounded-lg border border-[color:var(--color-border)]" style={{ backgroundColor: `${stream.accent}06` }}>
                            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: stream.accent }}>
                                Pricing
                            </div>
                            <p className="text-sm text-[color:var(--color-text-primary)] font-medium">{stream.pricing}</p>
                        </div>

                        {/* Target */}
                        <div className="mb-5 flex items-start gap-2">
                            <span className="mt-0.5 flex-shrink-0" style={{ color: stream.accent }}><UsersIcon /></span>
                            <p className="text-sm text-[color:var(--color-text-secondary)]">{stream.target}</p>
                        </div>

                        {/* Value Props */}
                        <ul className="space-y-2.5 mb-5">
                            {stream.valueProps.map((vp, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 + i * 0.06, duration: 0.35, ease }}
                                    className="flex items-start gap-2.5 text-sm text-[color:var(--color-text-secondary)] leading-relaxed"
                                >
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: stream.accent }} />
                                    {vp}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Workflow steps */}
                <div className="mt-6 pt-6 border-t border-[color:var(--color-border)]">
                    <div className="text-xs font-bold uppercase tracking-widest mb-4 text-[color:var(--color-text-muted)]">
                        How It Works
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {stream.workflow.map((step, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span
                                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                    style={{ backgroundColor: stream.accent }}
                                >
                                    {i + 1}
                                </span>
                                <p className="text-xs text-[color:var(--color-text-secondary)] leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue note */}
                <div className="mt-5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                    <p className="text-xs text-emerald-400 font-medium">
                        <span className="font-bold">Year 1 Potential: </span>{stream.revenue}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

function PricingPage() {
    const [annual, setAnnual] = useState(false);

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom max-w-7xl">

                    {/* ── Hero ─────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease }}
                        className="text-center mb-8"
                    >
                        <h1 className="font-display text-display-md font-bold mb-4">
                            Pricing & Revenue Model
                        </h1>
                        <p className="text-lg text-[color:var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                            High-volume B2C acquisition paired with high-margin B2B offerings.
                            Every tier is designed to convert learners into paying users, and paying users into advocates.
                        </p>
                    </motion.div>

                    {/* ── Impact & The Problem ────────────── */}
                    <div className="mb-16">
                        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-primary-500 via-amber-500 to-primary-500 opacity-40" />
                            <div className="p-8 md:p-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div>
                                        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 text-[color:var(--color-text-primary)]">
                                            The Gap We Solve
                                        </h2>
                                        <p className="text-base text-[color:var(--color-text-secondary)] leading-relaxed mb-4">
                                            India produces <span className="font-bold text-[color:var(--color-text-primary)]">1.5 million engineering graduates</span> a year, yet <span className="font-bold text-amber-500">83% remain unemployed</span> or without internships — not because they cannot code, but because they cannot <em>explain or reason through it under pressure</em>.
                                        </p>
                                        <div className="p-4 rounded-xl border border-primary-500/20 bg-primary-500/5">
                                            <p className="text-base font-semibold text-[color:var(--color-text-primary)]">
                                                That is the gap SocraticDev solves: <span className="text-primary-500">not faster coding — deeper developers.</span>
                                            </p>
                                        </div>
                                        <p className="mt-4 text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                                            We save students <span className="font-semibold text-[color:var(--color-text-secondary)]">8–10 hours a week</span> through structured practice, with offline flashcards, async Dojo challenges, and future Hindi and regional-language support via AWS Bedrock.
                                        </p>
                                    </div>
                                    <div className="text-[color:var(--color-text-secondary)]">
                                        <ImpactSVG />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Market Size ─────────────────────── */}
                    <div className="mb-16">
                        <div className="text-center mb-6">
                            <h2 className="font-display text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">The Market Is Already Here</h2>
                            <p className="text-sm text-[color:var(--color-text-muted)]">EdTech for developers is a massive and rapidly growing opportunity in India</p>
                        </div>
                        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 md:p-8 text-[color:var(--color-text-secondary)] mb-6">
                            <MarketSVG />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { value: '6M', label: 'Engineering Students', sub: 'Active in Indian universities', color: '#3B82F6' },
                                { value: '4M', label: 'Early-Career Developers', sub: '0-5 years experience', color: '#8B5CF6' },
                                { value: '$29B', label: 'Market by 2030', sub: '25% CAGR from $7.5B today', color: '#10B981' },
                            ].map(({ value, label, sub, color }) => (
                                <div key={label} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-5 text-center">
                                    <div className="font-display text-3xl font-bold mb-1" style={{ color }}>{value}</div>
                                    <div className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-1">{label}</div>
                                    <div className="text-xs text-[color:var(--color-text-muted)]">{sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Platform Edge ───────────────────── */}
                    <div className="mb-16">
                        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 opacity-30" />
                            <div className="p-8 md:p-10">
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 items-center">
                                    <div className="order-2 md:order-1 text-[color:var(--color-text-secondary)]">
                                        <PlatformEdgeSVG />
                                    </div>
                                    <div className="order-1 md:order-2">
                                        <h2 className="font-display text-2xl font-bold mb-2 text-[color:var(--color-text-primary)]">Built for Bharat</h2>
                                        <p className="text-sm text-[color:var(--color-text-muted)] mb-6">Engineered for the reality of Indian infrastructure</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                        { title: 'Sub-400KB Runtime', desc: 'Entire app loads in under 400KB — no bloated bundles', icon: (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                ), color: '#F59E0B' },
                                                { title: '₹8,000 Phone Ready', desc: 'Runs smoothly on entry-level Android devices', icon: (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                                                ), color: '#3B82F6' },
                                                { title: 'Patchy 4G Friendly', desc: 'Works on unstable connections with progressive loading', icon: (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>
                                                ), color: '#EF4444' },
                                                { title: 'Offline Flashcards', desc: 'Study anywhere — SRS works without internet', icon: (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                ), color: '#10B981' },
                                                { title: 'Async Dojo', desc: 'Complete challenges without a live connection', icon: (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                                                ), color: '#8B5CF6' },
                                                { title: 'Hindi & Regional (Soon)', desc: 'Future multi-language support via AWS Bedrock', icon: (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                                                ), color: '#EC4899' },
                                            ].map(({ title, desc, icon, color }) => (
                                                <div key={title} className="flex items-start gap-3 p-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
                                                    <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}12`, color }}>
                                                        {icon}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-[color:var(--color-text-primary)]">{title}</div>
                                                        <div className="text-xs text-[color:var(--color-text-muted)] leading-relaxed">{desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Freemium Funnel ─────────────────── */}
                    <div className="mb-16">
                        <div className="text-center mb-6">
                            <h2 className="font-display text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">Freemium Funnel</h2>
                            <p className="text-sm text-[color:var(--color-text-muted)] max-w-xl mx-auto">
                                The no-signup Dojo acquires users. Conversion happens when they save flashcards, upload projects, or unlock the full Dojo.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 md:p-8 text-[color:var(--color-text-secondary)]">
                            <FunnelSVG />
                        </div>
                    </div>

                    {/* ── Billing Toggle ────────────────────── */}
                    <BillingToggle annual={annual} onToggle={() => setAnnual(!annual)} />

                    {/* ── Pricing Tiers ─────────────────────── */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20"
                    >
                        {tiers.map((tier, i) => (
                            <TierCard key={tier.name} tier={tier} annual={annual} index={i} />
                        ))}
                    </motion.div>

                    {/* ── Revenue Overview Table ────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease }}
                        className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-8 mb-20 overflow-x-auto"
                    >
                        <h2 className="font-display text-xl font-bold mb-6 text-[color:var(--color-text-primary)]">
                            Year 1 Revenue Projection
                        </h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[color:var(--color-border)]">
                                    <th className="text-left py-3 pr-4 font-semibold text-[color:var(--color-text-muted)] text-xs uppercase tracking-wider">Stream</th>
                                    <th className="text-left py-3 pr-4 font-semibold text-[color:var(--color-text-muted)] text-xs uppercase tracking-wider">Price Point</th>
                                    <th className="text-left py-3 pr-4 font-semibold text-[color:var(--color-text-muted)] text-xs uppercase tracking-wider">Target</th>
                                    <th className="text-right py-3 font-semibold text-[color:var(--color-text-muted)] text-xs uppercase tracking-wider">Year 1 Potential</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[color:var(--color-border)]">
                                {[
                                    { stream: 'Free Tier', price: 'INR 0', target: 'All users', revenue: 'Acquisition funnel', color: '#64748B' },
                                    { stream: 'Student Plan', price: 'INR 299/mo', target: '2,500 paid users', revenue: 'INR 75L', color: '#3B82F6' },
                                    { stream: 'Pro Developer', price: 'INR 599/mo', target: '500 paid users', revenue: 'INR 36L', color: '#8B5CF6' },
                                    { stream: 'Institutional', price: 'INR 50-100/student/mo', target: '5,000 seats', revenue: 'INR 30L', color: '#10B981' },
                                    { stream: 'Hiring Assessment', price: '$5-10/candidate', target: 'HR teams', revenue: '$72K ARR at launch', color: '#F59E0B' },
                                    { stream: 'Corporate Bootcamp', price: 'Custom per cohort', target: 'IT firms, GCCs', revenue: 'Year 1 pilots', color: '#EC4899' },
                                ].map((row) => (
                                    <tr key={row.stream} className="group">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                                                <span className="font-medium text-[color:var(--color-text-primary)]">{row.stream}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 text-[color:var(--color-text-secondary)]">{row.price}</td>
                                        <td className="py-3 pr-4 text-[color:var(--color-text-secondary)]">{row.target}</td>
                                        <td className="py-3 text-right font-semibold" style={{ color: row.color }}>{row.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>

                    {/* ── B2B Section Divider ───────────────── */}
                    <div className="relative my-16">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[color:var(--color-border)]" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-[color:var(--color-bg-primary)] text-sm text-[color:var(--color-text-muted)] font-medium flex items-center gap-2">
                                <BuildingIcon />
                                High-Margin B2B Streams
                            </span>
                        </div>
                    </div>

                    {/* ── B2B Intro ─────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease }}
                        className="text-center mb-12 max-w-3xl mx-auto"
                    >
                        <h2 className="font-display text-2xl font-bold mb-3 text-[color:var(--color-text-primary)]">
                            Enterprise Revenue Without Enterprise Friction
                        </h2>
                        <p className="text-[color:var(--color-text-muted)] leading-relaxed">
                            Both B2B streams completely bypass the friction of handling private enterprise code.
                            SocraticDev provides the sandbox environment and returns structured performance data.
                            No proprietary code ever leaves the platform.
                        </p>
                    </motion.div>

                    {/* ── B2B Cards ─────────────────────────── */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="space-y-8 mb-16"
                    >
                        {b2bStreams.map((stream, i) => (
                            <B2BCard key={stream.title} stream={stream} index={i} />
                        ))}
                    </motion.div>

                    {/* ── Key Differentiators ───────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16"
                    >
                        {[
                            {
                                icon: <StarIcon />,
                                title: 'Zero Code Exposure Risk',
                                description: 'Assessment and bootcamp features never require access to proprietary codebases. All evaluation happens inside the SocraticDev sandbox.',
                                color: '#F59E0B',
                            },
                            {
                                icon: <InfinityIcon />,
                                title: 'Built-in Acquisition Flywheel',
                                description: 'Every corporate bootcamp cohort brings 20-50 new organic users. Every candidate assessment introduces engineers to the platform.',
                                color: '#8B5CF6',
                            },
                            {
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" /></svg>,
                                title: 'Sticky Revenue Cycles',
                                description: 'Bootcamps repeat quarterly. Assessment subscriptions auto-renew. Institutional seats grow with each incoming batch.',
                                color: '#10B981',
                            },
                        ].map((diff, i) => (
                            <motion.div
                                key={diff.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4, ease }}
                                className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${diff.color}12`, color: diff.color }}>
                                    {diff.icon}
                                </div>
                                <h3 className="font-display font-bold mb-2 text-[color:var(--color-text-primary)]">{diff.title}</h3>
                                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">{diff.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* ── Go-to-Market ────────────────────── */}
                    <div className="mb-16">
                        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 opacity-30" />
                            <div className="p-8 md:p-10">
                                <h2 className="font-display text-2xl font-bold mb-2 text-[color:var(--color-text-primary)]">Go-to-Market Strategy</h2>
                                <p className="text-sm text-[color:var(--color-text-muted)] mb-6 max-w-2xl">
                                    Acquiring our first 1,000 users through organic channels — WhatsApp and Discord placement communities, coding clubs, outreach to 50 colleges in 90 days, and live YouTube and LinkedIn demos. <span className="font-semibold text-emerald-400">Zero paid ads in Phase 1.</span>
                                </p>
                                <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-6 text-[color:var(--color-text-secondary)]">
                                    <GTMTimelineSVG />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                                    {[
                                        { stat: '1,000', label: 'Target Users', sub: 'Phase 1 goal' },
                                        { stat: '50', label: 'Colleges', sub: 'In 90 days' },
                                        { stat: '$0', label: 'Ad Spend', sub: 'Phase 1' },
                                        { stat: '100%', label: 'Organic', sub: 'Community-driven' },
                                    ].map(({ stat, label, sub }) => (
                                        <div key={label} className="text-center p-3 rounded-lg border border-[color:var(--color-border)]">
                                            <div className="font-display text-xl font-bold text-[color:var(--color-text-primary)]">{stat}</div>
                                            <div className="text-xs font-semibold text-[color:var(--color-text-secondary)]">{label}</div>
                                            <div className="text-[10px] text-[color:var(--color-text-muted)]">{sub}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── CTA ───────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease }}
                        className="rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 p-8 text-center"
                    >
                        <h2 className="font-display text-2xl font-bold mb-3">Ready to explore SocraticDev?</h2>
                        <p className="text-[color:var(--color-text-muted)] mb-6 max-w-xl mx-auto">
                            Start with the free tier — full Dojo access, interactive challenges, and AI-powered learning.
                            No credit card required.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/dojo"
                                className="px-6 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
                            >
                                Try the Dojo Free
                            </Link>
                            <Link
                                to="/contact"
                                className="px-6 py-2.5 rounded-xl border border-[color:var(--color-border)] text-[color:var(--color-text-primary)] font-semibold text-sm hover:bg-[color:var(--color-bg-muted)] transition-colors"
                            >
                                Contact for Enterprise
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default PricingPage;
