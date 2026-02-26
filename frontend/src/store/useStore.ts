import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectFile, getLanguageFromExtension } from '../utils/projectAnalyzer';

// Types
export type Theme = 'light' | 'dark';
export type Mode = 'learning' | 'building';
export type CursorStyle = 'showcase' | 'minimal';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    codeBlocks?: {
        language: string;
        code: string;
    }[];
    timestamp: Date;
    mode: Mode;
}

export interface Conversation {
    id: string;
    messages: Message[];
    createdAt: Date;
}

export interface ProjectContext {
    id: string;
    name: string;
    files: ProjectFile[];
    language: string;
    uploadedAt: Date;
}

export interface UploadProjectStats {
    file_count: number;
    entity_count: number;
    relationship_count: number;
    embedding_count?: number;
    error_count?: number;
}

export interface DependencyNode {
    id: string;
    label: string;
    type: 'file' | 'function' | 'class' | 'variable' | 'import';
    x: number;
    y: number;
    dependencies: string[];
    dependents: string[];
    metadata?: {
        lines?: number;
        language?: string;
        functions?: string[];
        classes?: string[];
    };
}

export interface DependencyEdge {
    source: string;
    target: string;
    type: 'imports' | 'calls' | 'extends' | 'uses';
}

export interface CodeSelectionRange {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
}

export interface EditorDocument {
    id: string;
    name: string;
    path?: string;
    content: string;
    languageMode: string;
    source: 'project' | 'example' | 'scratch';
    linkedProjectFileId?: string;
    isDirty: boolean;
    selection?: CodeSelectionRange;
}

export interface ChatContextSnippet {
    id: string;
    documentId: string;
    documentName: string;
    languageMode: string;
    text: string;
    startLine: number;
    endLine: number;
}

interface ExampleDocumentInput {
    id: string;
    name: string;
    filename: string;
    language: string;
    code: string;
    description?: string;
}

interface AppState {
    // UI State
    theme: Theme;
    isLoading: boolean;
    isSidebarOpen: boolean;
    cursorEnabled: boolean;
    cursorStyle: CursorStyle;

    // Mode State
    mode: Mode;

    // Chat State
    conversations: Conversation[];
    currentConversationId: string | null;
    chatContextSnippets: ChatContextSnippet[];

    // Project State
    projectContext: ProjectContext | null;
    projectFiles: ProjectFile[];
    selectedFile: ProjectFile | null;
    dependencyGraph: { nodes: DependencyNode[]; edges: DependencyEdge[] } | null;
    projectStats: UploadProjectStats | null;

    // Editor state
    editorDocuments: EditorDocument[];
    activeDocumentId: string | null;

    // Metrics (for demo)
    metrics: {
        questionsAsked: number;
        codeExplanations: number;
        bugsCaught: number;
        learningModeTime: number;
    };

    // Actions
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setLoading: (loading: boolean) => void;
    setSidebarOpen: (open: boolean) => void;
    setCursorEnabled: (enabled: boolean) => void;
    toggleCursorEnabled: () => void;
    setCursorStyle: (style: CursorStyle) => void;
    setMode: (mode: Mode) => void;
    toggleMode: () => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    setProjectContext: (context: ProjectContext | null) => void;
    setProjectFiles: (files: ProjectFile[]) => void;
    setSelectedFile: (file: ProjectFile | null) => void;
    setDependencyGraph: (graph: { nodes: DependencyNode[]; edges: DependencyEdge[] } | null) => void;
    setProjectStats: (stats: UploadProjectStats | null) => void;
    updateFileContent: (fileId: string, content: string) => void;
    clearProject: () => void;
    incrementMetric: (metric: keyof AppState['metrics']) => void;
    resetMetrics: () => void;

    // Editor actions
    openDocumentFromProjectFile: (fileId: string) => string | null;
    openDocumentFromExample: (example: ExampleDocumentInput) => string;
    createScratchDocument: (initial?: { name?: string; languageMode?: string; content?: string }) => string;
    setActiveDocument: (documentId: string | null) => void;
    removeEditorDocument: (documentId: string) => void;
    updateDocumentContent: (documentId: string, content: string) => void;
    renameDocument: (documentId: string, name: string) => void;
    setDocumentLanguageMode: (documentId: string, languageMode: string) => void;
    setDocumentSelection: (documentId: string, selection?: CodeSelectionRange) => void;
    insertIntoDocument: (documentId: string, payload: string, mode: 'replace_selection' | 'insert_at_cursor' | 'replace_all') => void;

