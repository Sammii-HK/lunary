/**
 * Native Haptic Feedback Service
 *
 * Provides haptic feedback for native app interactions.
 * Safe to import on web - no-ops when not on native platform.
 *
 * Usage:
 *   import { hapticService } from '@/services/native';
 *   await hapticService.medium(); // Card flip
 *   await hapticService.success(); // Save complete
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const STORAGE_KEY = 'lunary_haptics_enabled';

class HapticService {
  private isNative: boolean;
  private enabled: boolean = true;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.loadPreference();
  }

  private loadPreference() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.enabled = stored !== 'false';
    }
  }

  private async vibrate(action: () => Promise<void>): Promise<void> {
    if (!this.isNative || !this.enabled) return;
    try {
      await action();
    } catch (error) {
      // Haptics not available on this device - fail silently
      console.debug('[Haptic] Not available:', error);
    }
  }

  // ============================================
  // IMPACT HAPTICS (for UI interactions)
  // ============================================

  /**
   * Light impact - button taps, toggles, navigation
   */
  async light(): Promise<void> {
    await this.vibrate(() => Haptics.impact({ style: ImpactStyle.Light }));
  }

  /**
   * Medium impact - card reveals, selections, confirmations
   */
  async medium(): Promise<void> {
    await this.vibrate(() => Haptics.impact({ style: ImpactStyle.Medium }));
  }

  /**
   * Heavy impact - milestones, celebrations, major events
   */
  async heavy(): Promise<void> {
    await this.vibrate(() => Haptics.impact({ style: ImpactStyle.Heavy }));
  }

  // ============================================
  // NOTIFICATION HAPTICS (for outcomes)
  // ============================================

  /**
   * Success notification - save complete, action succeeded
   */
  async success(): Promise<void> {
    await this.vibrate(() =>
      Haptics.notification({ type: NotificationType.Success }),
    );
  }

  /**
   * Warning notification - challenging transit, attention needed
   */
  async warning(): Promise<void> {
    await this.vibrate(() =>
      Haptics.notification({ type: NotificationType.Warning }),
    );
  }

  /**
   * Error notification - failed action, network error
   */
  async error(): Promise<void> {
    await this.vibrate(() =>
      Haptics.notification({ type: NotificationType.Error }),
    );
  }

  // ============================================
  // SELECTION HAPTICS (for pickers/carousels)
  // ============================================

  /**
   * Selection changed - swiping through items, picker changes
   */
  async selection(): Promise<void> {
    await this.vibrate(async () => {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    });
  }

  /**
   * Single selection tick - for continuous selection feedback
   */
  async selectionTick(): Promise<void> {
    await this.vibrate(() => Haptics.selectionChanged());
  }

  // ============================================
  // USER PREFERENCES
  // ============================================

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, enabled.toString());
    }
    // Give feedback when enabling
    if (enabled) {
      this.success();
    }
  }

  /**
   * Check if haptics are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if we're on a native platform
   */
  isAvailable(): boolean {
    return this.isNative;
  }
}

// Export singleton instance
export const hapticService = new HapticService();
