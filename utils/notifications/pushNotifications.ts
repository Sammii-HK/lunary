// Push notification service for admin alerts
export interface PushNotification {
  title: string;
  message: string;
  url?: string;
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  sound?: string;
  device?: string;
}

export interface NotificationResult {
  success: boolean;
  service: 'pushover'| 'none';
  messageId?: string;
  error?: string;
}

// Send push notification via Pushover
export async function sendPushoverNotification(notification: PushNotification): Promise<NotificationResult> {
  const apiToken = process.env.PUSHOVER_API_TOKEN;
  const userKey = process.env.PUSHOVER_USER_KEY;
  
  if (!apiToken || !userKey) {
    console.log('📱 Pushover not configured, skipping notification');
    return { success: false, service: 'pushover', error: 'Not configured' };
  }

  try {
    const formData = new FormData();
    formData.append('token', apiToken);
    formData.append('user', userKey);
    formData.append('title', notification.title);
    formData.append('message', notification.message);
    
    if (notification.url) {
      formData.append('url', notification.url);
      formData.append('url_title', 'View Details');
    }
    
    if (notification.priority) {
      const priorityMap = { low: '-1', normal: '0', high: '1', emergency: '2' };
      formData.append('priority', priorityMap[notification.priority]);
    }
    
    if (notification.sound) {
      formData.append('sound', notification.sound);
    }

    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.status === 1) {
      console.log('✅ Pushover notification sent successfully');
      return { 
        success: true, 
        service: 'pushover', 
        messageId: result.request 
      };
    } else {
      console.error('❌ Pushover notification failed:', result);
      return { 
        success: false, 
        service: 'pushover', 
        error: result.errors?.join(', ') || 'Unknown error' 
      };
    }
  } catch (error) {
    console.error('❌ Pushover request failed:', error);
    return { 
      success: false, 
      service: 'pushover', 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}


// Send notification via Pushover only
export async function sendAdminNotification(notification: PushNotification): Promise<NotificationResult> {
  console.log('📱 Sending admin notification:', notification.title);
  
  const result = await sendPushoverNotification(notification);
  
  if (result.success) {
    console.log('📱 Pushover notification sent successfully');
  } else {
    console.error('📱 Pushover notification failed:', result.error);
  }
  
  return result;
}

// Predefined notification templates for common admin events
export const NotificationTemplates = {
  cronSuccess: (summary: any) => ({
    title: '✅ Cron Job Completed',
    message: `${summary.successful}/${summary.total} posts scheduled successfully. Success rate: ${summary.successRate}`,
    url: 'https://lunary.app/admin/cron-monitor',
    priority: 'normal' as const,
    sound: 'cosmic'
  }),

  cronFailure: (error: string) => ({
    title: '❌ Cron Job Failed',
    message: `Daily cron job encountered an error: ${error.substring(0, 100)}`,
    url: 'https://lunary.app/admin/cron-monitor',
    priority: 'high' as const,
    sound: 'siren'
  }),

  weeklyContentGenerated: (title: string, weekNumber: number) => ({
    title: '📝 Weekly Content Generated',
    message: `"${title}" - Week ${weekNumber} blog post and newsletter ready`,
    url: 'https://lunary.app/admin/blog-manager',
    priority: 'normal' as const
  }),

  packCreated: (packName: string, stripeId: string) => ({
    title: '📦 New Pack Created',
    message: `"${packName}" generated and synced to Stripe`,
    url: `https://lunary.app/admin/shop-manager`,
    priority: 'normal' as const
  }),

  dailyPreview: (date: string, postCount: number) => ({
    title: '👀 Daily Posts Preview',
    message: `${postCount} posts scheduled for ${date}. Tap to preview content and images.`,
    url: `https://lunary.app/admin/daily-posts-preview?date=${date}`,
    priority: 'low' as const
  }),

  retrogradeAlert: (planet: string, action: string, date: string) => ({
    title: `♻️ ${planet} ${action === 'begins' ? 'Goes Retrograde' : 'Stations Direct'}`,
    message: `${planet} ${action === 'begins' ? 'stations retrograde' : 'stations direct'} on ${date}. Major astrological event detected.`,
    url: 'https://lunary.app/admin/blog-manager',
    priority: 'high' as const
  })
};

// Notification queue for batch sending (to avoid rate limits)
class NotificationQueue {
  private queue: PushNotification[] = [];
  private processing = false;

  add(notification: PushNotification) {
    this.queue.push(notification);
    this.process();
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const notification = this.queue.shift();
      if (notification) {
        await sendAdminNotification(notification);
        // Rate limit: wait 1 second between notifications
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    this.processing = false;
  }
}

export const notificationQueue = new NotificationQueue();
