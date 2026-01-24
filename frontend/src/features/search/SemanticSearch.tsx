import { useState, useCallback, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { graphragAPI, Entity } from '../../services';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface SemanticSearchProps {
    projectId: string;
    onResultSelect?: (entity: Entity) => void;
}

function SemanticSearch({ projectId, onResultSelect }: SemanticSearchProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedResult, setSelectedResult] = useState<Entity | null>(null);
    const [limit, setLimit] = useState(20);

    // Query suggestions based on common patterns
    const suggestions = [
        'authentication logic',
        'database connection',
        'error handling',
        'API endpoints',
        'data validation',
        'user management',
    ];

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const searchResults = await graphragAPI.semanticSearch({
                project_id: projectId,
                query: query.trim(),
                limit,
            });

            setResults(searchResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setLoading(false);
        }
    }, [projectId, query, limit]);

    const handleResultClick = useCallback((entity: Entity) => {
        setSelectedResult(entity);
        onResultSelect?.(entity);
    }, [onResultSelect]);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        setQuery(suggestion);
    }, []);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    useGSAP(() => {
        gsap.from(containerRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="h-full flex flex-col bg-gradient-to-br from-[color:var(--color-bg-primary)] to-[color:var(--color-bg-secondary)]">
            {/* Search Input */}
            <div className="p-6 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)]/80 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="font-display font-semibold text-lg">Semantic Search</h3>
                </div>
                
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Search for code entities..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all shadow-sm text-sm"
                            disabled={loading}
                        />
                    </div>
                    <Button 
                        onClick={handleSearch} 
                        disabled={loading || !query.trim()}
                        className="px-6 rounded-2xl shadow-lg"
                    >
                        {loading ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </>
                        )}
                    </Button>
                </div>

                {/* Query Suggestions */}
                {!results.length && !loading && (
                    <div className="space-y-2">
                        <p className="text-xs text-[color:var(--color-text-muted)] font-medium">Try searching for:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium bg-[color:var(--color-bg-muted)] hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-secondary-500/10 hover:border-primary-500/30 border border-transparent transition-all transform hover:scale-105 shadow-sm"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Result count */}
                {results.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
                        <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">
                            Found {results.length} result{results.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="p-4">
                    <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
                        {error}
                    </div>
                </div>
            )}

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {results.map((entity) => (
                    <Card
                        key={entity.id}
                        className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
                            selectedResult?.id === entity.id 
                                ? 'border-primary-500 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 shadow-lg' 
                                : 'hover:border-primary-500/50'
                        }`}
                        onClick={() => handleResultClick(entity)}
                    >
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-lg mb-1 truncate">{entity.name}</h4>
                                    <p className="text-xs text-[color:var(--color-text-muted)] flex items-center gap-2">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        {entity.file_path}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Entity type badge */}
                                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[color:var(--color-bg-muted)] to-[color:var(--color-bg-elevated)] capitalize shadow-sm">
                                        {entity.type}
                                    </span>
                                    {/* Similarity score */}
                                    {entity.similarity_score !== undefined && (
                                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-500 border border-primary-500/30 shadow-sm">
                                            {(entity.similarity_score * 100).toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Code snippet */}
                            {entity.code && (
                                <div className="mt-3">
                                    <pre className="text-xs bg-[color:var(--color-bg-muted)] p-3 rounded-lg overflow-x-auto">
                                        <code>{entity.code.split('\n').slice(0, 10).join('\n')}</code>
                                        {entity.code.split('\n').length > 10 && (
                                            <span className="text-[color:var(--color-text-muted)]">...</span>
                                        )}
                                    </pre>
                                </div>
                            )}

                            {/* Line numbers */}
                            <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                                Lines {entity.start_line}-{entity.end_line}
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Empty state */}
                {!loading && !error && results.length === 0 && query && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-[color:var(--color-text-muted)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="mt-4 text-[color:var(--color-text-muted)]">No results found</p>
                        <p className="text-sm text-[color:var(--color-text-muted)]">Try a different search query</p>
                    </div>
                )}

                {/* Initial state */}
                {!loading && !error && results.length === 0 && !query && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-[color:var(--color-text-muted)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="mt-4 text-[color:var(--color-text-muted)]">Search your codebase</p>
                        <p className="text-sm text-[color:var(--color-text-muted)]">Enter a query to find relevant code entities</p>
                    </div>
                )}
            </div>

            {/* Selected Result Detail */}
            {selectedResult && selectedResult.code && (
                <div className="border-t border-[color:var(--color-border)] p-4 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Full Code</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedResult(null)}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>
                    <pre className="text-xs bg-[color:var(--color-bg-muted)] p-4 rounded-lg overflow-x-auto">
                        <code>{selectedResult.code}</code>
                    </pre>
                </div>
            )}
        </div>
    );
}

export default SemanticSearch;
