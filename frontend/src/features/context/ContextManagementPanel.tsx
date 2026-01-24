import { useState, useCallback, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { graphragAPI, ContextResponse } from '../../services';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Badge from '../../ui/Badge';

interface ContextManagementPanelProps {
    projectId: string;
    query?: string;
    tokenBudget?: number;
    onContextUpdate?: (context: ContextResponse) => void;
}

function ContextManagementPanel({
    projectId,
    query = '',
    tokenBudget = 8000,
    onContextUpdate,
}: ContextManagementPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [contextData, setContextData] = useState<ContextResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());
    const [expandedEntity, setExpandedEntity] = useState<string | null>(null);
    const [customQuery, setCustomQuery] = useState(query);
    const [customBudget, setCustomBudget] = useState(tokenBudget);

    // Load context when query changes
    useEffect(() => {
        if (query && projectId) {
            loadContext(query, tokenBudget);
        }
    }, [query, projectId, tokenBudget]);

    const loadContext = useCallback(async (searchQuery: string, budget: number) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await graphragAPI.retrieveContext({
                project_id: projectId,
                query: searchQuery.trim(),
                token_budget: budget,
            });

            setContextData(response);
            setSelectedEntities(new Set(response.entities.map(e => e.id)));
            onContextUpdate?.(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load context');
        } finally {
            setLoading(false);
        }
    }, [projectId, onContextUpdate]);

    const handleRetrieveContext = useCallback(() => {
        loadContext(customQuery, customBudget);
    }, [customQuery, customBudget, loadContext]);

    const toggleEntitySelection = useCallback((entityId: string) => {
        setSelectedEntities(prev => {
            const next = new Set(prev);
            if (next.has(entityId)) {
                next.delete(entityId);
            } else {
                next.add(entityId);
            }
            return next;
        });
    }, []);

    const toggleExpanded = useCallback((entityId: string) => {
        setExpandedEntity(prev => prev === entityId ? null : entityId);
    }, []);

    useGSAP(() => {
        gsap.from(containerRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
        });
    }, { scope: containerRef });

    const selectedTokenCount = contextData?.entities
        .filter(e => selectedEntities.has(e.id))
        .reduce((sum, e) => sum + (e.code?.split(' ').length || 0), 0) || 0;

    const isBudgetExceeded = selectedTokenCount > customBudget;

    return (
        <div ref={containerRef} className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[color:var(--color-border)] space-y-3">
                <h3 className="font-display font-semibold">Context Management</h3>

                {/* Query Input */}
                <div className="space-y-2">
                    <input
                        type="text"
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        placeholder="Enter query to retrieve context..."
                        className="w-full px-3 py-2 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] text-sm focus:border-primary-500 focus:outline-none"
                        disabled={loading}
                    />

                    {/* Token Budget */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-[color:var(--color-text-muted)]">Token Budget:</label>
                        <input
                            type="number"
                            value={customBudget}
                            onChange={(e) => setCustomBudget(Number(e.target.value))}
                            min={1000}
                            max={32000}
                            step={1000}
                            className="flex-1 px-3 py-1 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] text-sm focus:border-primary-500 focus:outline-none"
                            disabled={loading}
                        />
                    </div>

                    <Button
                        onClick={handleRetrieveContext}
                        disabled={loading || !customQuery.trim()}
                        className="w-full"
                        size="sm"
                    >
                        {loading ? 'Loading...' : 'Retrieve Context'}
                    </Button>
                </div>

                {/* Token Usage Display */}
                {contextData && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[color:var(--color-text-muted)]">Token Usage</span>
                            <span className={isBudgetExceeded ? 'text-error font-medium' : ''}>
                                {selectedTokenCount.toLocaleString()} / {customBudget.toLocaleString()}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 rounded-full bg-[color:var(--color-bg-muted)] overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${
                                    isBudgetExceeded ? 'bg-error' : 'bg-primary-500'
                                }`}
                                style={{ width: `${Math.min((selectedTokenCount / customBudget) * 100, 100)}%` }}
                            />
                        </div>

                        {isBudgetExceeded && (
                            <Badge variant="error" className="w-full justify-center">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Budget exceeded! Deselect some entities.
                            </Badge>
                        )}

                        <div className="text-xs text-[color:var(--color-text-muted)]">
                            {selectedEntities.size} of {contextData.entities.length} entities selected
                        </div>
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

            {/* Entities List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {contextData?.entities.map((entity) => {
                    const isSelected = selectedEntities.has(entity.id);
                    const isExpanded = expandedEntity === entity.id;
                    const tokenCount = entity.code?.split(' ').length || 0;

                    return (
                        <Card
                            key={entity.id}
                            className={`overflow-hidden transition-all ${
                                isSelected ? 'border-primary-500' : ''
                            }`}
                        >
                            <div className="p-3 space-y-2">
                                {/* Header */}
                                <div className="flex items-start gap-2">
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleEntitySelection(entity.id)}
                                        className="mt-1 w-4 h-4 rounded border-[color:var(--color-border)] text-primary-500 focus:ring-primary-500"
                                    />

                                    {/* Entity Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-medium truncate">{entity.name}</h4>
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-[color:var(--color-bg-muted)] capitalize">
                                                {entity.type}
                                            </span>
                                            {entity.relevance_score !== undefined && (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-500/10 text-primary-500">
                                                    {(entity.relevance_score * 100).toFixed(0)}% relevant
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-[color:var(--color-text-muted)] mt-1 truncate">
                                            {entity.file_path}
                                        </p>

                                        <div className="flex items-center gap-3 mt-2 text-xs text-[color:var(--color-text-muted)]">
                                            <span>Lines {entity.start_line}-{entity.end_line}</span>
                                            <span>•</span>
                                            <span>{tokenCount} tokens</span>
                                        </div>
                                    </div>

                                    {/* Expand button */}
                                    {entity.code && (
                                        <button
                                            onClick={() => toggleExpanded(entity.id)}
                                            className="p-1 rounded hover:bg-[color:var(--color-bg-muted)] transition-colors"
                                        >
                                            <svg
                                                className={`w-4 h-4 transition-transform ${
                                                    isExpanded ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Expanded Code View */}
                                {isExpanded && entity.code && (
                                    <div className="mt-3 pt-3 border-t border-[color:var(--color-border)]">
                                        <pre className="text-xs bg-[color:var(--color-bg-muted)] p-3 rounded-lg overflow-x-auto">
                                            <code>{entity.code}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}

                {/* Empty state */}
                {!loading && !error && !contextData && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-[color:var(--color-text-muted)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-[color:var(--color-text-muted)]">No context loaded</p>
                        <p className="text-sm text-[color:var(--color-text-muted)]">Enter a query to retrieve relevant context</p>
                    </div>
                )}

                {!loading && !error && contextData && contextData.entities.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-[color:var(--color-text-muted)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-[color:var(--color-text-muted)]">No entities found</p>
                        <p className="text-sm text-[color:var(--color-text-muted)]">Try a different query</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {contextData && contextData.entities.length > 0 && (
                <div className="p-4 border-t border-[color:var(--color-border)] space-y-2">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEntities(new Set(contextData.entities.map(e => e.id)))}
                            className="flex-1"
                        >
                            Select All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEntities(new Set())}
                            className="flex-1"
                        >
                            Deselect All
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContextManagementPanel;
