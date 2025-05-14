// src/store/authStore.ts
import { create } from 'zustand';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;

  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<any>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoading: false,
  error: null,
  token: null,

  signup: async (email, password, name) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.post('http://localhost:5000/api/userAuth/signup', {
        email,
        password,
        name
      });

      if (response.data.success) {
        set({
          isAuthenticated: true,
          user: response.data.user,
          token: response.data.token
        });
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.post(
          'http://localhost:5000/api/userAuth/login',
          { email, password },
          { withCredentials: true }
      );

      if (response.data.success) {
        set({
          isAuthenticated: true,
          user: response.data.user,
          token: response.data.token
        });
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await axios.get('http://localhost:5000/api/logout', { withCredentials: true });
      set({
        user: null,
        isAuthenticated: false,
        token: null
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const response = await axios.get(
          'http://localhost:5000/api/check-auth',
          { withCredentials: true }
      );

      if (response.data.success) {
        set({
          isAuthenticated: true,
          user: response.data.user,
          token: response.data.token || null
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          token: null
        });
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        token: null
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  verifyEmail: async (code) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(
          'http://localhost:5000/api/userAuth/verify-email',
          { code }
      );
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));