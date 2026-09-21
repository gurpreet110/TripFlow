const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  return localStorage.getItem('tripflow-token');
};

const parseJsonSafely = async (res) => {
  const text = await res.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response from API (${res.status}).`);
  }
};

const request = async (path, options = {}) => {
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await parseJsonSafely(res);

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}.`);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error: unable to reach the TripFlow API.');
    }

    throw error;
  }
};

export const api = {
  get: (path) =>
    request(path, {
      method: 'GET',
    }),

  post: (path, payload) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  put: (path, payload) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  del: (path) =>
    request(path, {
      method: 'DELETE',
    }),
};