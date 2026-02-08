"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Invitation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Spinner from "@/components/ui/Spinner";
import {
  Plus,
  CalendarDays,
  Users,
  FileText,
  Send,
  MoreVertical,
  Eye,
  Pencil,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invitations", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setInvitations(Array.isArray(data) ? data : []))
      .catch(() => setInvitations([]))
      .finally(() => setLoading(false));
  }, []);

  async function handlePublish(id: string) {
    const res = await fetch(`/api/invitations/${id}/publish`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, published: true } : inv))
      );
      toast({ title: "Published", description: "Your invitation is now live.", variant: "success" });
    } else {
      toast({ title: "Error", description: "Failed to publish invitation.", variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const published = invitations.filter((i) => i.published).length;
  const drafts = invitations.length - published;
  const totalRsvps = invitations.reduce((sum, i) => sum + (i._count?.rsvps ?? 0), 0);

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Manage your event invitations</p>
      </div>

      {/* Stats Row */}
      {invitations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface px-6 py-5 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground leading-none">{invitations.length}</p>
              <p className="text-xs text-muted font-medium uppercase tracking-wide mt-1">Invitations</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface px-6 py-5 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-light">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground leading-none">{totalRsvps}</p>
              <p className="text-xs text-muted font-medium uppercase tracking-wide mt-1">Total RSVPs</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface px-6 py-5 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
              <Send className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground leading-none">
                {published}
                <span className="text-sm font-normal text-muted ml-1.5">/ {drafts} draft{drafts !== 1 ? "s" : ""}</span>
              </p>
              <p className="text-xs text-muted font-medium uppercase tracking-wide mt-1">Published</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-24 px-6 shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light mb-5">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-2 text-foreground">No invitations yet</h2>
          <p className="text-muted mb-8 text-center max-w-sm">
            Create your first event invitation and start collecting RSVPs from your guests.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/invitations/new" className="no-underline">
              <Plus className="w-4 h-4" />
              Create your first invitation
            </Link>
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Your Invitations</h2>
          <div className="space-y-4">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-border bg-surface shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center justify-between gap-4 p-6 flex-wrap">
                  {/* Event Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground text-lg truncate">{inv.eventName}</h3>
                      <Badge variant={inv.published ? "success" : "secondary"}>
                        {inv.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-muted">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        {inv.eventDate
                          ? new Date(inv.eventDate).toLocaleDateString(undefined, { dateStyle: "medium" })
                          : "No date set"}
                      </span>
                      {inv._count?.rsvps != null && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {inv._count.rsvps} RSVP{inv._count.rsvps !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {inv.published ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/i/${inv.slug}`} target="_blank" rel="noopener noreferrer" className="no-underline">
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handlePublish(inv.id)}>
                        <Send className="w-3.5 h-3.5" />
                        Publish
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/invitations/${inv.id}/edit`} className="no-underline">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invitations/${inv.id}/preview`} className="no-underline">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invitations/${inv.id}/rsvps`} className="no-underline">
                            <Users className="w-4 h-4 mr-2" />
                            RSVPs
                          </Link>
                        </DropdownMenuItem>
                        {inv.published && (
                          <DropdownMenuItem asChild>
                            <a href={`/i/${inv.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View live
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
