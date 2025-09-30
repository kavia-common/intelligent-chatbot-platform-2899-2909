import { getProfile, setAccessToken } from "./api";

/**
 * Persist and retrieve auth state. Token is kept only in memory for requests,
 * while user info is cached in localStorage for quick UI load.
 */
const USER_KEY = "chatbot_user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

/**
 * Attempt to bootstrap auth from backend if token cookies exist (or session).
 * Optionally accept a token to set in memory.
 */
export async function bootstrapAuth(token) {
  if (token) setAccessToken(token);
  try {
    const me = await getProfile();
    if (me) {
      storeUser(me);
      return me;
    }
  } catch {
    // not logged-in or error
  }
  storeUser(null);
  return null;
}
