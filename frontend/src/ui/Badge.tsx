import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    icon?: ReactNode;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-secondary)]',
    primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    secondary: 'bg-secondary-500/10 text-secondary-600 dark:text-secondary-400',
    accent: 'bg-accent-500/10 text-accent-600 dark:text-accent-400',
    success: 'bg-success/10 text-green-600 dark:text-green-400',
    warning: 'bg-warning/10 text-yellow-600 dark:text-yellow-400',
    error: 'bg-error/10 text-red-600 dark:text-red-400',
};

function Badge({ children, variant = 'default', icon, className = '' }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
        ${variantStyles[variant]}
        ${className}
      `}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>
    );
}

export default Badge;
