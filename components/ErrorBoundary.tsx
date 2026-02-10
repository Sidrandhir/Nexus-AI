import React, { ReactNode, ReactElement } from 'react';
import { Icons } from '../constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service here (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <div className="max-w-md p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/50">
            <div className="flex gap-4 items-start">
              <Icons.Shield className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  An unexpected error occurred. Please try refreshing the page.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-[13px] font-mono text-red-400">{this.state.error.message}</p>
                    {this.state.error.stack && (
                      <pre className="mt-2 text-[12px] text-red-300 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
