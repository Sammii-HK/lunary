import { Section, Text, Heading } from '@react-email/components';
import { ReactNode } from 'react';

interface ContentSectionProps {
  title: string;
  children: ReactNode;
  icon?: string;
  variant?: 'dark' | 'light';
}

export function ContentSection({
  title,
  children,
  icon,
  variant = 'dark',
}: ContentSectionProps) {
  const isDark = variant === 'dark';

  return (
    <Section
      style={{
        margin: '24px 0',
        padding: '20px',
        background: isDark ? 'rgba(99, 102, 241, 0.1)' : '#f9fafb',
        borderRadius: '12px',
        borderLeft: `3px solid ${isDark ? '#a78bfa' : '#6366f1'}`,
      }}
    >
      <Heading
        as='h3'
        style={{
          color: isDark ? '#a78bfa' : '#6366f1',
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 12px 0',
        }}
      >
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {title}
      </Heading>
      <Text
        style={{
          color: isDark ? '#e1d9ff' : '#4b5563',
          fontSize: '15px',
          lineHeight: '1.8',
          margin: '0',
        }}
      >
        {children}
      </Text>
    </Section>
  );
}
