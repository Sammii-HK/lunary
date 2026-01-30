import React, { ReactNode, CSSProperties } from 'react';

export interface CardProps {
  children: ReactNode;
  background?: string;
  border?: string;
  borderRadius?: number;
  padding?: number;
  style?: CSSProperties;
}

export function Card({
  children,
  background = 'rgba(255, 255, 255, 0.03)',
  border = '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius = 16,
  padding = 24,
  style = {},
}: CardProps) {
  const cardStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    background,
    border,
    borderRadius,
    padding,
    ...style,
  };

  return <div style={cardStyle}>{children}</div>;
}

export interface CardGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  style?: CSSProperties;
}

export function CardGrid({
  children,
  columns = 2,
  gap = 16,
  style = {},
}: CardGridProps) {
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    ...style,
  };

  return <div style={gridStyle}>{children}</div>;
}

export interface PillBadgeProps {
  children: ReactNode;
  background?: string;
  color?: string;
  fontSize?: number;
  padding?: string;
  style?: CSSProperties;
}

export function PillBadge({
  children,
  background = 'rgba(132, 88, 216, 0.2)',
  color = '#C77DFF',
  fontSize = 14,
  padding = '6px 12px',
  style = {},
}: PillBadgeProps) {
  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    background,
    color,
    fontSize,
    padding,
    borderRadius: 9999,
    fontFamily: 'Roboto Mono',
    fontWeight: 400,
    letterSpacing: '0.05em',
    ...style,
  };

  return <span style={badgeStyle}>{children}</span>;
}
