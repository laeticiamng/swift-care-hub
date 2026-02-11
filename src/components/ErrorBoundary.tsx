import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[UrgenceOS] Erreur non interceptée :', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Une erreur est survenue
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                L'application a rencontré un problème inattendu. Aucune donnée patient n'a été perdue.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground text-left font-mono overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCcw className="h-4 w-4" />
                Recharger
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
              >
                <Home className="h-4 w-4" />
                Accueil
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Si le problème persiste, contactez{' '}
              <a href="mailto:support@emotionscare.com" className="text-primary hover:underline">
                support@emotionscare.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
