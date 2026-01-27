import { thematicPaletteConfig } from '@/constants/seo/thematic-palette-config';
import type { ThemeCategory } from './theme-category';

export const BRAND_COLORS = {
  cosmicBlack: thematicPaletteConfig.meta.brandColors.eventHorizon,
  cosmicBlackAlt: thematicPaletteConfig.meta.brandColors.singularity,
  textPrimary: thematicPaletteConfig.meta.brandColors.stardust,
  textSecondary: thematicPaletteConfig.meta.brandColors.galaxyHaze,
  accentDefault: thematicPaletteConfig.meta.brandColors.supernova,
} as const;

export type ThemePalette = {
  background: string;
  foreground: string;
  highlight: string;
  accent: string;
};

export function getThemePalette(category: ThemeCategory): ThemePalette {
  const palette =
    thematicPaletteConfig.palettesByTopLevelCategory[category] || null;
  const background =
    palette?.backgrounds?.[1] ||
    palette?.backgrounds?.[0] ||
    BRAND_COLORS.cosmicBlack;
  const highlight = palette?.highlight || BRAND_COLORS.accentDefault;

  return {
    background,
    foreground: BRAND_COLORS.textPrimary,
    highlight,
    accent: highlight,
  };
}
