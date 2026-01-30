import React, { CSSProperties } from 'react';

export interface StatItemProps {
  label: string;
  value: string | number;
  icon?: string;
  labelColor?: string;
  valueColor?: string;
  iconSize?: number;
  style?: CSSProperties;
}

export function StatItem({
  label,
  value,
  icon,
  labelColor = 'rgba(255, 255, 255, 0.6)',
  valueColor = '#ffffff',
  iconSize = 24,
  style = {},
}: StatItemProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    ...style,
  };

  const labelStyle: CSSProperties = {
    fontFamily: 'Roboto Mono',
    fontSize: 14,
    color: labelColor,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 300,
  };

  const valueStyle: CSSProperties = {
    fontFamily: 'Roboto Mono',
    fontSize: 24,
    color: valueColor,
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>
        {icon && <span style={{ fontSize: iconSize }}>{icon}</span>}
        {value}
      </div>
    </div>
  );
}

export interface StatsGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: CSSProperties;
}

export function StatsGrid({
  children,
  columns = 3,
  gap = 24,
  style = {},
}: StatsGridProps) {
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    ...style,
  };

  return <div style={gridStyle}>{children}</div>;
}

export interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
  style?: CSSProperties;
}

export function ProgressBar({
  value,
  max,
  color = '#8458D8',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  height = 8,
  borderRadius = 9999,
  style = {},
}: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);

  const containerStyle: CSSProperties = {
    width: '100%',
    height,
    backgroundColor,
    borderRadius,
    overflow: 'hidden',
    ...style,
  };

  const fillStyle: CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <div style={fillStyle} />
    </div>
  );
}
