import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[v0] ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
          <div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-6">
            <h1 className="text-xl font-serif font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              The page failed to render. Details are below.
            </p>
            <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs text-foreground">
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
