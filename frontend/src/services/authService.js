import apiClient from "./apiClient";
import { clearAccessToken, saveAccessToken } from "./oauthService";

export const AUTH_PROFILE_STORAGE_KEY = "eventify.authProfile";
export const REFRESH_TOKEN_STORAGE_KEY = "eventify.refreshToken";

const extractProfile = (payload) => {
  if (!payload) {
    return null;
  }

  const profile = {
    userId: payload.userId ?? null,
    fullName: payload.fullName ?? "",
    email: payload.email ?? "",
    role: payload.role ?? "ATTENDEE",
    emailVerified: Boolean(payload.emailVerified)
  };

  if (!profile.userId && !profile.email) {
    return null;
  }

  localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
};

export const persistAuthSession = (payload) => {
  const accessToken = payload?.accessToken || payload?.token;

  if (accessToken) {
    saveAccessToken(accessToken);
  }

  if (payload?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, payload.refreshToken);
  }

  extractProfile(payload);
  return payload;
};

export const loginWithEmail = async ({ email, password }) => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  persistAuthSession(data);
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

export const clearAuthSession = () => {
  clearAccessToken();
  localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

export const resolveDashboardPath = (role) => {
  const normalizedRole = String(role || "ATTENDEE").toUpperCase();
  return normalizedRole === "ORGANIZER" || normalizedRole === "ADMIN" ? "/organizer" : "/dashboard";
};
