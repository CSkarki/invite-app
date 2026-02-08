"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Invitation, Theme, ThemeConfig } from "@/types";
import styles from "./form.module.css";

const InviteView = dynamic(() => import("@/components/InviteView"), { ssr: false });
const InviteImageBuilder = dynamic(
  () => import("@/components/InviteImageBuilder"),
  { ssr: false }
);

interface FormValues {
  eventName: string;
  eventDate: string;
  eventTime: string;
  locationOrLink: string;
  message: string;
  imageUrl: string;
  slug: string;
  themeId: string;
  themeConfig: ThemeConfig;
}

const defaultValues: FormValues = {
  eventName: "",
  eventDate: "",
  eventTime: "",
  locationOrLink: "",
  message: "",
  imageUrl: "",
  slug: "",
  themeId: "classic",
  themeConfig: { accentColor: "#b8954a", showSubtitle: true },
};

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

interface InvitationFormProps {
  invitation?: Invitation;
  onSuccess?: (data: Invitation) => void;
}

export default function InvitationForm({ invitation, onSuccess }: InvitationFormProps) {
  const router = useRouter();
  const isEdit = !!invitation;
  const [themes, setThemes] = useState<Theme[]>([]);
  const [values, setValues] = useState<FormValues>(
    invitation
      ? {
          eventName: invitation.eventName ?? "",
          eventDate: formatDateForInput(invitation.eventDate),
          eventTime: invitation.eventTime ?? "",
          locationOrLink: invitation.locationOrLink ?? "",
          message: invitation.message ?? "",
          imageUrl: invitation.imageUrl ?? "",
          slug: invitation.slug ?? "",
          themeId: invitation.themeId ?? "classic",
          themeConfig:
            invitation.themeConfig && typeof invitation.themeConfig === "object"
              ? { ...defaultValues.themeConfig, ...invitation.themeConfig }
              : defaultValues.themeConfig,
        }
      : defaultValues
  );

  useEffect(() => {
    fetch("/api/themes", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setThemes(Array.isArray(data) ? data : []))
      .catch(() => setThemes([]));
  }, []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);

  function handleChange(field: keyof FormValues, value: string | ThemeConfig | undefined) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = isEdit ? `/api/invitations/${invitation!.id}` : "/api/invitations";
    const method = isEdit ? "PATCH" : "POST";
    const body = {
      eventName: values.eventName,
      eventDate: values.eventDate || null,
      eventTime: values.eventTime || null,
      locationOrLink: values.locationOrLink || null,
      message: values.message || null,
      imageUrl: values.imageUrl || null,
      slug: values.slug || undefined,
      themeId: values.themeId || null,
      themeConfig: values.themeConfig || null,
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      if (onSuccess) onSuccess(data);
      else if (isEdit) router.push("/dashboard");
      else router.push(`/dashboard/invitations/${data.id}/edit`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label}>Template</label>
      <div className={styles.templatePicker}>
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            className={
              values.themeId === t.id
                ? `${styles.templateCard} ${styles.templateCardSelected}`
                : styles.templateCard
            }
            onClick={() => handleChange("themeId", t.id)}
          >
            <span className={styles.templateName}>{t.name}</span>
            <span className={styles.templateDesc}>{t.description}</span>
          </button>
        ))}
      </div>
      <label className={styles.label}>Event name *</label>
      <input
        type="text"
        className={styles.input}
        value={values.eventName}
        onChange={(e) => handleChange("eventName", e.target.value)}
        required
      />
      <label className={styles.label}>Date & time</label>
      <input
        type="datetime-local"
        className={styles.input}
        value={values.eventDate}
        onChange={(e) => handleChange("eventDate", e.target.value)}
      />
      <label className={styles.label}>Time (text, e.g. 5:30 PM)</label>
      <input
        type="text"
        className={styles.input}
        value={values.eventTime}
        onChange={(e) => handleChange("eventTime", e.target.value)}
        placeholder="5:30 PM"
      />
      <label className={styles.label}>Location or link</label>
      <input
        type="text"
        className={styles.input}
        value={values.locationOrLink}
        onChange={(e) => handleChange("locationOrLink", e.target.value)}
        placeholder="Address or virtual meeting link"
      />
      <label className={styles.label}>Invitation message</label>
      <textarea
        className={styles.textarea}
        value={values.message}
        onChange={(e) => handleChange("message", e.target.value)}
        rows={4}
        placeholder="With love and gratitude, please join us..."
      />
      <label className={styles.label}>Cover image</label>
      <div className={styles.imageOptions}>
        <div className={styles.coverSourceRow}>
          <button
            type="button"
            className={styles.designBtn}
            onClick={() => setDesignOpen(true)}
          >
            Design with template
          </button>
        </div>
        <div className={styles.uploadRow}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setUploading(true);
              setError("");
              try {
                const form = new FormData();
                form.append("file", f);
                const res = await fetch("/api/upload", {
                  method: "POST",
                  credentials: "include",
                  body: form,
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  setError(data.error || "Upload failed");
                  return;
                }
                handleChange("imageUrl", data.url);
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
            disabled={uploading}
          />
          <span className={styles.uploadHint}>
            {uploading ? "Uploading\u2026" : "Upload (JPG/PNG/WebP, max 5 MB)"}
          </span>
        </div>
        <span className={styles.or}>or paste URL</span>
        <input
          type="url"
          className={styles.input}
          value={values.imageUrl}
          onChange={(e) => handleChange("imageUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>
      {designOpen && (
        <InviteImageBuilder
          onClose={() => setDesignOpen(false)}
          onApply={(url: string) => {
            handleChange("imageUrl", url);
            setDesignOpen(false);
          }}
        />
      )}
      <label className={styles.label}>URL slug (for /i/your-slug)</label>
      <input
        type="text"
        className={styles.input}
        value={values.slug}
        onChange={(e) => handleChange("slug", e.target.value)}
        placeholder="my-event-2026"
      />
      <label className={styles.label}>Customize</label>
      <div className={styles.customizeRow}>
        <div className={styles.customizeField}>
          <span className={styles.customizeLabel}>Accent color</span>
          <input
            type="color"
            className={styles.colorInput}
            value={values.themeConfig?.accentColor ?? "#b8954a"}
            onChange={(e) =>
              handleChange("themeConfig", {
                ...values.themeConfig,
                accentColor: e.target.value,
              })
            }
          />
          <input
            type="text"
            className={styles.colorText}
            value={values.themeConfig?.accentColor ?? "#b8954a"}
            onChange={(e) =>
              handleChange("themeConfig", {
                ...values.themeConfig,
                accentColor: e.target.value,
              })
            }
          />
        </div>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={values.themeConfig?.showSubtitle !== false}
            onChange={(e) =>
              handleChange("themeConfig", {
                ...values.themeConfig,
                showSubtitle: e.target.checked,
              })
            }
          />
          Show subtitle
        </label>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "Saving\u2026" : isEdit ? "Save changes" : "Create invitation"}
        </button>
        <a href="/dashboard" className={styles.cancel}>
          Cancel
        </a>
      </div>
      <div className={styles.livePreview}>
        <p className={styles.livePreviewTitle}>Live preview</p>
        <div className={styles.livePreviewFrame}>
          <InviteView
            previewOnly
            invitation={{
              id: invitation?.id ?? "draft",
              userId: invitation?.userId ?? "",
              slug: values.slug || "preview",
              eventName: values.eventName || "Event name",
              eventDate: values.eventDate ? new Date(values.eventDate) : null,
              eventTime: values.eventTime || "",
              locationOrLink: values.locationOrLink || "",
              message: values.message || "",
              imageUrl: values.imageUrl || null,
              themeId: values.themeId || "classic",
              themeConfig: values.themeConfig || {},
              ownerPlan: invitation?.ownerPlan ?? null,
              published: invitation?.published ?? false,
              createdAt: invitation?.createdAt ?? new Date().toISOString(),
              updatedAt: invitation?.updatedAt ?? new Date().toISOString(),
            }}
          />
        </div>
      </div>
    </form>
  );
}
