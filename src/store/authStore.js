import { create } from 'zustand';
import * as authService from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  /**
   * Login with email and password.
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data || response;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  /**
   * Register a new user.
   */
  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup(userData);
      const { token, user } = response.data || response;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  /**
   * Logout and clear state.
   */
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  /**
   * Load the current user profile using the stored token.
   */
  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    set({ isLoading: true });
    try {
      const response = await authService.getMe();
      const user = response.data || response.user || response;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Clear any auth errors.
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
