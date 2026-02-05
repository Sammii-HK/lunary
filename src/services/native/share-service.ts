/**
 * Native Share Service
 *
 * Provides native OS share sheet integration for iOS/Android.
 * Falls back to Web Share API or clipboard on web.
 *
 * Usage:
 *   import { shareService } from '@/services/native';
 *   await shareService.shareTarotCard(card, isReversed);
 */

import { Capacitor } from '@capacitor/core';
import { Share, ShareResult } from '@capacitor/share';

const APP_URL = 'https://lunary.app';

interface ShareContent {
  title?: string;
  text: string;
  url?: string;
  dialogTitle?: string;
}

class NativeShareService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Check if native sharing is available
   */
  isAvailable(): boolean {
    return (
      this.isNative || (typeof navigator !== 'undefined' && !!navigator.share)
    );
  }

  /**
   * Share content using native share sheet or web fallback
   */
  async share(content: ShareContent): Promise<ShareResult | void> {
    if (this.isNative) {
      return this.nativeShare(content);
    }
    return this.webShare(content);
  }

  private async nativeShare(content: ShareContent): Promise<ShareResult> {
    return Share.share({
      title: content.title,
      text: content.text,
      url: content.url,
      dialogTitle: content.dialogTitle || 'Share',
    });
  }

  private async webShare(content: ShareContent): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.text,
          url: content.url,
        });
      } catch (error) {
        // User cancelled - this is normal
        if ((error as Error).name !== 'AbortError') {
          console.error('[Share] Web Share failed:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      await this.copyToClipboard(content);
    }
  }

  private async copyToClipboard(content: ShareContent): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;

    const fullText = content.url
      ? `${content.text}\n${content.url}`
      : content.text;

    try {
      await navigator.clipboard.writeText(fullText);
      // Could emit an event here for toast notification
    } catch (error) {
      console.error('[Share] Clipboard write failed:', error);
    }
  }

  // ============================================
  // CONVENIENCE METHODS FOR COMMON SHARE TYPES
  // ============================================

  /**
   * Share a tarot card
   */
  async shareTarotCard(
    card: { name: string; keywords?: string[]; slug: string },
    isReversed?: boolean,
  ): Promise<void> {
    const reversedText = isReversed ? ' (reversed)' : '';
    const keyword = card.keywords?.[0] || 'guidance';

    await this.share({
      title: `My Daily Card - ${card.name}`,
      text: `I drew ${card.name}${reversedText} today ✨\n\n"${keyword}"\n\nDiscover your daily card at Lunary`,
      url: `${APP_URL}/tarot/${card.slug}`,
      dialogTitle: 'Share your cosmic guidance',
    });
  }

  /**
   * Share birth chart summary
   */
  async shareBirthChart(chart: {
    sunSign: string;
    moonSign: string;
    rising: string;
  }): Promise<void> {
    await this.share({
      title: 'My Birth Chart',
      text: `My Birth Chart ✨\n☀️ ${chart.sunSign} Sun\n🌙 ${chart.moonSign} Moon\n⬆️ ${chart.rising} Rising\n\nDiscover your cosmic blueprint at Lunary`,
      url: `${APP_URL}/birth-chart`,
    });
  }

  /**
   * Share current moon phase
   */
  async shareMoonPhase(phase: {
    name: string;
    sign: string;
    emoji: string;
  }): Promise<void> {
    await this.share({
      title: `${phase.emoji} ${phase.name}`,
      text: `${phase.emoji} ${phase.name} in ${phase.sign}\n\nTrack lunar cycles at Lunary`,
      url: `${APP_URL}/moon`,
    });
  }

  /**
   * Share streak milestone
   */
  async shareStreak(days: number): Promise<void> {
    const emoji = days >= 100 ? '💫' : days >= 30 ? '🌟' : '✨';
    await this.share({
      title: `${days} Day Streak!`,
      text: `${emoji} ${days} day streak on Lunary!\n\nBuilding cosmic consistency, one day at a time.`,
      url: APP_URL,
    });
  }

  /**
   * Share journal reflection (with user consent)
   */
  async shareJournalExcerpt(excerpt: string): Promise<void> {
    const truncated =
      excerpt.length > 100 ? `${excerpt.substring(0, 100)}...` : excerpt;

    await this.share({
      title: 'My Cosmic Reflection',
      text: `Just reflected on my cosmic journey ✨\n\n"${truncated}"\n\nStart your own cosmic journal at Lunary`,
      url: `${APP_URL}/journal`,
    });
  }

  /**
   * Invite someone to a moon circle
   */
  async inviteToMoonCircle(circle: {
    moonPhase: string;
    date: string;
    time: string;
    id: string;
    description?: string;
  }): Promise<void> {
    const desc = circle.description
      ? `\n\n${circle.description.substring(0, 100)}`
      : '';

    await this.share({
      title: `${circle.moonPhase} Moon Circle`,
      text: `Join me for a ${circle.moonPhase} Moon Circle 🌙\n\n${circle.date} at ${circle.time}${desc}`,
      url: `${APP_URL}/moon-circles/${circle.id}`,
    });
  }

  /**
   * Share numerology info
   */
  async shareNumerology(data: {
    lifePath: number;
    personalYear: number;
    personalDay: number;
  }): Promise<void> {
    await this.share({
      title: 'My Numerology',
      text: `My Numerology ✨\n🔢 Life Path ${data.lifePath}\n📅 Personal Year ${data.personalYear}\n🌟 Today: Day ${data.personalDay}\n\nDiscover your numbers at Lunary`,
      url: `${APP_URL}/numerology`,
    });
  }

  /**
   * Share a cosmic report
   */
  async shareCosmicReport(shareUrl: string): Promise<void> {
    await this.share({
      title: 'My Cosmic Report',
      text: `Check out my personalized cosmic report from Lunary ✨`,
      url: shareUrl,
    });
  }

  /**
   * Generic share with custom content
   */
  async shareCustom(title: string, text: string, path?: string): Promise<void> {
    await this.share({
      title,
      text,
      url: path ? `${APP_URL}${path}` : APP_URL,
    });
  }
}

// Export singleton instance
export const shareService = new NativeShareService();
