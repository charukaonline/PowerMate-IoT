import { create } from 'zustand';
import axios from 'axios';

const GENERATOR_API_URL = import.meta.env.GENERATE_API_URL || 'http://localhost:5000/api/generator';

// Define tank dimensions
const TANK_HEIGHT = 17; // Tank height in cm/inches

axios.defaults.withCredentials = true;

interface FuelHistoryItem {
    deviceId: string;
    distance: number;
    timestamp: string;
    date?: string;
    level?: number; // For UI compatibility with existing code
}

interface GeneratorState {
    _id: string;
    fuelLevel: number;
    fuelVolume: number;
    tankCapacity: number;
    oilTemperature: number;
    fuelLevelStatus: 'normal' | 'warning' | 'critical';
    fuelHistory: FuelHistoryItem[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchFuelHistory: (params?: { startDate?: string; endDate?: string; limit?: number }) => Promise<void>;
}

export const useGeneratorStore = create<GeneratorState>((set) => ({
    // Initial state
    _id: '',
    fuelLevel: 78, // Default value from mock data
    fuelVolume: 156, // Will be calculated based on level and capacity
    tankCapacity: 200, // Default
    oilTemperature: 75,
    fuelLevelStatus: 'normal',
    fuelHistory: [],
    loading: false,
    error: null,

    // Actions
    fetchFuelHistory: async (params = {}) => {
        try {
            set({ loading: true, error: null });

            const { startDate, endDate, limit } = params;
            let url = `${GENERATOR_API_URL}/fuel-history`;
            
            // Build query params
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            if (limit) queryParams.append('limit', limit.toString());
            
            // Add query string to URL if params exist
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }
            
            const response = await axios.get(url);
            
            if (response.data.success) {
                // Transform data with accurate fuel level calculation using tank height
                const transformedData = response.data.data.map((item: FuelHistoryItem) => {
                    // Calculate fuel level percentage based on tank height
                    // When distance is 0, tank is full (100%)
                    // When distance equals tank height, tank is empty (0%)
                    const fuelLevelPercentage = Math.max(0, Math.min(100, 
                        Math.round(((TANK_HEIGHT - item.distance) / TANK_HEIGHT) * 100)
                    ));
                    
                    return {
                        ...item,
                        date: new Date(item.timestamp).toISOString().split('T')[0],
                        level: fuelLevelPercentage,
                    };
                });
                
                set({ 
                    fuelHistory: transformedData,
                    loading: false 
                });
                
                // Update current fuel level from latest data if available
                if (transformedData.length > 0) {
                    const latestFuelLevel = transformedData[0].level || 78;
                    set({ 
                        fuelLevel: latestFuelLevel,
                        fuelLevelStatus: getFuelLevelStatus(latestFuelLevel)
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching fuel history:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch fuel history', 
                loading: false 
            });
        }
    }
}));

// Helper function to determine fuel level status
function getFuelLevelStatus(fuelLevel: number): 'normal' | 'warning' | 'critical' {
    if (fuelLevel > 30) return 'normal';
    if (fuelLevel > 15) return 'warning';
    return 'critical';
}