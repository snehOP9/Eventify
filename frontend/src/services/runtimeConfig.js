const stripTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");
const stripWrappingQuotes = (value = "") => String(value || "").replace(/^['"]|['"]$/g, "");
const ensureLeadingSlash = (value = "") => {
  const normalized = String(value || "");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

export const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(String(value || ""));
// Keep only legacy hosts here. The active backend host must stay allowed so
// OAuth starts and returns on the same origin, preserving the auth state.
const DEPRECATED_BACKEND_HOSTS = new Set(["deprecated-backend.example.com"]);

const normalizeConfiguredValue = (value = "") => stripWrappingQuotes(String(value || "").trim());

const isDeprecatedBackendUrl = (value = "") => {
  if (!isAbsoluteUrl(value)) {
    return false;
  }

  try {
    return DEPRECATED_BACKEND_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
};

export const sanitizeApiBaseUrl = (value = "/api") => {
  const normalized = normalizeConfiguredValue(value);

  if (!normalized || isDeprecatedBackendUrl(normalized)) {
    return "/api";
  }

  return normalized;
};

export const sanitizeBackendOrigin = (value = "") => {
  const normalized = normalizeConfiguredValue(value);

  if (!normalized || isDeprecatedBackendUrl(normalized)) {
    return "";
  }

  return normalized;
};

export const deriveBackendOriginFromApiBaseUrl = (apiBaseUrl = "") => {
  if (!isAbsoluteUrl(apiBaseUrl)) {
    return "";
  }

  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return "";
  }
};

const rawApiBaseUrl = sanitizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "/api");
const rawLocalBackendOrigin = normalizeConfiguredValue(
  import.meta.env.VITE_LOCAL_BACKEND_ORIGIN || "http://localhost:8080"
);
const rawBrowserBackendOrigin = sanitizeBackendOrigin(
  import.meta.env.VITE_BROWSER_BACKEND_ORIGIN || ""
);

export const API_BASE_URL = stripTrailingSlash(rawApiBaseUrl) || "/api";
export const LOCAL_BACKEND_ORIGIN = stripTrailingSlash(rawLocalBackendOrigin);
export const BROWSER_BACKEND_ORIGIN = stripTrailingSlash(
  rawBrowserBackendOrigin || deriveBackendOriginFromApiBaseUrl(API_BASE_URL)
);

export const isLocalBrowser = (locationObject) => {
  const targetLocation =
    locationObject || (typeof window !== "undefined" ? window.location : null);

  if (!targetLocation) {
    return false;
  }

  return ["localhost", "127.0.0.1"].includes(targetLocation.hostname);
};

export const resolveApiBaseUrl = ({
  browserNavigation = false,
  apiBaseUrl = API_BASE_URL,
  localBackendOrigin = LOCAL_BACKEND_ORIGIN,
  browserBackendOrigin = BROWSER_BACKEND_ORIGIN,
  locationObject
} = {}) => {
  const normalizedBaseUrl = stripTrailingSlash(apiBaseUrl) || "/api";

  if (isAbsoluteUrl(normalizedBaseUrl)) {
    return normalizedBaseUrl;
  }

  if (browserNavigation && isLocalBrowser(locationObject)) {
    return `${stripTrailingSlash(localBackendOrigin)}${ensureLeadingSlash(normalizedBaseUrl)}`;
  }

  if (browserNavigation && browserBackendOrigin) {
    return `${stripTrailingSlash(browserBackendOrigin)}${ensureLeadingSlash(normalizedBaseUrl)}`;
  }

  if (browserNavigation) {
    return ensureLeadingSlash(normalizedBaseUrl);
  }

  return ensureLeadingSlash(normalizedBaseUrl);
};

export const buildApiUrl = (path, options = {}) => {
  const normalizedPath = ensureLeadingSlash(path);
  const baseUrl = resolveApiBaseUrl(options);
  return `${stripTrailingSlash(baseUrl)}${normalizedPath}`;
};

export const buildAuthReadyUrl = (options = {}) =>
  buildApiUrl("/auth/oauth2/ready", options);
