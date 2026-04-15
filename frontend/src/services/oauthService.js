import apiClient from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
export const OAUTH_PORTAL_HINT_COOKIE = "eventify_oauth_portal";
const OAUTH_PORTAL_HINT_TTL_SECONDS = 600;

export const GOOGLE_OAUTH_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/google`;
export const GITHUB_OAUTH_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/github`;
export const ACCESS_TOKEN_STORAGE_KEY = "eventify.accessToken";

const normalizePortal = (portal) => (portal === "organizer" ? "organizer" : "attendee");

const setOAuthPortalHint = (portal) => {
  if (typeof document === "undefined") {
    return;
  }

  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";
  const value = normalizePortal(portal);
  document.cookie = `${OAUTH_PORTAL_HINT_COOKIE}=${value}; Path=/; Max-Age=${OAUTH_PORTAL_HINT_TTL_SECONDS}; SameSite=Lax${secureAttribute}`;
};

export const clearOAuthPortalHint = () => {
  if (typeof document === "undefined") {
    return;
  }

  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${OAUTH_PORTAL_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureAttribute}`;
};

export const getOAuthPortalHint = () => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookiePrefix = `${OAUTH_PORTAL_HINT_COOKIE}=`;
  const entry = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(cookiePrefix));

  if (!entry) {
    return null;
  }

  const portal = entry.slice(cookiePrefix.length);
  return normalizePortal(portal);
};

export const startGoogleLogin = (portal = "attendee") => {
  setOAuthPortalHint(portal);
  window.location.href = GOOGLE_OAUTH_LOGIN_URL;
};

export const startGitHubLogin = (portal = "attendee") => {
  setOAuthPortalHint(portal);
  window.location.href = GITHUB_OAUTH_LOGIN_URL;
};

export const saveAccessToken = (accessToken) => {
  if (!accessToken) {
    return null;
  }
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  return accessToken;
};

export const exchangeOAuthLogin = async () => {
  const code = new URLSearchParams(window.location.search).get("code");
  const { data } = await apiClient.post("/auth/oauth2/exchange", null, {
    params: code ? { code } : {}
  });
  saveAccessToken(data?.accessToken || data?.token);
  return data;
};

export const refreshAccessToken = async () => {
  const { data } = await apiClient.post("/auth/oauth2/refresh");
  saveAccessToken(data?.accessToken || data?.token);
  return data;
};

export const logoutOAuthSession = async () => {
  await apiClient.post("/auth/oauth2/logout");
  clearAccessToken();
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

export const clearAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
