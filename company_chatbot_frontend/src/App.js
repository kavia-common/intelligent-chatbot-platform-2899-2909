import React, { useEffect, useMemo, useState } from "react";
import "./theme.css";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import AuthPanel from "./components/AuthPanel";
import {
  bootstrapAuth,
  getStoredUser,
  storeUser,
} from "./services/auth";
import {
  createConversation,
  getConversation,
  listConversations,
  searchKnowledge,
  sendMessage,
  setAccessToken,
} from "./services/api";

/**
 * Main Chatbot Application with Ocean Professional theme and full API integration.
 * PUBLIC_INTERFACE
 */
function App() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [related, setRelated] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Bootstrap auth and fetch initial data
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const me = await bootstrapAuth();
      if (mounted) {
        setUser(me);
        if (me) {
          await loadConversations();
        }
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadConversations = async () => {
    try {
      const data = await listConversations();
      setConversations(data || []);
      if ((data || []).length > 0) {
        handleSelectConversation(data[0]);
      } else {
        setActive(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load conversations");
    }
  };

  const handleSelectConversation = async (conv) => {
    try {
      setActive(conv);
      const full = await getConversation(conv.id || conv.uuid || conv._id);
      const msgs = full?.messages || [];
      setMessages(
        msgs.map((m) => ({
          id: m.id || m._id,
          role: m.role || (m.sender === "user" ? "user" : "assistant"),
          content: m.content || m.text || "",
        }))
      );
      setRelated([]);
    } catch (err) {
      setError(err?.message || "Failed to load conversation");
    }
  };

  const handleCreateConversation = async (title) => {
    try {
      const conv = await createConversation(title);
      await loadConversations();
      // Set active to newly created
      const newConv =
        (conv && (conv.id || conv.uuid || conv._id)) ?
          conv :
          (await listConversations()).find((c) => c.title === title);
      if (newConv) {
        await handleSelectConversation(newConv);
      }
    } catch (err) {
      setError(err?.message || "Failed to create conversation");
    }
  };

  const handleSend = async (text) => {
    if (!active) {
      // Auto-create conversation if none selected
      await handleCreateConversation("New chat");
    }
    const convId = (active && (active.id || active.uuid || active._id)) || null;
    const optimisticUserMsg = {
      id: `tmp-u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setSending(true);
    setError("");
    try {
      const res = await sendMessage(convId || (active?.id), text);
      // Response may include messages or single assistant reply
      const assistantMsg = Array.isArray(res?.messages)
        ? res.messages[res.messages.length - 1]
        : res?.assistant || res;
      if (assistantMsg) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsg.id || `tmp-a-${Date.now()}`,
            role:
              assistantMsg.role ||
              (assistantMsg.sender === "assistant" ? "assistant" : "assistant"),
            content: assistantMsg.content || assistantMsg.text || "",
          },
        ]);
      }
    } catch (err) {
      setError(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleSearch = async (text) => {
    if (!text.trim()) return;
    try {
      const res = await searchKnowledge(text.trim());
      const items = Array.isArray(res) ? res : res?.results || [];
      setRelated(items);
    } catch (err) {
      // optional non-blocking error
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUser(null);
    storeUser(null);
    setConversations([]);
    setActive(null);
    setMessages([]);
  };

  const appContent = useMemo(() => {
    if (!user) {
      if (loading) {
        return (
          <div className="auth-card" style={{ maxWidth: 380, margin: "40px auto" }}>
            <div>Loading...</div>
          </div>
        );
      }
      return <AuthPanel onAuthenticated={async (u) => {
        setUser(u);
        storeUser(u);
        await loadConversations();
      }} />;
    }

    return (
      <>
        <Sidebar
          conversations={conversations}
          activeId={(active && (active.id || active.uuid || active._id)) || ""}
          onSelect={handleSelectConversation}
          onCreate={handleCreateConversation}
        />
        <Topbar user={user} onLogout={handleLogout} />
        <ChatWindow messages={messages} related={related} />
        <MessageInput disabled={sending} onSend={handleSend} onSearch={handleSearch} />
      </>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, conversations, active, messages, related, sending]);

  return (
    <div className="app-shell">
      {error && (
        <div
          className="error"
          style={{
            position: "fixed",
            top: 70,
            right: 16,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "8px 12px",
            boxShadow: "var(--shadow)",
            zIndex: 2,
          }}
          role="alert"
        >
          {error}
        </div>
      )}
      {appContent}
    </div>
  );
}

export default App;
