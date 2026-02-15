"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function RemindersPage() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [guests, setGuests] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [subject, setSubject] = useState(() => {
    try { return localStorage.getItem("reminder_subject") || ""; } catch { return ""; }
  });
  const [message, setMessage] = useState(() => {
    try { return localStorage.getItem("reminder_message") || ""; } catch { return ""; }
  });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  const opts = { credentials: "include" };

  useEffect(() => {
    try { localStorage.setItem("reminder_subject", subject); } catch {}
  }, [subject]);

  useEffect(() => {
    try { localStorage.setItem("reminder_message", message); } catch {}
  }, [message]);

  useEffect(() => {
    fetch("/api/auth/check", opts)
      .then((r) => {
        if (r.ok) {
          setLoggedIn(true);
          return fetch("/api/rsvp/list", opts).then((res) => res.json());
        }
        setLoggedIn(false);
        return [];
      })
      .then((data) => {
        const attending = (Array.isArray(data) ? data : []).filter(
          (r) => r.attending?.toLowerCase() === "yes"
        );
        setGuests(attending);
      })
      .catch(() => setLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  function toggleGuest(email) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(guests.map((g) => g.email)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  async function handleSend(e) {
    e.preventDefault();
    if (selected.size === 0) {
      setFeedback({ type: "error", text: "Select at least one recipient." });
      return;
    }
    if (!subject.trim()) {
      setFeedback({ type: "error", text: "Subject is required." });
      return;
    }
    if (!message.trim()) {
      setFeedback({ type: "error", text: "Message is required." });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/reminders/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipients: guests
            .filter((g) => selected.has(g.email))
            .map((g) => ({ name: g.name, email: g.email })),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Failed to send." });
        return;
      }

      if (data.failed > 0) {
        setFeedback({
          type: "error",
          text: `Sent ${data.sent} of ${data.sent + data.failed}. ${data.failed} failed.`,
        });
      } else {
        setFeedback({
          type: "success",
          text: `Reminder sent to ${data.sent} guest${data.sent !== 1 ? "s" : ""}.`,
        });
        setSelected(new Set());
      }
    } catch {
      setFeedback({ type: "error", text: "Network error. Try again." });
    } finally {
      setSending(false);
    }
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
        <h1 className={styles.title}>Send Reminders</h1>
        <a href="/host" className={styles.backLink}>
          Back to Dashboard
        </a>
      </div>

      <div className={styles.grid}>
        {/* Recipients */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Recipients (Attending)</h2>

          {guests.length === 0 ? (
            <p className={styles.empty}>No guests have RSVP'd Yes yet.</p>
          ) : (
            <>
              <div className={styles.selectActions}>
                <button
                  type="button"
                  className={styles.selectBtn}
                  onClick={selectAll}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className={styles.selectBtn}
                  onClick={deselectAll}
                >
                  Deselect All
                </button>
              </div>

              <ul className={styles.guestList}>
                {guests.map((g, i) => (
                  <li key={i} className={styles.guestItem}>
                    <input
                      type="checkbox"
                      checked={selected.has(g.email)}
                      onChange={() => toggleGuest(g.email)}
                    />
                    <div>
                      <div className={styles.guestName}>{g.name}</div>
                      <div className={styles.guestEmail}>{g.email}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <p className={styles.selectedCount}>
                {selected.size} of {guests.length} selected
              </p>
            </>
          )}
        </div>

        {/* Compose */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Compose Message</h2>

          <form onSubmit={handleSend} className={styles.form}>
            <label className={styles.label}>Subject</label>
            <input
              type="text"
              className={styles.input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Event Reminder"
            />

            <label className={styles.label}>Message</label>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your reminder message here..."
            />

            {feedback && (
              <p className={styles[feedback.type]}>{feedback.text}</p>
            )}

            <button
              type="submit"
              className={styles.sendBtn}
              disabled={sending}
            >
              {sending ? "Sending..." : `Send to ${selected.size} Guest${selected.size !== 1 ? "s" : ""}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
