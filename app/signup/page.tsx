"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Sign up failed.");
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
            Create invitations your guests will love
          </h2>
          <p className="text-base opacity-80 max-w-md leading-relaxed">
            Beautiful themes, RSVP collection, and a drag-and-drop image builder
            — all free.
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
              Create your account
            </h1>
            <p className="text-sm text-muted mt-1">
              Get started with your first invitation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name <span className="text-muted font-normal">(optional)</span></Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
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

            {error && (
              <div className="rounded-lg border border-error bg-error-light px-3 py-2.5 text-sm text-error">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? "Creating account\u2026" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:underline no-underline font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
