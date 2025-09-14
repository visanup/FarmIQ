export interface CreateDeviceConfigurationInput {
  deviceId: string;
  configType: string;
  configData: any;
  version: string;
  isActive?: boolean;
  appliedAt?: string;
}

export interface UpdateDeviceConfigurationInput {
  configData?: any;
  version?: string;
  isActive?: boolean;
  appliedAt?: string;
}

export interface DeviceConfigurationResponse {
  id: string;
  deviceId: string;
  configType: string;
  configData: any;
  version: string;
  isActive: boolean;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
