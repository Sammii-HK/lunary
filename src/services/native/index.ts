/**
 * Native Services
 *
 * Re-exports for native platform integrations.
 * These services are safe to import on web - they no-op when not on native.
 */

export {
  widgetService,
  isNativePlatform,
  type LunaryWidgetData,
  type MoonWidgetData,
  type TransitWidgetData,
  type CardWidgetData,
} from './widget-service';
