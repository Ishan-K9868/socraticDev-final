// Enhanced Gamification Types

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface League {
    tier: LeagueTier;
    name: string;
    icon: string;
    minXP: number;
    color: string;
    gradient: string;
}

export const LEAGUES: League[] = [
    { tier: 'bronze', name: 'Bronze', icon: '🥉', minXP: 0, color: 'text-orange-600', gradient: 'from-orange-600/20 to-orange-800/20' },
    { tier: 'silver', name: 'Silver', icon: '🥈', minXP: 500, color: 'text-neutral-400', gradient: 'from-neutral-400/20 to-neutral-600/20' },
    { tier: 'gold', name: 'Gold', icon: '🥇', minXP: 2000, color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-yellow-700/20' },
    { tier: 'platinum', name: 'Platinum', icon: '💎', minXP: 5000, color: 'text-cyan-400', gradient: 'from-cyan-400/20 to-cyan-600/20' },
    { tier: 'diamond', name: 'Diamond', icon: '👑', minXP: 10000, color: 'text-violet-400', gradient: 'from-violet-400/20 to-violet-600/20' },
];

export interface DailyQuest {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'challenges' | 'flashcards' | 'streak' | 'time';
    target: number;
    current: number;
    xpReward: number;
    completed: boolean;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: AchievementRarity;
    condition: {
        type: string;
        value: number;
    };
    unlockedAt?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    // Common
    { id: 'first_challenge', name: 'First Steps', description: 'Complete your first challenge', icon: '👶', rarity: 'common', condition: { type: 'challenges', value: 1 } },
    { id: 'five_challenges', name: 'Getting Warmed Up', description: 'Complete 5 challenges', icon: '🔥', rarity: 'common', condition: { type: 'challenges', value: 5 } },
    { id: 'first_flashcard', name: 'Memory Lane', description: 'Review your first flashcard', icon: '🃏', rarity: 'common', condition: { type: 'flashcards', value: 1 } },
    { id: 'streak_3', name: 'Hat Trick', description: 'Maintain a 3-day streak', icon: '🎩', rarity: 'common', condition: { type: 'streak', value: 3 } },

    // Rare
    { id: 'twenty_challenges', name: 'Dedicated Learner', description: 'Complete 20 challenges', icon: '📚', rarity: 'rare', condition: { type: 'challenges', value: 20 } },
    { id: 'fifty_flashcards', name: 'Card Collector', description: 'Review 50 flashcards', icon: '🎴', rarity: 'rare', condition: { type: 'flashcards', value: 50 } },
    { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚔️', rarity: 'rare', condition: { type: 'streak', value: 7 } },
    { id: 'silver_league', name: 'Rising Star', description: 'Reach Silver league', icon: '⭐', rarity: 'rare', condition: { type: 'xp', value: 500 } },

    // Epic
    { id: 'hundred_challenges', name: 'Century Club', description: 'Complete 100 challenges', icon: '💯', rarity: 'epic', condition: { type: 'challenges', value: 100 } },
    { id: 'streak_30', name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '🔥', rarity: 'epic', condition: { type: 'streak', value: 30 } },
    { id: 'gold_league', name: 'Golden Touch', description: 'Reach Gold league', icon: '🏆', rarity: 'epic', condition: { type: 'xp', value: 2000 } },
    { id: 'all_dojo', name: 'Dojo Master', description: 'Complete all 10 Dojo challenge types', icon: '🥷', rarity: 'epic', condition: { type: 'dojo_types', value: 10 } },

    // Legendary
    { id: 'streak_100', name: 'Legendary Dedication', description: 'Maintain a 100-day streak', icon: '👑', rarity: 'legendary', condition: { type: 'streak', value: 100 } },
    { id: 'diamond_league', name: 'Diamond Elite', description: 'Reach Diamond league', icon: '💎', rarity: 'legendary', condition: { type: 'xp', value: 10000 } },
    { id: 'thousand_reviews', name: 'Memory Master', description: 'Review 1000 flashcards', icon: '🧠', rarity: 'legendary', condition: { type: 'flashcards', value: 1000 } },
];

export const RARITY_COLORS: Record<AchievementRarity, { bg: string; text: string; glow: string }> = {
    common: { bg: 'bg-neutral-500/20', text: 'text-neutral-400', glow: '' },
    rare: { bg: 'bg-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    epic: { bg: 'bg-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
    legendary: { bg: 'bg-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/40 shadow-lg' },
};

export interface GamificationStats {
    totalXP: number;
    currentLeague: LeagueTier;
    weeklyXP: number;
    dailyQuests: DailyQuest[];
    unlockedAchievements: string[];
    questsResetAt: number;
}
