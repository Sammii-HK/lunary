import React, { ReactNode, CSSProperties } from 'react';
import { BrandFooter } from './BrandFooter';

export interface BaseTemplateProps {
  children: ReactNode;
  width: number;
  height: number;
  background?: string;
  gradient?: string;
  footer?: boolean;
  footerText?: string;
  padding?: number;
  style?: CSSProperties;
}

export function BaseTemplate({
  children,
  width,
  height,
  background = '#0A0A0A',
  gradient,
  footer = true,
  footerText,
  padding = 60,
  style = {},
}: BaseTemplateProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background,
    backgroundImage: gradient,
    position: 'relative',
    ...style,
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding,
    position: 'relative',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>{children}</div>
      {footer && <BrandFooter text={footerText} />}
    </div>
  );
}
