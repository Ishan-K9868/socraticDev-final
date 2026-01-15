import { useState, useCallback } from 'react';
import { ProjectFile } from '../../utils/projectAnalyzer';

interface FileExplorerProps {
    files: ProjectFile[];
    selectedFile: ProjectFile | null;
    onFileSelect: (file: ProjectFile) => void;
}

interface FileTreeItemProps {
    item: ProjectFile;
    depth: number;
    selectedFile: ProjectFile | null;
    onFileSelect: (file: ProjectFile) => void;
}

function FileTreeItem({ item, depth, selectedFile, onFileSelect }: FileTreeItemProps) {
    const [isExpanded, setIsExpanded] = useState(depth < 2);
    const isSelected = selectedFile?.id === item.id;
    const isDirectory = item.type === 'directory';
    const hasChildren = isDirectory && item.children && item.children.length > 0;

    const handleClick = useCallback(() => {
        if (isDirectory) {
            setIsExpanded(!isExpanded);
        } else {
            onFileSelect(item);
        }
    }, [isDirectory, isExpanded, item, onFileSelect]);

    // Get file icon based on type/extension
    const getIcon = () => {
        if (isDirectory) {
            return isExpanded ? (
                <svg className="w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
            ) : (
                <svg className="w-4 h-4 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            );
        }

        // File icons based on extension
        const ext = item.name.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'py':
                return <span className="text-xs">🐍</span>;
            case 'js':
                return <span className="text-xs text-yellow-400 font-bold">JS</span>;
            case 'ts':
            case 'tsx':
                return <span className="text-xs text-blue-400 font-bold">TS</span>;
            case 'json':
                return <span className="text-xs">📋</span>;
            case 'md':
                return <span className="text-xs">📝</span>;
            case 'html':
                return <span className="text-xs text-orange-400 font-bold">H</span>;
            case 'css':
            case 'scss':
                return <span className="text-xs text-pink-400 font-bold">C</span>;
            default:
                return (
                    <svg className="w-4 h-4 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
        }
    };

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '';
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={`
          w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded-md transition-colors
          ${isSelected
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'hover:bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-primary)]'
                    }
        `}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {/* Expand/collapse arrow for directories */}
                {isDirectory ? (
                    <svg
                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                ) : (
                    <span className="w-3" />
                )}

                {/* Icon */}
                <span className="flex-shrink-0">{getIcon()}</span>

                {/* Name */}
                <span className="flex-1 truncate">{item.name}</span>

                {/* Size for files */}
                {!isDirectory && item.size > 0 && (
                    <span className="text-xs text-[color:var(--color-text-muted)]">
                        {formatSize(item.size)}
                    </span>
                )}

                {/* Count for directories */}
                {isDirectory && hasChildren && (
                    <span className="text-xs text-[color:var(--color-text-muted)]">
                        {item.children!.length}
                    </span>
                )}
            </button>

            {/* Children */}
            {isDirectory && isExpanded && hasChildren && (
                <div>
                    {item.children!
                        .sort((a, b) => {
                            // Directories first, then files
                            if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                            return a.name.localeCompare(b.name);
                        })
                        .map((child) => (
                            <FileTreeItem
                                key={child.id}
                                item={child}
                                depth={depth + 1}
                                selectedFile={selectedFile}
                                onFileSelect={onFileSelect}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}

function FileExplorer({ files, selectedFile, onFileSelect }: FileExplorerProps) {
    if (files.length === 0) {
        return (
            <div className="p-4 text-center">
                <p className="text-sm text-[color:var(--color-text-muted)]">
                    No files loaded
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto">
            {files
                .sort((a, b) => {
                    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                    return a.name.localeCompare(b.name);
                })
                .map((item) => (
                    <FileTreeItem
                        key={item.id}
                        item={item}
                        depth={0}
                        selectedFile={selectedFile}
                        onFileSelect={onFileSelect}
                    />
                ))}
        </div>
    );
}

export default FileExplorer;
