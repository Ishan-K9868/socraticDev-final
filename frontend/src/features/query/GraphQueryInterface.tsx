import { useState, useCallback, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { graphragAPI, Entity } from '../../services';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface GraphQueryInterfaceProps {
    projectId: string;
    onEntitySelect?: (entity: Entity) => void;
}

type QueryType = 'callers' | 'dependencies' | 'impact';

function GraphQueryInterface({ projectId, onEntitySelect }: GraphQueryInterfaceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [queryType, setQueryType] = useState<QueryType>('callers');
    const [entityName, setEntityName] = useState('');
    const [results, setResults] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const handleQuery = useCallback(async () => {
        if (!entityName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            let queryResults: Entity[] = [];

            switch (queryType) {
                case 'callers':
                    queryResults = await graphragAPI.findCallers({
                        project_id: projectId,
                        entity_name: entityName.trim(),
                    });
                    break;
                case 'dependencies':
                    queryResults = await graphragAPI.findDependencies({
                        project_id: projectId,
                        entity_name: entityName.trim(),
                    });
                    break;
                case 'impact':
                    queryResults = await graphragAPI.impactAnalysis({
                        project_id: projectId,
                        entity_name: entityName.trim(),
                    });
                    break;
            }

            setResults(queryResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Query failed');
        } finally {
            setLoading(false);
        }
    }, [projectId, queryType, entityName]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleQuery();
        }
    }, [handleQuery]);

    const toggleExpanded = useCallback((id: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleEntityClick = useCallback((entity: Entity) => {
        onEntitySelect?.(entity);
    }, [onEntitySelect]);

    useGSAP(() => {
        gsap.from(containerRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    const getQueryDescription = () => {
        switch (queryType) {
            case 'callers':
                return 'Find all functions/methods that call this entity';
            case 'dependencies':
                return 'Find all entities that this entity depends on';
            case 'impact':
                return 'Analyze the impact of changes to this entity';
        }
    };

    const getQueryIcon = () => {
        switch (queryType) {
            case 'callers':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                );
            case 'dependencies':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                );
            case 'impact':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
        }
    };

    return (
        <div ref={containerRef} className="h-full flex flex-col">
            {/* Query Type Selector */}
            <div className="p-4 border-b border-[color:var(--color-border)] space-y-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => setQueryType('callers')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            queryType === 'callers'
                                ? 'bg-primary-500 text-white'
                                : 'bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)]'
                        }`}
                    >
                        Find Callers
                    </button>
                    <button
                        onClick={() => setQueryType('dependencies')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            queryType === 'dependencies'
                                ? 'bg-primary-500 text-white'
                                : 'bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)]'
                        }`}
                    >
                        Dependencies
                    </button>
                    <button
                        onClick={() => setQueryType('impact')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            queryType === 'impact'
                                ? 'bg-primary-500 text-white'
                                : 'bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-bg-elevated)]'
                        }`}
                    >
                        Impact Analysis
                    </button>
                </div>

                {/* Description */}
                <div className="flex items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
                    {getQueryIcon()}
                    <span>{getQueryDescription()}</span>
                </div>

                {/* Entity Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={entityName}
                        onChange={(e) => setEntityName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter entity name (e.g., MyClass.myMethod)"
                        className="flex-1 px-4 py-2 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] focus:border-primary-500 focus:outline-none"
                        disabled={loading}
                    />
                    <Button onClick={handleQuery} disabled={loading || !entityName.trim()}>
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            'Query'
                        )}
                    </Button>
                </div>

                {/* Result count */}
                {results.length > 0 && (
                    <div className="text-sm text-[color:var(--color-text-muted)]">
                        Found {results.length} result{results.length !== 1 ? 's' : ''}
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

            {/* Results - Tree/List View */}
            <div className="flex-1 overflow-y-auto p-4">
                {results.length > 0 ? (
                    <div className="space-y-2">
                        {results.map((entity, index) => {
                            const isExpanded = expandedItems.has(entity.id);
                            const hasCode = !!entity.code;

                            return (
                                <Card key={entity.id} className="overflow-hidden">
                                    <div
                                        className="flex items-start justify-between cursor-pointer hover:bg-[color:var(--color-bg-muted)] p-3 transition-colors"
                                        onClick={() => hasCode && toggleExpanded(entity.id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {/* Expand icon */}
                                                {hasCode && (
                                                    <svg
                                                        className={`w-4 h-4 transition-transform ${
                                                            isExpanded ? 'rotate-90' : ''
                                                        }`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                )}
                                                
                                                {/* Index */}
                                                <span className="text-xs text-[color:var(--color-text-muted)] font-mono">
                                                    {index + 1}.
                                                </span>

                                                {/* Entity name */}
                                                <h4 className="font-medium truncate">{entity.name}</h4>

                                                {/* Entity type badge */}
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-[color:var(--color-bg-muted)] capitalize">
                                                    {entity.type}
                                                </span>
                                            </div>

                                            {/* File path */}
                                            <p className="text-xs text-[color:var(--color-text-muted)] mt-1 ml-6 truncate">
                                                {entity.file_path} (lines {entity.start_line}-{entity.end_line})
                                            </p>
                                        </div>

                                        {/* View button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEntityClick(entity);
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </Button>
                                    </div>

                                    {/* Expanded code view */}
                                    {isExpanded && entity.code && (
                                        <div className="border-t border-[color:var(--color-border)] p-3 bg-[color:var(--color-bg-muted)]">
                                            <pre className="text-xs overflow-x-auto">
                                                <code>{entity.code}</code>
                                            </pre>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty state */
                    !loading && !error && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[color:var(--color-bg-muted)] flex items-center justify-center">
                                {getQueryIcon()}
                            </div>
                            <p className="text-[color:var(--color-text-muted)]">
                                {entityName ? 'No results found' : 'Enter an entity name to query'}
                            </p>
                            <p className="text-sm text-[color:var(--color-text-muted)] mt-2">
                                {queryType === 'callers' && 'Find which functions call this entity'}
                                {queryType === 'dependencies' && 'Find what this entity depends on'}
                                {queryType === 'impact' && 'Analyze the impact of changes'}
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default GraphQueryInterface;
