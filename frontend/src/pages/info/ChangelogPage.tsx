import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface Commit {
    hash: string;
    date: string;
    subject: string;
    explanation: string;
    type: 'feat' | 'fix' | 'docs' | 'refactor' | 'chore' | 'test';
    files: string[];
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION
   ═══════════════════════════════════════════════════════════════ */
const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════════════════════════ */
const GitCommitIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" /><line x1="1.05" y1="12" x2="7" y2="12" /><line x1="17.01" y1="12" x2="22.96" y2="12" />
    </svg>
);
const FileIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" />
    </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
        <polyline points="6,9 12,15 18,9" />
    </svg>
);

/* ═══════════════════════════════════════════════════════════════
   ALL 68 COMMITS — sourced from `git log --no-merges`
   ═══════════════════════════════════════════════════════════════ */
const commits: Commit[] = [
    // ──────────── April 2026 ────────────
    {
        hash: 'baa1b9f', date: '2026-04-04',
        subject: 'feat: implement footer component and scaffold core landing page structure with documentation and information pages',
        explanation: 'Added the global Footer component with link sections. Created Pricing, AWS Infrastructure, and Security pages. Refactored comparison slider and GraphRAG pipeline SVG for readability.',
        type: 'feat',
        files: ['.gitignore', 'frontend/src/App.tsx', 'frontend/src/components/ComparisonSection.tsx', 'frontend/src/components/Footer.tsx', 'frontend/src/components/GraphRAGPipelineSection.tsx', 'frontend/src/components/SolutionHorizontalScroll.tsx', 'frontend/src/pages/index.ts', 'frontend/src/pages/info/AWSPage.tsx', 'frontend/src/pages/info/PricingPage.tsx', 'frontend/src/pages/legal/SecurityPage.tsx'],
    },
    {
        hash: 'd2012d4', date: '2026-04-02',
        subject: 'feat: add ImplementationBlueprint component with interactive modal and tabbed content view',
        explanation: 'Created a reusable blueprint viewer that displays implementation plans in a tabbed modal with animated transitions between overview, architecture and timeline views.',
        type: 'feat',
        files: ['frontend/src/components/blueprint/ImplementationBlueprint.tsx'],
    },
    {
        hash: '4d8b9de', date: '2026-04-02',
        subject: 'feat: implement dojo simulation features including code review and learning path modules',
        explanation: 'Major Dojo expansion — Code Review Arena for peer-review simulation, Learning Path system with structured progression, architecture blueprints, and supporting data models.',
        type: 'feat',
        files: ['frontend/src/App.tsx', 'frontend/src/components/blueprint/ImplementationBlueprint.tsx', 'frontend/src/components/blueprint/blueprintData.ts', 'frontend/src/components/blueprint/blueprintTypes.ts', 'frontend/src/features/dojo/codeReview/CodeReviewArena.tsx', 'frontend/src/features/dojo/codeReview/CodeReviewLobby.tsx', 'frontend/src/features/dojo/codeReview/codeReviewData.ts', 'frontend/src/features/dojo/codeReview/codeReviewTypes.ts', 'frontend/src/features/dojo/codeReview/index.ts', 'frontend/src/features/dojo/learningPaths/LearningPathArena.tsx', 'frontend/src/features/dojo/learningPaths/LearningPathLobby.tsx', 'frontend/src/features/dojo/learningPaths/learningPathData.ts'],
    },
    {
        hash: 'fb4d0c6', date: '2026-04-02',
        subject: 'feat: update CountdownTimer and PlayerPanel styles, add SVG icons for improved visuals',
        explanation: 'Polished the Coliseum simulation UI — replaced emoji icons with custom SVGs, improved timer animations, and enhanced player panel layout.',
        type: 'feat',
        files: ['frontend/src/features/dojo/coliseum/ColiseumArena.tsx', 'frontend/src/features/dojo/coliseum/ColiseumLobby.tsx', 'frontend/src/features/dojo/coliseum/CountdownTimer.tsx', 'frontend/src/features/dojo/coliseum/PlayerPanel.tsx', 'frontend/src/features/dojo/coliseum/SpeedControl.tsx', 'frontend/src/features/dojo/coliseum/VictorySequence.tsx', 'frontend/src/features/dojo/coliseum/coliseumData.ts', 'frontend/src/features/dojo/coliseum/coliseumIcons.ts', 'frontend/src/features/dojo/coliseum/coliseumTypes.ts', 'frontend/src/features/dojo/coliseum/useColiseumSimulation.ts'],
    },
    {
        hash: '25085f7', date: '2026-04-02',
        subject: 'feat(eli5): enhance ELI5Challenge with evaluation logic and readability scoring',
        explanation: 'Added automated evaluation for the "Explain Like I\'m 5" challenge. Scores responses on simplicity, accuracy, and readability using Flesch-Kincaid metrics.',
        type: 'feat',
        files: ['frontend/src/features/dojo/ELI5Challenge.tsx', 'frontend/src/features/dojo/eli5Evaluation.ts'],
    },
    {
        hash: 'fea5981', date: '2026-04-02',
        subject: 'feat(coliseum): add core components for coliseum simulation',
        explanation: 'Built the Coliseum — a live AI debate simulation where two agents argue opposing sides of a technical question. Includes arena, lobby, countdown, player panels, speed controls, and victory sequence.',
        type: 'feat',
        files: ['frontend/src/App.tsx', 'frontend/src/features/dojo/ParsonsChallenge.tsx', 'frontend/src/features/dojo/coliseum/ColiseumArena.tsx', 'frontend/src/features/dojo/coliseum/ColiseumLobby.tsx', 'frontend/src/features/dojo/coliseum/CountdownTimer.tsx', 'frontend/src/features/dojo/coliseum/EliminationEffect.tsx', 'frontend/src/features/dojo/coliseum/PlayerPanel.tsx', 'frontend/src/features/dojo/coliseum/SpeedControl.tsx', 'frontend/src/features/dojo/coliseum/VictorySequence.tsx', 'frontend/src/features/dojo/coliseum/coliseumData.ts', 'frontend/src/features/dojo/coliseum/coliseumTypes.ts', 'frontend/src/features/dojo/coliseum/index.ts', 'frontend/src/features/dojo/coliseum/useColiseumSimulation.ts', 'frontend/src/pages/ColiseumPage.tsx', 'frontend/src/pages/LearningHub.tsx'],
    },

    // ──────────── March 2026 ────────────
    {
        hash: 'e7dc984', date: '2026-03-27',
        subject: 'Add .gitignore file to exclude common files and directories from version control',
        explanation: 'Created a comprehensive .gitignore excluding node_modules, build artifacts, environment files, IDE configs, and OS-specific files.',
        type: 'chore',
        files: ['.agents/skills/landing-page-design/SKILL.md', '.gitignore'],
    },
    {
        hash: '5579b12', date: '2026-03-27',
        subject: 'docs(phase-01): evolve PROJECT.md after phase completion',
        explanation: 'Updated project planning document — moved completed Phase 01 items to "done" status and updated the roadmap with next-phase priorities.',
        type: 'docs',
        files: ['.planning/PROJECT.md'],
    },
    {
        hash: '4f3af4c', date: '2026-03-27',
        subject: 'docs(phase-01): complete phase execution',
        explanation: 'Marked Phase 01 as complete in the planning state tracker. Added verification checklist confirming all acceptance criteria were met.',
        type: 'docs',
        files: ['.planning/STATE.md', '.planning/phases/01-landing-page-dojo-interaction/01-VERIFICATION.md'],
    },
    {
        hash: 'da78c39', date: '2026-03-27',
        subject: 'test(01): persist human verification items as UAT',
        explanation: 'Documented manual UAT (User Acceptance Testing) items — a checklist of human-verified behaviors that automated tests cannot cover.',
        type: 'test',
        files: ['.planning/phases/01-landing-page-dojo-interaction/01-HUMAN-UAT.md'],
    },
    {
        hash: '9004d54', date: '2026-03-27',
        subject: 'docs(01-02): complete landing dojo interaction plan',
        explanation: 'Finalized the Phase 01-02 planning documents — requirements, roadmap update, and a summary of the completed landing page dojo interaction feature.',
        type: 'docs',
        files: ['.planning/REQUIREMENTS.md', '.planning/ROADMAP.md', '.planning/STATE.md', '.planning/phases/01-landing-page-dojo-interaction/01-02-SUMMARY.md', '.planning/phases/01-landing-page-dojo-interaction/deferred-items.md'],
    },
    {
        hash: 'd11b875', date: '2026-03-27',
        subject: 'feat(01-02): rework dojo landing section around live previews',
        explanation: 'Redesigned the Dojo section on the landing page to use live interactive previews of challenge types instead of static descriptions.',
        type: 'feat',
        files: ['frontend/src/components/DojoSection.tsx'],
    },
    {
        hash: 'c31616a', date: '2026-03-27',
        subject: 'feat(01-02): build shared landing dojo preview panel',
        explanation: 'Created the LandingDojoPreview component — renders interactive Dojo challenge previews with evaluation feedback directly on the landing page.',
        type: 'feat',
        files: ['frontend/src/features/dojo/landingPreview/LandingDojoPreview.tsx', 'frontend/src/features/dojo/landingPreview/index.ts'],
    },
    {
        hash: 'd2b8e6d', date: '2026-03-27',
        subject: 'docs(01-01): complete landing preview foundation plan',
        explanation: 'Finalized the planning documents for Phase 01-01 — the foundation for landing page dojo previews. Includes requirements, roadmap, and summary.',
        type: 'docs',
        files: ['.planning/REQUIREMENTS.md', '.planning/ROADMAP.md', '.planning/STATE.md', '.planning/phases/01-landing-page-dojo-interaction/01-01-SUMMARY.md'],
    },
    {
        hash: '3815930', date: '2026-03-27',
        subject: 'feat(01-01): add landing preview verdict helpers',
        explanation: 'Added evaluation helper functions that score user attempts in the landing page preview challenges and return verdict objects with pass/fail and feedback.',
        type: 'feat',
        files: ['frontend/src/features/dojo/landingPreview/evaluators.ts'],
    },
    {
        hash: 'f46d82b', date: '2026-03-27',
        subject: 'feat(01-01): add landing preview contracts and scenarios',
        explanation: 'Defined TypeScript data contracts and sample scenarios for landing page dojo previews. Each scenario includes a challenge prompt, expected output, and evaluation criteria.',
        type: 'feat',
        files: ['frontend/src/features/dojo/landingPreview/content.ts', 'frontend/src/features/dojo/landingPreview/index.ts', 'frontend/src/features/dojo/landingPreview/types.ts'],
    },
    {
        hash: '6c59391', date: '2026-03-27',
        subject: 'docs(01): create landing dojo phase plans',
        explanation: 'Created detailed phase execution plans (01-01 and 01-02) for the landing page dojo interaction feature, including research findings and implementation strategies.',
        type: 'docs',
        files: ['.planning/PROJECT.md', '.planning/REQUIREMENTS.md', '.planning/ROADMAP.md', '.planning/phases/01-landing-page-dojo-interaction/01-01-PLAN.md', '.planning/phases/01-landing-page-dojo-interaction/01-02-PLAN.md', '.planning/phases/01-landing-page-dojo-interaction/01-RESEARCH.md'],
    },
    {
        hash: 'c017789', date: '2026-03-27',
        subject: 'docs(01): capture landing dojo context',
        explanation: 'Captured the current state of the project and initial context analysis for the landing page dojo interaction phase. Includes discussion log and implementation considerations.',
        type: 'docs',
        files: ['.planning/STATE.md', '.planning/phases/01-landing-page-dojo-interaction/01-CONTEXT.md', '.planning/phases/01-landing-page-dojo-interaction/01-DISCUSSION-LOG.md'],
    },
    {
        hash: '4515f62', date: '2026-03-27',
        subject: 'docs: add codebase mapping for planning workflows',
        explanation: 'Created comprehensive codebase documentation — architecture, conventions, concerns, integrations, stack, structure, and testing patterns. Used as reference for AI-assisted planning.',
        type: 'docs',
        files: ['.planning/codebase/ARCHITECTURE.md', '.planning/codebase/CONCERNS.md', '.planning/codebase/CONVENTIONS.md', '.planning/codebase/INTEGRATIONS.md', '.planning/codebase/STACK.md', '.planning/codebase/STRUCTURE.md', '.planning/codebase/TESTING.md'],
    },
    {
        hash: '01d2cdb', date: '2026-03-26',
        subject: 'feat: revamp AboutPage with updated team members, project mission, and values',
        explanation: 'Complete redesign of the About page with updated team profiles, refined mission statement, core values section with custom illustrations, and improved visual hierarchy.',
        type: 'feat',
        files: ['frontend/src/pages/info/AboutPage.tsx'],
    },
    {
        hash: '3c047a2', date: '2026-03-05',
        subject: 'model ref change',
        explanation: 'Updated the AI model reference identifier to point to the latest available model endpoint for improved response quality.',
        type: 'chore',
        files: ['README.md'],
    },
    {
        hash: '4a6648c', date: '2026-03-05',
        subject: 'readme updated for aws deployment',
        explanation: 'Updated README with AWS deployment instructions, architecture overview, and links to the deployment guide.',
        type: 'docs',
        files: ['README.md'],
    },
    {
        hash: '532a54d', date: '2026-03-04',
        subject: 'model name changed',
        explanation: 'Changed the configured model name in the Gemini service client to match the updated Google AI Studio model identifier format.',
        type: 'chore',
        files: ['frontend/src/services/gemini.ts'],
    },
    {
        hash: 'dff74b8', date: '2026-03-03',
        subject: 'data collision patch',
        explanation: 'Fixed a race condition in the upload task processor where concurrent file uploads could overwrite session data. Added mutex locking and session validation.',
        type: 'fix',
        files: ['backend/src/tasks/upload_tasks.py', 'backend/tests/unit/test_upload_tasks.py'],
    },
    {
        hash: '16479a0', date: '2026-03-02',
        subject: 'feat: implement Gemini and Bedrock AI service integration with mode-specific system prompts',
        explanation: 'Added dual AI provider support — Google Gemini and AWS Bedrock. Each provider uses mode-specific system prompts (Learning vs Build mode) with different temperature/token settings. Includes flashcard generation utilities.',
        type: 'feat',
        files: ['backend/.deps_installed', 'frontend/package-lock.json', 'frontend/src/services/gemini.ts'],
    },
    {
        hash: 'cdef9c7', date: '2026-03-01',
        subject: 'feat: introduce AI-powered flashcard generation review modal, integrate Gemini and Bedrock services',
        explanation: 'Added the GeneratedCardReviewModal for reviewing AI-generated flashcards before saving. Integrated Gemini and Bedrock services for card generation. Updated ChatPanel and DojoPage with new interactions.',
        type: 'feat',
        files: ['frontend/src/features/chat/ChatPanel.tsx', 'frontend/src/features/dojo/DojoPage.tsx', 'frontend/src/features/srs/GeneratedCardReviewModal.tsx', 'frontend/src/features/srs/types.ts', 'frontend/src/services/gemini.ts', 'frontend/test_bedrock.ts'],
    },
    {
        hash: 'afa63f7', date: '2026-03-01',
        subject: 'feat: implement the Socratic debate feature with AI agents and dedicated UI components',
        explanation: 'Built the Debate challenge type — two AI agents take opposing positions on a technical topic and debate in real-time. Users judge arguments and earn XP. Includes DebateMessage, CouncilChallenge, and DojoHub integration.',
        type: 'feat',
        files: ['frontend/src/App.tsx', 'frontend/src/features/dojo/ChallengeIcons.tsx', 'frontend/src/features/dojo/CouncilChallenge.tsx', 'frontend/src/features/dojo/DojoHub.tsx', 'frontend/src/features/dojo/DojoPage.tsx', 'frontend/src/features/dojo/constants.ts', 'frontend/src/features/dojo/debate/DebateMessage.tsx', 'frontend/src/features/dojo/debate/DebateTerminalButton.tsx', 'frontend/src/features/dojo/debate/SocraticDebatePanel.tsx', 'frontend/src/features/dojo/debate/agentPrompts.ts', 'frontend/src/features/dojo/debate/debateTypes.ts', 'frontend/src/features/dojo/debate/index.ts'],
    },
    {
        hash: '60f82bd', date: '2026-03-01',
        subject: 'Revise AWS Deployment Guide for Single Host Setup',
        explanation: 'Rewrote the AWS deployment guide to focus on single-host EC2 setup — Docker Compose orchestration, Nginx reverse proxy, SSL termination, and monitoring basics.',
        type: 'docs',
        files: ['aws_deployment_guide.md'],
    },

    // ──────────── February 2026 ────────────
    {
        hash: '920f706', date: '2026-02-28',
        subject: 'feat: implement core frontend application structure with routing, global state, and error handling',
        explanation: 'Established the core application skeleton — React Router, Zustand global state, error boundary, custom cursor, challengeAI hook, and Nginx deployment configuration.',
        type: 'feat',
        files: ['aws_deployment_guide.md', 'deploy/nginx/socraticdev-http.conf', 'frontend/src/App.tsx', 'frontend/src/components/AppErrorBoundary.tsx', 'frontend/src/components/CustomCursor.tsx', 'frontend/src/features/dojo/useChallengeAI.ts', 'frontend/src/store/useStore.ts', 'frontend/src/utils/generateId.ts'],
    },
    {
        hash: 'd947612', date: '2026-02-28',
        subject: 'feat: add ProjectUpload component for project uploads with local file processing',
        explanation: 'Created the ProjectUpload feature — users can drag-and-drop project folders, ZIP files, or paste GitHub URLs. Files are parsed client-side and sent to the backend for indexing.',
        type: 'feat',
        files: ['frontend/src/features/upload/ProjectUpload.tsx'],
    },
    {
        hash: 'c3eb1f0', date: '2026-02-28',
        subject: 'feat: implement project upload functionality with frontend UI and dedicated backend service',
        explanation: 'Full-stack project upload pipeline — frontend handles folder/GitHub/ZIP input with a file tree explorer. Backend processes, parses, and stores project files for GraphRAG indexing.',
        type: 'feat',
        files: ['backend/src/services/upload_service.py', 'frontend/src/features/upload/ProjectUpload.tsx', 'frontend/src/utils/projectAnalyzer.ts', 'stop.bat'],
    },
    {
        hash: '453559a', date: '2026-02-28',
        subject: 'feat: add new Solution section components for AI flashcard generation and code visualization',
        explanation: 'Built the Solution section\'s interactive demonstrations — CardGenAnimation showing the flashcard pipeline and CodeVisualizerAnimation showing call graph construction. Both use scroll-driven SVG animations.',
        type: 'feat',
        files: ['frontend/src/components/SectionIndicators.tsx', 'frontend/src/components/SolutionHorizontalScroll.tsx', 'frontend/src/components/SolutionSection.tsx'],
    },
    {
        hash: '10435fb', date: '2026-02-28',
        subject: 'feat: add initial landing page with core UI components, sections, and global styles',
        explanation: 'First complete landing page — Hero with typewriter animation, Problem section, Solution showcase, Comparison slider, Tech Stack grid, GraphRAG pipeline, Dojo section, CTA, and Footer. Established the global design system.',
        type: 'feat',
        files: ['frontend/src/components/CTASection.tsx', 'frontend/src/components/DojoSection.tsx', 'frontend/src/components/FeatureSection.tsx', 'frontend/src/components/Footer.tsx', 'frontend/src/components/GraphRAGPipelineSection.tsx', 'frontend/src/components/Hero.tsx', 'frontend/src/components/HowItWorksSection.tsx', 'frontend/src/components/ProblemSection.tsx', 'frontend/src/components/SectionIndicators.tsx', 'frontend/src/components/SolutionHorizontalScroll.tsx', 'frontend/src/components/SolutionSection.tsx', 'frontend/src/components/TechStackSection.tsx', 'frontend/src/components/solution/CardGenAnimation.tsx', 'frontend/src/components/solution/CodeVisualizerAnimation.tsx', 'frontend/src/pages/LandingPage.tsx'],
    },
    {
        hash: 'fb1ea61', date: '2026-02-28',
        subject: 'readme fix',
        explanation: 'Fixed formatting issues and broken markdown links in the project README.',
        type: 'docs',
        files: ['README.md'],
    },
    {
        hash: 'b9c49c0', date: '2026-02-27',
        subject: 'readme update',
        explanation: 'Updated README documentation with latest feature descriptions, technology stack details, and getting started instructions.',
        type: 'docs',
        files: ['README.md'],
    },
    {
        hash: 'c477c89', date: '2026-02-27',
        subject: 'aws deployment via ec2 guide',
        explanation: 'Initial AWS deployment documentation covering EC2 instance setup, Docker installation, repository cloning, environment configuration, and Nginx reverse proxy setup.',
        type: 'docs',
        files: ['aws_deployment_guide.md'],
    },
    {
        hash: 'f2a6ed8', date: '2026-02-27',
        subject: 'final',
        explanation: 'Backend deployment finalization — production Docker Compose config, environment example updates, upload API endpoint, and deployment documentation. Added upload service configuration and session storage setup.',
        type: 'chore',
        files: ['backend/.env.example', 'backend/DEPLOYMENT.md', 'backend/docker-compose.prod.yml', 'backend/src/api/upload.py', 'backend/src/config/settings.py', 'backend/src/services/upload_service.py'],
    },
    {
        hash: 'f0c1dff', date: '2026-02-27',
        subject: 'final touch',
        explanation: 'Pre-release polish — animation timing tweaks and responsive layout fixes in HowItWorks and TechStack sections.',
        type: 'chore',
        files: ['frontend/src/components/HowItWorksSection.tsx', 'frontend/src/components/TechStackSection.tsx'],
    },
    {
        hash: '85bb84f', date: '2026-02-27',
        subject: 'custom cursor added',
        explanation: 'Implemented a custom cursor effect that replaces the default pointer on desktop. Follows mouse movement with smooth interpolation and changes shape on hover.',
        type: 'feat',
        files: ['frontend/src/components/CustomCursor.tsx', 'frontend/src/styles/globals.css'],
    },
    {
        hash: '91fb546', date: '2026-02-27',
        subject: 'updates',
        explanation: 'Comprehensive update pass — added analytics dashboard, skill radar chart, gamification hub, metrics dashboard, SRS system, and integrated everything into the main AppPage layout with state management updates.',
        type: 'feat',
        files: ['frontend/src/App.tsx', 'frontend/src/components/CustomCursor.tsx', 'frontend/src/features/analytics/AnalyticsDashboard.tsx', 'frontend/src/features/analytics/SkillRadar.tsx', 'frontend/src/features/analytics/types.ts', 'frontend/src/features/analytics/useAnalytics.ts', 'frontend/src/features/chat/ChatMessage.tsx', 'frontend/src/features/dojo/DojoPage.tsx', 'frontend/src/features/gamification/GamificationHub.tsx', 'frontend/src/features/gamification/useGamification.ts', 'frontend/src/features/metrics/MetricsDashboard.tsx', 'frontend/src/features/srs/useSRS.ts', 'frontend/src/pages/AppPage.tsx', 'frontend/src/pages/LandingPage.tsx', 'frontend/src/store/useStore.ts'],
    },
    {
        hash: 'ef04eaa', date: '2026-02-27',
        subject: 'updated flashcard generation',
        explanation: 'Improved flashcard generation — updated AI service configuration, enhanced chat components (input, messages, panel, code blocks), and improved the DojoPage, editor, and SRS deck interactions.',
        type: 'feat',
        files: ['backend/src/api/visualization.py', 'backend/src/config/settings.py', 'backend/src/services/visualizer_ai_service.py', 'frontend/src/features/chat/ChatInput.tsx', 'frontend/src/features/chat/ChatMessage.tsx', 'frontend/src/features/chat/ChatPanel.tsx', 'frontend/src/features/chat/CodeBlock.tsx', 'frontend/src/features/chat/useChat.ts', 'frontend/src/features/dojo/DojoPage.tsx', 'frontend/src/features/dojo/ParsonsChallenge.tsx', 'frontend/src/features/editor/CodeEditor.tsx', 'frontend/src/features/srs/FlashcardDeck.tsx', 'frontend/src/features/srs/GeneratedCardReviewModal.tsx'],
    },
    {
        hash: 'aad00eb', date: '2026-02-26',
        subject: 'feat: improved Dojo for interactive coding challenges, code visualizer, and project upload',
        explanation: 'Major Dojo overhaul — restructured challenge types, added Code Visualizer with call graph and execution trace views, integrated project upload flow. Backend services updated with visualization API and graph services.',
        type: 'feat',
        files: ['backend/.gitignore', 'backend/src/api/visualization.py', 'backend/src/config/settings.py', 'backend/src/services/code_parser.py', 'backend/src/services/graph_service.py', 'backend/src/services/query_service.py', 'backend/src/services/upload_service.py', 'backend/src/services/visualizer_ai_service.py', 'backend/src/tasks/upload_tasks.py', 'backend/tests/unit/test_code_parser.py', 'backend/tests/unit/test_config.py', 'backend/tests/unit/test_graph_service.py', 'backend/tests/unit/test_query_service.py', 'backend/tests/unit/test_upload_tasks.py'],
    },
    {
        hash: '3848533', date: '2026-02-25',
        subject: 'updated',
        explanation: 'Backend infrastructure update — Docker Compose configuration, dependency installation tracking, environment settings, landing page design skill documentation, and batch startup/stop scripts.',
        type: 'chore',
        files: ['.agents/skills/landing-page-design/SKILL.md', 'backend/.deps_installed', 'backend/.gitignore', 'backend/docker-compose.yml', 'backend/src/config/settings.py', 'backend/src/main.py', 'start.bat', 'stop.bat'],
    },
    {
        hash: '8c23cea', date: '2026-02-21',
        subject: 'fixed lag',
        explanation: 'Performance optimization — reduced unnecessary re-renders in ComparisonSection, debounced scroll handlers, simplified cursor component, and streamlined FeatureSection animations.',
        type: 'fix',
        files: ['frontend/src/components/ComparisonSection.tsx', 'frontend/src/components/CustomCursor.tsx', 'frontend/src/components/FeatureSection.tsx', 'frontend/src/components/ProblemSection.tsx', 'frontend/src/components/SectionIndicators.tsx', 'frontend/src/pages/LandingPage.tsx', 'frontend/src/styles/globals.css'],
    },
    {
        hash: 'af48df2', date: '2026-02-14',
        subject: 'fixed some inconsistencies',
        explanation: 'Fixed UI inconsistencies in the CTA section, Hero component, and section indicators. Cleaned up the LandingPage layout spacing.',
        type: 'fix',
        files: ['frontend/src/components/CTASection.tsx', 'frontend/src/components/Hero.tsx', 'frontend/src/components/SectionIndicators.tsx', 'frontend/src/pages/LandingPage.tsx'],
    },
    {
        hash: 'c5011f5', date: '2026-02-14',
        subject: 'improved the techStack section of the landing page',
        explanation: 'Redesigned the Tech Stack section with animated card grid, hover effects revealing technology descriptions, and structured layout grouping tech by category.',
        type: 'feat',
        files: ['frontend/src/components/TechStackSection.tsx'],
    },
    {
        hash: 'c9bbd93', date: '2026-02-14',
        subject: 'added lenis and removed GSAP',
        explanation: 'Replaced GSAP ScrollTrigger with Lenis for smooth scrolling. Lenis provides buttery-smooth scroll behavior with less JavaScript overhead and better CSS scroll-snap compatibility.',
        type: 'refactor',
        files: ['frontend/package-lock.json', 'frontend/package.json', 'frontend/src/main.tsx', 'frontend/src/pages/LandingPage.tsx'],
    },
    {
        hash: 'dca9247', date: '2026-02-14',
        subject: 'fixed lightmode/darkmode issues',
        explanation: 'Fixed theme switching bugs — incorrect contrast ratios in light mode for the ParsonsChallenge component.',
        type: 'fix',
        files: ['frontend/src/features/dojo/ParsonsChallenge.tsx'],
    },
    {
        hash: '59b1847', date: '2026-02-14',
        subject: 'fixed dark mode light mode issues in landing page',
        explanation: 'Patched the ComparisonSection where dark mode backgrounds were bleeding into light mode. Updated gradient stops and border colors to use CSS custom properties.',
        type: 'fix',
        files: ['frontend/package-lock.json', 'frontend/src/components/ComparisonSection.tsx'],
    },
    {
        hash: '79a5751', date: '2026-02-06',
        subject: 'readme update',
        explanation: 'Updated README with latest project status, feature list, and deployment instructions.',
        type: 'docs',
        files: ['README.md'],
    },
    {
        hash: '051fb4b', date: '2026-02-04',
        subject: 'deleted implementation guide',
        explanation: 'Removed the outdated IMPLEMENTATION_GUIDE.md file that was superseded by the new .planning directory structure.',
        type: 'chore',
        files: ['IMPLEMENTATION_GUIDE.md'],
    },
    {
        hash: '8f709f8', date: '2026-02-04',
        subject: 'final updates',
        explanation: 'Updated implementation guide, added batch startup/stop scripts (start.bat, start.ps1, stop.ps1), added system health check script, and cleaned up leftover upload session files.',
        type: 'chore',
        files: ['IMPLEMENTATION_GUIDE.md', 'check-status.ps1', 'design.md', 'requirements.md', 'start.bat', 'start.ps1', 'stop.ps1'],
    },
    {
        hash: 'c3fd40b', date: '2026-02-03',
        subject: 'docs: regenerate comprehensive README',
        explanation: 'Complete README regeneration with updated architecture diagrams, feature descriptions, API documentation, and getting started guide.',
        type: 'docs',
        files: ['README.md'],
    },

    // ──────────── January 2026 ────────────
    {
        hash: '8acf9a5', date: '2026-01-24',
        subject: 'readme update',
        explanation: 'Updated README documentation with latest feature additions and corrected setup instructions.',
        type: 'docs',
        files: ['README.md'],
    },
    {
        hash: 'cd04b54', date: '2026-01-24',
        subject: 'README',
        explanation: 'Initial comprehensive README with project overview, installation guide, and architecture description.',
        type: 'docs',
        files: ['README.md'],
    },
    {
        hash: '6206fdd', date: '2026-01-24',
        subject: 'refactor: remove unused imports and simplify hook type definitions',
        explanation: 'Code cleanup — removed dead imports across feature modules, simplified generic type parameters on custom hooks, and standardized import ordering.',
        type: 'refactor',
        files: ['frontend/src/components/ProblemSection.tsx', 'frontend/src/features/context/ContextManagementPanel.tsx', 'frontend/src/features/graph/GraphPanel.tsx', 'frontend/src/features/search/SemanticSearch.tsx', 'frontend/src/hooks/useInViewAnimation.ts'],
    },
    {
        hash: 'f09a424', date: '2026-01-24',
        subject: 'tests',
        explanation: 'Added unit tests for the transaction handling layer in the backend, covering edge cases and concurrent operation scenarios.',
        type: 'test',
        files: ['backend/tests/unit/test_transactions.py'],
    },
    {
        hash: '71e9f64', date: '2026-01-24',
        subject: 'updates',
        explanation: 'Added Kiro AI specs for GraphRAG system, landing page animations, and premium landing redesign. Updated VS Code settings, PRD, README, backend config, and deployment documentation.',
        type: 'chore',
        files: ['.kiro/specs/graphrag-system/design.md', '.kiro/specs/graphrag-system/requirements.md', '.kiro/specs/graphrag-system/tasks.md', '.kiro/specs/landing-page-animations/design.md', '.kiro/specs/landing-page-animations/requirements.md', '.kiro/specs/landing-page-animations/tasks.md', '.kiro/specs/premium-landing-redesign/design.md', '.kiro/specs/premium-landing-redesign/requirements.md', '.kiro/specs/premium-landing-redesign/tasks.md', '.vscode/settings.json', 'PRD.txt', 'README.md', 'backend/.env.example', 'backend/.gitignore', 'backend/DEPLOYMENT.md'],
    },
    {
        hash: '9804d0c', date: '2026-01-22',
        subject: 'custom cursor fix',
        explanation: 'Fixed the custom cursor component — corrected z-index stacking, pointer event passthrough, and smooth interpolation on rapid mouse movements.',
        type: 'fix',
        files: ['frontend/src/App.tsx', 'frontend/src/styles/globals.css'],
    },
    {
        hash: 'bf1626c', date: '2026-01-21',
        subject: 'feat: implement core landing page sections, global design system, and initial coding challenge examples',
        explanation: 'The foundational commit — comprehensive design system with CSS custom properties, animation utilities, responsive breakpoints. All core landing sections (CTA, Dojo, Features, Footer, Hero, HowItWorks, Navbar, Problem, Solution, TechStack) and initial coding challenge examples.',
        type: 'feat',
        files: ['frontend/src/components/CTASection.tsx', 'frontend/src/components/DojoSection.tsx', 'frontend/src/components/FeatureSection.tsx', 'frontend/src/components/Footer.tsx', 'frontend/src/components/Hero.tsx', 'frontend/src/components/HowItWorksSection.tsx', 'frontend/src/components/Navbar.tsx', 'frontend/src/components/ProblemSection.tsx', 'frontend/src/components/SolutionSection.tsx', 'frontend/src/components/TechStackSection.tsx', 'frontend/src/features/dojo/examples/fadedExamples.ts', 'frontend/src/features/dojo/examples/parsonsExamples.ts', 'frontend/src/features/dojo/examples/surgeryExamples.ts', 'frontend/src/hooks/useScrollAnimation.ts', 'frontend/src/styles/globals.css'],
    },
    {
        hash: '98707d8', date: '2026-01-21',
        subject: 'feat: add comprehensive project README documentation with architecture diagrams',
        explanation: 'Created the initial project README with full architecture documentation, technology stack overview, feature breakdowns, and the initial package-lock.json.',
        type: 'docs',
        files: ['README.md', 'frontend/package-lock.json'],
    },
    {
        hash: 'dc2186a', date: '2026-01-16',
        subject: 'build: configure continuous deployment settings for the frontend on Netlify and Vercel',
        explanation: 'Added deployment configuration files for both Netlify (netlify.toml) and Vercel (vercel.json) with SPA routing rules, build commands, and output directory settings.',
        type: 'chore',
        files: ['frontend/netlify.toml', 'frontend/vercel.json'],
    },
    {
        hash: '210ddf6', date: '2026-01-16',
        subject: 'feat: implement core landing page sections including problem, solution, features, how-it-works, tech stack, CTA, and footer',
        explanation: 'Built out all major landing page sections — each with distinct visual identity, responsive layouts, and coordinated scroll animations. Established the complete user journey from problem awareness to call-to-action.',
        type: 'feat',
        files: ['frontend/src/components/CTASection.tsx', 'frontend/src/components/FeatureSection.tsx', 'frontend/src/components/Footer.tsx', 'frontend/src/components/HowItWorksSection.tsx', 'frontend/src/components/ProblemSection.tsx', 'frontend/src/components/SolutionSection.tsx', 'frontend/src/components/TechStackSection.tsx'],
    },
    {
        hash: 'ec817bb', date: '2026-01-16',
        subject: 'feat: implement initial Hero and Navbar components with animations and theme toggling',
        explanation: 'Created the Hero section with typewriter animation, gradient text effects, and floating code snippets. Built the Navbar with smooth scroll navigation, mobile menu, and light/dark theme toggle.',
        type: 'feat',
        files: ['frontend/src/components/Hero.tsx', 'frontend/src/components/Navbar.tsx'],
    },
    {
        hash: 'eeafb39', date: '2026-01-16',
        subject: 'feat: introduce Navbar component with GSAP animations and establish global styling',
        explanation: 'Initial Navbar implementation with GSAP-powered entrance animations. Established the global stylesheet with theme variables, glassmorphism utilities, and core UI patterns.',
        type: 'feat',
        files: ['frontend/src/components/Navbar.tsx', 'frontend/src/styles/globals.css'],
    },
    {
        hash: '2cfc9b2', date: '2026-01-16',
        subject: 'feat: implement global CSS with design tokens, light/dark themes, and utility classes',
        explanation: 'Created the design token system in CSS custom properties — color scales, typography, spacing, shadows, and border radius. Implemented light/dark theme switching and Vercel deployment config.',
        type: 'feat',
        files: ['frontend/src/styles/globals.css', 'frontend/vercel.json'],
    },
    {
        hash: '3550032', date: '2026-01-16',
        subject: 'feat: initialize frontend project with Vite, React, TypeScript, TailwindCSS, and ESLint',
        explanation: 'Project initialization — scaffolded with Vite + React + TypeScript. Configured TailwindCSS, ESLint, and build optimizations with manual vendor chunking for react, motion, gsap, flow, and monaco.',
        type: 'feat',
        files: ['frontend/eslint.config.js', 'frontend/package-lock.json', 'frontend/package.json', 'frontend/vite.config.ts'],
    },
    {
        hash: '92bfdf0', date: '2026-01-15',
        subject: 'feat: implement core SocraticDev application including AI chat, interactive challenges, code visualization, SRS, gamification, and project context features',
        explanation: 'The genesis commit — the entire SocraticDev application in one shot. AI-powered Socratic chat, interactive coding challenges (Dojo), code visualization with call graphs, spaced repetition flashcards, gamification with XP/leagues, GraphRAG project context, and the full backend API layer.',
        type: 'feat',
        files: [],
    },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function getTypeColor(type: string) {
    switch (type) {
        case 'feat': return { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/25', dot: 'bg-emerald-500' };
        case 'fix': return { bg: 'bg-amber-500/12', text: 'text-amber-400', border: 'border-amber-500/25', dot: 'bg-amber-500' };
        case 'docs': return { bg: 'bg-blue-500/12', text: 'text-blue-400', border: 'border-blue-500/25', dot: 'bg-blue-500' };
        case 'refactor': return { bg: 'bg-violet-500/12', text: 'text-violet-400', border: 'border-violet-500/25', dot: 'bg-violet-500' };
        case 'test': return { bg: 'bg-cyan-500/12', text: 'text-cyan-400', border: 'border-cyan-500/25', dot: 'bg-cyan-500' };
        default: return { bg: 'bg-neutral-500/12', text: 'text-neutral-400', border: 'border-neutral-500/25', dot: 'bg-neutral-400' };
    }
}

function getTypeLabel(type: string) {
    switch (type) {
        case 'feat': return 'Feature';
        case 'fix': return 'Fix';
        case 'docs': return 'Docs';
        case 'refactor': return 'Refactor';
        case 'test': return 'Test';
        default: return 'Chore';
    }
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function groupByMonth(items: Commit[]): { month: string; commits: Commit[] }[] {
    const groups: Record<string, Commit[]> = {};
    for (const c of items) {
        const d = new Date(c.date);
        const key = `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
    }
    return Object.entries(groups).map(([month, commits]) => ({ month, commits }));
}

function shortenPath(path: string) {
    const parts = path.split('/');
    if (parts.length <= 2) return path;
    return parts.slice(-2).join('/');
}

/* ═══════════════════════════════════════════════════════════════
   COMMIT CARD
   ═══════════════════════════════════════════════════════════════ */
function CommitCard({ commit }: { commit: Commit }) {
    const [open, setOpen] = useState(false);
    const colors = getTypeColor(commit.type);

    return (
        <div className="group">
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-4 sm:p-5 transition-all duration-200 hover:border-[color:var(--color-border-hover)] hover:shadow-lg"
            >
                {/* Top row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {getTypeLabel(commit.type)}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-mono text-[color:var(--color-text-muted)]">
                        <GitCommitIcon />
                        {commit.hash}
                    </span>
                    <span className="text-xs text-[color:var(--color-text-muted)] ml-auto">{formatDate(commit.date)}</span>
                </div>

                {/* Subject */}
                <h3 className="font-display font-semibold text-sm sm:text-base text-[color:var(--color-text-primary)] leading-snug mb-1">
                    {commit.subject}
                </h3>

                {/* File count + chevron */}
                <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)]">
                        <FileIcon />
                        {commit.files.length} file{commit.files.length !== 1 ? 's' : ''} changed
                    </span>
                    <ChevronIcon open={open} />
                </div>
            </button>

            {/* Expandable details */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className="overflow-hidden"
                    >
                        <div className="mx-1 mt-1 rounded-b-xl border border-t-0 border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)] p-4 sm:p-5 space-y-4">
                            {/* Explanation */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-text-muted)] mb-2">Summary</h4>
                                <p className="text-sm text-[color:var(--color-text-secondary)] leading-relaxed">{commit.explanation}</p>
                            </div>

                            {/* File list */}
                            {commit.files.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-text-muted)] mb-2">Files Changed</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {commit.files.map((file) => (
                                            <div key={file} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                                <FileIcon />
                                                <span className="text-xs font-mono text-[color:var(--color-text-secondary)] truncate" title={file}>
                                                    {shortenPath(file)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
function ChangelogPage() {
    const [filter, setFilter] = useState<string>('all');
    const filtered = filter === 'all' ? commits : commits.filter((c) => c.type === filter);
    const groups = groupByMonth(filtered);

    const filterButtons: { value: string; label: string; count: number }[] = [
        { value: 'all', label: 'All', count: commits.length },
        { value: 'feat', label: 'Features', count: commits.filter(c => c.type === 'feat').length },
        { value: 'fix', label: 'Fixes', count: commits.filter(c => c.type === 'fix').length },
        { value: 'docs', label: 'Docs', count: commits.filter(c => c.type === 'docs').length },
        { value: 'refactor', label: 'Refactors', count: commits.filter(c => c.type === 'refactor').length },
        { value: 'chore', label: 'Chores', count: commits.filter(c => c.type === 'chore').length },
        { value: 'test', label: 'Tests', count: commits.filter(c => c.type === 'test').length },
    ];

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom max-w-4xl">

                    {/* ── Hero ─────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease }}
                        className="mb-10"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-500/12 flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                                    <circle cx="12" cy="12" r="4" /><line x1="1.05" y1="12" x2="7" y2="12" /><line x1="17.01" y1="12" x2="22.96" y2="12" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="font-display text-display-md font-bold">Changelog</h1>
                            </div>
                        </div>
                        <p className="text-lg text-[color:var(--color-text-secondary)] max-w-2xl">
                            Every commit to SocraticDev, documented. Click any entry to see the files changed and a detailed explanation.
                        </p>

                        {/* Stats bar */}
                        <div className="flex items-center gap-5 mt-6 flex-wrap">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[color:var(--color-text-muted)]">{commits.filter(c => c.type === 'feat').length} features</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[color:var(--color-text-muted)]">{commits.filter(c => c.type === 'fix').length} fixes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[color:var(--color-text-muted)]">{commits.filter(c => c.type === 'docs').length} docs</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-violet-500" />
                                <span className="text-[color:var(--color-text-muted)]">{commits.filter(c => c.type === 'refactor').length} refactors</span>
                            </div>
                            <div className="text-sm font-mono text-[color:var(--color-text-muted)] ml-auto">
                                {commits.length} total commits
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Filters ──────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="flex gap-2 mb-8 flex-wrap"
                    >
                        {filterButtons.filter(b => b.count > 0).map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => setFilter(btn.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 ${
                                    filter === btn.value
                                        ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                                        : 'bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-muted)] border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)]'
                                }`}
                            >
                                {btn.label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    filter === btn.value ? 'bg-primary-500/20' : 'bg-[color:var(--color-bg-primary)]'
                                }`}>
                                    {btn.count}
                                </span>
                            </button>
                        ))}
                    </motion.div>

                    {/* ── Timeline ─────────────────────────── */}
                    <div className="space-y-10">
                        {groups.map((group) => (
                            <div key={group.month}>
                                {/* Month header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className="font-display text-lg font-bold text-[color:var(--color-text-primary)]">{group.month}</h2>
                                    <div className="flex-1 h-px bg-[color:var(--color-border)]" />
                                    <span className="text-xs text-[color:var(--color-text-muted)] font-mono">{group.commits.length} commit{group.commits.length !== 1 ? 's' : ''}</span>
                                </div>

                                {/* Commits */}
                                <div className="space-y-3 pl-4 border-l-2 border-[color:var(--color-border)]">
                                    {group.commits.map((commit) => (
                                        <div key={commit.hash} className="relative">
                                            {/* Timeline dot */}
                                            <div className={`absolute -left-[calc(1rem+5px)] top-5 w-2.5 h-2.5 rounded-full ${getTypeColor(commit.type).dot}`} />
                                            <CommitCard commit={commit} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Empty state ──────────────────────── */}
                    {groups.length === 0 && (
                        <div className="text-center py-16 text-[color:var(--color-text-muted)]">
                            <p className="text-lg">No commits match this filter.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ChangelogPage;
