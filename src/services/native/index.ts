/**
 * Native Services
 *
 * Re-exports for native platform integrations.
 * These services are safe to import on web - they no-op when not on native.
 */

export {
  widgetService,
  isNativePlatform,
  type WidgetData,
  type MoonData,
  type TransitData,
  type CardData,
} from './widget-service';

export { hapticService } from './haptic-service';
export { shareService } from './share-service';
export { offlineService } from './offline-service';
export { nativePushService } from './push-service';
