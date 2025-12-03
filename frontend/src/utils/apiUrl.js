/**
 * Get the API base URL, ensuring it includes /api
 * This ensures compatibility whether VITE_API_URL includes /api or not
 */
export const getApiUrl = (endpoint = '') => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Remove trailing slash
  let url = baseUrl.replace(/\/$/, '');
  
  // If URL doesn't end with /api, add it
  if (!url.endsWith('/api')) {
    url = url + '/api';
  }
  
  // Add endpoint if provided
  if (endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return url + cleanEndpoint;
  }
  
  return url;
};






