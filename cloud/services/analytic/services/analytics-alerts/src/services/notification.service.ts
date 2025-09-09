// src/services/notification.service.ts
import { Alert } from '../models/alert.model';
import { SLACK_WEBHOOK_URL } from '../configs/config';
import axios from 'axios';

/**
 * Service class for sending notifications
 */
export class NotificationService {
  /**
   * Send alert notification to Slack
   * @param alert Alert that triggered the notification
   */
  async sendSlackNotification(alert: Alert): Promise<void> {
    if (!SLACK_WEBHOOK_URL) {
      console.warn('⚠️ SLACK_WEBHOOK_URL not configured');
      return;
    }
    
    const message = {
      text: `🚨 New Alert: ${alert.type}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            content: `*🚨 New Alert: ${alert.type}*
            \n*Message:* ${alert.message}
            \n*Severity:* ${alert.severity}
            \n*Time:* ${alert.alert_time.toISOString()}
            \n*Metric:* ${alert.metric} - ${alert.value}
            \n*Location:* Tenant: ${alert.tenant_id}, Factory: ${alert.factory_id}, Device: ${alert.device_id}`
          }
        }
      ]
    };
    
    try {
      await axios.post(SLACK_WEBHOOK_URL, message);
      console.log(`✅ Slack notification sent for alert: ${alert.id}`);
    } catch (error) {
      console.error(`❌ Failed to send Slack notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Send alert notification to LINE
   * @param alert Alert that triggered the notification
   */
  async sendLineNotification(alert: Alert): Promise<void> {
    // Implementation for LINE notifications
    console.warn('⚠️ LINE notification not yet implemented');
  }
  
  /**
   * Send alert notification to all configured channels
   * @param alert Alert that triggered the notification
   */
  async sendNotification(alert: Alert): Promise<void> {
    // Send notifications based on configuration
    if (SLACK_WEBHOOK_URL) {
      await this.sendSlackNotification(alert);
    }
    
    if (process.env.ALERT_BACKEND === 'line' && process.env.LINE_NOTIFY_TOKEN) {
      await this.sendLineNotification(alert);
    }
    
    // Add more notification channels as needed
  }
}