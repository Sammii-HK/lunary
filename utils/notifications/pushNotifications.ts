// Push notification service for admin alerts
export interface PushNotification {
  title: string;
  message: string;
  url?: string;
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  sound?: string;
  device?: string;
  image?: string; // URL to image attachment (single image)
  images?: string[]; // Multiple image URLs (will attach first one, list others in message)
  icon?: string; // URL to icon (Pushover icon_url parameter)
  html?: boolean; // Enable HTML formatting
}

export interface NotificationResult {
  success: boolean;
  service: 'pushover' | 'none';
  messageId?: string;
  error?: string;
}

// Send push notification via Pushover
export async function sendPushoverNotification(
  notification: PushNotification,
): Promise<NotificationResult> {
  // Only send Pushover notifications in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('📱 Pushover notifications disabled in development, skipping');
    return { success: false, service: 'pushover', error: 'Development mode' };
  }

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

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    if (notification.url) {
      formData.append('url_title', 'View Details');
    }

    // Pushover allows one attachment per message - prioritize icon, then image
    // The attachment parameter is used for the icon file
    let attachmentAdded = false;

    // First, try to attach the icon (Lunary icon)
    const iconUrl = notification.icon || `${baseUrl}/icons/icon-192x192.png`;
    try {
      const iconResponse = await fetch(iconUrl);
      if (iconResponse.ok) {
        const iconBlob = await iconResponse.blob();
        const iconSize = iconBlob.size;

        // Pushover requires icon to be under 2.5 MB
        if (iconSize < 2.5 * 1024 * 1024) {
          const contentType =
            iconResponse.headers.get('content-type') || 'image/png';
          const extension =
            contentType.includes('jpeg') || contentType.includes('jpg')
              ? 'jpg'
              : 'png';
          formData.append('attachment', iconBlob, `lunary-icon.${extension}`);
          attachmentAdded = true;
          console.log('📎 Attached Lunary icon as notification icon');
        } else {
          console.warn(
            '📎 Icon file too large for Pushover (must be < 2.5 MB)',
          );
        }
      }
    } catch (iconError) {
      console.warn('📎 Failed to fetch icon:', iconError);
    }

    // If no icon was attached and there's an image, attach the image instead
    if (!attachmentAdded && notification.image) {
      try {
        const imageResponse = await fetch(notification.image);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const imageSize = imageBlob.size;

          // Pushover requires attachment to be under 2.5 MB
          if (imageSize < 2.5 * 1024 * 1024) {
            const contentType =
              imageResponse.headers.get('content-type') || 'image/png';
            const extension =
              contentType.includes('jpeg') || contentType.includes('jpg')
                ? 'jpg'
                : 'png';
            formData.append('attachment', imageBlob, `preview.${extension}`);
            attachmentAdded = true;
            console.log('📷 Attached preview image');
          } else {
            console.warn(
              '📷 Image file too large for Pushover (must be < 2.5 MB)',
            );
          }
        }
      } catch (imageError) {
        console.warn('📷 Failed to attach image:', imageError);
      }
    }

    // If still no attachment and there are multiple images, try the first one
    if (
      !attachmentAdded &&
      notification.images &&
      notification.images.length > 0
    ) {
      try {
        const imageResponse = await fetch(notification.images[0]);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const imageSize = imageBlob.size;

          if (imageSize < 2.5 * 1024 * 1024) {
            const contentType =
              imageResponse.headers.get('content-type') || 'image/png';
            const extension =
              contentType.includes('jpeg') || contentType.includes('jpg')
                ? 'jpg'
                : 'png';
            formData.append('attachment', imageBlob, `preview.${extension}`);
            console.log('📷 Attached first image from images array');
          }
        }
      } catch (imageError) {
        console.warn(
          '📷 Failed to attach image from images array:',
          imageError,
        );
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
        messageId: result.request,
      };
    } else {
      console.error('❌ Pushover notification failed:', result);
      return {
        success: false,
        service: 'pushover',
        error: result.errors?.join(', ') || 'Unknown error',
      };
    }
  } catch (error) {
    console.error('❌ Pushover request failed:', error);
    return {
      success: false,
      service: 'pushover',
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Send notification via Pushover only
export async function sendAdminNotification(
  notification: PushNotification,
): Promise<NotificationResult> {
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
  cronSuccess: (summary: any, posts: any[]) => {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    return {
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
      url: `${baseUrl}/admin/cron-monitor`,
      priority: 'normal' as const,
      sound: 'cosmic',
      icon: `${baseUrl}/icons/icon-192x192.png`,
      html: true,
    };
  },

  cronFailure: (error: string, failedPosts: any[]) => {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    return {
      title: '❌ Cron Job Failed',
      message: `<b>Daily cron job encountered an error</b>

🚨 <b>Error:</b> ${error.substring(0, 80)}

📱 <b>Failed Posts:</b> ${failedPosts.length > 0 ? failedPosts.map((p) => p.name).join(', ') : 'All posts'}

<i>Tap to debug and retry</i>`,
      url: `${baseUrl}/admin/cron-monitor`,
      priority: 'high' as const,
      sound: 'siren',
      icon: `${baseUrl}/icons/icon-192x192.png`,
      html: true,
    };
  },

  dailyPreview: (
    date: string,
    postCount: number,
    cosmicEvent: any,
    postContent?: string,
    allImages?: string[],
  ) => {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    // Collect all image URLs
    const imageUrls = allImages || [
      `${baseUrl}/api/og/cosmic/${date}`,
      `${baseUrl}/api/og/crystal?date=${date}`,
      `${baseUrl}/api/og/tarot?date=${date}`,
      `${baseUrl}/api/og/moon?date=${date}`,
      `${baseUrl}/api/og/horoscope?date=${date}`,
    ];

    // Truncate post content if too long
    const contentSnippet = postContent
      ? postContent.length > 200
        ? postContent.substring(0, 200) + '...'
        : postContent
      : '';

    return {
      title: '👀 Daily Posts Ready',
      message: `<b>${postCount} posts scheduled for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</b>

🌟 <b>Today's Cosmic Event:</b> ${cosmicEvent?.name || 'Cosmic Flow'}
✨ <b>Energy:</b> ${cosmicEvent?.energy || 'Universal Harmony'}
${contentSnippet ? `\n📝 <b>Post Content:</b> ${contentSnippet}` : ''}

📸 <b>Images Generated:</b>
${imageUrls.map((url, i) => `• ${['Cosmic', 'Crystal', 'Tarot', 'Moon', 'Horoscope'][i] || `Image ${i + 1}`}`).join('\n')}

📱 <b>Platforms:</b> X, Bluesky, Instagram, Reddit, Pinterest
⏰ <b>Schedule:</b> 12:00 PM UTC

<i>Tap to preview all images and content</i>`,
      url: `${baseUrl}/admin/daily-posts-preview?date=${date}`,
      priority: 'normal' as const,
      image: imageUrls[0],
      images: imageUrls,
      icon: `${baseUrl}/icons/icon-192x192.png`,
      html: true,
    };
  },

  dailyPostType: (
    postType: 'cosmic' | 'crystal' | 'tarot' | 'moon' | 'horoscope',
    date: string,
    imageUrl: string,
    content?: string,
    cosmicEvent?: any,
  ) => {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const typeNames = {
      cosmic: '🌟 Cosmic',
      crystal: '💎 Crystal',
      tarot: '🔮 Tarot',
      moon: '🌙 Moon',
      horoscope: '✨ Horoscope',
    };

    const typeName = typeNames[postType];
    const dateStr = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    // Truncate content if too long
    const contentSnippet = content
      ? content.length > 150
        ? content.substring(0, 150) + '...'
        : content
      : '';

    let message = `<b>${typeName} Post Ready</b>\n\n`;
    message += `📅 <b>Date:</b> ${dateStr}\n`;

    if (cosmicEvent) {
      message += `🌟 <b>Event:</b> ${cosmicEvent.name || 'Cosmic Flow'}\n`;
      message += `✨ <b>Energy:</b> ${cosmicEvent.energy || 'Universal Harmony'}\n`;
    }

    if (contentSnippet) {
      message += `\n📝 <b>Content:</b> ${contentSnippet}\n`;
    }

    message += `\n📱 <b>Platforms:</b> X, Bluesky, Instagram, Reddit, Pinterest`;
    message += `\n⏰ <b>Scheduled:</b> 12:00 PM UTC`;
    message += `\n\n<i>Tap to preview</i>`;

    return {
      title: `${typeName} Post Generated`,
      message,
      url: `${baseUrl}/admin/daily-posts-preview?date=${date}`,
      priority: 'normal' as const,
      image: imageUrl,
      icon: `${baseUrl}/icons/icon-192x192.png`,
      html: true,
    };
  },

  weeklyContentGenerated: (
    title: string,
    weekNumber: number,
    highlights: any[],
    blogPreviewUrl?: string,
  ) => {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    return {
      title: '📝 Weekly Content Generated',
      message: `<b>"${title}"</b>

📅 <b>Week ${weekNumber}</b> blog post and newsletter ready

🌟 <b>This Week's Highlights:</b>
${highlights
  .slice(0, 3)
  .map((h) => `• ${h.planet} ${h.event?.replace('-', ' ') || 'activity'}`)
  .join('\n')}

📧 <b>Newsletter:</b> Sent to subscribers
📝 <b>Blog:</b> Ready for publication

<i>Tap to review content</i>`,
      url: `${baseUrl}/admin/blog-manager`,
      priority: 'normal' as const,
      image:
        blogPreviewUrl ||
        `${baseUrl}/api/og/cosmic/${new Date().toISOString().split('T')[0]}`,
      icon: `${baseUrl}/icons/icon-192x192.png`,
      html: true,
    };
  },

  packCreated: (packName: string, sku: string, pricing: any) => {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    return {
      title: '📦 New Pack Created',
      message: `<b>"${packName}"</b>

🏷️ <b>SKU:</b> ${sku}
💰 <b>Price:</b> $${(pricing.amount / 100).toFixed(2)}
🔗 <b>Stripe:</b> Synced successfully

<i>Tap to manage in shop</i>`,
      url: `${baseUrl}/admin/shop-manager`,
      priority: 'normal' as const,
      icon: `${baseUrl}/icons/icon-192x192.png`,
      html: true,
    };
  },

  retrogradeAlert: (
    planet: string,
    action: string,
    date: string,
    sign: string,
  ) => {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    return {
      title: `♻️ ${planet} ${action === 'begins' ? 'Goes Retrograde' : 'Stations Direct'}`,
      message: `<b>Major Astrological Event</b>

🪐 <b>${planet}</b> ${action === 'begins' ? 'stations retrograde' : 'stations direct'}
📅 <b>Date:</b> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
♈ <b>Sign:</b> ${sign}

${getRetrogradeBriefing(planet, action)}

<i>Tap to see weekly forecast</i>`,
      url: `${baseUrl}/admin/blog-manager`,
      priority: 'high' as const,
      icon: `${baseUrl}/icons/icon-192x192.png`,
      html: true,
    };
  },
};

function getRetrogradeBriefing(planet: string, action: string): string {
  const briefings: { [key: string]: { begins: string; ends: string } } = {
    Mercury: {
      begins:
        '📱 Expect communication delays, tech issues. Good for reflection.',
      ends: '🚀 Clear communication returns. Resume major decisions.',
    },
    Venus: {
      begins: '💕 Review relationships and values. Avoid big love decisions.',
      ends: '💖 Relationships flow smoothly. Good for new partnerships.',
    },
    Mars: {
      begins: '⚡ Energy redirected inward. Focus on planning over action.',
      ends: '🔥 Action energy surges. Time for bold initiatives.',
    },
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    this.processing = false;
  }
}

export const notificationQueue = new NotificationQueue();
