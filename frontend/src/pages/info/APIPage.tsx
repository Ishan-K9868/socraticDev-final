import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// API Reference page with endpoint documentation
function APIPage() {
    const endpoints = [
        {
            category: 'Chat',
            description: 'AI-powered conversation endpoints',
            items: [
                {
                    method: 'POST',
                    path: '/api/chat/message',
                    description: 'Send a message and receive an AI response',
                    parameters: [
                        { name: 'message', type: 'string', required: true, description: 'The user message content' },
                        { name: 'mode', type: '"learning" | "building"', required: true, description: 'Chat mode' },
                        { name: 'context', type: 'string', required: false, description: 'Project context' },
                    ],
                    response: '{ response: string, mode: string, timestamp: number }'
                },
                {
                    method: 'GET',
                    path: '/api/chat/history',
                    description: 'Retrieve conversation history',
                    parameters: [
                        { name: 'conversationId', type: 'string', required: true, description: 'Conversation ID' },
                    ],
                    response: '{ messages: Message[], createdAt: number }'
                }
            ]
        },
        {
            category: 'Dojo',
            description: 'Challenge generation and validation',
            items: [
                {
                    method: 'POST',
                    path: '/api/dojo/generate',
                    description: 'Generate a new challenge',
                    parameters: [
                        { name: 'type', type: 'ChallengeType', required: true, description: 'Type of challenge' },
                        { name: 'difficulty', type: '"easy" | "medium" | "hard"', required: true, description: 'Difficulty level' },
                        { name: 'topic', type: 'string', required: false, description: 'Specific topic' },
                    ],
                    response: '{ challenge: Challenge, id: string }'
                },
                {
                    method: 'POST',
                    path: '/api/dojo/validate',
                    description: 'Validate a challenge submission',
                    parameters: [
                        { name: 'challengeId', type: 'string', required: true, description: 'Challenge ID' },
                        { name: 'answer', type: 'string | object', required: true, description: 'User submission' },
                    ],
                    response: '{ correct: boolean, feedback: string, xp: number }'
                }
            ]
        },
        {
            category: 'Analytics',
            description: 'Learning progress and statistics',
            items: [
                {
                    method: 'GET',
                    path: '/api/analytics/progress',
                    description: 'Get user learning progress',
                    parameters: [
                        { name: 'userId', type: 'string', required: true, description: 'User ID' },
                        { name: 'range', type: '"week" | "month" | "year"', required: false, description: 'Time range' },
                    ],
                    response: '{ xp: number, streak: number, skills: SkillMap }'
                },
                {
                    method: 'GET',
                    path: '/api/analytics/leaderboard',
                    description: 'Get global or league leaderboard',
                    parameters: [
                        { name: 'league', type: 'string', required: false, description: 'Filter by league' },
                        { name: 'limit', type: 'number', required: false, description: 'Number of results' },
                    ],
                    response: '{ users: LeaderboardEntry[], userRank: number }'
                }
            ]
        }
    ];

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-green-500/20 text-green-400';
            case 'POST': return 'bg-blue-500/20 text-blue-400';
            case 'PUT': return 'bg-yellow-500/20 text-yellow-400';
            case 'DELETE': return 'bg-red-500/20 text-red-400';
            default: return 'bg-neutral-500/20 text-neutral-400';
        }
    };

    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container-custom">
                    {/* Header */}
                    <div className="max-w-3xl mb-12">
                        <h1 className="font-display text-display-md font-bold mb-4">
                            API Reference
                        </h1>
                        <p className="text-lg text-[color:var(--color-text-secondary)]">
                            Complete documentation for the SocraticDev API. Integrate our AI-powered learning tools into your own applications.
                        </p>
                    </div>

                    {/* Authentication Notice */}
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-12">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-yellow-500">Authentication Required</h3>
                                <p className="text-sm text-[color:var(--color-text-secondary)]">
                                    All API requests require a valid API key. Get your key from the{' '}
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                                        Google AI Studio
                                    </a>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Endpoints */}
                    <div className="space-y-12">
                        {endpoints.map((category) => (
                            <div key={category.category}>
                                <div className="mb-6">
                                    <h2 className="font-display text-2xl font-bold">{category.category}</h2>
                                    <p className="text-[color:var(--color-text-muted)]">{category.description}</p>
                                </div>

                                <div className="space-y-4">
                                    {category.items.map((endpoint) => (
                                        <div key={endpoint.path} className="p-6 rounded-xl bg-[color:var(--color-bg-secondary)] border border-[color:var(--color-border)]">
                                            {/* Endpoint Header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${getMethodColor(endpoint.method)}`}>
                                                    {endpoint.method}
                                                </span>
                                                <code className="font-mono text-primary-400">{endpoint.path}</code>
                                            </div>

                                            <p className="text-[color:var(--color-text-secondary)] mb-4">{endpoint.description}</p>

                                            {/* Parameters */}
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                                                <div className="bg-[color:var(--color-bg-muted)] rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-[color:var(--color-border)]">
                                                                <th className="px-4 py-2 text-left font-medium">Name</th>
                                                                <th className="px-4 py-2 text-left font-medium">Type</th>
                                                                <th className="px-4 py-2 text-left font-medium">Required</th>
                                                                <th className="px-4 py-2 text-left font-medium">Description</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {endpoint.parameters.map((param) => (
                                                                <tr key={param.name} className="border-b border-[color:var(--color-border)] last:border-0">
                                                                    <td className="px-4 py-2 font-mono text-cyan-400">{param.name}</td>
                                                                    <td className="px-4 py-2 font-mono text-yellow-400">{param.type}</td>
                                                                    <td className="px-4 py-2">
                                                                        {param.required ? (
                                                                            <span className="text-green-400">Yes</span>
                                                                        ) : (
                                                                            <span className="text-[color:var(--color-text-muted)]">No</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-[color:var(--color-text-muted)]">{param.description}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Response */}
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Response</h4>
                                                <pre className="p-3 bg-neutral-900 rounded-lg font-mono text-sm text-green-400 overflow-x-auto">
                                                    {endpoint.response}
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default APIPage;
