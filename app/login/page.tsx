"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reset") === "ok") {
      setSuccess("Password updated. You can log in with your new password.");
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent relative flex-col justify-between p-12 text-accent-foreground">
        <div>
          <Link
            href="/"
            className="font-serif text-2xl font-semibold text-accent-foreground no-underline"
          >
            Nimantran
          </Link>
        </div>
        <div className="space-y-4">
          <Sparkles className="h-10 w-10 opacity-80" />
          <h2 className="font-serif text-3xl font-semibold leading-tight">
            Beautiful invitations, effortlessly shared
          </h2>
          <p className="text-base opacity-80 max-w-md leading-relaxed">
            Create stunning invites, collect RSVPs, and manage your guest list —
            all in one place.
          </p>
        </div>
        <p className="text-sm opacity-60">
          &copy; {new Date().getFullYear()} Nimantran
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="text-center mb-10 lg:hidden">
            <Link
              href="/"
              className="font-serif text-3xl font-semibold text-foreground hover:text-accent transition-colors no-underline"
            >
              Nimantran
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted mt-1">
              Log in to manage your invitations
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
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent hover:underline no-underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {success && (
              <div className="rounded-lg border border-success bg-success-light px-3 py-2.5 text-sm text-success">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-error bg-error-light px-3 py-2.5 text-sm text-error">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? "Signing in\u2026" : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-accent hover:underline no-underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
