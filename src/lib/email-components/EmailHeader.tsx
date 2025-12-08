import { Heading, Img, Section, Text } from '@react-email/components';

interface EmailHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  baseUrl?: string;
  showLogo?: boolean;
  variant?: 'dark' | 'light';
}

export function EmailHeader({
  title,
  subtitle,
  emoji,
  baseUrl = 'https://lunary.app',
  showLogo = true,
  variant = 'dark',
}: EmailHeaderProps) {
  const isDark = variant === 'dark';
  const titleColor = isDark ? '#8458D8' : '#8458D8';
  const subtitleColor = isDark ? '#C77DFF' : '#6b7280';

  return (
    <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
      {showLogo && (
        <Img
          src={`${baseUrl}/logo.png`}
          alt='Lunary'
          width='120'
          height='auto'
          style={{
            margin: '0 auto 20px',
            display: 'block',
            maxWidth: '120px',
          }}
        />
      )}
      {emoji && (
        <Text style={{ fontSize: '48px', margin: '0 0 16px 0' }}>{emoji}</Text>
      )}
      <Heading
        as='h1'
        style={{
          color: titleColor,
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0',
        }}
      >
        {title}
      </Heading>
      {subtitle && (
        <Text
          style={{
            color: subtitleColor,
            fontSize: '16px',
            margin: '8px 0 0 0',
          }}
        >
          {subtitle}
        </Text>
      )}
    </Section>
  );
}
