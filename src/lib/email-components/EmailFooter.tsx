import { Container, Hr, Link, Section, Text } from '@react-email/components';

interface EmailFooterProps {
  userEmail?: string;
  baseUrl?: string;
  variant?: 'dark' | 'light';
}

export function EmailFooter({
  userEmail,
  baseUrl = 'https://lunary.app',
  variant = 'dark',
}: EmailFooterProps) {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const linkColor = isDark ? '#a78bfa' : '#6366f1';
  const hrColor = isDark ? 'rgba(167, 139, 250, 0.2)' : '#e5e7eb';

  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return (
    <Section style={{ marginTop: '40px' }}>
      <Hr style={{ borderColor: hrColor, borderWidth: '1px' }} />
      <Container style={{ paddingTop: '20px', textAlign: 'center' as const }}>
        <Text
          style={{
            fontSize: '13px',
            color: textColor,
            margin: '0 0 15px 0',
          }}
        >
          Want to change your notification preferences?{' '}
          <Link
            href={`${baseUrl}/profile`}
            style={{ color: linkColor, textDecoration: 'none' }}
          >
            Manage Settings
          </Link>
        </Text>
        <Text
          style={{
            fontSize: '11px',
            color: textColor,
            margin: '0 0 15px 0',
          }}
        >
          <Link
            href={unsubscribeUrl}
            style={{ color: textColor, textDecoration: 'underline' }}
          >
            Unsubscribe
          </Link>
          {' | '}
          <Link
            href={`${baseUrl}/profile`}
            style={{ color: textColor, textDecoration: 'underline' }}
          >
            Manage Preferences
          </Link>
        </Text>
        <Text
          style={{
            fontSize: '10px',
            color: isDark ? '#6b7280' : '#9ca3af',
            margin: '0',
          }}
        >
          © {new Date().getFullYear()} Lunar Computing, Inc. Guided by the
          stars, powered by magic.
        </Text>
      </Container>
    </Section>
  );
}
