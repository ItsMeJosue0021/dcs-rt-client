let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = token;
}

export function apiFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}
