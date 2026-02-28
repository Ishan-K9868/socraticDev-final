// Custom SVG Icons for The Dojo challenges
// Each icon is designed to match the challenge theme

interface IconProps {
    className?: string;
    size?: number;
}

// Parsons Problem - Puzzle pieces
export function ParsonsIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M10 3H4a1 1 0 00-1 1v6a1 1 0 001 1h1.5a1.5 1.5 0 010 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-1.5a1.5 1.5 0 013 0V21a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1h-1.5a1.5 1.5 0 010-3H21a1 1 0 001-1V4a1 1 0 00-1-1h-6a1 1 0 00-1 1v1.5a1.5 1.5 0 01-3 0V4a1 1 0 00-1-1z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Code Surgery - Scalpel/knife
export function SurgeryIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M4 20l8-8m0 0l6-6m-6 6l3-3m-3 3l-3 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M18 6l2-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <circle cx="19" cy="5" r="1.5" fill="currentColor" />
            <path
                d="M6 18a2 2 0 100-4 2 2 0 000 4z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    );
}

// ELI5 Mode - Child/simple face
export function ELI5Icon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" />
            <path
                d="M8 15c1.5 2 6.5 2 8 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

// Fill the Blanks - Pencil writing
export function FadedIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Mental Compiler - Brain
export function MentalIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M12 4.5c-3.5 0-6 2.5-6 5.5 0 1.5.5 2.8 1.5 3.8.5.5.8 1.2.8 2v2.2a2 2 0 002 2h3.4a2 2 0 002-2v-2.2c0-.8.3-1.5.8-2 1-1 1.5-2.3 1.5-3.8 0-3-2.5-5.5-6-5.5z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path d="M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 17.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path
                d="M12 4.5V2M18 8h2M4 8h2M16 4l1.5-1.5M8 4L6.5 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

// Rubber Duck - Duck shape
export function DuckIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M8 14c-2 0-4 1-4 3s2 4 6 4 8-2 8-4-1-3-3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="13" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="11" cy="9" r="1" fill="currentColor" />
            <path
                d="M16 11c1 0 2-.5 2-1.5S17 8 16 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

// Code Translation - Globe with code
export function TranslationIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M3 12h18M12 3c-2 2-3 5-3 9s1 7 3 9m0-18c2 2 3 5 3 9s-1 7-3 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M4 7h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

// Pattern Detective - Magnifying glass
export function PatternIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M15.5 15.5L21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M7 8h6M7 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

// Big O Battle - Chart/graph
export function BigOIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M3 3v18h18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7 17V14M11 17V11M15 17V8M19 17V5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

// TDD Challenge - Test tube/flask
export function TDDIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M9 2v5.172a2 2 0 01-.586 1.414L5.5 11.5c-1.5 1.5-2 3-2 4.5 0 3 2.5 5 6.5 5s6.5-2 6.5-5c0-1.5-.5-3-2-4.5l-2.914-2.914A2 2 0 0111 7.172V2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path d="M7 2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="16.5" r="1" fill="currentColor" />
            <circle cx="11" cy="18" r="1" fill="currentColor" />
        </svg>
    );
}

// Council of Dead Engineers - Ancient pillars / council chamber
export function CouncilIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            {/* Pediment / roof */}
            <path
                d="M2 8l10-5 10 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Columns */}
            <path d="M4 8v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 8v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 8v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 8v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M20 8v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {/* Base */}
            <path
                d="M2 19h20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Entablature */}
            <path d="M3 8h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

// Dojo Icon - Training/martial arts
export function DojoIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M12 2L4 6v4c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Export all icons as a map for easy access
export const ChallengeIcons = {
    parsons: ParsonsIcon,
    surgery: SurgeryIcon,
    eli5: ELI5Icon,
    faded: FadedIcon,
    mental: MentalIcon,
    'rubber-duck': DuckIcon,
    translation: TranslationIcon,
    pattern: PatternIcon,
    bigo: BigOIcon,
    tdd: TDDIcon,
    council: CouncilIcon,
    dojo: DojoIcon
};

export type ChallengeIconType = keyof typeof ChallengeIcons;
