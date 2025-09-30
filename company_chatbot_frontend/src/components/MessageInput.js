import React, { useState, useRef, useEffect } from "react";

/**
 * Bottom input component for composing and sending messages.
 * PUBLIC_INTERFACE
 */
export default function MessageInput({ disabled, onSend, onSearch }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 180) + "px";
    }
  }, [value]);

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="inputbar">
      <div className="input-inner">
        <textarea
          ref={ref}
          className="prompt"
          placeholder="Ask your question... (Shift+Enter for newline)"
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          aria-label="Chat prompt"
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn secondary"
            type="button"
            onClick={() => onSearch && onSearch(value)}
            disabled={disabled || value.trim().length === 0}
            title="Show related knowledge"
          >
            Related
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleSend}
            disabled={disabled || value.trim().length === 0}
            title="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
