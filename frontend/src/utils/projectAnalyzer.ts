// Types for the project file system
export interface ProjectFile {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'directory';
    content?: string;
    language?: string;
    size: number;
    children?: ProjectFile[];
}

export interface ParsedImport {
    source: string;
    specifiers: string[];
    type: 'default' | 'named' | 'namespace' | 'side-effect';
}

export interface CodeAnalysis {
    imports: ParsedImport[];
    exports: string[];
    functions: string[];
    classes: string[];
}

// Supported file extensions for code analysis
const CODE_EXTENSIONS = ['py', 'js', 'ts', 'tsx', 'jsx', 'java', 'go', 'rs', 'c', 'cpp', 'h'];
const TEXT_EXTENSIONS = [...CODE_EXTENSIONS, 'json', 'md', 'txt', 'yaml', 'yml', 'toml', 'html', 'css', 'scss', 'xml'];
const IGNORED_UPLOAD_PATH_SEGMENTS = new Set(['.git', 'node_modules', 'dist', 'build']);
const BACKEND_SUPPORTED_UPLOAD_EXTENSIONS = new Set(['py', 'js', 'jsx', 'ts', 'tsx', 'java']);

// Check if uploaded path should be excluded from processing/upload.
export function shouldIgnoreUploadPath(rawPath: string): boolean {
    const normalized = (rawPath || '')
        .replace(/\\/g, '/')
        .replace(/^\/+|\/+$/g, '');
    if (!normalized) return false;
    return normalized.split('/').some((segment) => IGNORED_UPLOAD_PATH_SEGMENTS.has(segment));
}

// Check if file is supported by backend parser upload pipeline.
export function isBackendSupportedUploadFile(rawPath: string): boolean {
    const normalized = (rawPath || '').replace(/\\/g, '/');
    const fileName = normalized.split('/').pop() || '';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return BACKEND_SUPPORTED_UPLOAD_EXTENSIONS.has(ext);
}

// Get language from file extension
export function getLanguageFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
        py: 'python',
        js: 'javascript',
        ts: 'typescript',
        tsx: 'typescriptreact',
        jsx: 'javascriptreact',
        java: 'java',
        go: 'go',
        rs: 'rust',
        c: 'c',
        cpp: 'cpp',
        h: 'c',
        json: 'json',
        md: 'markdown',
        html: 'html',
        css: 'css',
        scss: 'scss',
        yaml: 'yaml',
        yml: 'yaml',
        xml: 'xml',
    };
    return langMap[ext || ''] || 'plaintext';
}

// Check if file is readable as text
export function isTextFile(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return TEXT_EXTENSIONS.includes(ext);
}

// Check if file should be analyzed for dependencies
export function isCodeFile(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return CODE_EXTENSIONS.includes(ext);
}

// Read file content from File object
export async function readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

