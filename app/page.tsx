import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  CalendarDays,
  Palette,
  Send,
  Users,
  Smartphone,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background w-full antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-serif text-xl font-semibold text-foreground transition-colors hover:text-accent"
          >
            Nimantran
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:brightness-110"
            >
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-light via-transparent to-transparent" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-accent">
              Event invitations, simplified
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Beautiful invitations,{" "}
              <span className="text-accent">effortlessly shared</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Create stunning invites, collect RSVPs, and manage your guest list in one place. Free to use.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:brightness-110"
              >
                <Sparkles className="h-4 w-4" />
                Create your first invitation
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-border bg-surface px-6 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-background"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-border bg-surface py-24 px-6 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Everything you need
            </p>
            <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-foreground lg:text-4xl">
              From design to RSVP tracking
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
              One place to design, share, and manage your event invitations.
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              <FeatureCard
                icon={<Palette className="h-5 w-5 text-accent" />}
                title="Beautiful themes"
                description="Curated themes and layouts. Customize colors and fonts to match your event."
              />
              <FeatureCard
                icon={<Users className="h-5 w-5 text-accent" />}
                title="RSVP collection"
                description="Guests RSVP from the invite. Track responses in real time."
              />
              <FeatureCard
                icon={<CalendarDays className="h-5 w-5 text-accent" />}
                title="Event details"
                description="Date, time, and location — clearly presented for your guests."
              />
              <FeatureCard
                icon={<Sparkles className="h-5 w-5 text-accent" />}
                title="Image designer"
                description="Build custom invite images with templates and drag-and-drop."
              />
              <FeatureCard
                icon={<Send className="h-5 w-5 text-accent" />}
                title="Shareable links"
                description="Unique link per invite. Share via WhatsApp, email, or social."
              />
              <FeatureCard
                icon={<Smartphone className="h-5 w-5 text-accent" />}
                title="Mobile-friendly"
                description="Invites look great on every device."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 lg:py-32">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-foreground lg:text-4xl">
              Three steps to your invite
            </h2>
            <div className="mt-16 grid gap-16 md:grid-cols-3 md:gap-8">
              <StepCard
                step="1"
                title="Create"
                description="Add event details, pick a theme, and design your invitation."
              />
              <StepCard
                step="2"
                title="Share"
                description="Publish and share the unique link with your guests."
              />
              <StepCard
                step="3"
                title="Track"
                description="View RSVPs, export your list, and manage your event."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-surface py-24 px-6 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold text-foreground lg:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Create your first invitation in minutes. No credit card required.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" />
              Get started free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-serif text-muted-foreground">Nimantran</span>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nimantran. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-background p-8 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-light text-accent">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-semibold text-accent-foreground">
        {step}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}