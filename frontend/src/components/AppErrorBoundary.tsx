import React, { ErrorInfo, ReactNode } from 'react';
import { generateId } from '../utils/generateId';

interface AppErrorBoundaryProps {
    children: ReactNode;
}

interface AppErrorBoundaryState {
    hasError: boolean;
    errorId: string;
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    constructor(props: AppErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            errorId: '',
        };
    }

    static getDerivedStateFromError(): Partial<AppErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const errorId = generateId().slice(0, 8);
        this.setState({ errorId });
        console.error(`[AppErrorBoundary:${errorId}]`, error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-bg-primary)] px-4">
                    <div className="max-w-lg w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 text-center shadow-md">
                        <h1 className="text-2xl font-display font-bold mb-3">Something went wrong</h1>
                        <p className="text-[color:var(--color-text-secondary)] mb-6">
                            The app hit an unexpected error. Reload to recover.
                        </p>
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                            >
                                Reload App
                            </button>
                            <a
                                href="/"
                                className="px-4 py-2 rounded-md border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-muted)] transition-colors"
                            >
                                Go Home
                            </a>
                        </div>
                        <p className="text-xs text-[color:var(--color-text-muted)]">
                            Error reference: {this.state.errorId || 'unknown'}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;

