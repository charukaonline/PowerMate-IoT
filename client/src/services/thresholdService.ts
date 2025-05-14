// src/services/thresholdService.ts

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/thresholds';

// Define types for the threshold data
interface VoltageThreshold {
    min: number;
    max: number;
    warningMin: number;
    warningMax: number;
}

interface CurrentThreshold {
    min: number;
    max: number;
    warningMin: number;
    warningMax: number;
}

interface FuelThreshold {
    warningLevel: number;
    criticalLevel: number;
}

interface BatteryThreshold {
    warningVoltage: number;
    criticalVoltage: number;
    maxTemperature: number;
}

interface TemperatureThreshold {
    normal: number;
    warning: number;
    critical: number;
}

interface PowerSupplyThreshold {
    minVoltage: number;
    maxVoltage: number;
    minCurrent: number;
    maxCurrent: number;
}

interface BackupBatteryThreshold {
    minVoltage: number;
    maxVoltage: number;
    minCurrent: number;
    maxCurrent: number;
}

interface GeneratorThreshold {
    tankCapacity: number;
    criticalLevel: number;
}

export interface ThresholdData {
    thresholds: {
        voltage: VoltageThreshold;
        current: CurrentThreshold;
        fuel: FuelThreshold;
        battery: BatteryThreshold;
        temperature: TemperatureThreshold;
        powerSupply: PowerSupplyThreshold;
        backupBattery: BackupBatteryThreshold;
        generator: GeneratorThreshold;
    };
    tankCapacity: number;
    updatedAt?: Date;
    _id?: string;
}

export interface ApiResponse {
    success: boolean;
    data?: ThresholdData;
    message?: string;
}


export const getUserThresholds = async (): Promise<ApiResponse> => {
    try {
        const response = await axios.get(`${API_URL}/get-thresholds`);
        return response.data;
    } catch (error) {
        console.error('Error fetching threshold settings:', error);
        throw error;
    }
};


export const updateUserThresholds = async (thresholdData: Partial<ThresholdData>): Promise<ApiResponse> => {
    try {
        const response = await axios.put(`${API_URL}/update-thresholds`, thresholdData);
        return response.data;
    } catch (error) {
        console.error('Error updating threshold settings:', error);
        throw error;
    }
};