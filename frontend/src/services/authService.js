import apiClient from "./apiClient";
import { clearAccessToken, getAccessToken, saveAccessToken } from "./oauthService";

export const AUTH_PROFILE_STORAGE_KEY = "eventify.authProfile";
export const REFRESH_TOKEN_STORAGE_KEY = "eventify.refreshToken";
export const AUTH_STATE_CHANGED_EVENT = "eventify:auth-state-changed";
export const AUTH_PORTAL_STORAGE_KEY = "eventify.authPortal";

export const normalizeAuthRole = (role) => {
  const normalized = String(role || "ATTENDEE").trim().toUpperCase();

  if (normalized.startsWith("ROLE_")) {
    return normalized.slice(5);
  }

  if (normalized === "ORGANISER") {
    return "ORGANIZER";
  }

  return normalized;
};

export const isOrganizerRole = (role) => {
  const normalizedRole = normalizeAuthRole(role);
  return normalizedRole === "ORGANIZER" || normalizedRole === "ADMIN";
};

export const setPreferredPortal = (portal) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPortal = portal === "organizer" ? "organizer" : "attendee";
  localStorage.setItem(AUTH_PORTAL_STORAGE_KEY, normalizedPortal);
};

export const getPreferredPortal = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const portal = localStorage.getItem(AUTH_PORTAL_STORAGE_KEY);
  return portal === "organizer" || portal === "attendee" ? portal : null;
};

export const canAccessPath = (role, pathname = "") => {
  const normalizedPath = String(pathname || "");

  if (!normalizedPath) {
    return true;
  }

  if (normalizedPath.startsWith("/organizer")) {
    return isOrganizerRole(role);
  }

  if (normalizedPath.startsWith("/dashboard")) {
    return !isOrganizerRole(role);
  }

  return true;
};

const notifyAuthStateChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT));
  }
};

const extractProfile = (payload) => {
  if (!payload) {
    return null;
  }

  const profile = {
    userId: payload.userId ?? null,
    fullName: payload.fullName ?? "",
    email: payload.email ?? "",
    role: normalizeAuthRole(payload.role),
    emailVerified: Boolean(payload.emailVerified)
  };

  if (!profile.userId && !profile.email) {
    return null;
  }

  localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  notifyAuthStateChanged();
  return profile;
};

export const persistAuthSession = (payload) => {
  const accessToken = payload?.accessToken || payload?.token;

  if (accessToken) {
    saveAccessToken(accessToken);
  }

  if (payload?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, payload.refreshToken);
    notifyAuthStateChanged();
  }

  extractProfile(payload);
  return payload;
};

export const loginWithEmail = async ({ email, password }) => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  persistAuthSession(data);
  return data;
};

export const signupWithEmail = async ({ fullName, email, password, role = "ATTENDEE" }) => {
  const { data } = await apiClient.post("/auth/signup", {
    fullName,
    email,
    password,
    role: normalizeAuthRole(role)
  });
  return data;
};

export const verifySignupOtp = async ({ email, otp }) => {
  const { data } = await apiClient.post("/auth/verify-email-otp", { email, otp });
  return data;
};

export const requestPasswordResetOtp = async (email) => {
  const { data } = await apiClient.post("/auth/forgot-password/request", { email });
  return data;
};

export const verifyPasswordResetOtp = async ({ email, otp }) => {
  const { data } = await apiClient.post("/auth/forgot-password/verify-otp", { email, otp });
  return data;
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const { data } = await apiClient.post("/auth/forgot-password/reset", {
    email,
    otp,
    newPassword
  });
  return data;
};

export const getStoredAuthProfile = () => {
  const rawProfile = localStorage.getItem(AUTH_PROFILE_STORAGE_KEY);

  if (!rawProfile) {
    return null;
  }

  try {
    return JSON.parse(rawProfile);
  } catch {
    localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
    return null;
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof window === "undefined") {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalizedPayload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getCurrentAuthIdentity = () => {
  const token = getAccessToken();
  const claims = decodeJwtPayload(token) || {};
  const tokenRole = normalizeAuthRole(claims.role);

  const profile = getStoredAuthProfile();
  if (profile) {
    const profileRole = normalizeAuthRole(profile.role);
    return {
      isAuthenticated: true,
      fullName: profile.fullName || "",
      email: profile.email || "",
      role: tokenRole && tokenRole !== "ATTENDEE" ? tokenRole : profileRole
    };
  }

  if (!token) {
    return {
      isAuthenticated: false,
      fullName: "",
      email: "",
      role: normalizeAuthRole()
    };
  }

  return {
    isAuthenticated: true,
    fullName: String(claims.name || claims.fullName || claims.preferred_username || ""),
    email: String(claims.email || claims.sub || ""),
    role: normalizeAuthRole(claims.role)
  };
};

export const clearAuthSession = () => {
  clearAccessToken();
  localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_PORTAL_STORAGE_KEY);
  notifyAuthStateChanged();
};

export const isAuthenticated = () => Boolean(getAccessToken());

export const resolveDashboardPath = (role) => {
  return isOrganizerRole(role) ? "/organizer" : "/dashboard";
};

export const resolvePostLoginPath = (role, requestedPath) => {
  const fallbackPath = resolveDashboardPath(role);

  if (!requestedPath) {
    return fallbackPath;
  }

  return canAccessPath(role, requestedPath) ? requestedPath : fallbackPath;
};
