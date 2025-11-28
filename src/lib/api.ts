// A simple wrapper for fetch to automatically add the auth token and base url

const API_URL = 'https://rent-backend-fbz2.onrender.com';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
        const errorData = await response.json();
        // FastAPI often puts the error message in a `detail` property
        if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
                errorDetail = errorData.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('; ');
            } else {
                errorDetail = errorData.detail;
            }
        } else {
           errorDetail = JSON.stringify(errorData);
        }
    } catch (e) {
        // If parsing JSON fails, the original status text is the best we have.
    }
    // Throw a proper error object with a descriptive message.
    throw new Error(errorDetail);
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
