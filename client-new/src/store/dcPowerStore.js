import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useDCPowerStore = create((set, get) => ({
  // Current power data
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
  
  // Fetch current/real-time data
  fetchCurrentData: async (deviceId = null) => {
    set({ isLoadingCurrent: true, currentError: null });
    try {
      const params = deviceId ? { deviceId } : {};
      const response = await axios.get(`${API_URL}/dc-power/current`, { params });
      
      if (response.data.success) {
        set({ 
          currentData: response.data.data,
          isLoadingCurrent: false 
        });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch current data');
      }
    } catch (error) {
      console.error('Error fetching current data:', error);
      set({ 
        currentError: error.message || 'Failed to fetch current data',
        isLoadingCurrent: false 
      });
      return [];
    }
  },
  
  // Fetch historical data with pagination
  fetchHistoryData: async ({ deviceId = null, startDate = null, endDate = null, page = 1, limit = 10 } = {}) => {
    set({ isLoadingHistory: true, historyError: null });
    try {
      const params = { page, limit };
      if (deviceId) params.deviceId = deviceId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axios.get(`${API_URL}/dc-power/history`, { params });
      
      if (response.data.success) {
        set({ 
          historyData: response.data.data,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          isLoadingHistory: false 
        });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch history data');
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
      set({ 
        historyError: error.message || 'Failed to fetch history data',
        isLoadingHistory: false 
      });
      return [];
    }
  },
  
  // Fetch chart data (24-hour)
  fetchChartData: async (deviceId = null) => {
    set({ isLoadingChart: true, chartError: null });
    try {
      const params = deviceId ? { deviceId } : {};
      const response = await axios.get(`${API_URL}/dc-power/chart`, { params });
      
      if (response.data.success) {
        // Format the data for charting
        const formattedData = response.data.data.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          voltage: item.voltage,
          current: item.current,
          power: item.power
        }));
        
        set({ 
          chartData: formattedData,
          isLoadingChart: false 
        });
        return formattedData;
      } else {
        throw new Error(response.data.error || 'Failed to fetch chart data');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      set({ 
        chartError: error.message || 'Failed to fetch chart data',
        isLoadingChart: false 
      });
      return [];
    }
  },
  
  // Clear all data (useful for logout, etc.)
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

export default useDCPowerStore;
