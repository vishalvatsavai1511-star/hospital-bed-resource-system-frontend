const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401 && token) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).message || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

export const fmt = (d) => (d ? new Date(d).toLocaleString() : '-');
