/**
 * PersonalEmail — a layout that looks like a real email from Sammii,
 * not a marketing template. Light, minimal, no decorative flourishes.
 */
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { ReactNode } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

const styles = {
  body: {
    backgroundColor: '#ffffff',
    fontFamily: "-apple-system, 'Helvetica Neue', Arial, sans-serif",
    margin: '0',
    padding: '0',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '48px 24px 40px',
  },
  wordmark: {
    fontSize: '13px',
    color: '#9ca3af',
    letterSpacing: '0.05em',
    marginBottom: '40px',
    display: 'block' as const,
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.75',
    color: '#1a1a1a',
    margin: '0 0 20px 0',
  },
  highlight: {
    fontSize: '16px',
    lineHeight: '1.75',
    color: '#374151',
    margin: '24px 0',
    paddingLeft: '16px',
    borderLeft: '2px solid #e5e7eb',
  },
  link: {
    color: '#7c3aed',
    textDecoration: 'underline',
    fontSize: '16px',
  },
  signatureName: {
    fontSize: '16px',
    lineHeight: '1.4',
    color: '#1a1a1a',
    margin: '32px 0 4px 0',
  },
  signatureRole: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0 0 40px 0',
  },
  divider: {
    borderTop: '1px solid #f3f4f6',
    margin: '32px 0',
  },
  footer: {
    fontSize: '12px',
    color: '#d1d5db',
    textAlign: 'center' as const,
  },
  footerLink: {
    color: '#d1d5db',
    textDecoration: 'underline',
    fontSize: '12px',
  },
} as const;

interface PersonalEmailProps {
  preview: string;
  children: ReactNode;
  userEmail?: string;
}

export function PersonalEmail({
  preview,
  children,
  userEmail,
}: PersonalEmailProps) {
  const unsubscribeUrl = userEmail
    ? `${BASE_URL}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${BASE_URL}/unsubscribe`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>lunary</Text>
          {children}
          <Section style={styles.divider} />
          <Text style={styles.footer}>
            Any issues, contact{' '}
            <Link href='mailto:help@lunary.app' style={styles.footerLink}>
              help@lunary.app
            </Link>{' '}
            &middot;{' '}
            <Link href={unsubscribeUrl} style={styles.footerLink}>
              unsubscribe
            </Link>{' '}
            &middot; Lunar Computing, Inc.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/** A standard paragraph */
export function P({ children }: { children: ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

/** A pull-quote / highlighted insight block */
export function Insight({ children }: { children: ReactNode }) {
  return <Text style={styles.highlight}>{children}</Text>;
}

/** Sammii's signature — no dashes */
export function Signature() {
  return (
    <>
      <Text style={styles.signatureName}>Sammii</Text>
      <Text style={styles.signatureRole}>Founder, Lunary</Text>
    </>
  );
}

/** A plain text-style CTA link (no button) */
export function Cta({ href, label }: { href: string; label: string }) {
  return (
    <Text style={{ ...styles.paragraph, margin: '28px 0' }}>
      <Link href={href} style={styles.link}>
        {label} &rarr;
      </Link>
    </Text>
  );
}
