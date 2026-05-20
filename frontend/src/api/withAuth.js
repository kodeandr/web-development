export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
};