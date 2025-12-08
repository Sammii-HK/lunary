import { Button } from '@react-email/components';
import { ReactNode } from 'react';

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function CTAButton({
  href,
  children,
  variant = 'primary',
}: CTAButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Button
      href={href}
      style={{
        display: 'inline-block',
        background: isPrimary
          ? 'linear-gradient(135deg, #8458D8, #7B7BE8)'
          : 'transparent',
        color: isPrimary ? '#ffffff' : '#C77DFF',
        padding: '16px 32px',
        textDecoration: 'none',
        borderRadius: isPrimary ? '999px' : '8px',
        fontWeight: '600',
        fontSize: '16px',
        textAlign: 'center' as const,
        border: isPrimary ? 'none' : '1px solid #C77DFF',
      }}
    >
      {children}
    </Button>
  );
}
