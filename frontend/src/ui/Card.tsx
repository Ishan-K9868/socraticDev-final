import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: 'default' | 'glass' | 'terminal';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

interface CardHeaderProps {
    children?: ReactNode;
    title?: string;
    subtitle?: string;
    action?: ReactNode;
}

interface CardTerminalHeaderProps {
    title?: string;
    showDots?: boolean;
}

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

function Card({
    children,
    variant = 'default',
    padding = 'md',
    hover = true,
    className = '',
    ...props
}: CardProps) {
    const baseStyles = 'rounded-2xl transition-none gsap-element';

    const variantStyles = {
        default: `
      bg-[color:var(--color-bg-secondary)]
      border border-[color:var(--color-border)]
      ${hover ? 'hover:border-[color:var(--color-border-hover)] hover:shadow-elevated' : ''}
    `,
        glass: `
      glass
      ${hover ? 'hover:bg-[color:var(--glass-bg)]' : ''}
    `,
        terminal: `
      bg-[color:var(--color-bg-secondary)]
      border border-[color:var(--color-border)]
      overflow-hidden
    `,
    };

    return (
        <div
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}

function CardHeader({ children, title, subtitle, action }: CardHeaderProps) {
    if (children) {
        return <div className="mb-4">{children}</div>;
    }

    return (
        <div className="flex items-start justify-between mb-4">
            <div>
                {title && <h3 className="font-display text-lg font-semibold">{title}</h3>}
                {subtitle && (
                    <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

function CardTerminalHeader({ title = 'Terminal', showDots = true }: CardTerminalHeaderProps) {
    return (
        <div className="px-4 py-3 flex items-center gap-3 bg-[color:var(--color-bg-muted)] border-b border-[color:var(--color-border)]">
            {showDots && (
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
            )}
            <span className="text-sm text-[color:var(--color-text-secondary)] font-mono">
                {title}
            </span>
        </div>
    );
}

function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
}

function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`mt-4 pt-4 border-t border-[color:var(--color-border)] ${className}`}>
            {children}
        </div>
    );
}

Card.Header = CardHeader;
Card.TerminalHeader = CardTerminalHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
