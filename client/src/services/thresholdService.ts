import axios from 'axios';
import { ThresholdSettings } from '@/types/threshold';

const API_URL = 'http://localhost:5000/api/thresholds';

// Set axios defaults for all requests
axios.defaults.withCredentials = true;

// Configure axios with authentication
const getAuthConfig = () => {
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
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    };
};

// Get user thresholds from the server
export const getUserThresholds = async () => {
    try {
        console.log('Fetching threshold settings...');
        const config = getAuthConfig();

        const response = await axios.get(`${API_URL}`, config);

        if (!response.data) {
            throw new Error('No data received from server');
        }

        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching thresholds:', error.response?.data || error.message);
            throw new Error(`Failed to fetch threshold settings: ${error.response?.data?.message || error.message}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred');
        }
    }
};

// Update user thresholds on the server
export const updateUserThresholds = async (thresholdData: Partial<ThresholdSettings>) => {
    try {
        console.log('Updating threshold settings:', thresholdData);
        const config = getAuthConfig();

        const response = await axios.put(`${API_URL}`, thresholdData, config);

        if (!response.data) {
            throw new Error('No data received from server');
        }

        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Error updating thresholds:', error.response?.data || error.message);
            throw new Error(`Failed to update threshold settings: ${error.response?.data?.message || error.message}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred');
        }
    }
};