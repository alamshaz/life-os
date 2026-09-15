export async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed`);
  return res.json();
}

export async function apiSend(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `${method} ${url} failed`);
  }
  return res.json();
}

export const apiPost = (url, body) => apiSend(url, "POST", body);
export const apiPatch = (url, body) => apiSend(url, "PATCH", body);
export const apiDelete = (url) => apiSend(url, "DELETE");

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
