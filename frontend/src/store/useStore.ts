import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectFile } from '../utils/projectAnalyzer';

// Types
export type Theme = 'light' | 'dark';
export type Mode = 'learning' | 'building';

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

interface AppState {
    // UI State
    theme: Theme;
    isLoading: boolean;
    isSidebarOpen: boolean;

    // Mode State
    mode: Mode;

    // Chat State
    conversations: Conversation[];
    currentConversationId: string | null;

    // Project State
    projectContext: ProjectContext | null;
    projectFiles: ProjectFile[];
    selectedFile: ProjectFile | null;
    dependencyGraph: { nodes: DependencyNode[]; edges: DependencyEdge[] } | null;
    projectStats: UploadProjectStats | null;

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
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial UI State
            theme: 'dark',
            isLoading: true,
            isSidebarOpen: true,

            // Initial Mode
            mode: 'learning',

            // Initial Chat State
            conversations: [],
            currentConversationId: null,

            // Initial Project State
            projectContext: null,
            projectFiles: [],
            selectedFile: null,
            dependencyGraph: null,
            projectStats: null,

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
                theme: state.theme === 'light' ? 'dark' : 'light'
            })),
            setLoading: (isLoading) => set({ isLoading }),
            setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

            // Mode Actions
            setMode: (mode) => set({ mode }),
            toggleMode: () => set((state) => ({
                mode: state.mode === 'learning' ? 'building' : 'learning'
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
                                : conv
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
            setProjectFiles: (projectFiles) => set({ projectFiles }),
            setSelectedFile: (selectedFile) => set({ selectedFile }),
            setDependencyGraph: (dependencyGraph) => set({ dependencyGraph }),
            setProjectStats: (projectStats) => set({ projectStats }),

            updateFileContent: (fileId, content) => {
                const state = get();

                // Helper to recursively update file in tree
                const updateInTree = (files: ProjectFile[]): ProjectFile[] => {
                    return files.map(file => {
                        if (file.id === fileId) {
                            return { ...file, content };
                        }
                        if (file.children) {
                            return { ...file, children: updateInTree(file.children) };
                        }
                        return file;
                    });
                };

                const updatedFiles = updateInTree(state.projectFiles);

                // Also update selectedFile if it matches
                const updatedSelectedFile = state.selectedFile?.id === fileId
                    ? { ...state.selectedFile, content }
                    : state.selectedFile;

                set({
                    projectFiles: updatedFiles,
                    selectedFile: updatedSelectedFile,
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
        }),
        {
            name: 'socraticdev-storage',
            partialize: (state) => ({
                theme: state.theme,
                mode: state.mode,
                projectContext: state.projectContext,
                projectFiles: state.projectFiles,
                selectedFile: state.selectedFile,
                dependencyGraph: state.dependencyGraph,
                projectStats: state.projectStats,
            }),
        }
    )
);
