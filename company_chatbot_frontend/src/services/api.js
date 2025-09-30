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
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data?.access_token) setAccessToken(data.access_token);
  return data;
}

// PUBLIC_INTERFACE
export async function register(email, password) {
  /** Perform registration; returns { message } or new user; does not auto-login by default. */
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      emailRedirectTo: process.env.REACT_APP_SITE_URL,
    }),
  });
}

// PUBLIC_INTERFACE
export async function getProfile() {
  /** Retrieve current user profile. */
  return request("/auth/me", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function listConversations() {
  /** Get list of conversations for the current user. */
  return request("/conversations", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createConversation(title) {
  /** Create a new conversation; returns conversation object. */
  return request("/conversations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

// PUBLIC_INTERFACE
export async function getConversation(conversationId) {
  /** Get conversation details including messages. */
  return request(`/conversations/${conversationId}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function sendMessage(conversationId, message) {
  /** Send user message; returns updated assistant message and state. */
  return request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content: message }),
  });
}

// PUBLIC_INTERFACE
export async function searchKnowledge(query) {
  /** Perform a RAG/semantic search to show related results (optional helper). */
  return request(`/rag/search?q=${encodeURIComponent(query)}`, { method: "GET" });
}
