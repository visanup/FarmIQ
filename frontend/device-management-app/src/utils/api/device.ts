// src/utils/api/device.ts

const API_URL = process.env.REACT_APP_DATA_SERVICE_URL!;
console.log('API URL:', API_URL);

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface Device {
  device_id?: number;
  house_id: number;
  type_id: number | null;
  group_id: number | null;
  model?: string;
  serial_number?: string;
  install_date?: string | Date | null;
  calibration_date?: string | Date | null;
  last_maintenance?: string | Date | null;
  location_detail: string | null;
  manufacturer: string | null;
  purchase_date?: string | Date | null;
  warranty_expiry?: string | Date | null;
  specs: any;
  location_latitude: number | null;
  location_longitude: number | null;
  firmware_version: string | null;
  ip_address: string | null;
  mac_address: string | null;
  last_seen: string | null;
  tags: string[];
  config: any;
  credentials: any;
  build_code: string | null;
  build_date: string | null;
  status: string;
  created_at: string;
  group_name?: string;
  type_name?: string;
}

export interface DeviceGroup {
  group_id: number;
  name: string;
  note: string | null;
  created_at: string;
}

export interface DeviceType {
  type_id: number;
  name: string;
  icon_css_class: string | null;
  default_image_url: string | null;
}

export interface DeviceLog {
  log_id: number;
  device_id: number;
  event_type: string;
  event_data: any;
  performed_by: string | null;
  created_at: string;
}

export interface DeviceStatusHistory {
  id: number;
  device_id: number;
  performed_by: string | null;
  status: string;
  changed_at: string;
  note: string | null;
}

export const deviceApi = {
  devices: {
    list: async (): Promise<Device[]> => {
      const res = await fetch(`${API_URL}/api/devices`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch devices');
      return res.json();
    },
    get: async (id: number): Promise<Device> => {
      const res = await fetch(`${API_URL}/api/devices/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch device');
      return res.json();
    },
    create: async (data: Partial<Device>): Promise<Device> => {
      const res = await fetch(`${API_URL}/api/devices`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create device');
      return res.json();
    },
    update: async (id: number, data: Partial<Device>): Promise<Device> => {
      const res = await fetch(`${API_URL}/api/devices/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update device');
      return res.json();
    },
    remove: async (id: number): Promise<void> => {
      const res = await fetch(`${API_URL}/api/devices/${id}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete device');
    },
  },

  groups: {
    list: async (): Promise<DeviceGroup[]> => {
      const res = await fetch(`${API_URL}/api/devices/device-groups`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch device groups');
      return res.json();
    },
    get: async (id: number): Promise<DeviceGroup> => {
      const res = await fetch(`${API_URL}/api/devices/device-groups/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch device group');
      return res.json();
    },
    create: async (data: Partial<DeviceGroup>): Promise<DeviceGroup> => {
      const res = await fetch(`${API_URL}/api/devices/device-groups`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create device group');
      return res.json();
    },
    update: async (id: number, data: Partial<DeviceGroup>): Promise<DeviceGroup> => {
      const res = await fetch(`${API_URL}/api/devices/device-groups/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update device group');
      return res.json();
    },
    remove: async (id: number): Promise<void> => {
      const res = await fetch(`${API_URL}/api/devices/device-groups/${id}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete device group');
    },
  },

  types: {
    list: async (): Promise<DeviceType[]> => {
      const res = await fetch(`${API_URL}/api/devices/device-types`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch device types');
      return res.json();
    },
    get: async (id: number): Promise<DeviceType> => {
      const res = await fetch(`${API_URL}/api/devices/device-types/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch device type');
      return res.json();
    },
    create: async (data: Partial<DeviceType>): Promise<DeviceType> => {
      const res = await fetch(`${API_URL}/api/devices/device-types`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create device type');
      return res.json();
    },
    update: async (id: number, data: Partial<DeviceType>): Promise<DeviceType> => {
      const res = await fetch(`${API_URL}/api/devices/device-types/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update device type');
      return res.json();
    },
    remove: async (id: number): Promise<void> => {
      const res = await fetch(`${API_URL}/api/devices/device-types/${id}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete device type');
    },
  },

  // Logs endpoint: build URL manually to avoid new URL() with empty base
  logs: {
    list: async (deviceId?: number) => {
      let endpoint = `${API_URL}/api/devices/device-logs`;
      if (deviceId != null) endpoint += `?device_id=${deviceId}`;
      return fetch(endpoint, { headers: getAuthHeaders() })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch device logs');
          return res.json();
        });
    },
    get: async (id: number): Promise<DeviceLog> => {
      const res = await fetch(`${API_URL}/api/devices/device-logs/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch device log');
      return res.json();
    },
    create: async (data: Partial<DeviceLog>): Promise<DeviceLog> => {
      const res = await fetch(`${API_URL}/api/devices/device-logs`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create device log');
      return res.json();
    },
    update: async (id: number, data: Partial<DeviceLog>): Promise<DeviceLog> => {
      const res = await fetch(`${API_URL}/api/devices/device-logs/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update device log');
      return res.json();
    },
    remove: async (id: number): Promise<void> => {
      const res = await fetch(`${API_URL}/api/devices/device-logs/${id}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete device log');
    },
  },

  // Status history endpoint: manual URL building as well
  statusHistory: {
    list: async (deviceId?: number) => {
      let endpoint = `${API_URL}/api/devices/device-status-history`;
      if (deviceId != null) endpoint += `?device_id=${deviceId}`;
      return fetch(endpoint, { headers: getAuthHeaders() })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch status history');
          return res.json();
        });
    },
    get: async (id: number): Promise<DeviceStatusHistory> => {
      const res = await fetch(`${API_URL}/api/devices/device-status-history${id}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch status record');
      return res.json();
    },
    create: async (data: Partial<DeviceStatusHistory>): Promise<DeviceStatusHistory> => {
      const res = await fetch(`${API_URL}/api/devices/device-status-history`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create status record');
      return res.json();
    },
    update: async (id: number, data: Partial<DeviceStatusHistory>): Promise<DeviceStatusHistory> => {
      const res = await fetch(`${API_URL}/api/devices/device-status-history/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update status record');
      return res.json();
    },
    remove: async (id: number): Promise<void> => {
      const res = await fetch(`${API_URL}/api/devices/device-status-history/${id}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete status record');
    },
  },
};
