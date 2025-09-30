import React from "react";

/**
 * Chat window showing messages for current conversation.
 * PUBLIC_INTERFACE
 */
export default function ChatWindow({ messages, related }) {
  return (
    <main className="main">
      <div className="chat" aria-live="polite">
        {messages.length === 0 && (
          <div className="auth-card" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: "var(--primary)" }}>Welcome 👋</div>
            <div className="helper">
              Start a conversation by asking a question. The assistant uses RAG to pull relevant knowledge.
            </div>
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={m.id || idx}
            className={`message-row ${m.role === "user" ? "user" : "assistant"}`}
          >
            <div className={`bubble ${m.role === "user" ? "user" : "assistant"}`}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                {m.role === "user" ? "You" : "Assistant"}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          </div>
        ))}
        {related && related.length > 0 && (
          <div className="auth-card" style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Related Knowledge</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {related.map((r, i) => (
                <li key={i} className="helper">
                  {r.title || r.text || r.snippet || JSON.stringify(r)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
