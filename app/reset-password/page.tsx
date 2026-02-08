"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/Spinner";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        setInvalidLink(true);
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/login?reset=ok");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!ready && !invalidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Spinner size={32} />
      </div>
    );
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

        {invalidLink ? (
          <div className="rounded-xl border border-border bg-surface p-8 shadow-card text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-light mb-4">
              <ShieldCheck className="w-6 h-6 text-error" />
            </div>
            <h1 className="font-serif text-xl font-semibold text-foreground mb-2">
              Invalid or expired link
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/forgot-password"
                className="text-sm text-accent hover:underline no-underline font-medium"
              >
                Request new link
              </Link>
              <span className="text-border">|</span>
              <Link
                href="/login"
                className="text-sm text-accent hover:underline no-underline font-medium"
              >
                Log in
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-8 shadow-card">
            <div className="mb-6">
              <h1 className="font-serif text-xl font-semibold text-foreground">
                Set new password
              </h1>
              <p className="text-sm text-muted mt-1">
                Choose a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-error bg-error-light px-3 py-2.5 text-sm text-error">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading ? "Updating\u2026" : "Update password"}
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
