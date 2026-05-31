export const AUTH_TOKEN_KEY = "dcs_rt_admin_token";

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function storeToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
