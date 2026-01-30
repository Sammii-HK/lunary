import React from 'react';

export interface BrandFooterProps {
  text?: string;
  iconSize?: number;
  textSize?: number;
  opacity?: number;
  bottom?: number;
}

export function BrandFooter({
  text = 'lunary.app',
  iconSize = 22,
  textSize = 16,
  opacity = 0.4,
  bottom = 32,
}: BrandFooterProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        position: 'absolute',
        bottom,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <img
        src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
        width={iconSize}
        height={iconSize}
        style={{ opacity: opacity + 0.05 }}
        alt=''
      />
      <span
        style={{
          fontFamily: 'Roboto Mono',
          fontWeight: 300,
          fontSize: textSize,
          opacity,
          letterSpacing: '0.1em',
          color: '#ffffff',
        }}
      >
        {text}
      </span>
    </div>
  );
}
