import apiClient from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const GOOGLE_OAUTH_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/google`;
export const GITHUB_OAUTH_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/github`;
export const ACCESS_TOKEN_STORAGE_KEY = "eventify.accessToken";

export const startGoogleLogin = () => {
  window.location.href = GOOGLE_OAUTH_LOGIN_URL;
};

export const startGitHubLogin = () => {
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
