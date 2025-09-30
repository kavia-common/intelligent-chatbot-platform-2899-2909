import React, { useState } from "react";

/**
 * Sidebar for navigation and conversation history.
 * PUBLIC_INTERFACE
 */
export default function Sidebar({ conversations, activeId, onSelect, onCreate }) {
  const [title, setTitle] = useState("");

  const create = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim());
    setTitle("");
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo" />
        <div>Company Chatbot</div>
      </div>

      <div className="section-title">New</div>
      <form onSubmit={create} className="auth-card">
        <input
          className="input"
          placeholder="Conversation title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Conversation title"
        />
        <button type="submit" className="btn secondary">Create</button>
      </form>

      <div className="section-title">History</div>
      <div className="conv-list" role="list">
        {conversations.length === 0 && (
          <div className="helper">No conversations yet. Create one to get started.</div>
        )}
        {conversations.map((c) => (
          <div
            key={c.id || c.uuid || c._id || c.title}
            role="listitem"
            className={`conv-item ${String(activeId) === String(c.id) ? "active" : ""}`}
            onClick={() => onSelect(c)}
            title={c.title}
          >
            {c.title || "Untitled"}
          </div>
        ))}
      </div>
    </aside>
  );
}
