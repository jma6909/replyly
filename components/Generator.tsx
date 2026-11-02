"use client";

import { useState } from "react";

type Draft = { label: string; body: string };

export default function Generator({
  isPaid,
  initialUsesLeft,
}: {
  isPaid: boolean;
  initialUsesLeft: number | null;
}) {
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("professional");
  const [goal, setGoal] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [usesLeft, setUsesLeft] = useState<number | null>(initialUsesLeft);
  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(!isPaid && initialUsesLeft === 0);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tone, goal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        if (data.upgrade) setNeedsUpgrade(true);
      } else {
        setDrafts(data.drafts);
        setUsesLeft(data.usesLeft);
        if (data.usesLeft === 0) setNeedsUpgrade(true);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  }

  async function upgrade() {
    setCheckoutBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Could not start checkout.");
    } catch {
      setError("Could not start checkout.");
    }
    setCheckoutBusy(false);
  }

  async function copy(i: number) {
    try {
      await navigator.clipboard.writeText(drafts[i].body);
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      {!isPaid && (
        <div className="notice" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>
            {usesLeft === 0
              ? "You're out of free replies."
              : `${usesLeft} free ${usesLeft === 1 ? "reply" : "replies"} left.`}
          </span>
          <button className="btn primary" onClick={upgrade} disabled={checkoutBusy}>
            {checkoutBusy ? "Opening checkout…" : "Upgrade to Pro"}
          </button>
        </div>
      )}

      <div className="app-grid">
        <form className="panel" onSubmit={generate}>
          <div className="field">
            <label htmlFor="email">Email you received</label>
            <textarea
              id="email"
              placeholder="Paste the email here…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="tone">Tone</label>
              <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="firm but polite">Firm but polite</option>
                <option value="apologetic">Apologetic</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="goal">What do you want? (optional)</label>
              <input
                id="goal"
                placeholder="e.g. push the deadline a week"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <button
            className="btn primary big"
            style={{ width: "100%" }}
            disabled={busy || needsUpgrade}
          >
            {busy ? "Writing replies…" : "Write 3 replies"}
          </button>
        </form>

        <div className="panel">
          {drafts.length === 0 ? (
            <div className="empty">Your three drafts will show up here.</div>
          ) : (
            drafts.map((d, i) => (
              <div className="draft" key={i}>
                <div className="draft-head">
                  <strong>{d.label}</strong>
                  <button type="button" className="btn copy" onClick={() => copy(i)}>
                    {copied === i ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre>{d.body}</pre>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
