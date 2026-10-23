"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, Suspense } from "react";

const AdminPage = dynamic(() => import("@/pages/AdminPage"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  ),
});

class AdminErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-lg rounded-xl border border-destructive/30 bg-card p-6 text-left shadow-sm">
            <h1 className="text-lg font-semibold text-destructive">
              Administrace spadla
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Obnovte stránku (Cmd+Shift+R). Pokud problém zůstane, zkopírujte chybu:
            </p>
            <pre className="mt-4 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminClient() {
  return (
    <AdminErrorBoundary>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        }
      >
        <AdminPage />
      </Suspense>
    </AdminErrorBoundary>
  );
}
