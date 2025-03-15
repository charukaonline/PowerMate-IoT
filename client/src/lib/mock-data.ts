// Helper function to generate random data
const randomValue = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate time series data
const generateTimeSeriesData = (
  hours: number,
  minValue: number,
  maxValue: number,
  interval: number = 10
) => {
  const data = [];
  const now = new Date();
  
  for (let i = hours * 60; i >= 0; i -= interval) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toISOString(),
      value: randomValue(minValue, maxValue),
    });
  }
  
  return data;
};

// Dashboard data
export const powerConsumptionData = generateTimeSeriesData(24, 180, 240);
export const backupPowerStatus = "Active";
export const generatorFuelLevel = 78;
export const powerDowntime = 2.5;
export const runtimeDistribution = [
  { name: "Main Power", value: 75 },
  { name: "Generator", value: 15 },
  { name: "Battery", value: 10 },
];

// Power Supply data
export const voltageData = generateTimeSeriesData(24, 210, 240);
export const frequencyData = generateTimeSeriesData(24, 48, 52);
export const minVoltageData = generateTimeSeriesData(24, 200, 220);
export const maxVoltageData = generateTimeSeriesData(24, 230, 250);
export const voltageStatus = {
  max: 245,
  min: 210,
  average: 228,
};

// Current Monitoring data
export const currentData = generateTimeSeriesData(24, 10, 30);
export const minCurrentData = generateTimeSeriesData(24, 8, 15);
export const maxCurrentData = generateTimeSeriesData(24, 25, 35);
export const currentStatus = "normal"; // "normal", "warning", "critical"

// Generator Fuel data
export const fuelLevelPercentage = 78;
export const fuelVolume = 156; // liters
export const fuelLevelStatus = "normal"; // "normal", "warning", "critical"
export const oilTemperature = 65; // Celsius

// Backup Battery data
export const batteryVoltageData = generateTimeSeriesData(24, 11.5, 13.8);
export const batteryStatus = "charging"; // "charging", "discharging"
export const batteryPower = 12.6;
export const batteryTemperatureData = generateTimeSeriesData(24, 25, 40);
export const chargingCycleStatus = {
  cycleCount: 128,
  wastedCycles: 12,
  dischargeTime: 4.5, // hours
};

// User data
export const userData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  role: "Administrator",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
  lastLogin: "2025-04-10T08:30:00Z",
  preferences: {
    theme: "system",
    notifications: true,
    refreshRate: 30, // seconds
  },
};

// Settings data
export const settingsData = {
  thresholds: {
    voltage: {
      min: 200,
      max: 250,
      warningMin: 210,
      warningMax: 240,
    },
    current: {
      min: 5,
      max: 40,
      warningMin: 10,
      warningMax: 30,
    },
    fuel: {
      warningLevel: 30,
      criticalLevel: 15,
    },
    battery: {
      warningVoltage: 11.8,
      criticalVoltage: 11.2,
      maxTemperature: 45,
    },
  },
  tankCapacity: 200, // liters
};

// Activity logs
export const activityLogs = [
  {
    id: 1,
    action: "System Login",
    timestamp: "2025-04-10T08:30:00Z",
    details: "User logged in from 192.168.1.105",
  },
  {
    id: 2,
    action: "Voltage Alert",
    timestamp: "2025-04-10T10:15:00Z",
    details: "Voltage dropped below warning threshold (205V)",
  },
  {
    id: 3,
    action: "Generator Start",
    timestamp: "2025-04-10T10:16:00Z",
    details: "Generator automatically started due to low voltage",
  },
  {
    id: 4,
    action: "Settings Changed",
    timestamp: "2025-04-09T14:22:00Z",
    details: "User updated voltage threshold settings",
  },
  {
    id: 5,
    action: "Fuel Level Alert",
    timestamp: "2025-04-08T23:45:00Z",
    details: "Generator fuel level below 30%",
  },
];