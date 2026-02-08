"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InvitationForm from "../../InvitationForm";
import type { Invitation } from "@/types";
import Spinner from "@/components/ui/Spinner";
import { ArrowLeft } from "lucide-react";

interface EditInvitationPageProps {
  params: { id: string };
}

export default function EditInvitationPage({ params }: EditInvitationPageProps) {
  const { id } = params;
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/invitations/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setInvitation)
      .catch(() => setInvitation(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <p className="text-lg">Invitation not found.</p>
        <Link href="/dashboard" className="text-accent hover:underline mt-2 text-sm no-underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

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
        <h1 className="font-serif text-2xl font-semibold text-foreground">Edit invitation</h1>
      </div>
      <InvitationForm invitation={invitation} />
    </div>
  );
}
