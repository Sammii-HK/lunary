import { type LifeTheme } from './LifeThemesEngine';

export interface LifeThemesEmailData {
  themes: Array<{
    name: string;
    summary: string;
    guidanceBullet?: string;
  }>;
  generatedAt: string;
}

export function exportThemesForEmail(
  themes: LifeTheme[],
  isPremium: boolean,
): LifeThemesEmailData {
  const maxThemes = isPremium ? 3 : 1;
  const exportedThemes = themes.slice(0, maxThemes).map((theme) => ({
    name: theme.name,
    summary: isPremium ? theme.longSummary.slice(0, 200) : theme.shortSummary,
    guidanceBullet:
      isPremium && theme.guidanceBullets?.[0]
        ? theme.guidanceBullets[0]
        : undefined,
  }));

  return {
    themes: exportedThemes,
    generatedAt: new Date().toISOString(),
  };
}

export function formatThemesForEmailHtml(data: LifeThemesEmailData): string {
  if (data.themes.length === 0) {
    return '';
  }

  const themeHtml = data.themes
    .map(
      (theme) => `
      <div style="margin-bottom: 16px; padding: 16px; background: #1a1a2e; border-radius: 8px; border-left: 3px solid #8b5cf6;">
        <h4 style="margin: 0 0 8px 0; color: #e5e5e5; font-size: 14px; font-weight: 600;">
          ${theme.name}
        </h4>
        <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
          ${theme.summary}
        </p>
        ${
          theme.guidanceBullet
            ? `<p style="margin: 0; color: #8b5cf6; font-size: 12px;">→ ${theme.guidanceBullet}</p>`
            : ''
        }
      </div>
    `,
    )
    .join('');

  return `
    <div style="margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #f5f5f5; font-size: 16px; font-weight: 600;">
        ✨ Your Life Themes
      </h3>
      ${themeHtml}
    </div>
  `;
}
