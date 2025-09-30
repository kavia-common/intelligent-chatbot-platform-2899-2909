import React from "react";

/**
 * Top bar showing brand and user info.
 * PUBLIC_INTERFACE
 */
export default function Topbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="brandline">
        <div className="brand">
          <div className="logo" />
          <div>AI Assistant</div>
        </div>
        <span className="tag">Ocean Professional</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <>
            <div className="helper">{user.email || user.name || "User"}</div>
            <button className="btn" onClick={onLogout} title="Logout">Logout</button>
          </>
        ) : (
          <div className="helper">Not signed in</div>
        )}
      </div>
    </header>
  );
}
