const API_URL = 'http://localhost:3001';

export const loginRequest = async (login, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Ошибка входа');
  }
  return res.json();
};