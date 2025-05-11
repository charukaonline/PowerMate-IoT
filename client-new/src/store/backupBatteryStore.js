import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useBackupBatteryStore = create((set, get) => ({
    // Current battery data
    currentData: [],
    isLoadingCurrent: false,
    currentError: null,

    // Historical data with pagination
    historyData: [],
    totalPages: 0,
    currentPage: 1,
    isLoadingHistory: false,
    historyError: null,

    // Chart data
    chartData: [],
    isLoadingChart: false,
    chartError: null,

    // Fetch current/real-time battery data
    fetchCurrentData: async (deviceId = null) => {
        set({ isLoadingCurrent: true, currentError: null });
        try {
            const params = deviceId ? { deviceId } : {};
            const response = await axios.get(`${API_URL}/backup-battery/current`, { params });

            if (response.data.success) {
                set({
                    currentData: response.data.data,
                    isLoadingCurrent: false
                });
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Failed to fetch current battery data');
            }
        } catch (error) {
            console.error('Error fetching current battery data:', error);
            set({
                currentError: error.message || 'Failed to fetch current battery data',
                isLoadingCurrent: false
            });
            return [];
        }
    },

    // Fetch historical battery data with pagination
    fetchHistoryData: async ({ deviceId = null, startDate = null, endDate = null, page = 1, limit = 10 } = {}) => {
        set({ isLoadingHistory: true, historyError: null });
        try {
            const params = { page, limit };
            if (deviceId) params.deviceId = deviceId;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await axios.get(`${API_URL}/backup-battery/history`, { params });

            if (response.data.success) {
                set({
                    historyData: response.data.data,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage,
                    isLoadingHistory: false
                });
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Failed to fetch battery history data');
            }
        } catch (error) {
            console.error('Error fetching battery history data:', error);
            set({
                historyError: error.message || 'Failed to fetch battery history data',
                isLoadingHistory: false
            });
            return [];
        }
    },

    // Fetch chart data for visualization - show all data without date filtering
    fetchChartData: async ({ deviceId = null } = {}) => {
        set({ isLoadingChart: true, chartError: null });
        try {
            const params = {};
            if (deviceId) params.deviceId = deviceId;
            
            console.log('Fetching chart data with params:', params);
            
            // No date parameters - fetch all data
            const response = await axios.get(`${API_URL}/backup-battery/chart`, { params });
            console.log('Chart API response:', response.data);
            
            if (response.data.success) {
                // Handle empty data case
                if (!response.data.data || response.data.data.length === 0) {
                    console.warn('API returned empty chart data');
                    set({ 
                        chartData: [],
                        isLoadingChart: false 
                    });
                    return [];
                }
                
                // Format the data for charting - keep it simple for all chart types
                const formattedData = response.data.data.map(item => ({
                    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date(item.timestamp).toLocaleDateString(),
                    voltage: typeof item.voltage === 'number' ? item.voltage : parseFloat(item.voltage),
                    current: typeof item.current === 'number' ? item.current : parseFloat(item.current),
                    percentage: typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage),
                    // Add combined datetime for tooltips
                    formattedTime: new Date(item.timestamp).toLocaleString(),
                    // Add raw timestamp for sorting if needed
                    timestamp: item.timestamp
                }));
                
                // Sort by timestamp to ensure chronological order
                formattedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                console.log('Formatted chart data:', formattedData);
                
                set({ 
                    chartData: formattedData,
                    isLoadingChart: false 
                });
                return formattedData;
            } else {
                console.error('API returned error for chart data:', response.data.error);
                throw new Error(response.data.error || 'Failed to fetch battery chart data');
            }
        } catch (error) {
            console.error('Error fetching battery chart data:', error);
            set({ 
                chartError: error.message || 'Failed to fetch battery chart data',
                isLoadingChart: false 
            });
            return [];
        }
    },

    // Save new battery data (for testing purposes)
    saveData: async (batteryData) => {
        try {
            const response = await axios.post(`${API_URL}/backup-battery`, batteryData);

            if (response.data.success) {
                // Refresh current data after save
                get().fetchCurrentData(batteryData.deviceId);
                return response.data;
            } else {
                throw new Error(response.data.error || 'Failed to save battery data');
            }
        } catch (error) {
            console.error('Error saving battery data:', error);
            return { success: false, error: error.message };
        }
    },

    // Clear all data
    clearAllData: () => {
        set({
            currentData: [],
            historyData: [],
            chartData: [],
            currentError: null,
            historyError: null,
            chartError: null,
            isLoadingCurrent: false,
            isLoadingHistory: false,
            isLoadingChart: false
        });
    }
}));

export default useBackupBatteryStore;
