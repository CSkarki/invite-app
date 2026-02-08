"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";
import { getTheme } from "@/lib/themes";
import type { Invitation, ThemeConfig } from "@/types";
import styles from "./InviteView.module.css";

interface InviteImageProps {
  src: string | null;
  alt: string;
}

function InviteImage({ src, alt }: InviteImageProps) {
  const [error, setError] = useState(false);
  const isLocal = src?.startsWith("/");
  if (!src || error) {
    return (
      <div className={styles.invite__imagePlaceholder}>
        {src ? "Image could not be loaded" : "No image set"}
      </div>
    );
  }
  if (isLocal) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={styles.invite__image}
        sizes="50vw"
        priority
        onError={() => setError(true)}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={styles.invite__image}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "center",
      }}
      onError={() => setError(true)}
    />
  );
}

interface RsvpStatus {
  type: "success" | "error";
  text: string;
}

interface InviteViewProps {
  invitation: Invitation;
  previewOnly?: boolean;
}

export default function InviteView({ invitation, previewOnly }: InviteViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status && statusRef.current) {
      statusRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [status]);

  if (!invitation) return null;

  const theme = getTheme(invitation.themeId ?? "classic");
  const layoutType = theme?.layoutType ?? "classic";
  const themeConfig: ThemeConfig =
    invitation.themeConfig && typeof invitation.themeConfig === "object"
      ? invitation.themeConfig
      : {};
  const accentColor = themeConfig.accentColor ?? "#b8954a";
  const showSubtitle = themeConfig.showSubtitle !== false;

  const imageUrl = invitation.imageUrl?.trim() || null;
  const eventDate = invitation.eventDate
    ? new Date(invitation.eventDate).toLocaleDateString(undefined, {
        dateStyle: "medium",
      })
    : "";
  const eventTime = invitation.eventTime?.trim() || "";
  const dateTimeText = [eventDate, eventTime].filter(Boolean).join(", ");
  const showRsvp = !previewOnly;
  const showBranding = !previewOnly && invitation.ownerPlan === "free";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !attending) {
      setStatus({ type: "error", text: "Please fill name, email, and RSVP." });
      return;
    }
    setLoading(true);
    setStatus(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitation.id,
          name: name.trim(),
          email: email.trim(),
          attending,
          message: message.trim() || "",
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `RSVP failed (${res.status})`);
      }
      setStatus({ type: "success", text: "Thank you! Your RSVP has been recorded." });
      setName("");
      setEmail("");
      setAttending("");
      setMessage("");
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const error = err as Error & { name?: string };
      const isAbort = error.name === "AbortError";
      setStatus({
        type: "error",
        text: isAbort
          ? "Request timed out. Check your connection or try again later."
          : error.message || "Network error. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const rsvpBlock = showRsvp ? (
    <section className={styles.invite__rsvp} id="rsvp">
      <h2 className={styles.invite__rsvpTitle} style={{ color: accentColor }}>RSVP</h2>
      <form onSubmit={handleSubmit} className={styles.rsvpForm}>
        <label className={styles.rsvpForm__label}>Name <span className={styles.required}>*</span></label>
        <input type="text" className={styles.rsvpForm__input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        <label className={styles.rsvpForm__label}>Email <span className={styles.required}>*</span></label>
        <input type="email" className={styles.rsvpForm__input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
        <label className={styles.rsvpForm__label}>Will you attend? <span className={styles.required}>*</span></label>
        <div className={styles.rsvpForm__radioGroup}>
          <label className={styles.rsvpForm__radio}><input type="radio" name="attending" value="Yes" checked={attending === "Yes"} onChange={(e) => setAttending(e.target.value)} /><span>Yes</span></label>
          <label className={styles.rsvpForm__radio}><input type="radio" name="attending" value="No" checked={attending === "No"} onChange={(e) => setAttending(e.target.value)} /><span>No</span></label>
        </div>
        <label className={styles.rsvpForm__label}>Message (optional)</label>
        <textarea className={`${styles.rsvpForm__input} ${styles.rsvpForm__textarea}`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A brief message..." rows={2} />
        {status && <p ref={statusRef} role="alert" className={status.type === "success" ? `${styles.rsvpForm__status} ${styles.rsvpForm__statusSuccess}` : `${styles.rsvpForm__status} ${styles.rsvpForm__statusError}`}>{status.text}</p>}
        <footer className={styles.invite__footer}>
          <button type="submit" className={styles.rsvpForm__submit} disabled={loading} style={{ background: accentColor }}>{loading ? "Sending\u2026" : "Send RSVP"}</button>
        </footer>
      </form>
    </section>
  ) : null;

  const brandingBlock = showBranding ? (
    <footer className={styles.invite__branding}>
      Powered by <a href="/">Nimantran</a>
    </footer>
  ) : null;

  const contentBlock = (
    <>
      <div className={styles.invite__titleWrap}>
        <h1 className={styles.invite__title} style={{ color: accentColor }}>
          {invitation.eventName || "You\u2019re Invited"}
        </h1>
        {showSubtitle && (
          <p className={styles.invite__subtitle}>We&apos;d love to celebrate with you</p>
        )}
      </div>
      <section className={styles.invite__details}>
        {invitation.message && (
          <p className={styles.invite__copy}>{invitation.message}</p>
        )}
        <div className={styles.invite__meta}>
          {dateTimeText && <span>Date & time &mdash; {dateTimeText}</span>}
          {invitation.locationOrLink && (
            <span>Location &mdash; {invitation.locationOrLink}</span>
          )}
        </div>
      </section>
    </>
  );

  const imageBlock = (
    <div className={styles.invite__imageWrap}>
      {imageUrl ? (
        <InviteImage
          src={imageUrl}
          alt={invitation.eventName || "Event invitation"}
        />
      ) : (
        <div className={styles.invite__imagePlaceholder}>No image set</div>
      )}
    </div>
  );

  if (layoutType === "minimal") {
    return (
      <main className={styles.invite}>
        <div className={styles.invite__layoutMinimal}>
          {imageBlock}
          <div className={styles.invite__content}>
            <div className={styles.invite__contentInner}>
              {contentBlock}
              {rsvpBlock}
              {brandingBlock}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (layoutType === "photo-heavy") {
    return (
      <main className={styles.invite}>
        <div className={styles.invite__layoutPhotoHeavy}>
          <div className={styles.invite__photoHeavyImage}>
            {imageUrl ? (
              <InviteImage src={imageUrl} alt={invitation.eventName || "Event invitation"} />
            ) : (
              <div className={styles.invite__imagePlaceholder}>No image set</div>
            )}
            <div className={styles.invite__photoHeavyOverlay}>
              <h1 className={styles.invite__title} style={{ color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{invitation.eventName || "You\u2019re Invited"}</h1>
              {showSubtitle && <p className={styles.invite__subtitle} style={{ color: "rgba(255,255,255,0.9)" }}>We&apos;d love to celebrate with you</p>}
            </div>
          </div>
          <div className={styles.invite__content}>
            <div className={styles.invite__contentInner}>
              <section className={styles.invite__details}>
                {invitation.message && <p className={styles.invite__copy}>{invitation.message}</p>}
                <div className={styles.invite__meta}>
                  {dateTimeText && <span>Date & time &mdash; {dateTimeText}</span>}
                  {invitation.locationOrLink && <span>Location &mdash; {invitation.locationOrLink}</span>}
                </div>
              </section>
              {rsvpBlock}
              {brandingBlock}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.invite}>
      <div className={styles.invite__layout}>
        {imageBlock}
        <div className={styles.invite__content}>
          <div className={styles.invite__contentInner}>
            {contentBlock}
            {rsvpBlock}
            {brandingBlock}
          </div>
        </div>
      </div>
    </main>
  );
}
