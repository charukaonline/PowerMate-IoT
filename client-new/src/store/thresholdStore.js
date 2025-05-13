import { create } from 'zustand';
import axios from 'axios';

// Default threshold values (matching the MongoDB schema defaults)
const defaultThresholds = {
    powerSupply: {
        minVoltage: 10,
        maxVoltage: 13,
        minCurrent: 0.5,
        maxCurrent: 5,
    },
    backupBattery: {
        minVoltage: 9,
        maxVoltage: 12.5,
        minCurrent: 0.5,
        maxCurrent: 5,
    },
    generator: {
        tankCapacity: 200,
        criticalLevel: 15,
    },
};

// API base URL
const API_URL = 'http://localhost:5000/api';

// Get auth config for API requests
const getAuthConfig = () => {
    // Try to get token from localStorage
    const userData = localStorage.getItem('userData');
    let token = null;

    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            token = parsedData.token;
        } catch (e) {
            console.error('Error parsing userData from localStorage:', e);
        }
    }

    return {
        withCredentials: true,
        headers: token ? {
            'Authorization': `Bearer ${token}`
        } : {}
    };
};

const useThresholdStore = create((set, get) => ({
    // State
    thresholds: defaultThresholds,
    isLoading: false,
    error: null,

    // Actions
    fetchThresholds: async () => {
        try {
            set({ isLoading: true, error: null });

            // Make actual API call to fetch thresholds
            const config = getAuthConfig();
            const response = await axios.get(`${API_URL}/thresholds`, config);

            if (response.data && response.data.success) {
                set({ 
                    thresholds: response.data.data.thresholds,
                    isLoading: false 
                });
            } else {
                throw new Error(response.data?.message || 'Failed to fetch thresholds');
            }
            
        } catch (error) {
            console.error('Error fetching thresholds:', error);
            set({
                error: error.message || 'Error loading threshold settings',
                isLoading: false
            });
        }
    },

    updateThresholds: async (thresholdData) => {
        try {
            set({ isLoading: true, error: null });
            
            // Make actual API call to update thresholds
            const config = getAuthConfig();
            const response = await axios.put(
                `${API_URL}/thresholds`, 
                { thresholds: thresholdData },
                config
            );
            
            if (response.data && response.data.success) {
                set({ 
                    thresholds: response.data.data.thresholds,
                    isLoading: false 
                });
                return { success: true, message: 'Settings updated successfully' };
            } else {
                throw new Error(response.data?.message || 'Failed to update thresholds');
            }
            
        } catch (error) {
            console.error('Error updating thresholds:', error);
            set({
                error: error.message || 'Error saving threshold settings',
                isLoading: false
            });
            return { success: false, error: error.message };
        }
    },

    // Helper to update a specific threshold value
    updateThresholdValue: (category, key, value) => {
        const thresholds = { ...get().thresholds };

        if (thresholds[category]) {
            thresholds[category] = {
                ...thresholds[category],
                [key]: parseFloat(value)
            };

            set({ thresholds });
        }
    },

    // Reset error state
    clearError: () => set({ error: null }),
}));

export default useThresholdStore;
