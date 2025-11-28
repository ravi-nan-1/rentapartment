// A simple wrapper for fetch to automatically add the auth token and base url

const API_URL = 'https://rent-backend-fbz2.onrender.com';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // The caller is now responsible for setting the Content-Type header if needed.
  // This was incorrectly overriding the content-type for form-urlencoded requests.

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let error;
    try {
        // Try to parse the error response from the backend
        error = await response.json();
    } catch (e) {
        // If parsing fails, fall back to the status text
        error = { detail: response.statusText };
    }
    // Throw the error so it can be caught by the calling function
    throw error;
  }

  // If response has content, parse it as JSON, otherwise return null
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 0) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
  }
  return null;
}

export default apiFetch;