    // Chat context chip actions
    addChatContextSnippet: (snippet: Omit<ChatContextSnippet, 'id'>) => void;
    removeChatContextSnippet: (snippetId: string) => void;
    clearChatContextSnippets: () => void;
}

function sanitizeFilename(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return 'untitled.txt';
    return trimmed.replace(/[\\/:*?"<>|]/g, '_');
}

function updateProjectTreeContent(files: ProjectFile[], fileId: string, content: string): ProjectFile[] {
    return files.map((file) => {
        if (file.id === fileId) {
            return { ...file, content };
        }
        if (file.children) {
            return { ...file, children: updateProjectTreeContent(file.children, fileId, content) };
        }
        return file;
    });
}

function findProjectFileById(files: ProjectFile[], fileId: string): ProjectFile | null {
    for (const file of files) {
        if (file.id === fileId) return file;
        if (file.children?.length) {
            const found = findProjectFileById(file.children, fileId);
            if (found) return found;
        }
    }
    return null;
}

function findFirstEditableFile(files: ProjectFile[]): ProjectFile | null {
    for (const file of files) {
        if (file.type === 'file' && typeof file.content === 'string') {
            return file;
        }
        if (file.children?.length) {
            const nested = findFirstEditableFile(file.children);
            if (nested) return nested;
        }
    }
    return null;
}

function getOffsetFromLineCol(content: string, line: number, column: number): number {
    const lines = content.split('\n');
    const safeLine = Math.max(1, Math.min(line, lines.length));
    const lineText = lines[safeLine - 1] || '';
    const safeCol = Math.max(1, Math.min(column, lineText.length + 1));

    let offset = 0;
    for (let i = 0; i < safeLine - 1; i += 1) {
        offset += lines[i].length + 1;
    }
    offset += safeCol - 1;
    return offset;
}

const MAX_CHAT_CONTEXT_SNIPPETS = 4;

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial UI State
            theme: 'dark',
            isLoading: true,
            isSidebarOpen: true,
            cursorEnabled: true,
            cursorStyle: 'showcase',

            // Initial Mode
            mode: 'learning',

            // Initial Chat State
            conversations: [],
            currentConversationId: null,
            chatContextSnippets: [],

            // Initial Project State
            projectContext: null,
            projectFiles: [],
            selectedFile: null,
            dependencyGraph: null,
            projectStats: null,

            // Initial editor state
            editorDocuments: [],
            activeDocumentId: null,

            // Initial Metrics
            metrics: {
                questionsAsked: 0,
                codeExplanations: 0,
                bugsCaught: 0,
                learningModeTime: 0,
            },

            // UI Actions
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'light' ? 'dark' : 'light',
            })),
            setLoading: (isLoading) => set({ isLoading }),
            setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
            setCursorEnabled: (cursorEnabled) => set({ cursorEnabled }),
            toggleCursorEnabled: () => set((state) => ({ cursorEnabled: !state.cursorEnabled })),
            setCursorStyle: (cursorStyle) => set({ cursorStyle }),

            // Mode Actions
            setMode: (mode) => set({ mode }),
            toggleMode: () => set((state) => ({
                mode: state.mode === 'learning' ? 'building' : 'learning',
            })),

            // Chat Actions
            addMessage: (message) => {
                const state = get();
                const newMessage: Message = {
                    ...message,
                    id: crypto.randomUUID(),
                    timestamp: new Date(),
                };

                if (state.currentConversationId) {
                    set({
                        conversations: state.conversations.map((conv) =>
                            conv.id === state.currentConversationId
                                ? { ...conv, messages: [...conv.messages, newMessage] }
                                : conv,
                        ),
                    });
                } else {
                    const newConversation: Conversation = {
                        id: crypto.randomUUID(),
                        messages: [newMessage],
                        createdAt: new Date(),
                    };
                    set({
                        conversations: [...state.conversations, newConversation],
                        currentConversationId: newConversation.id,
                    });
                }
            },

            // Project Actions
            setProjectContext: (projectContext) => set({ projectContext }),
            setProjectFiles: (projectFiles) => {
                set({ projectFiles });
                const state = get();
                if (!state.activeDocumentId) {
                    const firstCodeFile = findFirstEditableFile(projectFiles);
                    if (firstCodeFile) {
                        get().openDocumentFromProjectFile(firstCodeFile.id);
                    }
                }
            },
            setSelectedFile: (selectedFile) => set({ selectedFile }),
            setDependencyGraph: (dependencyGraph) => set({ dependencyGraph }),
            setProjectStats: (projectStats) => set({ projectStats }),

            updateFileContent: (fileId, content) => {
                const state = get();
                const updatedFiles = updateProjectTreeContent(state.projectFiles, fileId, content);
                const updatedSelectedFile = state.selectedFile?.id === fileId
                    ? { ...state.selectedFile, content }
                    : state.selectedFile;
                const updatedDocuments = state.editorDocuments.map((doc) =>
                    doc.linkedProjectFileId === fileId
                        ? { ...doc, content }
                        : doc,
                );

                set({
                    projectFiles: updatedFiles,
                    selectedFile: updatedSelectedFile,
                    editorDocuments: updatedDocuments,
                });
            },

            clearProject: () => set({
                projectContext: null,
                projectFiles: [],
                selectedFile: null,
                dependencyGraph: null,
                projectStats: null,
            }),

            // Metric Actions
            incrementMetric: (metric) => set((state) => ({
                metrics: {
                    ...state.metrics,
                    [metric]: state.metrics[metric] + 1,
                },
            })),
            resetMetrics: () => set({
                metrics: {
                    questionsAsked: 0,
                    codeExplanations: 0,
                    bugsCaught: 0,
                    learningModeTime: 0,
                },
            }),

            // Editor actions
            openDocumentFromProjectFile: (fileId) => {
                const state = get();
                const file = findProjectFileById(state.projectFiles, fileId);
                if (!file || file.type !== 'file') return null;

                const existing = state.editorDocuments.find((doc) => doc.linkedProjectFileId === file.id);
                if (existing) {
                    set({ activeDocumentId: existing.id, selectedFile: file });
                    return existing.id;
                }

                const documentId = `doc_${crypto.randomUUID()}`;
                const newDoc: EditorDocument = {
                    id: documentId,
                    name: file.name,
                    path: file.path,
                    content: file.content || '',
                    languageMode: file.language || getLanguageFromExtension(file.name),
                    source: 'project',
                    linkedProjectFileId: file.id,
                    isDirty: false,
                };

                set({
                    editorDocuments: [...state.editorDocuments, newDoc],
                    activeDocumentId: documentId,
                    selectedFile: file,
                });
                return documentId;
            },

            openDocumentFromExample: (example) => {
                const state = get();
                const existing = state.editorDocuments.find((doc) =>
                    doc.source === 'example' && doc.path === `example://${example.id}`,
                );

                if (existing) {
                    set({ activeDocumentId: existing.id });
                    return existing.id;
                }

                const documentId = `doc_${crypto.randomUUID()}`;
                const newDoc: EditorDocument = {
                    id: documentId,
                    name: sanitizeFilename(example.filename),
                    path: `example://${example.id}`,
                    content: example.code,
                    languageMode: example.language || getLanguageFromExtension(example.filename),
                    source: 'example',
                    isDirty: false,
                };

                set({
                    editorDocuments: [...state.editorDocuments, newDoc],
                    activeDocumentId: documentId,
                });
                return documentId;
            },

            createScratchDocument: (initial) => {
                const state = get();
                const name = sanitizeFilename(initial?.name || 'scratch.py');
                const languageMode = initial?.languageMode || getLanguageFromExtension(name);
                const documentId = `doc_${crypto.randomUUID()}`;
                const doc: EditorDocument = {
                    id: documentId,
                    name,
                    content: initial?.content || '',
                    languageMode,
                    source: 'scratch',
                    isDirty: Boolean(initial?.content),
                };

                set({
                    editorDocuments: [...state.editorDocuments, doc],
                    activeDocumentId: documentId,
                });

                return documentId;
            },

            setActiveDocument: (documentId) => {
                const state = get();
                const doc = state.editorDocuments.find((d) => d.id === documentId);
                if (!doc) {
                    set({ activeDocumentId: documentId });
                    return;
                }

                const selectedFile = doc.linkedProjectFileId
                    ? findProjectFileById(state.projectFiles, doc.linkedProjectFileId)
                    : state.selectedFile;

                set({
                    activeDocumentId: documentId,
                    selectedFile: selectedFile || state.selectedFile,
                });
            },

            removeEditorDocument: (documentId) => {
                const state = get();
                const idx = state.editorDocuments.findIndex((d) => d.id === documentId);
                if (idx < 0) return;

                const remaining = state.editorDocuments.filter((d) => d.id !== documentId);
                let nextActive = state.activeDocumentId;
                if (state.activeDocumentId === documentId) {
                    nextActive = remaining[idx]?.id || remaining[idx - 1]?.id || null;
                }

                set({
                    editorDocuments: remaining,
                    activeDocumentId: nextActive,
                });
            },

            updateDocumentContent: (documentId, content) => {
                const state = get();
                const doc = state.editorDocuments.find((d) => d.id === documentId);
                if (!doc) return;

                set({
                    editorDocuments: state.editorDocuments.map((d) =>
                        d.id === documentId
                            ? { ...d, content, isDirty: true }
                            : d,
                    ),
                });

                if (doc.linkedProjectFileId) {
                    get().updateFileContent(doc.linkedProjectFileId, content);
                }
            },

            renameDocument: (documentId, name) => {
                const safeName = sanitizeFilename(name);
                set((state) => ({
                    editorDocuments: state.editorDocuments.map((d) =>
                        d.id === documentId
                            ? { ...d, name: safeName, isDirty: true }
                            : d,
                    ),
                }));
            },

            setDocumentLanguageMode: (documentId, languageMode) => {
                set((state) => ({
                    editorDocuments: state.editorDocuments.map((d) =>
                        d.id === documentId
                            ? { ...d, languageMode, isDirty: true }
                            : d,
                    ),
                }));
            },

            setDocumentSelection: (documentId, selection) => {
                set((state) => ({
                    editorDocuments: state.editorDocuments.map((d) =>
                        d.id === documentId
                            ? { ...d, selection }
                            : d,
                    ),
                }));
            },

            insertIntoDocument: (documentId, payload, mode) => {
                const state = get();
                const doc = state.editorDocuments.find((d) => d.id === documentId);
                if (!doc) return;

                let nextContent = doc.content;

                if (mode === 'replace_all') {
                    nextContent = payload;
                } else if (mode === 'replace_selection') {
                    const selection = doc.selection;
                    if (selection &&
                        (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn)
                    ) {
                        const start = getOffsetFromLineCol(doc.content, selection.startLineNumber, selection.startColumn);
                        const end = getOffsetFromLineCol(doc.content, selection.endLineNumber, selection.endColumn);
                        nextContent = `${doc.content.slice(0, start)}${payload}${doc.content.slice(end)}`;
                    } else {
                        const cursorLine = selection?.endLineNumber || doc.content.split('\n').length;
                        const cursorCol = selection?.endColumn || ((doc.content.split('\n').slice(-1)[0] || '').length + 1);
                        const at = getOffsetFromLineCol(doc.content, cursorLine, cursorCol);
                        nextContent = `${doc.content.slice(0, at)}${payload}${doc.content.slice(at)}`;
                    }
                } else {
                    const selection = doc.selection;
                    const cursorLine = selection?.endLineNumber || doc.content.split('\n').length;
                    const cursorCol = selection?.endColumn || ((doc.content.split('\n').slice(-1)[0] || '').length + 1);
                    const at = getOffsetFromLineCol(doc.content, cursorLine, cursorCol);
                    nextContent = `${doc.content.slice(0, at)}${payload}${doc.content.slice(at)}`;
                }

                get().updateDocumentContent(documentId, nextContent);
            },

            // Chat context chip actions
            addChatContextSnippet: (snippet) => {
                const cleanText = snippet.text.trim();
                if (!cleanText) return;

                const state = get();
                const duplicate = state.chatContextSnippets.find((item) =>
                    item.documentId === snippet.documentId &&
                    item.startLine === snippet.startLine &&
                    item.endLine === snippet.endLine &&
                    item.text === cleanText,
                );
                if (duplicate) return;

                const next = [...state.chatContextSnippets, {
                    ...snippet,
                    id: `ctx_${crypto.randomUUID()}`,
                    text: cleanText,
                }];

                set({
                    chatContextSnippets: next.slice(-MAX_CHAT_CONTEXT_SNIPPETS),
                });
            },

            removeChatContextSnippet: (snippetId) => {
                set((state) => ({
                    chatContextSnippets: state.chatContextSnippets.filter((item) => item.id !== snippetId),
                }));
            },

            clearChatContextSnippets: () => set({ chatContextSnippets: [] }),
        }),
        {
            name: 'socraticdev-storage',
            partialize: (state) => ({
                theme: state.theme,
                cursorEnabled: state.cursorEnabled,
                cursorStyle: state.cursorStyle,
                mode: state.mode,
                projectContext: state.projectContext,
                projectFiles: state.projectFiles,
                selectedFile: state.selectedFile,
                dependencyGraph: state.dependencyGraph,
                projectStats: state.projectStats,
                editorDocuments: state.editorDocuments,
                activeDocumentId: state.activeDocumentId,
                chatContextSnippets: state.chatContextSnippets,
            }),
        },
    ),
);
