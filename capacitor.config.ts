import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lunary',
  appName: 'Lunary',

  // Load from your live site - no static export needed
  server: {
    url: 'https://lunary.app/app',
    // For local dev, use your Mac's IP:
    // url: 'http://192.168.68.107:3000/app',
    // cleartext: true,
  },

  ios: {
    scheme: 'Lunary',
    contentInset: 'automatic',
    backgroundColor: '#0a0a0f',
    preferredContentMode: 'mobile',
  },

  android: {
    backgroundColor: '#0a0a0f',
    allowMixedContent: true, // Allow HTTP for local dev
  },

  plugins: {
    WidgetBridge: {
      // Local plugin - no additional config needed
    },
  },
};

export default config;
