const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const rawLocalBackendOrigin = import.meta.env.VITE_LOCAL_BACKEND_ORIGIN || "http://localhost:8080";
const rawBrowserBackendOrigin = import.meta.env.VITE_BROWSER_BACKEND_ORIGIN || "https://eventify-project.up.railway.app";

const stripTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");
const ensureLeadingSlash = (value = "") => {
  const normalized = String(value || "");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

export const API_BASE_URL = stripTrailingSlash(rawApiBaseUrl) || "/api";
export const LOCAL_BACKEND_ORIGIN = stripTrailingSlash(rawLocalBackendOrigin);
export const BROWSER_BACKEND_ORIGIN = stripTrailingSlash(rawBrowserBackendOrigin);

export const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(String(value || ""));

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

  if (browserNavigation) {
    return `${stripTrailingSlash(browserBackendOrigin)}${ensureLeadingSlash(normalizedBaseUrl)}`;
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
