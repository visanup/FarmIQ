import { io, Socket } from 'socket.io-client';
import { SensorReading, DeviceHealth, Alert } from '@/types';

export type WebSocketEventType = 
  | 'sensor-reading' 
  | 'device-health' 
  | 'alert' 
  | 'analytics-feature';

export interface WebSocketSubscription {
  eventType: WebSocketEventType;
  filters?: {
    tenant_id?: string;
    device_id?: string;
    metric?: string;
  };
  callback: (data: any) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    this.connect();
  }

  private connect(): void {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';
    
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // Resubscribe to all subscriptions
      this.subscriptions.forEach((subscription, id) => {
        this.resubscribe(id, subscription);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Data event handlers
    this.socket.on('sensor-reading', (data: SensorReading) => {
      this.handleEvent('sensor-reading', data);
    });

    this.socket.on('device-health', (data: DeviceHealth) => {
      this.handleEvent('device-health', data);
    });

    this.socket.on('alert', (data: Alert) => {
      this.handleEvent('alert', data);
    });

    this.socket.on('analytics-feature', (data: any) => {
      this.handleEvent('analytics-feature', data);
    });
  }

  private handleEvent(eventType: WebSocketEventType, data: any): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription.eventType === eventType) {
        // Apply filters if specified
        if (subscription.filters) {
          const { tenant_id, device_id, metric } = subscription.filters;
          
          if (tenant_id && data.tenant_id !== tenant_id) return;
          if (device_id && data.device_id !== device_id) return;
          if (metric && data.metric !== metric) return;
        }
        
        // Call the callback
        try {
          subscription.callback(data);
        } catch (error) {
          console.error('Error in WebSocket callback:', error);
        }
      }
    });
  }

  private handleReconnect(): void {
    this.reconnectAttempts++;
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      setTimeout(() => {
        if (!this.socket?.connected) {
          this.connect();
        }
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
    }
  }

  private resubscribe(id: string, subscription: WebSocketSubscription): void {
    if (!this.socket?.connected) return;

    // Send subscription request to server
    this.socket.emit('subscribe', {
      id,
      eventType: subscription.eventType,
      filters: subscription.filters,
    });
  }

  public subscribe(subscription: WebSocketSubscription): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.subscriptions.set(id, subscription);
    
    if (this.socket?.connected) {
      this.resubscribe(id, subscription);
    }
    
    return id;
  }

  public unsubscribe(subscriptionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', { id: subscriptionId });
    }
    this.subscriptions.delete(subscriptionId);
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscriptions.clear();
  }

  // Convenience methods for common subscriptions
  public subscribeSensorReadings(
    filters: { tenant_id?: string; device_id?: string; metric?: string },
    callback: (data: SensorReading) => void
  ): string {
    return this.subscribe({
      eventType: 'sensor-reading',
      filters,
      callback,
    });
  }

  public subscribeDeviceHealth(
    filters: { tenant_id?: string; device_id?: string },
    callback: (data: DeviceHealth) => void
  ): string {
    return this.subscribe({
      eventType: 'device-health',
      filters,
      callback,
    });
  }

  public subscribeAlerts(
    filters: { tenant_id?: string },
    callback: (data: Alert) => void
  ): string {
    return this.subscribe({
      eventType: 'alert',
      filters,
      callback,
    });
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;