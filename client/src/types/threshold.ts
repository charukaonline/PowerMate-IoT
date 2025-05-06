export interface ThresholdSettings {
  userId?: string;
  thresholds: {
    voltage: {
      min: number;
      max: number;
      warningMin: number;
      warningMax: number;
    };
    current: {
      min: number;
      max: number;
      warningMin: number;
      warningMax: number;
    };
    fuel: {
      warningLevel: number;
      criticalLevel: number;
    };
    battery: {
      warningVoltage: number;
      criticalVoltage: number;
      maxTemperature: number;
    };
    temperature: {
      normal: number;
      warning: number;
      critical: number;
    };
  };
  tankCapacity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ThresholdResponse {
  success: boolean;
  message?: string;
  data?: ThresholdSettings;
}
