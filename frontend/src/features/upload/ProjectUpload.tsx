import { useRef, useState, useCallback, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useStore } from '../../store/useStore';
import { processUploadedFiles, buildDependencyGraph, ProjectFile } from '../../utils/projectAnalyzer';
import { FileExplorer } from '../explorer';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { graphragAPI, UploadStatusResponse } from '../../services';

function ProjectUpload() {
    const containerRef = useRef<HTMLDivElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadMode, setUploadMode] = useState<'folder' | 'github' | 'zip'>('folder');
    const [githubUrl, setGithubUrl] = useState('');
    const [projectName, setProjectName] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatusResponse | null>(null);
    const [pendingFiles, setPendingFiles] = useState<ProjectFile[]>([]);  // Store files until backend completes

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

    // Poll upload status
    useEffect(() => {
        if (!sessionId || !isProcessing) return;

        const pollInterval = setInterval(async () => {
            try {
                const status = await graphragAPI.getUploadStatus(sessionId);
                setUploadStatus(status);
                setProgress(status.progress * 100);  // Convert 0.0-1.0 to 0-100

                if (status.status === 'completed') {
                    setIsProcessing(false);
                    clearInterval(pollInterval);
                    
                    // Update project context with backend data using project_id from status
                    if (status.statistics && status.project_id) {
                        // Set project files NOW (not earlier)
                        setProjectFiles(pendingFiles);
                        
                        // Set project context
                        setProjectContext({
                            id: status.project_id,  // Use project_id from status response
                            name: projectName,
                            files: pendingFiles,
                            language: 'mixed',
                            uploadedAt: new Date(),
                        });
                        
                        // Clear pending files
                        setPendingFiles([]);
                    }
                } else if (status.status === 'failed') {
                    setIsProcessing(false);
                    setError(status.error || 'Upload failed');
                    clearInterval(pollInterval);
                }
            } catch (err) {
                console.error('Failed to poll upload status:', err);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [sessionId, isProcessing, projectName, pendingFiles, setProjectContext, setProjectFiles]);

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
            // Process files locally for preview
            const files = await processUploadedFiles(fileList, setProgress);

            if (files.length === 0) {
                setError('No files found in the selected folder');
                setIsProcessing(false);
                return;
            }

            // Store project files temporarily (don't show UI yet)
            setPendingFiles(files);

            // Build dependency graph from real imports
            const graph = buildDependencyGraph(files);
            setDependencyGraph(graph as any);

            // Get project name from root folder
            const detectedProjectName = files[0]?.type === 'directory'
                ? files[0].name
                : 'Uploaded Project';
            
            setProjectName(detectedProjectName);

            // Upload to backend
            const fileArray = Array.from(fileList);
            const response = await graphragAPI.uploadProject({
                files: fileArray as File[],
                projectName: detectedProjectName,
            });

            setSessionId(response.session_id);
            // Keep isProcessing = true, polling will continue via useEffect
            // project_id will come from status polling

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process files');
            setIsProcessing(false);
        }
    }, [setDependencyGraph]);

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

    const handleGithubUpload = useCallback(async () => {
        if (!githubUrl.trim() || !projectName.trim()) {
            setError('Please provide both GitHub URL and project name');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const response = await graphragAPI.uploadFromGithub({
                githubUrl: githubUrl.trim(),
                projectName: projectName.trim(),
            });

            setSessionId(response.session_id);
            // project_id will come from status polling
            // Polling will continue via useEffect
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload from GitHub');
            setIsProcessing(false);
        }
    }, [githubUrl, projectName]);

    const handleZipUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const zipFile = e.target.files[0];
        if (!zipFile.name.endsWith('.zip')) {
            setError('Please select a .zip file');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const detectedProjectName = zipFile.name.replace('.zip', '');
            setProjectName(detectedProjectName);

            const response = await graphragAPI.uploadProject({
                files: [zipFile],
                projectName: detectedProjectName,
            });

            setSessionId(response.session_id);
            // project_id will come from status polling
            // Polling will continue via useEffect
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload zip file');
            setIsProcessing(false);
        }
    }, []);

    const handleClearProject = useCallback(() => {
        clearProject();
        setError(null);
        setSessionId(null);
        setUploadStatus(null);
        setPendingFiles([]);
        setGithubUrl('');
        setProjectName('');
        setProgress(0);
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
                    {/* Upload Mode Selector */}
                    <div className="flex gap-2 mb-6 p-1 bg-[color:var(--color-bg-muted)] rounded-2xl">
                        <button
                            onClick={() => setUploadMode('folder')}
                            className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all transform ${
                                uploadMode === 'folder'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                                    : 'hover:bg-[color:var(--color-bg-elevated)]'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                Folder
                            </div>
                        </button>
                        <button
                            onClick={() => setUploadMode('github')}
                            className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all transform ${
                                uploadMode === 'github'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                                    : 'hover:bg-[color:var(--color-bg-elevated)]'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                GitHub
                            </div>
                        </button>
                        <button
                            onClick={() => setUploadMode('zip')}
                            className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all transform ${
                                uploadMode === 'zip'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                                    : 'hover:bg-[color:var(--color-bg-elevated)]'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                ZIP File
                            </div>
                        </button>
                    </div>

                    {uploadMode === 'folder' && (
                        <div
                            ref={dropZoneRef}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                relative rounded-2xl border-2 border-dashed p-16 text-center transition-all transform
                                ${isDragging
                                    ? 'border-primary-500 bg-gradient-to-br from-primary-500/10 to-primary-600/10 scale-105 shadow-2xl'
                                    : 'border-[color:var(--color-border)] hover:border-primary-500/50 hover:shadow-xl hover:scale-102'
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
                                    <p className="font-medium">
                                        {uploadStatus?.status === 'processing' ? 'Processing project...' : 'Uploading files...'}
                                    </p>
                                    <div className="w-48 h-2 mx-auto rounded-full bg-[color:var(--color-bg-muted)] overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-[color:var(--color-text-muted)]">{progress}%</p>
                                    {uploadStatus?.message && (
                                        <p className="text-xs text-[color:var(--color-text-muted)]">{uploadStatus.message}</p>
                                    )}
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
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileInput}
                                        className="hidden"
                                        id="file-upload"
                                        multiple
                                        // @ts-ignore - webkitdirectory is a valid attribute
                                        webkitdirectory=""
                                    />
                                    <label htmlFor="file-upload">
                                        <span className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                            Select Folder
                                        </span>
                                    </label>

                                    <p className="mt-8 text-xs text-[color:var(--color-text-muted)] flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Supports Python, JavaScript, TypeScript, Java, and more
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {uploadMode === 'github' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
                                <input
                                    type="text"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/username/repo"
                                    className="w-full px-4 py-2 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:border-primary-500 focus:outline-none"
                                    disabled={isProcessing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="my-project"
                                    className="w-full px-4 py-2 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:border-primary-500 focus:outline-none"
                                    disabled={isProcessing}
                                />
                            </div>
                            <Button
                                onClick={handleGithubUpload}
                                disabled={isProcessing || !githubUrl.trim() || !projectName.trim()}
                                className="w-full"
                            >
                                {isProcessing ? 'Uploading...' : 'Upload from GitHub'}
                            </Button>
                            {isProcessing && (
                                <div className="space-y-2">
                                    <div className="w-full h-2 rounded-full bg-[color:var(--color-bg-muted)] overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-center text-[color:var(--color-text-muted)]">{progress}%</p>
                                    {uploadStatus?.message && (
                                        <p className="text-xs text-center text-[color:var(--color-text-muted)]">{uploadStatus.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {uploadMode === 'zip' && (
                        <div
                            className={`
                                relative rounded-2xl border-2 border-dashed p-12 text-center transition-all
                                border-[color:var(--color-border)] hover:border-primary-500/50
                            `}
                        >
                            {isProcessing ? (
                                <div className="space-y-4">
                                    <svg className="w-12 h-12 mx-auto text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <p className="font-medium">Processing ZIP file...</p>
                                    <div className="w-48 h-2 mx-auto rounded-full bg-[color:var(--color-bg-muted)] overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-[color:var(--color-text-muted)]">{progress}%</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[color:var(--color-bg-muted)] flex items-center justify-center">
                                        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>

                                    <h3 className="font-display text-lg font-semibold mb-2">
                                        Upload ZIP File
                                    </h3>
                                    <p className="text-[color:var(--color-text-secondary)] mb-6">
                                        Select a .zip file containing your project
                                    </p>

                                    <input
                                        type="file"
                                        onChange={handleZipUpload}
                                        className="hidden"
                                        id="zip-upload"
                                        accept=".zip"
                                    />
                                    <label htmlFor="zip-upload">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)] transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Select ZIP File
                                        </span>
                                    </label>
                                </>
                            )}
                        </div>
                    )}

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
                        <div className="flex items-center justify-between mb-3">
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
                        
                        {/* Upload Statistics */}
                        {uploadStatus?.statistics && (
                            <div className="grid grid-cols-3 gap-3">
                                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 shadow-sm">
                                    <p className="text-xs text-[color:var(--color-text-muted)] mb-1">Entities</p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">{uploadStatus.statistics.entity_count}</p>
                                </div>
                                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-secondary-500/10 to-secondary-600/10 border border-secondary-500/20 shadow-sm">
                                    <p className="text-xs text-[color:var(--color-text-muted)] mb-1">Relations</p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-secondary-500 to-secondary-600 bg-clip-text text-transparent">{uploadStatus.statistics.relationship_count}</p>
                                </div>
                                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-accent-500/10 to-accent-600/10 border border-accent-500/20 shadow-sm">
                                    <p className="text-xs text-[color:var(--color-text-muted)] mb-1">Files</p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">{uploadStatus.statistics.file_count}</p>
                                </div>
                            </div>
                        )}
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
