export const CHART_COLORS = {
  surface: 'rgb(var(--chart-surface, var(--surface-card)))',
  surfaceSoft: 'rgb(var(--chart-surface-soft, var(--surface-elevated)))',
  stroke: 'rgb(var(--chart-stroke, var(--stroke-default)))',
  strokeSubtle: 'rgb(var(--chart-stroke-subtle, var(--stroke-subtle)))',
  text: 'rgb(var(--chart-text, var(--content-primary)))',
  textMuted: 'rgb(var(--chart-text-muted, var(--content-muted)))',
  angular: 'rgb(var(--chart-angular, var(--content-brand-secondary)))',
  selected: 'rgb(var(--chart-selected, var(--content-brand-accent)))',
  sunA: 'rgb(var(--chart-sun-a, 255 224 138))',
  sunB: 'rgb(var(--chart-sun-b, 255 122 69))',
  moonA: 'rgb(var(--chart-moon-a, 232 236 255))',
  moonB: 'rgb(var(--chart-moon-b, 139 156 249))',
  retrograde: 'rgb(var(--chart-retrograde, 248 113 113))',
} as const;

export const CHART_ELEMENT_COLORS = {
  Fire: 'rgb(var(--chart-fire, 255 107 107))',
  Earth: 'rgb(var(--chart-earth, 107 142 78))',
  Air: 'rgb(var(--chart-air, 93 173 226))',
  Water: 'rgb(var(--chart-water, 155 89 182))',
} as const;

export const CHART_ASPECT_COLORS = {
  Conjunction: 'rgb(var(--chart-aspect-conjunction, 183 128 232))',
  Opposition: 'rgb(var(--chart-aspect-opposition, 196 143 89))',
  Trine: 'rgb(var(--chart-aspect-trine, 78 160 112))',
  Square: 'rgb(var(--chart-aspect-square, 210 86 86))',
  Sextile: 'rgb(var(--chart-aspect-sextile, 86 145 195))',
} as const;

export const CHART_GLYPH_SHADOW =
  'drop-shadow(0 1px 1px rgb(var(--chart-shadow, 26 15 46) / 0.18))';
