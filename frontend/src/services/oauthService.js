import apiClient from "./apiClient";
import { buildApiUrl, buildAuthReadyUrl, isLocalBrowser } from "./runtimeConfig";

export const OAUTH_PORTAL_HINT_COOKIE = "eventify_oauth_portal";
export const OAUTH_REDIRECT_TARGET_STORAGE_KEY = "eventify.oauthRedirectTarget";
const OAUTH_PORTAL_HINT_TTL_SECONDS = 600;
const OAUTH_PROVIDER_PATHS = {
  google: "/oauth2/authorization/google",
  github: "/oauth2/authorization/github"
};
const OAUTH_HEALTH_TIMEOUT_MS = 4000;

export const ACCESS_TOKEN_STORAGE_KEY = "eventify.accessToken";

const normalizePortal = (portal) => (portal === "organizer" ? "organizer" : "attendee");
const normalizeRedirectTarget = (target) => {
  if (typeof target !== "string") {
    return null;
  }

  const normalizedTarget = target.trim();
  return normalizedTarget.startsWith("/") ? normalizedTarget : null;
};

export const buildOAuthLoginUrl = (provider) => {
  const providerPath = OAUTH_PROVIDER_PATHS[provider];

  if (!providerPath) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  return buildApiUrl(providerPath, { browserNavigation: true });
};

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

export const setOAuthRedirectTarget = (target) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedTarget = normalizeRedirectTarget(target);

  if (normalizedTarget) {
    window.sessionStorage.setItem(OAUTH_REDIRECT_TARGET_STORAGE_KEY, normalizedTarget);
    return;
  }

  window.sessionStorage.removeItem(OAUTH_REDIRECT_TARGET_STORAGE_KEY);
};

export const consumeOAuthRedirectTarget = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const target = normalizeRedirectTarget(
    window.sessionStorage.getItem(OAUTH_REDIRECT_TARGET_STORAGE_KEY)
  );
  window.sessionStorage.removeItem(OAUTH_REDIRECT_TARGET_STORAGE_KEY);
  return target;
};

export const ensureOAuthBackendReachable = async (provider = "google") => {
  if (typeof window === "undefined") {
    return;
  }

  const providerLabel = provider === "github" ? "GitHub" : "Google";
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(
    () => abortController.abort(),
    OAUTH_HEALTH_TIMEOUT_MS
  );

  try {
    const response = await fetch(buildAuthReadyUrl({ browserNavigation: true }), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error("Authentication backend is unavailable");
    }

    const readiness = await response.json().catch(() => ({}));
    const providerEnabled = provider === "github"
      ? readiness.githubEnabled !== false
      : readiness.googleEnabled !== false;

    if (!providerEnabled) {
      throw new Error(
        provider === "github"
          ? "GitHub sign-in is not configured on the backend right now."
          : "Google sign-in is not configured on the backend right now."
      );
    }
  } catch (error) {
    const description = error?.message?.includes("configured on the backend")
      ? error.message
      : isLocalBrowser()
        ? `Start the backend server on http://localhost:8080 before using ${providerLabel} sign in.`
        : "Authentication is temporarily unavailable. Please try again in a moment.";

    const wrappedError = new Error(description);
    wrappedError.cause = error;
    throw wrappedError;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const startOAuthLogin = async (provider, portal = "attendee") => {
  setOAuthPortalHint(portal);

  try {
    await ensureOAuthBackendReachable(provider);
  } catch (error) {
    clearOAuthPortalHint();
    throw error;
  }

  window.location.assign(buildOAuthLoginUrl(provider));
};

export const startGoogleLogin = (portal = "attendee") => {
  return startOAuthLogin("google", portal);
};

export const startGitHubLogin = (portal = "attendee") => {
  return startOAuthLogin("github", portal);
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