// Process uploaded files into ProjectFile tree
export async function processUploadedFiles(
    fileList: FileList,
    onProgress?: (progress: number) => void
): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];
    const fileMap = new Map<string, ProjectFile>();
    const total = fileList.length;

    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const relativePath = file.webkitRelativePath || file.name;
        if (shouldIgnoreUploadPath(relativePath)) {
            if (onProgress) {
                onProgress(Math.round(((i + 1) / total) * 100));
            }
            continue;
        }
        const parts = relativePath.split('/');

        // Read file content for text files
        let content: string | undefined;
        if (isTextFile(file.name) && file.size < 500000) { // Max 500KB
            try {
                content = await readFileContent(file);
            } catch (error) {
                console.warn(`Failed to read ${file.name}:`, error);
            }
        }

        // Create file node
        const fileNode: ProjectFile = {
            id: relativePath,
            name: file.name,
            path: relativePath,
            type: 'file',
            content,
            language: getLanguageFromExtension(file.name),
            size: file.size,
        };

        // Build directory structure
        let currentPath = '';
        for (let j = 0; j < parts.length - 1; j++) {
            const dirName = parts[j];
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${dirName}` : dirName;

            if (!fileMap.has(currentPath)) {
                const dirNode: ProjectFile = {
                    id: currentPath,
                    name: dirName,
                    path: currentPath,
                    type: 'directory',
                    size: 0,
                    children: [],
                };
                fileMap.set(currentPath, dirNode);

                if (parentPath && fileMap.has(parentPath)) {
                    fileMap.get(parentPath)!.children!.push(dirNode);
                } else if (!parentPath) {
                    files.push(dirNode);
                }
            }
        }

        // Add file to its parent directory
        if (parts.length > 1) {
            const parentPath = parts.slice(0, -1).join('/');
            const parent = fileMap.get(parentPath);
            if (parent) {
                parent.children!.push(fileNode);
            }
        } else {
            files.push(fileNode);
        }

        fileMap.set(relativePath, fileNode);

        // Report progress
        if (onProgress) {
            onProgress(Math.round(((i + 1) / total) * 100));
        }
    }

    return files;
}

// Parse Python imports
function parsePythonImports(content: string): ParsedImport[] {
    const imports: ParsedImport[] = [];

    // Match 'import x' and 'from x import y'
    const importRegex = /^(?:from\s+([\w.]+)\s+)?import\s+(.+)$/gm;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const fromModule = match[1];
        const importPart = match[2].trim();

        if (fromModule) {
            // from x import y, z
            const specifiers = importPart.split(',').map(s => s.trim().split(/\s+as\s+/)[0]);
            imports.push({
                source: fromModule,
                specifiers,
                type: 'named',
            });
        } else {
            // import x, y
            const modules = importPart.split(',').map(s => s.trim().split(/\s+as\s+/)[0]);
            modules.forEach(mod => {
                imports.push({
                    source: mod,
                    specifiers: [],
                    type: 'default',
                });
            });
        }
    }

    return imports;
}

// Parse JavaScript/TypeScript imports
function parseJSImports(content: string): ParsedImport[] {
    const imports: ParsedImport[] = [];

    // Match various import patterns
    const importRegex = /import\s+(?:(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?(?:\*\s+as\s+(\w+))?)\s*from\s*['"]([^'"]+)['"]/g;
    const sideEffectRegex = /import\s+['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const defaultImport = match[1];
        const namedImports = match[2];
        const namespaceImport = match[3];
        const source = match[4];

        const specifiers: string[] = [];
        if (defaultImport) specifiers.push(defaultImport);
        if (namedImports) {
            namedImports.split(',').forEach(s => {
                const name = s.trim().split(/\s+as\s+/)[0].trim();
                if (name) specifiers.push(name);
            });
        }
        if (namespaceImport) specifiers.push(namespaceImport);

        imports.push({
            source,
            specifiers,
            type: namespaceImport ? 'namespace' : (namedImports ? 'named' : 'default'),
        });
    }

    // Side effect imports
    while ((match = sideEffectRegex.exec(content)) !== null) {
        // Make sure this isn't already captured
        const source = match[1];
        if (!imports.find(i => i.source === source)) {
            imports.push({
                source,
                specifiers: [],
                type: 'side-effect',
            });
        }
    }

    return imports;
}

// Parse exports
function parseExports(content: string, language: string): string[] {
    const exports: string[] = [];

    if (language === 'python') {
        // Python doesn't have explicit exports, but we can find top-level functions/classes
        const defRegex = /^(?:def|class)\s+(\w+)/gm;
        let match;
        while ((match = defRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
    } else if (['javascript', 'typescript', 'typescriptreact', 'javascriptreact'].includes(language)) {
        // Match export statements
        const exportRegex = /export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type)?\s*(\w+)/g;
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
    }

    return exports;
}

// Analyze code file
export function analyzeCode(content: string, language: string): CodeAnalysis {
    let imports: ParsedImport[] = [];

    if (language === 'python') {
        imports = parsePythonImports(content);
    } else if (['javascript', 'typescript', 'typescriptreact', 'javascriptreact'].includes(language)) {
        imports = parseJSImports(content);
    }

    const exports = parseExports(content, language);

    // Extract functions and classes
    const functions: string[] = [];
    const classes: string[] = [];

    if (language === 'python') {
        const funcRegex = /^def\s+(\w+)/gm;
        const classRegex = /^class\s+(\w+)/gm;
        let match;
        while ((match = funcRegex.exec(content)) !== null) functions.push(match[1]);
        while ((match = classRegex.exec(content)) !== null) classes.push(match[1]);
    } else {
        const funcRegex = /(?:function|const|let|var)\s+(\w+)\s*(?:=\s*(?:async\s*)?\([^)]*\)\s*=>|\([^)]*\))/g;
        const classRegex = /class\s+(\w+)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) functions.push(match[1]);
        while ((match = classRegex.exec(content)) !== null) classes.push(match[1]);
    }

    return { imports, exports, functions, classes };
}

// Build dependency graph from project files
export function buildDependencyGraph(files: ProjectFile[]): { nodes: any[]; edges: any[] } {
    const nodes: any[] = [];
    const edges: any[] = [];
    const fileNodes = new Map<string, any>();

    // Recursively collect all code files
    function collectFiles(items: ProjectFile[]): ProjectFile[] {
        const result: ProjectFile[] = [];
        for (const item of items) {
            if (item.type === 'file' && item.content && isCodeFile(item.name)) {
                result.push(item);
            } else if (item.type === 'directory' && item.children) {
                result.push(...collectFiles(item.children));
            }
        }
        return result;
    }

    const codeFiles = collectFiles(files);

    // Create nodes for each file
    codeFiles.forEach((file) => {
        const analysis = analyzeCode(file.content!, file.language!);
        const node = {
            id: file.path,
            label: file.name,
            type: 'file' as const,
            x: 0,
            y: 0,
            dependencies: [] as string[],
            dependents: [] as string[],
            metadata: {
                lines: file.content?.split('\n').length || 0,
                language: file.language,
                functions: analysis.functions,
                classes: analysis.classes,
            },
        };
        nodes.push(node);
        fileNodes.set(file.path, node);

        // Also map by filename for import resolution
        fileNodes.set(file.name, node);
        fileNodes.set(file.name.replace(/\.[^.]+$/, ''), node);
    });

    // Build edges based on imports
    codeFiles.forEach(file => {
        const analysis = analyzeCode(file.content!, file.language!);
        const sourceNode = fileNodes.get(file.path);

        analysis.imports.forEach(imp => {
            // Try to resolve import to a file in the project
            let targetPath = imp.source;

            // Normalize import path
            if (targetPath.startsWith('./') || targetPath.startsWith('../')) {
                // Relative import - resolve based on current file path
                const dir = file.path.split('/').slice(0, -1).join('/');
                targetPath = `${dir}/${targetPath}`.replace(/\/\.\//g, '/');
            }

            // Try to find matching file
            let targetNode = fileNodes.get(targetPath) ||
                fileNodes.get(`${targetPath}.py`) ||
                fileNodes.get(`${targetPath}.js`) ||
                fileNodes.get(`${targetPath}.ts`) ||
                fileNodes.get(`${targetPath}.tsx`) ||
                fileNodes.get(`${targetPath}/index.ts`) ||
                fileNodes.get(`${targetPath}/index.js`);

            // Also try the source directly (for named imports like 'react')
            const baseName = imp.source.split('/').pop() || '';
            if (!targetNode) {
                targetNode = fileNodes.get(baseName);
            }

            if (targetNode && targetNode.id !== sourceNode.id) {
                sourceNode.dependencies.push(targetNode.id);
                targetNode.dependents.push(sourceNode.id);

                edges.push({
                    source: file.path,
                    target: targetNode.id,
                    type: 'imports' as const,
                });
            }
        });
    });

    return { nodes, edges };
}
