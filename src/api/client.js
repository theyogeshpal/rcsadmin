const API_BASE = import.meta.env.VITE_API_BASE || '';
const TOKEN_KEY = 'rcs_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    setToken(null);
    throw new Error(data.error || 'Session expired — please login again');
  }
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export async function login(username, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export async function fetchMe() {
  return apiFetch('/api/auth/me');
}

export function logout() {
  setToken(null);
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  return apiFetch('/api/upload/image', { method: 'POST', body: form });
}

export async function createCampaign(body) {
  return apiFetch('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listCampaigns() {
  return apiFetch('/api/campaigns');
}

export async function getCampaign(id) {
  return apiFetch(`/api/campaigns/${id}`);
}

export async function getActiveDevices() {
  return apiFetch('/api/devices/active');
}

export async function deleteDevice(deviceId) {
  return apiFetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
}
