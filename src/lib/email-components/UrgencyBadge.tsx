import { Text } from '@react-email/components';

interface UrgencyBadgeProps {
  daysRemaining: number;
  variant?: 'purple' | 'orange';
}

export function UrgencyBadge({
  daysRemaining,
  variant = 'purple',
}: UrgencyBadgeProps) {
  const isPurple = variant === 'purple';
  const dayLabel = daysRemaining === 1 ? 'Day' : 'Days';

  return (
    <Text
      style={{
        display: 'inline-block',
        background: isPurple
          ? 'linear-gradient(135deg, #8458D8, #7B7BE8)'
          : 'linear-gradient(135deg, #EE789E, #D06060)',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '20px',
      }}
    >
      {daysRemaining} {dayLabel} Left
    </Text>
  );
}
