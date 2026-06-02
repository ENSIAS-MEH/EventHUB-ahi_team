const AUTH_URL = 'http://localhost:8081';
const EVENT_URL = 'http://localhost:8082';
const BOOKING_URL = 'http://localhost:8083';

function getToken() {
  try {
    const stored = localStorage.getItem('eventhub_user');
    if (!stored) return null;
    return JSON.parse(stored).token || null;
  } catch {
    return null;
  }
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (res.ok) {
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  }
  const text = await res.text();
  throw new Error(text || `Erreur ${res.status}`);
}

export const authApi = {
  login: (email, password) =>
    fetch(`${AUTH_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  register: (nom, email, password, telephone, age) =>
    fetch(`${AUTH_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, password, telephone, age }),
    }).then(handleResponse),

  verifyUser: (id) =>
    fetch(`${AUTH_URL}/api/auth/users/${id}`).then(handleResponse),
};

export const eventsApi = {
  getAll: () =>
    fetch(`${EVENT_URL}/api/events`).then(handleResponse),

  getByAnnonceur: (userId) =>
    fetch(`${EVENT_URL}/api/events/annonceur/${userId}`).then(handleResponse),

  create: (data) =>
    fetch(`${EVENT_URL}/api/events`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),

  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${EVENT_URL}/api/upload/image`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    }).then(handleResponse);
  },
};

export const bookingsApi = {
  create: (userId, eventId, nombrePlaces) =>
    fetch(`${BOOKING_URL}/api/bookings`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId, eventId, nombrePlaces }),
    }).then(handleResponse),

  getByUser: (userId) =>
    fetch(`${BOOKING_URL}/api/bookings/user/${userId}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  getByEvent: (eventId) =>
    fetch(`${BOOKING_URL}/api/bookings/event/${eventId}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  confirmer: (id) =>
    fetch(`${BOOKING_URL}/api/bookings/${id}/confirmer`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handleResponse),

  annuler: (id) =>
    fetch(`${BOOKING_URL}/api/bookings/${id}/annuler`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handleResponse),

  getTicket: (id) =>
    fetch(`${BOOKING_URL}/api/bookings/${id}/ticket`, {
      headers: authHeaders(),
    }),
};
