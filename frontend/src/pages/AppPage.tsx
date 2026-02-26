import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useStore } from '../store/useStore';
import { ChatPanel } from '../features/chat';
import { CodeEditor } from '../features/editor';
import { ProjectUpload } from '../features/upload';
import { ModeToggle } from '../features/mode';
import { GraphPanel } from '../features/graph';
import { Onboarding } from '../features/onboarding';
import { MetricsDashboard } from '../features/metrics';
import { DojoIcon } from '../features/dojo';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ThemeToggle from '../components/ThemeToggle';
import { EXAMPLE_PROJECTS } from '../data/examples';

type SidebarTab = 'chat' | 'upload' | 'graph' | 'metrics' | 'settings';

function AppPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sidebarTab, setSidebarTab] = useState<SidebarTab>('chat');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [selectedExampleId, setSelectedExampleId] = useState(EXAMPLE_PROJECTS[0]?.id || '');
    const {
        projectContext,
        theme,
        cursorEnabled,
        cursorStyle,
        setCursorEnabled,
        setCursorStyle,
        selectedFile,
        activeDocumentId,
        editorDocuments,
        setDocumentSelection,
        addChatContextSnippet,
        updateDocumentContent,
        renameDocument,
        setDocumentLanguageMode,
        openDocumentFromExample,
        createScratchDocument,
        openDocumentFromProjectFile,
    } = useStore();
    const activeDocument = editorDocuments.find((doc) => doc.id === activeDocumentId) || null;
    const selectedExample = EXAMPLE_PROJECTS.find((project) => project.id === selectedExampleId) || EXAMPLE_PROJECTS[0];

    // Check if first visit - show onboarding
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('socraticdev-onboarding');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    useEffect(() => {
        if (!activeDocumentId && editorDocuments.length === 0) {
            createScratchDocument({
                name: 'scratch.py',
                languageMode: 'python',
                content: '# Start coding...\n',
            });
        }
    }, [activeDocumentId, editorDocuments.length, createScratchDocument]);

    useEffect(() => {
        if (selectedFile?.id) {
            openDocumentFromProjectFile(selectedFile.id);
        }
    }, [selectedFile?.id, openDocumentFromProjectFile]);

    const handleOnboardingComplete = () => {
        localStorage.setItem('socraticdev-onboarding', 'true');
        setShowOnboarding(false);
    };

    useGSAP(() => {
        gsap.from('.app-panel', {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    const sidebarTabs = [
        {
            id: 'chat' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            label: 'Chat',
        },
        {
            id: 'upload' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            ),
            label: 'Project',
        },
        {
            id: 'graph' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            ),
            label: 'Graph',
        },
        {
            id: 'metrics' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            label: 'Progress',
        },
        {
            id: 'settings' as const,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            label: 'Settings',
        },
    ];

    // Check if graph tab is active - show full width graph
    const isGraphView = sidebarTab === 'graph';

    return (
        <>
            {/* Onboarding Modal */}
            {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

            <div ref={containerRef} className="h-screen flex flex-col bg-[color:var(--color-bg-primary)]">
                {/* App Header */}
                <header className="h-14 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] flex-shrink-0">
                    <div className="h-full px-4 flex items-center justify-between">
                        {/* Left side */}
                        <div className="flex items-center gap-4">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <svg
                                        className="w-4 h-4 text-white"
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
                                <span className="font-display font-bold text-lg hidden sm:block">SocraticDev</span>
                            </Link>

                            {/* Project context indicator */}
                            {projectContext && (
                                <Badge variant="secondary" className="hidden md:flex">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    {projectContext.name}
                                </Badge>
                            )}
                        </div>

                        {/* Center - Mode Toggle */}
                        <div className="hidden sm:block">
                            <ModeToggle />
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            {/* The Dojo - Challenges */}
                            <Link to="/dojo">
                                <Button variant="ghost" size="sm">
                                    <span className="text-primary-400"><DojoIcon size={18} /></span>
                                    <span className="hidden sm:inline ml-1">Dojo</span>
                                </Button>
                            </Link>

                            {/* IDE Mode button */}
                            <Link to="/build">
                                <Button variant="secondary" size="sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span className="hidden sm:inline">IDE Mode</span>
                                </Button>
                            </Link>

                            {/* Help/Tour button */}
                            <Button variant="ghost" size="sm" onClick={() => setShowOnboarding(true)}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Tour</span>
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Navigation */}
                    <nav className="w-14 lg:w-16 border-r border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] flex flex-col items-center py-4 gap-2 flex-shrink-0">
                        {sidebarTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSidebarTab(tab.id)}
                                className={`
                w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center
                transition-colors relative group
                ${sidebarTab === tab.id
                                        ? 'bg-primary-500/10 text-primary-500'
                                        : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-muted)]'
                                    }
              `}
                                title={tab.label}
                            >
                                {tab.icon}

                                {/* Active indicator */}
                                {sidebarTab === tab.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                                )}

                                {/* Tooltip */}
                                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-neutral-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    {tab.label}
                                </span>
                            </button>
                        ))}

                        {/* Project loaded indicator */}
                        {projectContext && sidebarTab !== 'upload' && (
                            <div className="absolute w-2 h-2 rounded-full bg-accent-500 top-16 left-10 lg:left-12" />
                        )}
                    </nav>

                    {/* Main Panel(s) */}
                    {isGraphView ? (
                        /* Full-width Graph View */
                        <div className="app-panel flex-1 flex flex-col bg-[color:var(--color-bg-secondary)] overflow-hidden">
                            <GraphPanel projectName={projectContext?.name} />
                        </div>
                    ) : (
                        <>
                            {/* Left Panel - Chat, Upload, Metrics, or Settings */}
                            <div className="app-panel w-full md:w-1/2 lg:w-2/5 border-r border-[color:var(--color-border)] flex flex-col bg-[color:var(--color-bg-secondary)] overflow-hidden">
                                {sidebarTab === 'chat' && <ChatPanel />}
                                {sidebarTab === 'upload' && <ProjectUpload />}
                                {sidebarTab === 'metrics' && <MetricsDashboard />}
                                {sidebarTab === 'settings' && (
                                    <div className="p-6 overflow-y-auto">
                                        <h2 className="font-display text-xl font-bold mb-6">Settings</h2>

                                        <div className="space-y-6">
                                            {/* Mode Toggle Section */}
                                            <div className="p-4 rounded-xl bg-[color:var(--color-bg-muted)]">
                                                <h3 className="font-medium mb-3">Learning Mode</h3>
                                                <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
                                                    Toggle between Learning Mode (Socratic questioning) and Build Mode (direct code generation).
                                                </p>
                                                <ModeToggle size="lg" />
                                            </div>

                                            {/* Example Projects */}
                                            <div className="p-4 rounded-xl bg-[color:var(--color-bg-muted)]">
                                                <h3 className="font-medium mb-3">Example Code</h3>
                                                <p className="text-sm text-[color:var(--color-text-secondary)] mb-3">
                                                    Load an example to explore in the editor
                                                </p>
                                                <div className="space-y-2">
                                                    {EXAMPLE_PROJECTS.map((project) => (
                                                        <button
                                                            key={project.id}
                                                            onClick={() => {
                                                                setSelectedExampleId(project.id);
                                                                openDocumentFromExample(project);
                                                            }}
                                                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedExample.id === project.id
                                                                ? 'bg-primary-500/10 border border-primary-500/30'
                                                                : 'bg-[color:var(--color-bg-elevated)] hover:bg-[color:var(--color-bg-secondary)]'
                                                                }`}
                                                        >
                                                            <p className="font-medium text-sm">{project.name}</p>
                                                            <p className="text-xs text-[color:var(--color-text-muted)]">
                                                                {project.description}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Theme Section */}
                                            <div className="p-4 rounded-xl bg-[color:var(--color-bg-muted)]">
                                                <h3 className="font-medium mb-3">Appearance</h3>
                                                <p className="text-sm text-[color:var(--color-text-secondary)] mb-2">
                                                    Current theme: {theme === 'dark' ? 'Dark' : 'Light'}
                                                </p>

                                                <div className="mt-4 space-y-3">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div>
                                                            <p className="text-sm font-medium">Custom Cursor</p>
                                                            <p className="text-xs text-[color:var(--color-text-muted)]">
                                                                Show interactive technical cursor effects on desktop.
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={cursorEnabled}
                                                            onClick={() => setCursorEnabled(!cursorEnabled)}
                                                            className={`relative h-6 w-11 rounded-full transition-colors ${cursorEnabled ? 'bg-primary-500' : 'bg-[color:var(--color-border)]'
                                                                }`}
                                                            data-cursor="interactive"
                                                            data-cursor-label="toggle"
                                                        >
                                                            <span
                                                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${cursorEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                                                    }`}
                                                            />
                                                        </button>
                                                    </div>

                                                    <label className="block">
                                                        <span className="text-xs font-medium text-[color:var(--color-text-secondary)]">Cursor Style</span>
                                                        <select
                                                            value={cursorStyle}
                                                            onChange={(event) => setCursorStyle(event.target.value as 'showcase' | 'minimal')}
                                                            className="mt-1 w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2 text-sm"
                                                            disabled={!cursorEnabled}
                                                            data-cursor="interactive"
                                                            data-cursor-label="style"
                                                        >
                                                            <option value="showcase">Showcase</option>
                                                            <option value="minimal">Minimal</option>
                                                        </select>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* About Section */}
                                            <div className="p-4 rounded-xl bg-[color:var(--color-bg-muted)]">
                                                <h3 className="font-medium mb-3">About SocraticDev</h3>
                                                <p className="text-sm text-[color:var(--color-text-secondary)]">
                                                    An AI coding assistant that teaches through questions, understands your entire codebase,
                                                    and catches bugs before they ship.
                                                </p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <Badge variant="primary">v1.0.0</Badge>
                                                    <Badge variant="secondary">Hackathon Edition</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel - Code Editor */}
                            <div className="app-panel hidden md:flex flex-1 flex-col overflow-hidden">
                                <CodeEditor
                                    key={activeDocument?.id || 'scratch-editor'}
                                    value={activeDocument?.content || ''}
                                    filename={activeDocument?.name || 'scratch.py'}
                                    languageMode={activeDocument?.languageMode || 'python'}
                                    onChange={(value) => {
                                        if (activeDocument?.id) {
                                            updateDocumentContent(activeDocument.id, value);
                                        }
                                    }}
                                    onRename={(nextName) => {
                                        if (!activeDocument?.id) return;
                                        renameDocument(activeDocument.id, nextName);
                                    }}
                                    onLanguageModeChange={(nextLanguage) => {
                                        if (!activeDocument?.id) return;
                                        setDocumentLanguageMode(activeDocument.id, nextLanguage);
                                    }}
                                    onSelectionChange={(selection) => {
                                        if (!activeDocument?.id) return;
                                        setDocumentSelection(activeDocument.id, selection);
                                    }}
                                    onSelectionContextAdd={(snippet) => {
                                        if (!activeDocument?.id) return;
                                        addChatContextSnippet({
                                            documentId: activeDocument.id,
                                            documentName: activeDocument.name,
                                            languageMode: activeDocument.languageMode,
                                            text: snippet.text,
                                            startLine: snippet.startLine,
                                            endLine: snippet.endLine,
                                        });
                                        setSidebarTab('chat');
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default AppPage;
