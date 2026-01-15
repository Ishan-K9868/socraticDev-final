import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useStore } from '../../store/useStore';
import { processUploadedFiles, buildDependencyGraph, ProjectFile } from '../../utils/projectAnalyzer';
import { FileExplorer } from '../explorer';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

function ProjectUpload() {
    const containerRef = useRef<HTMLDivElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const {
        projectContext,
        projectFiles,
        selectedFile,
        setProjectContext,
        setProjectFiles,
        setSelectedFile,
        setDependencyGraph,
        clearProject
    } = useStore();

    useGSAP(() => {
        gsap.from(containerRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const processFiles = useCallback(async (fileList: FileList) => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            // Process files and read content
            const files = await processUploadedFiles(fileList, setProgress);

            if (files.length === 0) {
                setError('No files found in the selected folder');
                setIsProcessing(false);
                return;
            }

            // Set project files
            setProjectFiles(files);

            // Build dependency graph from real imports
            const graph = buildDependencyGraph(files);
            setDependencyGraph(graph as any);

            // Get project name from root folder
            const projectName = files[0]?.type === 'directory'
                ? files[0].name
                : 'Uploaded Project';

            // Detect primary language
            const detectLanguage = (items: ProjectFile[]): string => {
                const extensions: string[] = [];
                const collectExtensions = (list: ProjectFile[]) => {
                    list.forEach(item => {
                        if (item.type === 'file') {
                            const ext = item.name.split('.').pop()?.toLowerCase();
                            if (ext) extensions.push(ext);
                        } else if (item.children) {
                            collectExtensions(item.children);
                        }
                    });
                };
                collectExtensions(items);

                if (extensions.includes('py')) return 'python';
                if (extensions.includes('ts') || extensions.includes('tsx')) return 'typescript';
                if (extensions.includes('js') || extensions.includes('jsx')) return 'javascript';
                if (extensions.includes('java')) return 'java';
                if (extensions.includes('go')) return 'go';
                return 'mixed';
            };

            // Set project context
            setProjectContext({
                id: crypto.randomUUID(),
                name: projectName,
                files: files,
                language: detectLanguage(files),
                uploadedAt: new Date(),
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process files');
        } finally {
            setIsProcessing(false);
        }
    }, [setProjectContext, setProjectFiles, setDependencyGraph]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
    }, [processFiles]);

    const handleClearProject = useCallback(() => {
        clearProject();
        setError(null);
    }, [clearProject]);

    const handleFileSelect = useCallback((file: ProjectFile) => {
        if (file.type === 'file' && file.content) {
            setSelectedFile(file);
        }
    }, [setSelectedFile]);

    // Count total files
    const countFiles = (items: ProjectFile[]): number => {
        let count = 0;
        items.forEach(item => {
            if (item.type === 'file') count++;
            else if (item.children) count += countFiles(item.children);
        });
        return count;
    };

    return (
        <div ref={containerRef} className="h-full flex flex-col">
            {projectFiles.length === 0 ? (
                /* Upload Zone */
                <div className="p-6">
                    <div
                        ref={dropZoneRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            relative rounded-2xl border-2 border-dashed p-12 text-center transition-all
                            ${isDragging
                                ? 'border-primary-500 bg-primary-500/5'
                                : 'border-[color:var(--color-border)] hover:border-primary-500/50'
                            }
                        `}
                    >
                        {isProcessing ? (
                            /* Processing State */
                            <div className="space-y-4">
                                <svg className="w-12 h-12 mx-auto text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <p className="font-medium">Reading files...</p>
                                <div className="w-48 h-2 mx-auto rounded-full bg-[color:var(--color-bg-muted)] overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-[color:var(--color-text-muted)]">{progress}%</p>
                            </div>
                        ) : (
                            /* Upload Prompt */
                            <>
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[color:var(--color-bg-muted)] flex items-center justify-center">
                                    <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>

                                <h3 className="font-display text-lg font-semibold mb-2">
                                    Upload Your Project
                                </h3>
                                <p className="text-[color:var(--color-text-secondary)] mb-6">
                                    Drag and drop a folder, or click to browse
                                </p>

                                <input
                                    type="file"
                                    onChange={handleFileInput}
                                    className="hidden"
                                    id="file-upload"
                                    multiple
                                    // @ts-ignore - webkitdirectory is a valid attribute
                                    webkitdirectory=""
                                />
                                <label htmlFor="file-upload">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)] transition-colors cursor-pointer">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        Select Folder
                                    </span>
                                </label>

                                <p className="mt-6 text-xs text-[color:var(--color-text-muted)]">
                                    Supports Python, JavaScript, TypeScript, Java, Go, and more
                                </p>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                /* Project Loaded - File Explorer */
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-[color:var(--color-border)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-display font-semibold">{projectContext?.name}</h3>
                                <p className="text-sm text-[color:var(--color-text-muted)]">
                                    {countFiles(projectFiles)} files • {projectContext?.language}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleClearProject}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Button>
                        </div>
                    </div>

                    {/* File Explorer */}
                    <div className="flex-1 overflow-y-auto p-2">
                        <FileExplorer
                            files={projectFiles}
                            selectedFile={selectedFile}
                            onFileSelect={handleFileSelect}
                        />
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[color:var(--color-border)]">
                        <Badge variant="accent" className="w-full justify-center">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Click a file to view • Graph tab shows dependencies
                        </Badge>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProjectUpload;
