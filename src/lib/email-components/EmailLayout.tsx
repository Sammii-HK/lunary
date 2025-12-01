import { Body, Container, Head, Html, Preview } from '@react-email/components';
import { ReactNode } from 'react';

interface EmailLayoutProps {
  children: ReactNode;
  title?: string;
  preview?: string;
  variant?: 'dark' | 'light';
}

export function EmailLayout({
  children,
  title = 'Lunary',
  preview,
  variant = 'dark',
}: EmailLayoutProps) {
  const isDark = variant === 'dark';

  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: '1.6',
          color: isDark ? '#f1f1ff' : '#333',
          margin: '0',
          padding: '20px',
          backgroundColor: isDark ? '#0b0b12' : '#f8f9fa',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: isDark ? '#101020' : '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: isDark
              ? '0 20px 45px rgba(106, 90, 205, 0.25)'
              : '0 2px 4px rgba(0,0,0,0.1)',
            border: isDark
              ? '1px solid rgba(147, 112, 219, 0.2)'
              : '1px solid #e5e7eb',
          }}
        >
          {children}
        </Container>
      </Body>
    </Html>
  );
}
