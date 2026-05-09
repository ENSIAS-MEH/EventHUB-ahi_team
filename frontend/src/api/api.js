const AUTH_URL = 'http://localhost:8081';
const EVENT_URL = 'http://localhost:8082';
const BOOKING_URL = 'http://localhost:8083';

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

  register: (nom, email, password) =>
    fetch(`${AUTH_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, password }),
    }).then(handleResponse),
};

export const eventsApi = {
  getAll: () =>
    fetch(`${EVENT_URL}/api/events`).then(handleResponse),

  create: (data) =>
    fetch(`${EVENT_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${EVENT_URL}/api/upload/image`, {
      method: 'POST',
      body: form,
    }).then(handleResponse);
  },
};

export const bookingsApi = {
  create: (userId, eventId, nombrePlaces) =>
    fetch(`${BOOKING_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, eventId, nombrePlaces }),
    }).then(handleResponse),

  getByUser: (userId) =>
    fetch(`${BOOKING_URL}/api/bookings/user/${userId}`).then(handleResponse),
};
