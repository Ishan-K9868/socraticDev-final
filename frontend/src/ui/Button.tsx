import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    isLoading?: boolean;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow-primary',
    secondary: 'border-2 border-current text-[color:var(--color-text-primary)] hover:bg-neutral-100 dark:hover:bg-neutral-800',
    ghost: 'text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-muted)]',
    danger: 'bg-error text-white hover:bg-red-600',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            icon,
            iconPosition = 'left',
            isLoading = false,
            fullWidth = false,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-none gsap-element';

        return (
            <button
                ref={ref}
                className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && icon}
                        {children}
                        {icon && iconPosition === 'right' && icon}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
