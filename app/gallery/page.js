"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

export default function GalleryPage() {
  const [verified, setVerified] = useState(null); // null = checking, true/false
  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const opts = { credentials: "include" };

  // Check if already verified (existing cookie)
  useEffect(() => {
    fetch("/api/gallery/photos", opts)
      .then((r) => {
        if (r.ok) {
          setVerified(true);
          return r.json();
        }
        setVerified(false);
        return [];
      })
      .then((data) => setPhotos(Array.isArray(data) ? data : []))
      .catch(() => setVerified(false));
  }, []);

  // Step 1: Send OTP to email
  async function handleSendCode(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/gallery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed.");
        return;
      }

      if (data.codeSent) {
        setStep("code");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: Verify OTP code
  async function handleVerifyCode(e) {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/gallery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code.");
        return;
      }

      if (data.verified) {
        setVerified(true);
        loadPhotos();
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Resend code
  async function handleResend() {
    setCode("");
    setError("");
    setStep("email");
    // Re-submit email to get a new code
    setSubmitting(true);
    try {
      const res = await fetch("/api/gallery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
        return;
      }
      if (data.codeSent) {
        setStep("code");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadPhotos() {
    setLoadingPhotos(true);
    try {
      const res = await fetch("/api/gallery/photos", opts);
      if (res.ok) {
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoadingPhotos(false);
    }
  }

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && lightboxUrl) setLightboxUrl(null);
    },
    [lightboxUrl]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Loading state
  if (verified === null) {
    return (
      <main className={styles.gallery}>
        <p className={styles.loading}>Loading...</p>
      </main>
    );
  }

  // Verification flow
  if (!verified) {
    return (
      <main className={styles.gallery}>
        <div className={styles.verifyCard}>
          <h1 className={styles.verifyTitle}>Event Gallery</h1>

          {step === "email" ? (
            <>
              <p className={styles.verifySubtitle}>
                Enter your RSVP email to receive a verification code
              </p>
              <form onSubmit={handleSendCode} className={styles.verifyForm}>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
                {error && <p className={styles.error}>{error}</p>}
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? "Sending code..." : "Send Verification Code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className={styles.verifySubtitle}>
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
              <form onSubmit={handleVerifyCode} className={styles.verifyForm}>
                <input
                  type="text"
                  className={`${styles.input} ${styles.codeInput}`}
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(val);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  required
                />
                {error && <p className={styles.error}>{error}</p>}
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting || code.length < 6}
                >
                  {submitting ? "Verifying..." : "Verify & View Photos"}
                </button>
                <div className={styles.resendRow}>
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={handleResend}
                    disabled={submitting}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setError("");
                    }}
                  >
                    Change email
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    );
  }

  // Gallery view
  return (
    <main className={styles.gallery}>
      <div className={styles.header}>
        <h1 className={styles.title}>Event Gallery</h1>
        <a href="/" className={styles.backLink}>
          Back to Invite
        </a>
      </div>

      {loadingPhotos ? (
        <p className={styles.loading}>Loading photos...</p>
      ) : photos.length === 0 ? (
        <p className={styles.empty}>No photos have been shared yet.</p>
      ) : (
        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <div
              key={photo.name}
              className={styles.photoItem}
              onClick={() => setLightboxUrl(photo.url)}
            >
              <img src={photo.url} alt={photo.name} loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {lightboxUrl && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className={styles.lightboxClose}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxUrl(null);
            }}
          >
            x
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
