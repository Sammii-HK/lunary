import type { Metadata, Viewport } from 'next';
import { ADMIN_PWA_MANIFEST_URL } from '@/constants/pwa';
import { AdminCanonicalRemover } from '@/components/AdminCanonicalRemover';

export function generateMetadata(): Metadata {
  return {
    title: 'Lunary Admin',
    description:
      'Manage Lunary automations, content, and notifications with a streamlined mobile workspace.',
    manifest: ADMIN_PWA_MANIFEST_URL,
    themeColor: '#0b0b0f',
    alternates: {},
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    icons: {
      icon: [
        { url: '/icons/pwa/favicon.ico' },
        {
          url: '/icons/pwa/icon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/icons/pwa/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
      apple: [
        {
          url: '/icons/pwa/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Lunary Admin',
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'application-name': 'Lunary Admin',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0b0b0f',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminCanonicalRemover />
      {children}
    </>
  );
}
