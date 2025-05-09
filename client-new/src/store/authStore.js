import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    token: null,

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/userAuth/signup`, { email, password, name });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                token: response.data.token
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/userAuth/login`, { email, password }, {
                withCredentials: true
            });

            localStorage.setItem('isAuthenticated', 'true');
            const token = response.data.token || '';
            let userData = response.data.user || {};

            userData = {
                _id: userData._id || '',
                email: userData.email || email,
                name: userData.name || '',
                isVerified: userData.isVerified === undefined ? true : userData.isVerified,
                token: token,
                ...userData
            };

            localStorage.setItem('userData', JSON.stringify(userData));

            set({
                isAuthenticated: true,
                user: userData,
                error: null,
                isLoading: false,
                token: token
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });

        try {

            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userData');
            set({ user: null, isAuthenticated: false, error: null, isLoading: false, token: null });
            return true;
        } catch (error) {
            console.error("Logout error:", error);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userData');
            set({ user: null, isAuthenticated: false, error: error.message || "Error during logout", isLoading: false, token: null });
            return false;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/userAuth/verify-email`, { code });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                token: response.data.token
            });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true });

        try {
            const savedAuth = localStorage.getItem('isAuthenticated') === 'true';
            let savedUserData = null;

            try {
                const userData = localStorage.getItem('userData');
                if (userData) {
                    savedUserData = JSON.parse(userData);
                    set({
                        user: savedUserData,
                        isAuthenticated: true,
                    });
                }
            } catch (e) {
                console.error("Error parsing saved user data:", e);
            }

            if (savedAuth) {
                try {
                    const response = await axios.get(`${API_URL}/userAuth/check-auth`, {
                        timeout: 3000,
                    });

                    if (response.data && response.data.user) {
                        const userData = {
                            _id: response.data.user._id || '',
                            email: response.data.user.email || '',
                            name: response.data.user.name || '',
                            isVerified: response.data.user.isVerified === undefined ? true : response.data.user.isVerified,
                            ...response.data.user
                        };

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
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userData');
                set({
                    user: null,
                    isAuthenticated: false,
                    isCheckingAuth: false
                });
            }
        } catch (error) {
            console.error("Auth check error:", error);

            set({
                isCheckingAuth: false,
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
