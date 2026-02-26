import { useState, useCallback, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { useStore } from '../store/useStore';
import { ChatPanel } from '../features/chat';
import { CodeEditor } from '../features/editor';
import { FileExplorer } from '../features/explorer';
import { ModeToggle } from '../features/mode';
import { useChat } from '../features/chat/useChat';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ThemeToggle from '../components/ThemeToggle';
import { Link } from 'react-router-dom';
import { ProjectFile } from '../utils/projectAnalyzer';

function BuildModePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [explorerWidth, setExplorerWidth] = useState(250);
    const [chatWidth, setChatWidth] = useState(400);
    const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);
    const [isResizing, setIsResizing] = useState<'explorer' | 'chat' | null>(null);
    const [actionFeedback, setActionFeedback] = useState<string | null>(null);

    const {
        projectContext,
        projectFiles,
        selectedFile,
        editorDocuments,
        activeDocumentId,
        setActiveDocument,
        removeEditorDocument,
        setDocumentSelection,
        addChatContextSnippet,
        updateDocumentContent,
        renameDocument,
        setDocumentLanguageMode,
        createScratchDocument,
        openDocumentFromProjectFile,
    } = useStore();

    const { sendMessage, isLoading } = useChat();
    const activeDocument = editorDocuments.find((doc) => doc.id === activeDocumentId) || null;

    useEffect(() => {
        if (!activeDocumentId && editorDocuments.length === 0) {
            createScratchDocument({
                name: 'scratch.py',
                languageMode: 'python',
                content: '# Start building...\n',
            });
        }
    }, [activeDocumentId, editorDocuments.length, createScratchDocument]);

    // Handle resizing with proper mouse tracking
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();

            if (isResizing === 'explorer') {
                const newWidth = Math.max(180, Math.min(400, e.clientX));
                setExplorerWidth(newWidth);
            } else if (isResizing === 'chat') {
                const explorerW = isExplorerCollapsed ? 0 : explorerWidth;
                const newWidth = Math.max(280, Math.min(600, e.clientX - explorerW - 4));
                setChatWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(null);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, explorerWidth, isExplorerCollapsed]);

    const handleFileSelect = useCallback((file: ProjectFile) => {
        if (file.type !== 'file') return;
        openDocumentFromProjectFile(file.id);
    }, [openDocumentFromProjectFile]);

    const closeTab = useCallback((documentId: string, e: ReactMouseEvent) => {
        e.stopPropagation();
        removeEditorDocument(documentId);
    }, [removeEditorDocument]);

    const handleQuickAction = useCallback((action: 'explain' | 'refactor' | 'fix' | 'test') => {
        if (!activeDocument?.content.trim()) return;

        const codeSnippet = activeDocument.content.length > 2000
            ? `${activeDocument.content.substring(0, 2000)}\n# ... (truncated)`
            : activeDocument.content;

        const prompts: Record<typeof action, string> = {
            explain: `Explain the following code from ${activeDocument.name}. Break it down step by step:\n\n\`\`\`${activeDocument.languageMode || 'code'}\n${codeSnippet}\n\`\`\``,
            refactor: `Suggest refactoring improvements for this code from ${activeDocument.name}:\n\n\`\`\`${activeDocument.languageMode || 'code'}\n${codeSnippet}\n\`\`\``,
            fix: `Review this code from ${activeDocument.name} for bugs and issues:\n\n\`\`\`${activeDocument.languageMode || 'code'}\n${codeSnippet}\n\`\`\``,
            test: `Generate unit tests for this code from ${activeDocument.name}:\n\n\`\`\`${activeDocument.languageMode || 'code'}\n${codeSnippet}\n\`\`\``,
        };

        const actionNames = {
            explain: 'Explaining',
            refactor: 'Refactoring',
            fix: 'Finding bugs in',
            test: 'Generating tests for',
        };
        setActionFeedback(`${actionNames[action]} ${activeDocument.name}...`);
        setTimeout(() => setActionFeedback(null), 2000);

        sendMessage(prompts[action]);
    }, [activeDocument, sendMessage]);

    return (
        <div ref={containerRef} className="h-screen flex flex-col bg-[color:var(--color-bg-primary)] select-none">
            <header className="h-12 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] flex-shrink-0">
                <div className="h-full px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <span className="font-display font-bold hidden sm:block">SocraticDev</span>
                        </Link>

                        {projectContext && (
                            <Badge variant="secondary">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                {projectContext.name}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <ModeToggle />
                        <ThemeToggle />
                        <Link to="/app">
                            <Button variant="ghost" size="sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                Standard View
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {projectFiles.length > 0 && (
                    <>
                        <div
                            className={`flex flex-col bg-[color:var(--color-bg-secondary)] border-r border-[color:var(--color-border)] transition-all duration-200 ${isExplorerCollapsed ? 'w-10' : ''}`}
                            style={{ width: isExplorerCollapsed ? 40 : explorerWidth }}
                        >
                            <div className="p-2 border-b border-[color:var(--color-border)] flex items-center justify-between">
                                <button
                                    onClick={() => setIsExplorerCollapsed(!isExplorerCollapsed)}
                                    className="p-1.5 rounded hover:bg-[color:var(--color-bg-muted)] transition-colors"
                                    title={isExplorerCollapsed ? 'Expand Explorer' : 'Collapse Explorer'}
                                >
                                    <svg
                                        className={`w-4 h-4 text-[color:var(--color-text-muted)] transition-transform ${isExplorerCollapsed ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>
                                {!isExplorerCollapsed && (
                                    <span className="text-sm font-medium">Explorer</span>
                                )}
                            </div>

                            {!isExplorerCollapsed && (
                                <div className="flex-1 overflow-y-auto p-2">
                                    <FileExplorer
                                        files={projectFiles}
                                        selectedFile={selectedFile}
                                        onFileSelect={handleFileSelect}
                                    />
                                </div>
                            )}
                        </div>

                        {!isExplorerCollapsed && (
                            <div
                                className="w-2 bg-[color:var(--color-border)] hover:bg-primary-500 cursor-col-resize transition-colors flex-shrink-0"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setIsResizing('explorer');
                                }}
                            />
                        )}
                    </>
                )}

                <div
                    className="flex flex-col bg-[color:var(--color-bg-secondary)] border-r border-[color:var(--color-border)] flex-shrink-0"
                    style={{ width: chatWidth }}
                >
                    <ChatPanel />
                </div>

                <div
                    className="w-2 bg-[color:var(--color-border)] hover:bg-primary-500 cursor-col-resize transition-colors flex-shrink-0"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing('chat');
                    }}
                />

                <div className="flex-1 flex flex-col overflow-hidden bg-[color:var(--color-bg-primary)] min-w-0">
                    {editorDocuments.length > 0 && (
                        <div className="h-9 flex bg-[color:var(--color-bg-secondary)] border-b border-[color:var(--color-border)] overflow-x-auto flex-shrink-0">
                            {editorDocuments.map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => setActiveDocument(doc.id)}
                                    className={`
                                        flex items-center gap-2 px-3 h-full border-r border-[color:var(--color-border)]
                                        text-sm whitespace-nowrap transition-colors
                                        ${doc.id === activeDocumentId
                                            ? 'bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-primary)]'
                                            : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]'
                                        }
                                    `}
                                >
                                    {doc.isDirty && (
                                        <span className="w-2 h-2 rounded-full bg-accent-500" />
                                    )}
                                    <span>{doc.name}</span>
                                    <button
                                        onClick={(e) => closeTab(doc.id, e)}
                                        className="w-4 h-4 rounded hover:bg-[color:var(--color-bg-muted)] flex items-center justify-center opacity-50 hover:opacity-100"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 min-h-0">
                        {activeDocument ? (
                            <CodeEditor
                                key={activeDocument.id}
                                value={activeDocument.content}
                                filename={activeDocument.name}
                                languageMode={activeDocument.languageMode}
                                onChange={(value) => updateDocumentContent(activeDocument.id, value)}
                                onRename={(name) => renameDocument(activeDocument.id, name)}
                                onLanguageModeChange={(mode) => setDocumentLanguageMode(activeDocument.id, mode)}
                                onSelectionChange={(selection) => setDocumentSelection(activeDocument.id, selection)}
                                onSelectionContextAdd={(snippet) => {
                                    addChatContextSnippet({
                                        documentId: activeDocument.id,
                                        documentName: activeDocument.name,
                                        languageMode: activeDocument.languageMode,
                                        text: snippet.text,
                                        startLine: snippet.startLine,
                                        endLine: snippet.endLine,
                                    });
                                }}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[color:var(--color-text-muted)]">
                                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="font-medium">No document open</p>
                                <p className="text-sm mb-4">Create a scratch file or open one from the explorer</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => createScratchDocument({ name: 'scratch.py', languageMode: 'python' })}
                                >
                                    New Scratch File
                                </Button>
                            </div>
                        )}
                    </div>

                    {activeDocument && (
                        <div className="h-10 px-4 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-[color:var(--color-text-muted)] mr-auto truncate">
                                {actionFeedback || `${activeDocument.name} - ${activeDocument.content.split('\n').length} lines`}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickAction('explain')}
                                disabled={isLoading}
                            >
                                Explain
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickAction('refactor')}
                                disabled={isLoading}
                            >
                                Refactor
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickAction('fix')}
                                disabled={isLoading}
                            >
                                Fix Bugs
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickAction('test')}
                                disabled={isLoading}
                            >
                                Add Tests
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BuildModePage;
