import type { DripConfig, DripEmail, DripRenderContext } from './types';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://lunary.app';

function appLink(path: string, utmContent: string): string {
  const utm = new URLSearchParams({
    utm_source: 'email',
    utm_medium: 'lifecycle',
    utm_campaign: 'quiz_drip_chart_ruler',
    utm_content: utmContent,
  });
  return `${APP_URL}${path}?${utm.toString()}`;
}

function wrapHtml(preheader: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Lunary</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#fff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A0A;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#141422;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:40px 32px 32px;">
              <div style="color:#C77DFF;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">Beyond Your Sun Sign</div>
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6;">
              You're receiving this because you took the Chart Ruler quiz on Lunary.
              <a href="${APP_URL}/account/email" style="color:#C77DFF;text-decoration:none;">Manage email preferences</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --- Day 2 template ---------------------------------------------------------

function renderDay2Html(ctx: DripRenderContext): string {
  const archetype = ctx.archetype ?? 'Your chart ruler';
  const rising = ctx.risingSign ?? 'your rising sign';
  const name = ctx.userName || 'there';
  const appCta = appLink('/app', 'day2_cta_app');
  const quizCta = appLink(
    '/quiz/beyond-your-sun-sign/chart-ruler/full',
    'day2_cta_result',
  );

  const inner = `
    <h1 style="color:#fff;font-size:26px;line-height:1.3;margin:0 0 16px;font-weight:700;">
      ${archetype}, two days in.
    </h1>
    <p style="color:rgba(255,255,255,0.85);font-size:16px;line-height:1.6;margin:0 0 16px;">
      Hi ${name}, two days ago you found out ${archetype} is your chart ruler because you have ${rising}. Here's what to do with that.
    </p>
    <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin:0 0 20px;">
      Your chart ruler is the planet the whole chart reports to. Tracking what it's doing day to day is the fastest way to see astrology actually land in your life, not just sit on a screen.
    </p>
    <p style="color:rgba(255,255,255,0.85);font-size:15px;line-height:1.7;margin:0 0 24px;font-weight:500;">
      Three small habits that compound:
    </p>
    <ol style="color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;margin:0 0 24px;padding-left:20px;">
      <li style="margin-bottom:10px;">Check where your chart ruler is today in the app. Notice the house it's transiting.</li>
      <li style="margin-bottom:10px;">Write one line in your journal when it changes sign or makes a tight aspect. You'll build a real dataset in weeks.</li>
      <li style="margin-bottom:10px;">Watch for the aspects between your chart ruler and other planets, they usually land as conversations, decisions, or friction.</li>
    </ol>
    <p style="margin:24px 0;">
      <a href="${appCta}" style="display:inline-block;background:#8458D8;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">Open Lunary</a>
    </p>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:16px 0 0;">
      Want your full reading again? <a href="${quizCta}" style="color:#C77DFF;text-decoration:none;">Open your Chart Ruler profile →</a>
    </p>
  `;

  return wrapHtml(
    `Two days into your ${archetype} reading. Three habits that compound.`,
    inner,
  );
}

function renderDay2Text(ctx: DripRenderContext): string {
  const archetype = ctx.archetype ?? 'Your chart ruler';
  const rising = ctx.risingSign ?? 'your rising sign';
  const name = ctx.userName || 'there';
  return `${archetype}, two days in.

Hi ${name}, two days ago you found out ${archetype} is your chart ruler because you have ${rising}. Here's what to do with that.

Your chart ruler is the planet the whole chart reports to. Tracking what it's doing day to day is the fastest way to see astrology actually land in your life.

Three habits that compound:

1. Check where your chart ruler is today in the app. Notice the house it's transiting.
2. Write one line in your journal when it changes sign or makes a tight aspect.
3. Watch for the aspects between your chart ruler and other planets.

Open Lunary: ${appLink('/app', 'day2_text_cta')}

— Lunary`;
}

async function renderDay2(ctx: DripRenderContext): Promise<DripEmail> {
  const archetype = ctx.archetype ?? 'your chart ruler';
  return {
    subject: `${archetype}, two days in`,
    html: renderDay2Html(ctx),
    text: renderDay2Text(ctx),
  };
}

// --- Day 5 template ---------------------------------------------------------

function renderDay5Html(ctx: DripRenderContext): string {
  const archetype = ctx.archetype ?? 'Your chart ruler';
  const tagline = ctx.archetypeTagline ?? '';
  const name = ctx.userName || 'there';
  const chartCta = appLink('/birth-chart', 'day5_cta_chart');
  const upgradeCta = appLink('/pricing', 'day5_cta_upgrade');

  const inner = `
    <h1 style="color:#fff;font-size:26px;line-height:1.3;margin:0 0 16px;font-weight:700;">
      What to actually do with ${archetype}
    </h1>
    ${tagline ? `<p style="color:#C77DFF;font-style:italic;font-size:15px;margin:0 0 20px;">${tagline}</p>` : ''}
    <p style="color:rgba(255,255,255,0.85);font-size:16px;line-height:1.6;margin:0 0 16px;">
      ${name}, five days ago you discovered your chart ruler. If you've been opening Lunary since, you've probably already noticed it showing up in how days feel.
    </p>
    <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.7;margin:0 0 16px;">
      Two ways the most engaged users get compounding value from this:
    </p>
    <ul style="color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;margin:0 0 24px;padding-left:20px;">
      <li style="margin-bottom:10px;"><strong style="color:#fff;">Cross-reference transits with your journal.</strong> When your chart ruler changes sign or forms a tight aspect, the life events around it start to show a pattern.</li>
      <li style="margin-bottom:10px;"><strong style="color:#fff;">Learn the aspects your chart ruler makes.</strong> Those aspects are the "secondary threads" running through your whole chart. Knowing them makes every transit readable.</li>
    </ul>
    <p style="margin:24px 0 16px;">
      <a href="${chartCta}" style="display:inline-block;background:#8458D8;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">Open your full chart</a>
    </p>
    <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;margin:20px 0 0;">
      Your Lunary+ trial gives you full access to transits, aspects, and the daily chart ruler tracker. <a href="${upgradeCta}" style="color:#C77DFF;text-decoration:none;">See what's included →</a>
    </p>
  `;

  return wrapHtml(
    `What to do with ${archetype} to make astrology actually land.`,
    inner,
  );
}

function renderDay5Text(ctx: DripRenderContext): string {
  const archetype = ctx.archetype ?? 'your chart ruler';
  const name = ctx.userName || 'there';
  return `What to actually do with ${archetype}

${name}, five days ago you discovered your chart ruler. Two ways engaged users get compounding value:

1. Cross-reference transits with your journal. Patterns emerge within weeks.
2. Learn the aspects your chart ruler makes. They're the secondary threads running through your whole chart.

Open your full chart: ${appLink('/birth-chart', 'day5_text_chart')}

— Lunary`;
}

async function renderDay5(ctx: DripRenderContext): Promise<DripEmail> {
  const archetype = ctx.archetype ?? 'your chart ruler';
  return {
    subject: `What to actually do with ${archetype}`,
    html: renderDay5Html(ctx),
    text: renderDay5Text(ctx),
  };
}

// --- Config export ----------------------------------------------------------

export const chartRulerDripConfig: DripConfig = {
  quizSlug: 'chart-ruler',
  day2: renderDay2,
  day5: renderDay5,
};
