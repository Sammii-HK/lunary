import type { ZodiacSign } from '@/lib/horoscope/public-horoscope';

interface DailyHoroscopeEmailInput {
  userEmail: string;
  sign: ZodiacSign;
  signLabel: string;
  date: string;
  horoscope: string;
  mood: string;
  luckyNumber: number;
  luckyColor: string;
  compatibility: string;
  moonPhase: string;
  ctaUrl: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export function generateDailyHoroscopeEmailHTML({
  userEmail,
  sign,
  signLabel,
  date,
  horoscope,
  mood,
  luckyNumber,
  luckyColor,
  compatibility,
  moonPhase,
  ctaUrl,
}: DailyHoroscopeEmailInput) {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?email=${encodeURIComponent(userEmail)}&type=daily_horoscope`;
  const manageUrl = `${BASE_URL}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${signLabel} daily horoscope</title>
      </head>
      <body style="margin:0;padding:24px;background:#090914;color:#f5f1ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:620px;margin:0 auto;background:#121226;border:1px solid rgba(199,125,255,0.2);border-radius:18px;padding:32px;">
          <p style="margin:0 0 8px 0;color:#c77dff;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Daily horoscope email</p>
          <h1 style="margin:0 0 8px 0;font-size:30px;line-height:1.2;">${signLabel} for ${date}</h1>
          <p style="margin:0 0 24px 0;color:#a7a2c1;font-size:14px;">Moon phase: ${moonPhase}</p>

          <div style="border-radius:16px;background:rgba(199,125,255,0.08);padding:20px 22px;margin-bottom:24px;">
            <p style="margin:0;color:#f5f1ff;font-size:18px;line-height:1.7;">${horoscope}</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:28px;">
            <div style="border-radius:14px;background:#17172d;padding:14px;">
              <p style="margin:0 0 6px 0;color:#8f88b6;font-size:12px;text-transform:uppercase;">Mood</p>
              <p style="margin:0;font-size:16px;">${mood}</p>
            </div>
            <div style="border-radius:14px;background:#17172d;padding:14px;">
              <p style="margin:0 0 6px 0;color:#8f88b6;font-size:12px;text-transform:uppercase;">Lucky number</p>
              <p style="margin:0;font-size:16px;">${luckyNumber}</p>
            </div>
            <div style="border-radius:14px;background:#17172d;padding:14px;">
              <p style="margin:0 0 6px 0;color:#8f88b6;font-size:12px;text-transform:uppercase;">Lucky colour</p>
              <p style="margin:0;font-size:16px;">${luckyColor}</p>
            </div>
            <div style="border-radius:14px;background:#17172d;padding:14px;">
              <p style="margin:0 0 6px 0;color:#8f88b6;font-size:12px;text-transform:uppercase;">Best match today</p>
              <p style="margin:0;font-size:16px;">${compatibility}</p>
            </div>
          </div>

          <div style="border-radius:16px;background:linear-gradient(135deg, rgba(199,125,255,0.18), rgba(132,88,216,0.12));padding:20px 22px;margin-bottom:24px;">
            <p style="margin:0 0 10px 0;color:#f5f1ff;font-size:17px;font-weight:600;">Want the version based on your exact degree, not just your sign?</p>
            <p style="margin:0 0 18px 0;color:#d5cfff;font-size:15px;line-height:1.6;">Create your free Lunary account to see whether today’s transits are actually hitting your chart.</p>
            <a href="${ctaUrl}" style="display:inline-block;background:#c77dff;color:#120a1f;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">See my full chart</a>
          </div>

          <p style="margin:0 0 10px 0;color:#8f88b6;font-size:12px;">This email was sent because you asked for ${signLabel} daily horoscope emails.</p>
          <p style="margin:0;color:#8f88b6;font-size:12px;">
            <a href="${unsubscribeUrl}" style="color:#8f88b6;">Unsubscribe from daily horoscope emails</a>
            &nbsp;|&nbsp;
            <a href="${manageUrl}" style="color:#8f88b6;">Manage email preferences</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

export function generateDailyHoroscopeEmailText({
  userEmail,
  sign,
  signLabel,
  date,
  horoscope,
  mood,
  luckyNumber,
  luckyColor,
  compatibility,
  moonPhase,
  ctaUrl,
}: DailyHoroscopeEmailInput) {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?email=${encodeURIComponent(userEmail)}&type=daily_horoscope`;
  const manageUrl = `${BASE_URL}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  return `
${signLabel} daily horoscope for ${date}

Moon phase: ${moonPhase}

${horoscope}

Mood: ${mood}
Lucky number: ${luckyNumber}
Lucky colour: ${luckyColor}
Best match today: ${compatibility}

Want the version based on your exact degree, not just your sign?
Create your free Lunary account to see whether today’s transits are actually hitting your chart:
${ctaUrl}

Unsubscribe from daily horoscope emails:
${unsubscribeUrl}

Manage email preferences:
${manageUrl}
  `.trim();
}
