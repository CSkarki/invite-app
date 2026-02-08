"use client";

import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "relative rounded-lg border bg-surface p-4 pr-8 shadow-lg animate-in slide-in-from-bottom-5 fade-in-0",
            t.variant === "destructive" && "border-error bg-error-light text-error",
            t.variant === "success" && "border-success bg-success-light text-success",
            (!t.variant || t.variant === "default") && "border-border"
          )}
        >
          {t.title && <p className="text-sm font-semibold">{t.title}</p>}
          {t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}
          <button
            onClick={() => dismiss(t.id)}
            className="absolute top-2 right-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
