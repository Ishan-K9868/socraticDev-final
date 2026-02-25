import { ChallengeSource } from './types';

interface ChallengeSourceBadgeProps {
    source: ChallengeSource;
    isFallback?: boolean;
    fallbackReason?: string;
}

function ChallengeSourceBadge({ source, isFallback = false, fallbackReason }: ChallengeSourceBadgeProps) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                    source === 'ai'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}
            >
                {source === 'ai' ? 'AI' : 'Practice'}
            </span>
            {isFallback && (
                <span
                    title={fallbackReason || 'AI failed, using local challenge'}
                    className="px-2 py-1 rounded-full text-xs font-semibold border bg-amber-500/10 text-amber-300 border-amber-500/30"
                >
                    Fallback Loaded
                </span>
            )}
        </div>
    );
}

export default ChallengeSourceBadge;
