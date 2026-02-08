"use client";

import Link from "next/link";
import InvitationForm from "../InvitationForm";
import { ArrowLeft } from "lucide-react";

export default function NewInvitationPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors no-underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Create invitation</h1>
      </div>
      <InvitationForm />
    </div>
  );
}
