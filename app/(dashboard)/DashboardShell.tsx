"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, LogOut } from "lucide-react";

interface DashboardShellProps {
  user: AppUser;
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  const initials = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface backdrop-blur-sm shadow-sm">
        <Link
          href="/dashboard"
          className="font-serif text-xl font-semibold text-foreground hover:text-accent transition-colors no-underline"
        >
          Nimantran
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link href="/dashboard/invitations/new" className="no-underline">
              <Plus className="w-4 h-4" />
              New Invitation
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-light text-accent text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-error cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
