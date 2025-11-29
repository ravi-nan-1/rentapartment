// A simple wrapper for fetch to automatically add the auth token and base url

const API_URL = 'https://rent-backend-fbz2.onrender.com';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // Let browser set Content-Type for FormData and URLSearchParams
  if (options.body && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
      if (!headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
      }
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      mode: 'cors',
    });
  } catch (error: any) {
    // This catches network errors (like CORS failures, DNS issues, etc.)
    console.error('Network or CORS error in apiFetch:', error);
    throw new Error(`Network error: Could not connect to API. Please check your network connection and CORS server configuration. Details: ${error.message}`);
  }


  if (!response.ok) {
    let errorDetail;
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
         errorDetail = response.statusText;
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
