// A simple wrapper for fetch to automatically add the auth token and base url

const API_URL = 'https://rent-backend-fbz2.onrender.com';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
 if (options.body && !(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let error;
    try {
        error = await response.json();
    } catch (e) {
        error = { message: response.statusText };
    }
    throw error;
  }

  // If response has content, parse it as JSON, otherwise return null
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 0) {
      return response.json();
  }
  return null;
}

export default apiFetch;
