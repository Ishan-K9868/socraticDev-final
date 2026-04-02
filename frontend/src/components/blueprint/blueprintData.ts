import type { BlueprintData } from './blueprintTypes';

// SVG icon paths (viewBox 0 0 24 24)
const ICON_SOCKET   = 'M13 10V3L4 14h7v7l9-11h-7z'; // lightning bolt - websocket

const ICON_DB       = 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4';

const ICON_AI       = 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z';
const ICON_GRAPH    = 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
const ICON_USERS    = 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
const ICON_CODE     = 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4';
const ICON_EYE      = 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z';

const ICON_SHIELD   = 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
const ICON_BRAIN    = 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253';
const ICON_ROUTE    = 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0020 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7';
const ICON_CHART    = 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z';

// ═══════════════════════════════════════════════════════════════════════════
// Speed Coding Coliseum
// ═══════════════════════════════════════════════════════════════════════════
export const COLISEUM_BLUEPRINT: BlueprintData = {
    title: 'Speed Coding Coliseum',
    subtitle: 'Real-time multiplayer architecture',
    accentColor: '#EF4444',
    gradient: 'from-red-500 to-orange-500',
    techStack: [
        { label: 'WebSocket',      color: '#EF4444' },
        { label: 'Socket.io',      color: '#F59E0B' },
        { label: 'Redis Pub/Sub',  color: '#DC2626' },
        { label: 'Node.js',        color: '#10B981' },
        { label: 'React',          color: '#3B82F6' },
        { label: 'Monaco Editor',  color: '#8B5CF6' },
    ],
    archNodes: [
        { id: 'client',    label: 'Player Client',    description: 'React + Monaco Editor with real-time code sync',    icon: ICON_CODE,   color: '#3B82F6', x: 10, y: 25 },
        { id: 'ws',        label: 'WebSocket Gateway', description: 'Socket.io server handles rooms, events, heartbeat', icon: ICON_SOCKET, color: '#EF4444', x: 45, y: 25 },
        { id: 'matchmaker', label: 'Matchmaking',      description: 'ELO-based matchmaking with skill brackets',         icon: ICON_USERS,  color: '#F59E0B', x: 45, y: 75 },
        { id: 'redis',     label: 'Redis',             description: 'Session state, pub/sub for horizontal scaling',      icon: ICON_DB,     color: '#DC2626', x: 80, y: 25 },
        { id: 'judge',     label: 'AI Judge',          description: 'AST analysis + LLM scoring for code quality',        icon: ICON_AI,     color: '#8B5CF6', x: 80, y: 75 },
        { id: 'spectator', label: 'Spectator View',    description: 'Read-only WebSocket stream with 50ms latency',       icon: ICON_EYE,    color: '#10B981', x: 10, y: 75 },
    ],
    archEdges: [
        { from: 'client',    to: 'ws',        label: 'WS' },
        { from: 'ws',        to: 'redis',     label: 'pub/sub' },
        { from: 'ws',        to: 'matchmaker', label: 'queue' },
        { from: 'ws',        to: 'judge',     label: 'evaluate' },
        { from: 'spectator', to: 'ws',        label: 'stream' },
        { from: 'matchmaker', to: 'redis' },
    ],
    phases: [
        { title: 'Lobby & Matchmaking',    description: 'Players join rooms via WS. ELO-based brackets ensure fair matches. Countdown sync across clients.',           color: '#EF4444' },
        { title: 'Live Battle Engine',     description: 'Code changes broadcast via WS diff patches (not full files). Server validates, tracks progress, manages timer.', color: '#F59E0B' },
        { title: 'AI Judging Pipeline',    description: 'On round end, code sent to AST analyzer + LLM. Scores combine correctness, complexity, and explanation quality.',  color: '#8B5CF6' },
        { title: 'Spectator & Replay',     description: 'Read-only WS streams with event replay. Tournament brackets, elimination animations, confetti on victory.',       color: '#10B981' },
    ],
    keyInsights: [
        'WebSocket diff patches instead of full code — 95% bandwidth reduction',
        'Redis Pub/Sub enables horizontal scaling across multiple WS servers',
        'AST-based scoring is deterministic; LLM handles subjective "explain" rounds',
        'Optimistic UI updates with server reconciliation for <50ms perceived latency',
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// AI Code Reviews
// ═══════════════════════════════════════════════════════════════════════════
export const CODE_REVIEW_BLUEPRINT: BlueprintData = {
    title: 'AI Code Reviews',
    subtitle: 'Static analysis + LLM pipeline',
    accentColor: '#3B82F6',
    gradient: 'from-blue-500 to-emerald-500',
    techStack: [
        { label: 'Tree-sitter',    color: '#10B981' },
        { label: 'Claude API',     color: '#8B5CF6' },
        { label: 'ESLint Engine',  color: '#3B82F6' },
        { label: 'OWASP Rules',    color: '#EF4444' },
        { label: 'GitHub API',     color: '#6B7280' },
        { label: 'Redis Cache',    color: '#F59E0B' },
    ],
    archNodes: [
        { id: 'input',     label: 'Code Input',       description: 'Paste, upload, or connect GitHub repo',                 icon: ICON_CODE,   color: '#3B82F6', x: 10, y: 50 },
        { id: 'parser',    label: 'AST Parser',        description: 'Tree-sitter builds language-agnostic AST',              icon: ICON_GRAPH,  color: '#10B981', x: 35, y: 25 },
        { id: 'static',    label: 'Static Analysis',   description: 'ESLint, security rules (OWASP), complexity metrics',    icon: ICON_SHIELD, color: '#EF4444', x: 35, y: 75 },
        { id: 'llm',       label: 'LLM Reviewer',      description: 'Claude analyzes context, intent, and architecture',     icon: ICON_AI,     color: '#8B5CF6', x: 65, y: 25 },
        { id: 'merge',     label: 'Score Aggregator',   description: 'Merges static + AI findings, deduplicates, ranks',     icon: ICON_CHART,  color: '#F59E0B', x: 65, y: 75 },
        { id: 'output',    label: 'Review Report',      description: 'Inline annotations, quality score, fix suggestions',   icon: ICON_EYE,    color: '#3B82F6', x: 90, y: 50 },
    ],
    archEdges: [
        { from: 'input',  to: 'parser',  label: 'source' },
        { from: 'input',  to: 'static',  label: 'source' },
        { from: 'parser', to: 'llm',     label: 'AST' },
        { from: 'static', to: 'merge',   label: 'findings' },
        { from: 'llm',    to: 'merge',   label: 'insights' },
        { from: 'merge',  to: 'output',  label: 'report' },
    ],
    phases: [
        { title: 'Parse & Tokenize',      description: 'Tree-sitter generates AST for 15+ languages. Extracts function signatures, call graphs, data flow.',     color: '#10B981' },
        { title: 'Static Rule Engine',     description: 'Runs OWASP security rules, ESLint patterns, cyclomatic complexity. Zero false-positive goal via AST.',    color: '#EF4444' },
        { title: 'LLM Deep Review',        description: 'Claude receives AST context (not raw code). Finds logic errors, architectural smell, suggests refactors.', color: '#8B5CF6' },
        { title: 'Report Generation',      description: 'Inline annotations with severity. Click-to-fix suggestions. Quality score with dimension breakdown.',    color: '#3B82F6' },
    ],
    keyInsights: [
        'AST-first approach — LLM sees structure, not syntax. Cheaper and more accurate.',
        'Static + AI hybrid: deterministic rules catch OWASP/CWE, LLM catches logic issues',
        'Results cached by file hash — same code reviewed instantly on second pass',
        'GitHub PR integration: auto-review on push, inline comments via Check Runs API',
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Adaptive Learning Paths
// ═══════════════════════════════════════════════════════════════════════════
export const LEARNING_PATH_BLUEPRINT: BlueprintData = {
    title: 'Adaptive Learning Paths',
    subtitle: 'Knowledge graph + spaced repetition',
    accentColor: '#8B5CF6',
    gradient: 'from-violet-500 to-amber-500',
    techStack: [
        { label: 'Knowledge Graph', color: '#8B5CF6' },
        { label: 'Neo4j',           color: '#00B4D8' },
        { label: 'GPT-4 API',       color: '#10B981' },
        { label: 'SM-2 Algorithm',   color: '#F59E0B' },
        { label: 'D3.js',           color: '#EF4444' },
        { label: 'PostgreSQL',      color: '#3B82F6' },
    ],
    archNodes: [
        { id: 'assess',    label: 'Skill Assessment',   description: 'Adaptive quiz determines current level per topic',      icon: ICON_CHART,  color: '#F59E0B', x: 10, y: 50 },
        { id: 'graph',     label: 'Knowledge Graph',    description: 'Neo4j stores topics, prerequisites, difficulty edges',   icon: ICON_GRAPH,  color: '#8B5CF6', x: 35, y: 25 },
        { id: 'ai',        label: 'Path Generator',     description: 'GPT-4 plans optimal route through the graph',            icon: ICON_AI,     color: '#10B981', x: 35, y: 75 },
        { id: 'content',   label: 'Content Engine',     description: 'Selects exercises, readings, projects per node',         icon: ICON_BRAIN,  color: '#3B82F6', x: 65, y: 25 },
        { id: 'srs',       label: 'Spaced Repetition',  description: 'SM-2 schedules reviews at optimal intervals',            icon: ICON_ROUTE,  color: '#EF4444', x: 65, y: 75 },
        { id: 'progress',  label: 'Progress Tracker',   description: 'Real-time skill radar, XP, streak, mastery levels',      icon: ICON_EYE,    color: '#F59E0B', x: 90, y: 50 },
    ],
    archEdges: [
        { from: 'assess',  to: 'graph',   label: 'gaps' },
        { from: 'assess',  to: 'ai',      label: 'level' },
        { from: 'graph',   to: 'content', label: 'topics' },
        { from: 'ai',      to: 'content', label: 'path' },
        { from: 'content', to: 'srs',     label: 'schedule' },
        { from: 'srs',     to: 'progress', label: 'data' },
    ],
    phases: [
        { title: 'Diagnostic Assessment',  description: 'Adaptive quiz engine: correct answers increase difficulty, wrong answers branch to prerequisites.',     color: '#F59E0B' },
        { title: 'Graph Traversal',         description: 'Neo4j query finds shortest path from current skills to target. Respects prerequisite edges.',           color: '#8B5CF6' },
        { title: 'AI Path Optimization',    description: 'GPT-4 considers learning style, time budget, and goals. Reorders nodes for engagement.',                color: '#10B981' },
        { title: 'Continuous Adaptation',    description: 'SM-2 spaced repetition for retention. Path re-calculates as skills update. Mastery unlocks new branches.', color: '#EF4444' },
    ],
    keyInsights: [
        'Knowledge graph edges encode prerequisite strength — not just binary yes/no',
        'Assessment is adaptive: Item Response Theory (IRT) converges in ~10 questions',
        'Path re-generates daily based on retention decay from SM-2 algorithm',
        'D3.js force-directed layout makes the skill tree explorable and zoomable',
    ],
};
