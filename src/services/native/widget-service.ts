/**
 * Native Widget Service
 *
 * Bridges data between the web app and iOS/Android home screen widgets.
 * Uses WebKit message handlers for direct native communication.
 *
 * Usage:
 *   import { widgetService } from '@/services/native/widget-service';
 *   await widgetService.updateWidgetData({ ... });
 */

import { Capacitor } from '@capacitor/core';

// Type for WebKit message handlers (iOS) and Android bridge
declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        widgetBridge?: {
          postMessage: (data: unknown) => void;
        };
      };
    };
    AndroidWidgetBridge?: {
      setWidgetData: (jsonData: string) => void;
      isWidgetSupported: () => boolean;
    };
  }
}

// Widget data interfaces - must match Swift LunaryWidgetData struct
export interface MoonData {
  phase: string;
  sign: string;
  illumination: number;
  nextPhase?: string | null;
  nextPhaseIn?: number | null;
}

export interface CardData {
  name: string;
  briefMeaning: string;
}

export interface TransitData {
  planet: string;
  aspect: string;
  natalPoint: string;
  briefMeaning: string;
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
}

export interface HoroscopeData {
  headline: string;
  guidance: string;
}

export interface WidgetData {
  moon: MoonData;
  todayCard?: CardData | null;
  personalDayNumber: number;
  dayTheme: string;
  currentTransit?: TransitData | null;
  planets?: PlanetPosition[] | null;
  horoscope?: HoroscopeData | null;
}

class NativeWidgetService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Check if we're running on a native platform
   */
  get isAvailable(): boolean {
    return this.isNative;
  }

  /**
   * Update all widgets with current cosmic data
   */
  async updateWidgetData(
    data: WidgetData,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isNative) {
      console.log('[Widget] Not on native platform, skipping update');
      return { success: false, error: 'Not native platform' };
    }

    const platform = Capacitor.getPlatform();

    try {
      // iOS: Use WebKit message handler
      if (platform === 'ios') {
        const handler = window.webkit?.messageHandlers?.widgetBridge;
        if (handler) {
          console.log('[Widget] Sending data via WebKit message handler...');
          handler.postMessage({ action: 'setWidgetData', data });
          console.log('[Widget] Data sent successfully');
          return { success: true };
        } else {
          console.warn('[Widget] WebKit message handler not available');
          return { success: false, error: 'Message handler not available' };
        }
      }

      // Android: Use JavaScript interface
      if (platform === 'android') {
        const bridge = window.AndroidWidgetBridge;
        if (bridge) {
          console.log('[Widget] Sending data via Android bridge...');
          bridge.setWidgetData(JSON.stringify(data));
          console.log('[Widget] Data sent successfully');
          return { success: true };
        } else {
          console.warn('[Widget] Android bridge not available');
          return { success: false, error: 'Android bridge not available' };
        }
      }

      return { success: false, error: 'Unknown platform' };
    } catch (error) {
      console.error('[Widget] Failed to update:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Reload all widget timelines
   */
  async refreshWidgets(): Promise<void> {
    if (!this.isNative) return;

    const handler = window.webkit?.messageHandlers?.widgetBridge;
    if (handler) {
      handler.postMessage({ action: 'reloadWidgets' });
      console.log('[Widget] Widgets refreshed');
    }
  }

  /**
   * Get current widget data (for debugging)
   * Note: WebKit message handlers are one-way, so this just returns null
   */
  async getWidgetData(): Promise<WidgetData | null> {
    console.log('[Widget] getWidgetData not supported with WebKit handlers');
    return null;
  }

  /**
   * Create widget data from cosmic snapshot
   */
  createWidgetData(options: {
    moonPhase: string;
    moonSign: string;
    moonIllumination: number;
    nextMoonPhase?: string;
    nextMoonPhaseIn?: number;
    todayCard?: { name: string; meaning: string } | null;
    personalDayNumber: number;
    dayTheme: string;
    currentTransit?: {
      planet: string;
      aspect: string;
      natalPoint: string;
      meaning: string;
    } | null;
    planets?: Array<{
      name: string;
      sign: string;
      degree: number;
      isRetrograde: boolean;
    }>;
    horoscope?: { headline: string; guidance: string } | null;
  }): WidgetData {
    return {
      moon: {
        phase: options.moonPhase,
        sign: options.moonSign,
        illumination: options.moonIllumination,
        nextPhase: options.nextMoonPhase,
        nextPhaseIn: options.nextMoonPhaseIn,
      },
      todayCard: options.todayCard
        ? {
            name: options.todayCard.name,
            briefMeaning: options.todayCard.meaning,
          }
        : null,
      personalDayNumber: options.personalDayNumber,
      dayTheme: options.dayTheme,
      currentTransit: options.currentTransit
        ? {
            planet: options.currentTransit.planet,
            aspect: options.currentTransit.aspect,
            natalPoint: options.currentTransit.natalPoint,
            briefMeaning: options.currentTransit.meaning,
          }
        : null,
      planets: options.planets?.map((p) => ({
        planet: p.name,
        sign: p.sign,
        degree: p.degree,
        retrograde: p.isRetrograde,
      })),
      horoscope: options.horoscope
        ? {
            headline: options.horoscope.headline,
            guidance: options.horoscope.guidance,
          }
        : null,
    };
  }
}

// Export singleton instance
export const widgetService = new NativeWidgetService();

// Export helper to check if native
export const isNativePlatform = () => Capacitor.isNativePlatform();
