import React, { useState } from "react";
import { login, register } from "../services/api";

/**
 * Authentication panel to handle login and registration.
 * PUBLIC_INTERFACE
 */
export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        const res = await login(email, password);
        onAuthenticated(res?.user || { email });
      } else {
        await register(email, password);
        // After register, auto-login for convenience
        const res = await login(email, password);
        onAuthenticated(res?.user || { email });
      }
    } catch (err) {
      setError(err?.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 380, margin: "40px auto" }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>
        {mode === "login" ? "Sign in" : "Create account"}
      </div>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <div className="separator" />
      <div className="helper">
        {mode === "login" ? "No account?" : "Already have an account?"}{" "}
        <button
          className="btn secondary"
          style={{ padding: "6px 10px" }}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create one" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
