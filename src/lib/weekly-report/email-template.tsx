import React from 'react';
import { WeeklyReport } from '../cosmic-snapshot/reports';

export function generateWeeklyReportEmailHTML(
  report: WeeklyReport,
  appUrl: string,
  userName?: string,
  userEmail?: string,
): string {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Cosmic Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a;">
  <div style="background: linear-gradient(135deg, #1e293b 0%, #312e81 100%); border-radius: 12px; padding: 30px; color: #fff;">
    <h1 style="color: #fff; margin-top: 0;">🌙 Your Weekly Cosmic Report</h1>
    <p style="color: #cbd5e1; font-size: 16px;">${greeting}</p>
    
    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #fff; margin-top: 0; font-size: 20px;">Week Summary</h2>
      <p style="color: #cbd5e1;">${report.summary}</p>
    </div>

    ${
      report.moonPhases.length > 0
        ? `
    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #fff; margin-top: 0; font-size: 20px;">Moon Phases This Week</h2>
      ${report.moonPhases
        .map(
          (phase) => `
        <div style="margin: 10px 0; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
          <span style="font-size: 24px;">${phase.emoji}</span>
          <strong style="color: #fff; margin-left: 10px;">${phase.phase}</strong>
          <span style="color: #94a3b8; margin-left: 10px; font-size: 14px;">${phase.date}</span>
        </div>
      `,
        )
        .join('')}
    </div>
    `
        : ''
    }

    ${
      report.keyTransits.length > 0
        ? `
    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #fff; margin-top: 0; font-size: 20px;">Key Transits</h2>
      ${report.keyTransits
        .map(
          (transit) => `
        <div style="margin: 10px 0; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
          <strong style="color: #fff;">${transit.transit}</strong>
          <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">${transit.description} - ${transit.date}</p>
        </div>
      `,
        )
        .join('')}
    </div>
    `
        : ''
    }

    ${
      report.tarotPatterns.dominantThemes.length > 0
        ? `
    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #fff; margin-top: 0; font-size: 20px;">🔮 Tarot Patterns This Week</h2>
      <p style="color: #cbd5e1; margin-bottom: 10px;">Dominant themes: <strong style="color: #fff;">${report.tarotPatterns.dominantThemes.join(', ')}</strong></p>
      ${
        report.tarotPatterns.frequentCards &&
        report.tarotPatterns.frequentCards.length > 0
          ? `
      <div style="margin-top: 15px;">
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">Most frequent cards:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${report.tarotPatterns.frequentCards
            .slice(0, 5)
            .map(
              (card) => `
            <span style="background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 6px; font-size: 13px; color: #cbd5e1;">
              ${card.name} (${card.count}x)
            </span>
          `,
            )
            .join('')}
        </div>
      </div>
      `
          : ''
      }
    </div>
    `
        : ''
    }

    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #fff; margin-top: 0; font-size: 20px;">📊 Week Overview</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 6px;">
          <div style="font-size: 24px; margin-bottom: 5px;">${report.moonPhases.length}</div>
          <div style="color: #94a3b8; font-size: 13px;">Moon Phases</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 6px;">
          <div style="font-size: 24px; margin-bottom: 5px;">${report.keyTransits.length}</div>
          <div style="color: #94a3b8; font-size: 13px;">Key Transits</div>
        </div>
      </div>
    </div>

    <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #fff; margin-top: 0; font-size: 20px;">💫 Cosmic Insights</h2>
      <p style="color: #cbd5e1; line-height: 1.8;">
        This week's cosmic energy has been ${report.tarotPatterns.dominantThemes.length > 0 ? report.tarotPatterns.dominantThemes[0].toLowerCase() : 'dynamic'}, 
        with ${report.keyTransits.length} significant planetary transits shaping your path. 
        The moon's journey through ${report.moonPhases.length > 0 ? report.moonPhases[0].phase : 'various phases'} 
        has influenced the emotional landscape, while your tarot patterns reveal deeper themes 
        ${report.tarotPatterns.dominantThemes.length > 0 ? `around ${report.tarotPatterns.dominantThemes.slice(0, 2).join(' and ')}` : 'of transformation'}.
      </p>
      <p style="color: #cbd5e1; margin-top: 15px; line-height: 1.8;">
        <strong style="color: #fff;">Looking ahead:</strong> Use these insights to align with the cosmic flow. 
        Pay attention to the patterns that emerged this week—they're guiding you toward your highest path.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/cosmic-state" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View Your Full Cosmic State →
      </a>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
      <p style="color: #94a3b8; font-size: 12px;">
        Want personalized insights? <a href="${appUrl}/book-of-shadows" style="color: #8b5cf6;">Ask Lunary AI</a>
      </p>
      <p style="color: #64748b; font-size: 11px; margin-top: 15px;">
        <a href="${appUrl}/unsubscribe?email=${userEmail ? encodeURIComponent(userEmail) : ''}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> | 
        <a href="${appUrl}/profile" style="color: #64748b; text-decoration: underline;">Manage Preferences</a>
      </p>
      <p style="color: #475569; font-size: 10px; margin-top: 10px;">
        © ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateWeeklyReportEmailText(
  report: WeeklyReport,
  appUrl: string,
  userName?: string,
  userEmail?: string,
): string {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  return `
${greeting}

🌙 Your Weekly Cosmic Report

${report.summary}

📊 Week Overview:
- ${report.moonPhases.length} Moon Phases
- ${report.keyTransits.length} Key Transits

Moon Phases This Week:
${report.moonPhases.map((p) => `${p.emoji} ${p.phase} - ${p.date}`).join('\n')}

Key Transits:
${report.keyTransits.map((t) => `${t.transit} - ${t.date}\n  ${t.description}`).join('\n')}

${report.tarotPatterns.dominantThemes.length > 0 ? `\n🔮 Tarot Patterns:\nDominant themes: ${report.tarotPatterns.dominantThemes.join(', ')}\n` : ''}
${
  report.tarotPatterns.frequentCards &&
  report.tarotPatterns.frequentCards.length > 0
    ? `Most frequent cards: ${report.tarotPatterns.frequentCards
        .slice(0, 5)
        .map((c) => `${c.name} (${c.count}x)`)
        .join(', ')}\n`
    : ''
}

💫 Cosmic Insights:
This week's cosmic energy has been ${report.tarotPatterns.dominantThemes.length > 0 ? report.tarotPatterns.dominantThemes[0].toLowerCase() : 'dynamic'}, with ${report.keyTransits.length} significant planetary transits shaping your path. The moon's journey through ${report.moonPhases.length > 0 ? report.moonPhases[0].phase : 'various phases'} has influenced the emotional landscape, while your tarot patterns reveal deeper themes ${report.tarotPatterns.dominantThemes.length > 0 ? `around ${report.tarotPatterns.dominantThemes.slice(0, 2).join(' and ')}` : 'of transformation'}.

Looking ahead: Use these insights to align with the cosmic flow. Pay attention to the patterns that emerged this week—they're guiding you toward your highest path.

View your full cosmic state: ${appUrl}/cosmic-state
Ask Lunary AI: ${appUrl}/book-of-shadows

---
Unsubscribe: ${appUrl}/unsubscribe?email=${userEmail ? encodeURIComponent(userEmail) : ''}
Manage Preferences: ${appUrl}/profile

© ${new Date().getFullYear()} Lunary. Made with 🌙 for your cosmic journey.
  `.trim();
}
