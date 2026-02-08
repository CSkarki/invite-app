"use client";

import Link from "next/link";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Something went wrong</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.25rem",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          style={{
            padding: "0.5rem 1.25rem",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
