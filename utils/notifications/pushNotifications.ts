// Push notification service for admin alerts
export interface PushNotification {
  title: string;
  message: string;
  url?: string;
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  sound?: string;
  device?: string;
  image?: string; // URL to image attachment
  html?: boolean; // Enable HTML formatting
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
    
    if (notification.html) {
      formData.append('html', '1');
    }
    
    // Add image attachment if provided
    if (notification.image) {
      try {
        const imageResponse = await fetch(notification.image);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          formData.append('attachment', imageBlob, 'preview.png');
        }
      } catch (imageError) {
        console.warn('📷 Failed to attach image:', imageError);
        // Continue without image
      }
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

// Rich notification templates with images and detailed content
export const NotificationTemplates = {
  cronSuccess: (summary: any, posts: any[]) => ({
    title: '✅ Cron Job Completed',
    message: `<b>Daily Posts Scheduled Successfully</b>

📊 <b>Results:</b> ${summary.successful}/${summary.total} posts
📈 <b>Success Rate:</b> ${summary.successRate}

📱 <b>Platforms:</b> X, Bluesky, Instagram, Reddit, Pinterest

⏰ <b>Schedule:</b>
• 12:00 PM UTC - Main Cosmic
• 3:00 PM UTC - Daily Crystal  
• 6:00 PM UTC - Daily Tarot
• 9:00 PM UTC - Moon Phase
• 12:00 AM UTC - Daily Horoscope

<i>Tap to view detailed results</i>`,
    url: 'https://lunary.app/admin/cron-monitor',
    priority: 'normal' as const,
    sound: 'cosmic',
    html: true
  }),

  cronFailure: (error: string, failedPosts: any[]) => ({
    title: '❌ Cron Job Failed',
    message: `<b>Daily cron job encountered an error</b>

🚨 <b>Error:</b> ${error.substring(0, 80)}

📱 <b>Failed Posts:</b> ${failedPosts.length > 0 ? failedPosts.map(p => p.name).join(', ') : 'All posts'}

<i>Tap to debug and retry</i>`,
    url: 'https://lunary.app/admin/cron-monitor',
    priority: 'high' as const,
    sound: 'siren',
    html: true
  }),

  dailyPreview: (date: string, postCount: number, cosmicEvent: any) => ({
    title: '👀 Daily Posts Ready',
    message: `<b>${postCount} posts scheduled for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</b>

🌟 <b>Today's Cosmic Event:</b> ${cosmicEvent?.name || 'Cosmic Flow'}
✨ <b>Energy:</b> ${cosmicEvent?.energy || 'Universal Harmony'}
🔮 <b>Post content:</b> ${cosmicEvent?.content || ''}

📱 <b>All platforms:</b> X, Bluesky, Instagram, Reddit, Pinterest

⏰ <b>Times:</b> 12PM, UTC

<i>Tap to preview all images and content</i>`,
    url: `https://lunary.app/admin/daily-posts-preview?date=${date}`,
    priority: 'low' as const,
    image: `https://lunary.app/api/og/cosmic/${date}`,
    html: true
  }),

  weeklyContentGenerated: (title: string, weekNumber: number, highlights: any[]) => ({
    title: '📝 Weekly Content Generated',
    message: `<b>"${title}"</b>

📅 <b>Week ${weekNumber}</b> blog post and newsletter ready

🌟 <b>This Week's Highlights:</b>
${highlights.slice(0, 3).map(h => `• ${h.planet} ${h.event?.replace('-', ' ') || 'activity'}`).join('\n')}

📧 <b>Newsletter:</b> Sent to subscribers
📝 <b>Blog:</b> Ready for publication

<i>Tap to review content</i>`,
    url: 'https://lunary.app/admin/blog-manager',
    priority: 'normal' as const,
    html: true
  }),

  packCreated: (packName: string, sku: string, pricing: any) => ({
    title: '📦 New Pack Created',
    message: `<b>"${packName}"</b>

🏷️ <b>SKU:</b> ${sku}
💰 <b>Price:</b> $${(pricing.amount / 100).toFixed(2)}
🔗 <b>Stripe:</b> Synced successfully

<i>Tap to manage in shop</i>`,
    url: `https://lunary.app/admin/shop-manager`,
    priority: 'normal' as const,
    html: true
  }),

  retrogradeAlert: (planet: string, action: string, date: string, sign: string) => ({
    title: `♻️ ${planet} ${action === 'begins' ? 'Goes Retrograde' : 'Stations Direct'}`,
    message: `<b>Major Astrological Event</b>

🪐 <b>${planet}</b> ${action === 'begins' ? 'stations retrograde' : 'stations direct'}
📅 <b>Date:</b> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
♈ <b>Sign:</b> ${sign}

${getRetrogradeBriefing(planet, action)}

<i>Tap to see weekly forecast</i>`,
    url: 'https://lunary.app/admin/blog-manager',
    priority: 'high' as const,
    html: true
  })
};

function getRetrogradeBriefing(planet: string, action: string): string {
  const briefings: { [key: string]: { begins: string; ends: string } } = {
    'Mercury': {
      begins: '📱 Expect communication delays, tech issues. Good for reflection.',
      ends: '🚀 Clear communication returns. Resume major decisions.'
    },
    'Venus': {
      begins: '💕 Review relationships and values. Avoid big love decisions.',
      ends: '💖 Relationships flow smoothly. Good for new partnerships.'
    },
    'Mars': {
      begins: '⚡ Energy redirected inward. Focus on planning over action.',
      ends: '🔥 Action energy surges. Time for bold initiatives.'
    }
  };

  const planetBriefing = briefings[planet];
  if (planetBriefing && (action === 'begins' || action === 'ends')) {
    return planetBriefing[action as 'begins' | 'ends'];
  }
  
  return `🌟 ${planet} energy ${action === 'begins' ? 'turns inward' : 'moves forward'}.`;
}

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
