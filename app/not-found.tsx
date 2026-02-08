import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <p className="font-serif text-lg text-muted mb-2">Nimantran</p>
      <h1 className="font-serif text-5xl font-semibold mb-2">404</h1>
      <p className="text-muted mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-accent text-accent-foreground rounded-lg no-underline text-sm font-medium hover:brightness-110 transition-all shadow-sm"
      >
        Go home
      </Link>
    </main>
  );
}
