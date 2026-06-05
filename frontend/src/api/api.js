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

  updateProfile: (id, data) =>
    fetch(`${AUTH_URL}/api/auth/users/${id}/profile`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),
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

export const adminApi = {
  // Auth
  getUsers: () =>
    fetch(`${AUTH_URL}/api/admin/users`, { headers: authHeaders() }).then(handleResponse),
  changeRole: (id, role) =>
    fetch(`${AUTH_URL}/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role }),
    }).then(handleResponse),
  toggleUser: (id) =>
    fetch(`${AUTH_URL}/api/admin/users/${id}/toggle`, {
      method: 'PUT', headers: authHeaders(),
    }).then(handleResponse),
  deleteUser: (id) =>
    fetch(`${AUTH_URL}/api/admin/users/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    }).then(handleResponse),
  getUserStats: () =>
    fetch(`${AUTH_URL}/api/admin/stats`, { headers: authHeaders() }).then(handleResponse),

  // Auth
  getUser: (id) =>
    fetch(`${AUTH_URL}/api/auth/users/${id}`, { headers: authHeaders() }).then(handleResponse),

  // Events
  getAllEvents: () =>
    fetch(`${EVENT_URL}/api/admin/events`, { headers: authHeaders() }).then(handleResponse),
  validerEvent: (id) =>
    fetch(`${EVENT_URL}/api/admin/events/${id}/valider`, {
      method: 'PUT', headers: authHeaders(),
    }).then(handleResponse),
  refuserEvent: (id) =>
    fetch(`${EVENT_URL}/api/admin/events/${id}/refuser`, {
      method: 'PUT', headers: authHeaders(),
    }).then(handleResponse),
  deleteEvent: (id) =>
    fetch(`${EVENT_URL}/api/admin/events/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    }).then(handleResponse),
  getEventStats: () =>
    fetch(`${EVENT_URL}/api/admin/events/stats`, { headers: authHeaders() }).then(handleResponse),

  // Bookings
  getAllBookings: () =>
    fetch(`${BOOKING_URL}/api/admin/bookings`, { headers: authHeaders() }).then(handleResponse),
  getBookingStats: () =>
    fetch(`${BOOKING_URL}/api/admin/bookings/stats`, { headers: authHeaders() }).then(handleResponse),
};
