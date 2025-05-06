import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/userAuth';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

interface User {
  _id: string; 
  email: string;
  name: string; 
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
      const response = await axios.post(`${API_URL}/login`, { email, password }, {
        withCredentials: true
      });

      // Save auth state in localStorage
      localStorage.setItem('isAuthenticated', 'true');

      // Get token from response 
      const token = response.data.token || '';

      // Safely extract user data from response
      let userData = response.data.user || {};

      // Ensure we have all required fields with fallbacks
      userData = {
        _id: userData._id || '',
        email: userData.email || email, // Use provided email as fallback
        name: userData.name || '',
        isVerified: userData.isVerified === undefined ? true : userData.isVerified,
        token: token, // Store token with user data for API calls
        // Include any other fields from the original response
        ...userData
      };

      // Save user data to localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(userData));

      set({
        isAuthenticated: true,
        user: userData,
        error: null,
        isLoading: false,
        token: token
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await axios.get(`${API_URL}/logout`);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      set({ user: null, isAuthenticated: false, error: null, isLoading: false, token: null });
    } catch (error: any) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      set({ user: null, isAuthenticated: false, error: error.response?.data?.message || "Error logging out", isLoading: false, token: null });
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
    set({ isCheckingAuth: true });

    try {
      // First check for saved auth data
      const savedAuth = localStorage.getItem('isAuthenticated') === 'true';
      let savedUserData = null;

      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          savedUserData = JSON.parse(userData);
          // Set initial state from localStorage to avoid UI flashes
          set({
            user: savedUserData,
            isAuthenticated: true,
          });
        }
      } catch (e) {
        console.error("Error parsing saved user data:", e);
      }

      // Only attempt to verify with server if we have saved auth data
      if (savedAuth) {
        try {
          // Use a shorter timeout to prevent long loading states
          const response = await axios.get(`${API_URL}/check-auth`, {
            timeout: 3000,
          });

          if (response.data && response.data.user) {
            // Normalize user data from server
            const userData = {
              _id: response.data.user._id || '',
              email: response.data.user.email || '',
              name: response.data.user.name || '',
              isVerified: response.data.user.isVerified === undefined ? true : response.data.user.isVerified,
              ...response.data.user
            };

            // Update storage with fresh data
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userData', JSON.stringify(userData));

            set({
              user: userData,
              isAuthenticated: true,
              isCheckingAuth: false,
              error: null
            });
            return;
          }
        } catch (serverError) {
          console.error("Server auth check failed:", serverError);
        }
      }

      if (savedAuth && savedUserData) {

        set({
          isCheckingAuth: false,
          isAuthenticated: true,
          user: savedUserData
        });
      } else {
        // No valid auth data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        set({
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false
        });
      }
    } catch (error: any) {
      console.error("Auth check error:", error);

      // ALWAYS ensure isCheckingAuth is set to false to prevent infinite loading
      set({
        isCheckingAuth: false,
        // Use saved data as fallback
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        user: (() => {
          try {
            const data = localStorage.getItem('userData');
            return data ? JSON.parse(data) : null;
          } catch (e) {
            return null;
          }
        })()
      });
    }
  }
}));
