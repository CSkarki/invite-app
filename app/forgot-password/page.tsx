"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-serif text-3xl font-semibold text-foreground hover:text-accent transition-colors no-underline"
          >
            Nimantran
          </Link>
        </div>

        {sent ? (
          <div className="rounded-xl border border-border bg-surface p-8 shadow-card text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-light mb-4">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h1 className="font-serif text-xl font-semibold text-foreground mb-2">
              Check your email
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              If an account exists for <strong className="text-foreground">{email}</strong>,
              we&apos;ve sent a link to reset your password. Check your inbox and
              spam folder.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline no-underline font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to log in
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-8 shadow-card">
            <div className="mb-6">
              <h1 className="font-serif text-xl font-semibold text-foreground">
                Forgot password?
              </h1>
              <p className="text-sm text-muted mt-1">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-error bg-error-light px-3 py-2.5 text-sm text-error">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading ? "Sending\u2026" : "Send reset link"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline no-underline font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
