"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <h1 className="font-serif text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-muted mb-6 max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-accent text-accent-foreground rounded-lg border-none text-sm font-medium cursor-pointer hover:brightness-110 transition-all shadow-sm"
      >
        Try again
      </button>
    </main>
  );
}
