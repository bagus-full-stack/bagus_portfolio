import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] text-white p-4">
          <div className="bg-[#1C232B] p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-red-500/20">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Une erreur inattendue est survenue</h1>
            <p className="text-gray-400 mb-6">Nous sommes désolés pour ce désagrément. Veuillez rafraîchir la page ou réessayer plus tard.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#E08A3E] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#c77a35] transition-colors"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
