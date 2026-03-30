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
