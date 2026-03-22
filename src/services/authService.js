import api from './api';

/**
 * Login with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

/**
 * Register a new user.
 * @param {object} userData - { firstName, lastName, email, password }
 * @returns {Promise<{token: string, user: object}>}
 */
export async function signup(userData) {
  const { data } = await api.post('/auth/signup', userData);
  return data;
}

/**
 * Get the current authenticated user's profile.
 * @returns {Promise<{user: object}>}
 */
export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}
