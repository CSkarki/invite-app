"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function HostGalleryPage() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const opts = { credentials: "include" };

  useEffect(() => {
    fetch("/api/auth/check", opts)
      .then((r) => {
        if (r.ok) {
          setLoggedIn(true);
          return loadPhotos();
        }
        setLoggedIn(false);
      })
      .catch(() => setLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  async function loadPhotos() {
    try {
      const res = await fetch("/api/gallery/photos", opts);
      if (res.ok) {
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    }
  }

  async function handleUpload(files) {
    if (!files || !files.length) return;

    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!imageFiles.length) {
      setError("No image files selected.");
      return;
    }

    setUploading(true);
    setUploadMsg(`Uploading ${imageFiles.length} photo${imageFiles.length !== 1 ? "s" : ""}...`);
    setError("");

    try {
      const formData = new FormData();
      imageFiles.forEach((f) => formData.append("photos", f));

      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }

      setUploadMsg(`${data.uploaded} photo${data.uploaded !== 1 ? "s" : ""} uploaded!`);
      await loadPhotos();
      setTimeout(() => setUploadMsg(""), 3000);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(filename) {
    if (!confirm("Delete this photo?")) return;

    try {
      const res = await fetch("/api/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.name !== filename));
      } else {
        const data = await res.json();
        setError(data.error || "Delete failed.");
      }
    } catch {
      setError("Delete failed. Try again.");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }

  if (loading) {
    return (
      <main className={styles.host}>
        <p className={styles.loading}>Loading...</p>
      </main>
    );
  }

  if (loggedIn !== true) {
    return (
      <main className={styles.host}>
        <p className={styles.loading}>
          Please{" "}
          <a href="/host" style={{ color: "var(--accent)" }}>
            log in
          </a>{" "}
          first.
        </p>
      </main>
    );
  }

  return (
    <main className={styles.host}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Gallery</h1>
        <div className={styles.headerActions}>
          <a href="/gallery" className={styles.backLink}>
            Guest View
          </a>
          <a href="/host" className={styles.backLink}>
            Dashboard
          </a>
        </div>
      </div>

      {/* Upload area */}
      <div
        className={`${styles.uploadCard} ${dragOver ? styles.dragOver : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <label className={styles.uploadLabel}>
          Choose Photos
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
        <p className={styles.uploadHint}>
          or drag and drop images here
        </p>
        {uploadMsg && <p className={styles.uploadProgress}>{uploadMsg}</p>}
        {error && <p className={styles.feedback}>{error}</p>}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <p className={styles.photoCount}>{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
      )}

      {photos.length === 0 ? (
        <p className={styles.empty}>No photos uploaded yet. Upload some above!</p>
      ) : (
        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <div key={photo.name} className={styles.photoItem}>
              <img src={photo.url} alt={photo.name} loading="lazy" />
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(photo.name)}
                title="Delete"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
