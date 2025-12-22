import Image from 'next/image';
import {
  MonthlyMoonPhaseKey,
  monthlyMoonPhases,
} from '../../utils/moon/monthlyPhases';

type MoonPhaseIconProps = {
  phase: MonthlyMoonPhaseKey;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
};

export function MoonPhaseIcon({
  phase,
  size = 48,
  width,
  height,
  className,
  alt,
  priority,
}: MoonPhaseIconProps) {
  const phaseData = monthlyMoonPhases[phase];
  if (!phaseData?.icon?.src) {
    return (
      <span className={className ?? ''}>{phaseData?.symbol ?? phase}</span>
    );
  }

  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Image
      src={phaseData.icon.src}
      alt={alt ?? phaseData.icon.alt}
      width={iconWidth}
      height={iconHeight}
      className={className}
      priority={priority}
    />
  );
}
