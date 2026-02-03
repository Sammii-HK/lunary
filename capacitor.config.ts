import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lunary',
  appName: 'Lunary',

  // Load from your live site - no static export needed
  server: {
    // url: 'https://lunary.app',
    url: 'http://localhost:3000/app',
    cleartext: true, // Allow HTTP for local dev
  },

  ios: {
    scheme: 'Lunary',
    contentInset: 'automatic',
    backgroundColor: '#0a0a0f',
    preferredContentMode: 'mobile',
  },

  plugins: {
    WidgetBridge: {
      // Local plugin - no additional config needed
    },
  },
};

export default config;
