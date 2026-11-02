"use client";

import Link from "next/link";
import { useState } from "react";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setBusy(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="logo">
          Reply<span>ly</span>
        </Link>
      </nav>
      <form className="auth" onSubmit={submit}>
        <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="sub">
          {isLogin ? "Log in to keep writing replies." : "3 free replies, no card needed."}
        </p>
        {error && <div className="error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={isLogin ? undefined : 8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn primary big" style={{ width: "100%" }} disabled={busy}>
          {busy ? "One moment…" : isLogin ? "Log in" : "Sign up"}
        </button>
        <div className="alt">
          {isLogin ? (
            <>
              New here? <Link href="/signup">Create an account</Link>
            </>
          ) : (
            <>
              Already have an account? <Link href="/login">Log in</Link>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
