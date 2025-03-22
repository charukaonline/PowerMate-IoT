import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/userAuth';

interface User {
  id: string;
  username: string;
  isVerified: boolean;
  // Add other user properties as needed
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  token: null,

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post<{ user: User, token: string }>(`${API_URL}/signup`, { email, password, name });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.data.token
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post<{ user: User, token: string }>(`${API_URL}/login`, { email, password });
      set({
        isAuthenticated: true,
        user: response.data.user,
        token: response.data.token,
        error: null,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await axios.post(`${API_URL}/logout`);
      set({ user: null, isAuthenticated: false, error: null, isLoading: false, token: null });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error logging out", isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post<{ user: User, token: string }>(`${API_URL}/verify-email`, { code });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.data.token
      });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });

    try {
      // For development purposes, adding a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await axios.get<{ user: User, token: string }>(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        isCheckingAuth: false
      });
    } catch (error: any) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  }
}));
