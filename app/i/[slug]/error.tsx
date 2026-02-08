"use client";

interface InviteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InviteError({ error, reset }: InviteErrorProps) {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Unable to load invitation
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        {error.message || "Something went wrong while loading this invitation."}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "0.6rem 1.5rem",
          background: "var(--accent)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
