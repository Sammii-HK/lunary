interface MoonCircleEmailTemplateProps {
  moonCircleId: number;
  moonPhase: string;
  dateLabel: string;
  title?: string;
  summary?: string;
  appUrl?: string;
}

const getAppUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://lunary.app';

export function generateMoonCircleEmailHTML({
  moonCircleId,
  moonPhase,
  dateLabel,
  title,
  summary,
  appUrl = getAppUrl(),
}: MoonCircleEmailTemplateProps) {
  const shareLink = `${appUrl}/moon-circles/${moonCircleId}?share=true`;
  return `
    <div style="background-color:#07070e;color:#f8f4ff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:32px;border-radius:24px;border:1px solid rgba(139,92,246,0.2)">
      <p style="letter-spacing:0.4em;text-transform:uppercase;color:#c4b5fd;font-size:11px;margin:0 0 12px;">${moonPhase}</p>
      <h1 style="font-size:28px;margin:0 0 12px;">${title || 'Moon Circle Update'}</h1>
      <p style="color:#a78bfa;margin:0 0 24px;font-size:14px;">${dateLabel}</p>
      ${
        summary
          ? `<p style="margin:0 0 24px;line-height:1.6;color:#e0d7ff;">
        ${summary}
      </p>`
          : ''
      }
      <div style="margin:30px 0;padding:20px;background:rgba(255,255,255,0.08);border-radius:12px;border:1px solid rgba(139,92,246,0.25);">
        <h3 style="margin:0 0 8px;color:#ffffff;font-size:18px;">Share Your Insight</h3>
        <p style="margin:0 0 16px;color:#d8cffe;font-size:14px;line-height:1.6;">
          Did this Moon Circle resonate with you? Share your insight anonymously with the community.
        </p>
        <a href="${shareLink}"
          style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">
          Share Your Insight →
        </a>
      </div>
    </div>
  `;
}

export function generateMoonCircleEmailText({
  moonCircleId,
  moonPhase,
  dateLabel,
  title,
  summary,
  appUrl = getAppUrl(),
}: MoonCircleEmailTemplateProps) {
  const shareLink = `${appUrl}/moon-circles/${moonCircleId}?share=true`;
  return `
${title || 'Moon Circle Update'} – ${moonPhase}
${dateLabel}

${summary || ''}

Share your insight with the circle:
${shareLink}
  `.trim();
}
