"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InviteView from "@/components/InviteView";
import type { Invitation } from "@/types";
import Spinner from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface PreviewInvitationPageProps {
  params: { id: string };
}

export default function PreviewInvitationPage({ params }: PreviewInvitationPageProps) {
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
    <div className="-mx-6 -mt-8">
      <div className="px-6 py-4 bg-surface border-b border-border">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-sm text-muted">Preview</p>
          <Badge variant="secondary">Draft</Badge>
        </div>
      </div>
      <InviteView invitation={invitation} />
    </div>
  );
}
