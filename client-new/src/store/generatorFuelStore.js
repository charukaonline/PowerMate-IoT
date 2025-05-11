import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useGeneratorFuelStore = create((set) => ({
    // Fuel history state
    fuelHistory: [],
    fuelLoading: false,
    fuelError: null,

    // Temperature state
    temperature: null,
    tempLoading: false,
    tempError: null,

    // Fetch fuel history data
    fetchFuelHistory: async (params = {}) => {
        set({ fuelLoading: true, fuelError: null });
        try {
            const response = await axios.get(`${API_URL}/generator/fuel-history`, { params });

            if (response.data.success) {
                // Transform data for chart display
                const chartData = response.data.data.map(item => ({
                    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    level: item.fuelLevel || 0, // Assuming fuelLevel is the property name
                    date: new Date(item.timestamp).toLocaleDateString()
                }));

                set({
                    fuelHistory: chartData,
                    fuelLoading: false
                });
            } else {
                set({
                    fuelError: response.data.message || 'Failed to fetch fuel history',
                    fuelLoading: false
                });
            }
        } catch (error) {
            console.error('Error fetching fuel history:', error);
            set({
                fuelError: error.message || 'An error occurred while fetching fuel history',
                fuelLoading: false
            });
        }
    },

    // Fetch temperature data
    fetchTemperature: async (deviceId) => {
        set({ tempLoading: true, tempError: null });
        try {
            const response = await axios.get(`${API_URL}/generator/temperature`, {
                params: { deviceId }
            });
            
            if (response.data.success) {
                set({ 
                    temperature: response.data.data, 
                    tempLoading: false 
                });
            } else {
                set({ 
                    tempError: response.data.message || 'Failed to fetch temperature data', 
                    tempLoading: false 
                });
            }
        } catch (error) {
            console.error('Error fetching temperature data:', error);
            set({ 
                tempError: error.message || 'An error occurred while fetching temperature data', 
                tempLoading: false 
            });
        }
    },
    
    // Clear data functions
    clearFuelHistory: () => set({ fuelHistory: [] }),
    clearTemperature: () => set({ temperature: null }),
    resetAll: () => set({ 
        fuelHistory: [], 
        fuelLoading: false, 
        fuelError: null,
        temperature: null,
        tempLoading: false,
        tempError: null
    })
}));

export default useGeneratorFuelStore;
