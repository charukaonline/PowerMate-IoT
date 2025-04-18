import axios from 'axios';
import { ThresholdSettings } from '@/types/threshold';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Set axios defaults for all requests
axios.defaults.withCredentials = true;

// Configure axios with authentication
const getAuthConfig = () => {
    // Try to get token from localStorage
    const userData = localStorage.getItem('userData');
    let token = null;

    if (userData) {
        try {
            // If we have userData, try to extract token if it exists
            const parsedData = JSON.parse(userData);
            token = parsedData.token;
        } catch (e) {
            console.error('Error parsing userData from localStorage:', e);
        }
    }

    // Add auth header only if token exists
    return {
        withCredentials: true, // Always include cookies
        headers: token ? {
            'Authorization': `Bearer ${token}`
        } : {}
    };
};

// Get user thresholds from the server
export const getUserThresholds = async () => {
    try {
        console.log('Fetching threshold settings...');
        const config = getAuthConfig();

        // Use a relative path to ensure cookies are included
        const response = await axios.get(`${API_URL}/api/thresholds`, config);

        if (!response.data) {
            throw new Error('No data received from server');
        }

        return response.data;
    } catch (error: any) {
        console.error('Error fetching thresholds:', error.response?.data || error.message);
        // Include more diagnostic information
        throw new Error(`Failed to fetch threshold settings: ${error.response?.data?.message || error.message}`);
    }
};

// Update user thresholds on the server
export const updateUserThresholds = async (thresholdData: Partial<ThresholdSettings>) => {
    try {
        console.log('Updating threshold settings:', thresholdData);
        const config = getAuthConfig();

        // Use relative path to ensure cookies are included
        const response = await axios.put(`${API_URL}/api/thresholds`, thresholdData, config);

        if (!response.data) {
            throw new Error('No data received from server');
        }

        return response.data;
    } catch (error: any) {
        console.error('Error updating thresholds:', error.response?.data || error.message);
        // Include more diagnostic information
        throw new Error(`Failed to update threshold settings: ${error.response?.data?.message || error.message}`);
    }
};
