"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Invitation } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/ui/Spinner";
import { ArrowLeft, Download, FileJson, Users } from "lucide-react";

interface RsvpRow {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  attending: string;
  message: string;
}

interface InvitationRsvpsPageProps {
  params: { id: string };
}

export default function InvitationRsvpsPage({ params }: InvitationRsvpsPageProps) {
  const { id } = params;
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/invitations/${id}`, { credentials: "include" }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`/api/invitations/${id}/rsvps`, { credentials: "include" }).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([inv, list]) => {
        setInvitation(inv);
        setRsvps(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
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

  const exportUrl = `/api/export?invitation_id=${id}`;
  const exportJsonUrl = `/api/export/json?invitation_id=${id}`;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors no-underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">RSVPs</h1>
            <p className="text-sm text-muted mt-0.5">{invitation.eventName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={exportUrl} download="rsvps.xlsx" className="no-underline">
                <Download className="w-3.5 h-3.5" />
                Excel
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={exportJsonUrl} download="rsvps.json" className="no-underline">
                <FileJson className="w-3.5 h-3.5" />
                JSON
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
        {rsvps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <p className="text-muted font-medium">No RSVPs yet</p>
            <p className="text-sm text-muted-foreground mt-1">RSVPs will appear here once guests respond.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase tracking-wide">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase tracking-wide">Attending</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase tracking-wide">Message</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-background transition-colors">
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{r.timestamp}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-muted">{r.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.attending?.toLowerCase() === "yes" ? "success" : "destructive"}>
                        {r.attending}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted max-w-xs truncate">{r.message || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
