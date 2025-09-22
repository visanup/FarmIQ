import { API_CONFIG } from '../../config/api';
import { Alert } from '../../types/api';

export class NotificationServiceClient {
  private baseUrl: string;

  constructor() {
    // Use analytics-alerts service on port 7306
    this.baseUrl = 'http://localhost:7306/api';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': API_CONFIG.ANALYTICS_API_KEY,
    };
  }

  // Get all notifications/alerts
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    status?: 'unread' | 'read' | 'all';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<{ notifications: Alert[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      // Use appropriate endpoint based on status
      let endpoint = '/alerts';
      if (params?.status === 'unread') {
        endpoint = '/alerts/unresolved';
      }

      const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform analytics-alerts format to our Alert format
      const notifications = (data.alerts || []).map((alert: any) => ({
        id: alert.id.toString(),
        type: alert.alert_type || 'warning',
        title: alert.message || 'Alert',
        message: alert.message || 'No message',
        timestamp: alert.alert_time || new Date().toISOString(),
        deviceId: alert.device_id || '',
        farmId: alert.factory_id || '',
        acknowledged: alert.resolved || false,
        severity: alert.severity || 'medium',
      }));

      // Filter by severity if specified
      let filteredNotifications = notifications;
      if (params?.severity) {
        filteredNotifications = notifications.filter((alert: Alert) => alert.severity === params.severity);
      }

      return {
        notifications: filteredNotifications,
        total: filteredNotifications.length,
        page: params?.page || 1,
        limit: params?.limit || 50,
      };
    } catch (error) {
      console.warn('Failed to fetch notifications from API, using mock data:', error);
      // Return mock data as fallback
      return this.getMockNotifications(params);
    }
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    try {
      // Use unresolved alerts endpoint from analytics-alerts service
      const response = await fetch(`${this.baseUrl}/alerts/unresolved?limit=1000`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Count unresolved alerts as unread
      return data.alerts?.length || 0;
    } catch (error) {
      console.warn('Failed to fetch unread count from API, using mock data:', error);
      // Return mock count as fallback
      return this.getMockUnreadCount();
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // Use resolve endpoint from analytics-alerts service
      const response = await fetch(`${this.baseUrl}/alerts/${notificationId}/resolve`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      // Get all unresolved alerts first
      const unresolvedResponse = await fetch(`${this.baseUrl}/alerts/unresolved?limit=1000`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!unresolvedResponse.ok) {
        throw new Error(`HTTP error! status: ${unresolvedResponse.status}`);
      }

      const data = await unresolvedResponse.json();
      const alerts = data.alerts || [];

      // Resolve each alert individually
      for (const alert of alerts) {
        try {
          await fetch(`${this.baseUrl}/alerts/${alert.id}/resolve`, {
            method: 'PUT',
            headers: this.getHeaders(),
          });
        } catch (error) {
          console.warn(`Failed to resolve alert ${alert.id}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to mark all notifications as read:', error);
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/${notificationId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to delete notification:', error);
    }
  }

  // Mock data methods
  private getMockNotifications(params?: {
    page?: number;
    limit?: number;
    status?: 'unread' | 'read' | 'all';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): { notifications: Alert[]; total: number; page: number; limit: number } {
    // Import mock data directly to avoid require issues
    const mockAlerts: Alert[] = [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'อุณหภูมิสูงเกินไป',
        message: 'อุณหภูมิในเล้า 1 สูงเกิน 35°C',
        timestamp: new Date().toISOString(),
        deviceId: 'device-1',
        farmId: 'farm-1',
        acknowledged: false,
        severity: 'high',
      },
      {
        id: 'alert-2',
        type: 'error',
        title: 'อุปกรณ์ออฟไลน์',
        message: 'เซ็นเซอร์ TEMP-002 ออฟไลน์เป็นเวลา 30 นาที',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        deviceId: 'device-3',
        farmId: 'farm-2',
        acknowledged: false,
        severity: 'critical',
      },
      {
        id: 'alert-3',
        type: 'info',
        title: 'คุณภาพน้ำดี',
        message: 'ค่า pH ของน้ำอยู่ในช่วงปกติ',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        farmId: 'farm-1',
        acknowledged: true,
        severity: 'low',
      },
      {
        id: 'alert-4',
        type: 'warning',
        title: 'แบตเตอรี่ต่ำ',
        message: 'แบตเตอรี่ของเซ็นเซอร์ HUM-001 เหลือ 20%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        deviceId: 'device-2',
        farmId: 'farm-1',
        acknowledged: false,
        severity: 'medium',
      },
      {
        id: 'alert-5',
        type: 'info',
        title: 'การบำรุงรักษาตามกำหนด',
        message: 'อุปกรณ์ในฟาร์ม 1 ผ่านการบำรุงรักษาเรียบร้อย',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        farmId: 'farm-1',
        acknowledged: true,
        severity: 'low',
      },
      {
        id: 'alert-6',
        type: 'warning',
        title: 'ความชื้นต่ำ',
        message: 'ความชื้นในเล้า 2 ต่ำกว่า 40%',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        deviceId: 'device-4',
        farmId: 'farm-2',
        acknowledged: false,
        severity: 'medium',
      }
    ];
    
    let filteredAlerts = [...mockAlerts];

    // Filter by status
    if (params?.status === 'unread') {
      filteredAlerts = filteredAlerts.filter(alert => !alert.acknowledged);
    } else if (params?.status === 'read') {
      filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged);
    }

    // Filter by severity
    if (params?.severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === params.severity);
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    return {
      notifications: paginatedAlerts,
      total: filteredAlerts.length,
      page,
      limit,
    };
  }

  private getMockUnreadCount(): number {
    // Count unread alerts from mock data
    const mockAlerts: Alert[] = [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'อุณหภูมิสูงเกินไป',
        message: 'อุณหภูมิในเล้า 1 สูงเกิน 35°C',
        timestamp: new Date().toISOString(),
        deviceId: 'device-1',
        farmId: 'farm-1',
        acknowledged: false,
        severity: 'high',
      },
      {
        id: 'alert-2',
        type: 'error',
        title: 'อุปกรณ์ออฟไลน์',
        message: 'เซ็นเซอร์ TEMP-002 ออฟไลน์เป็นเวลา 30 นาที',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        deviceId: 'device-3',
        farmId: 'farm-2',
        acknowledged: false,
        severity: 'critical',
      },
      {
        id: 'alert-3',
        type: 'info',
        title: 'คุณภาพน้ำดี',
        message: 'ค่า pH ของน้ำอยู่ในช่วงปกติ',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        farmId: 'farm-1',
        acknowledged: true,
        severity: 'low',
      },
      {
        id: 'alert-4',
        type: 'warning',
        title: 'แบตเตอรี่ต่ำ',
        message: 'แบตเตอรี่ของเซ็นเซอร์ HUM-001 เหลือ 20%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        deviceId: 'device-2',
        farmId: 'farm-1',
        acknowledged: false,
        severity: 'medium',
      },
      {
        id: 'alert-5',
        type: 'info',
        title: 'การบำรุงรักษาตามกำหนด',
        message: 'อุปกรณ์ในฟาร์ม 1 ผ่านการบำรุงรักษาเรียบร้อย',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        farmId: 'farm-1',
        acknowledged: true,
        severity: 'low',
      },
      {
        id: 'alert-6',
        type: 'warning',
        title: 'ความชื้นต่ำ',
        message: 'ความชื้นในเล้า 2 ต่ำกว่า 40%',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        deviceId: 'device-4',
        farmId: 'farm-2',
        acknowledged: false,
        severity: 'medium',
      }
    ];
    
    return mockAlerts.filter((alert: Alert) => !alert.acknowledged).length;
  }
}

export const notificationServiceClient = new NotificationServiceClient();
