const BASE_URL = process.env.REACT_APP_BACKEND_URL || "";

let accessToken = null;

/**
 * Set the bearer token to be used for subsequent API calls
 * PUBLIC_INTERFACE
 */
export function setAccessToken(token) {
  /** Set the in-memory access token for authenticated requests. */
  accessToken = token || null;
}

/**
 * Get the current bearer token (if any).
 * PUBLIC_INTERFACE
 */
export function getAccessToken() {
  /** Returns the currently stored in-memory access token string or null. */
  return accessToken;
}

/**
 * Build headers for API requests including JSON and Bearer token (if present).
 */
function buildHeaders(extra = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * Core request wrapper to handle errors consistently
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const resp = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
    credentials: "include",
    mode: "cors",
  });

  let data = null;
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  if (isJson) {
    data = await resp.json().catch(() => null);
  } else {
    data = await resp.text().catch(() => null);
  }

  if (!resp.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `API Error ${resp.status}: ${resp.statusText}`;
    const error = new Error(message);
    error.status = resp.status;
    error.payload = data;
    throw error;
  }

  return data;
}

// PUBLIC_INTERFACE
export async function login(email, password) {
  /** Perform login; returns { access_token, user } and stores token in memory. */
  try {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.access_token) setAccessToken(data.access_token);
    return data;
  } catch (e) {
    if (e?.status === 404 || e?.status === 405) {
      // Try OAuth2 password flow at /auth/token
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", password);
      const tokenData = await request("/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      if (tokenData?.access_token) setAccessToken(tokenData.access_token);
      // Optionally fetch profile
      let user = null;
      try { user = await request("/auth/me", { method: "GET" }); } catch {}
      return { access_token: tokenData?.access_token, user };
    }
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function register(email, password) {
  /** Perform registration; returns { message } or new user; does not auto-login by default. */
  try {
    return await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        emailRedirectTo: process.env.REACT_APP_SITE_URL,
      }),
    });
  } catch (e) {
    if (e?.status === 404 || e?.status === 405) {
      return request("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    }
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function getProfile() {
  /** Retrieve current user profile. */
  return request("/auth/me", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function listConversations() {
  /** Get list of conversations for the current user. */
  try {
    return await request("/conversations", { method: "GET" });
  } catch (e) {
    if (e?.status === 404) {
      return request("/chat/conversations", { method: "GET" });
    }
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function createConversation(title) {
  /** Create a new conversation; returns conversation object. */
  try {
    return await request("/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  } catch (e) {
    if (e?.status === 404) {
      return request("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
    }
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function getConversation(conversationId) {
  /** Get conversation details including messages. */
  try {
    return await request(`/conversations/${conversationId}`, { method: "GET" });
  } catch (e) {
    if (e?.status === 404) {
      const msgs = await request(`/chat/conversations/${conversationId}/messages`, { method: "GET" });
      return {
        id: String(conversationId),
        title: "Chat",
        messages: Array.isArray(msgs) ? msgs : [],
      };
    }
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function sendMessage(conversationId, message) {
  /** Send user message; returns updated assistant message and state. */
  try {
    return await request(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: message }),
    });
  } catch (e) {
    if (e?.status === 404) {
      const arr = await request(`/chat/messages`, {
        method: "POST",
        body: JSON.stringify({ content: message, session_id: conversationId }),
      });
      // Convert to assistant reply
      return Array.isArray(arr) ? { messages: arr } : arr;
    }
    throw e;
  }
}

/**
 * Attempt GET first; if it fails with 405/404, fallback to POST body as some backends require POST /rag/search
 */
// PUBLIC_INTERFACE
export async function searchKnowledge(query) {
  /** Perform a RAG/semantic search to show related results (optional helper). */
  try {
    return await request(`/rag/search?q=${encodeURIComponent(query)}`, { method: "GET" });
  } catch (e) {
    if (e?.status === 405 || e?.status === 404) {
      return request(`/rag/search`, {
        method: "POST",
        body: JSON.stringify({ query, top_k: 3 }),
      });
    }
    throw e;
  }
}
