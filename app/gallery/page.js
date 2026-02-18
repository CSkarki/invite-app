"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

export default function GalleryPage() {
  const [verified, setVerified] = useState(null); // null = checking, true/false
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
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

  async function handleVerify(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setVerifying(true);
    setVerifyError("");

    try {
      const res = await fetch("/api/gallery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setVerifyError(data.error || "Verification failed.");
        return;
      }

      setVerified(true);
      loadPhotos();
    } catch {
      setVerifyError("Network error. Try again.");
    } finally {
      setVerifying(false);
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

  // Email verification form
  if (!verified) {
    return (
      <main className={styles.gallery}>
        <div className={styles.verifyCard}>
          <h1 className={styles.verifyTitle}>Event Gallery</h1>
          <p className={styles.verifySubtitle}>
            Enter your RSVP email to view event photos
          </p>
          <form onSubmit={handleVerify} className={styles.verifyForm}>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
            {verifyError && <p className={styles.error}>{verifyError}</p>}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "View Photos"}
            </button>
          </form>
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
