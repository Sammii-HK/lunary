import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lunary',
  appName: 'Lunary',

  // Load from your live site - no static export needed
  server: {
    url: 'https://lunary.app/app',
  },

  ios: {
    scheme: 'Lunary',
    // 'never' lets the WebView extend edge-to-edge so the bottom nav
    // can sit flush with the home indicator. CSS env(safe-area-inset-bottom)
    // is the single source of truth for keeping tap targets above it.
    contentInset: 'never',
    backgroundColor: '#0a0a0f',
    preferredContentMode: 'mobile',
  },

  android: {
    backgroundColor: '#0a0a0f',
    allowMixedContent: false,
  },

  plugins: {
    WidgetBridge: {
      // Local plugin - no additional config needed
    },
  },
};

export default config;
