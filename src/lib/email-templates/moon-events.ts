const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export interface MoonEventData {
  moonPhase: 'New Moon' | 'Full Moon';
  moonSign: string;
  date: Date;
  dateLabel: string;
  intention?: string;
  ritualSuggestion?: string;
  tarotSuggestion?: string;
}

// New Moon Email Template
export function generateNewMoonEmailHTML(
  userName: string,
  moonData: MoonEventData,
): string {
  const dateStr = moonData.date.toISOString().split('T')[0];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Moon in ${moonData.moonSign} - Lunary</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #0b0b12;
          }
          .container {
            background: linear-gradient(135deg, #1e293b 0%, #312e81 100%);
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 45px rgba(106, 90, 205, 0.25);
            border: 1px solid rgba(147, 112, 219, 0.2);
            color: #f1f1ff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 120px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
          }
          .moon-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }
          .title {
            color: #fff;
            font-size: 32px;
            font-weight: bold;
            margin: 0 0 8px 0;
          }
          .subtitle {
            color: #cbd5e1;
            font-size: 18px;
            margin: 0 0 24px 0;
          }
          .date-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            color: #cbd5e1;
            margin-bottom: 24px;
          }
          .content {
            margin: 30px 0;
          }
          .intention-box {
            background: rgba(255, 255, 255, 0.1);
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .ritual-box {
            background: rgba(255, 255, 255, 0.08);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #94a3b8;
            font-size: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.png" alt="Lunary" class="logo" />
            <div class="moon-icon">🌑</div>
            <h1 class="title">New Moon in ${moonData.moonSign}</h1>
            <p class="subtitle">A Time for New Beginnings</p>
            <span class="date-badge">${moonData.dateLabel}</span>
          </div>
          
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>The New Moon in <strong>${moonData.moonSign}</strong> marks a powerful moment of renewal and intention-setting. This is your cosmic blank slate—a time to plant seeds for the lunar cycle ahead.</p>
            
            ${
              moonData.intention
                ? `
            <div class="intention-box">
              <h3 style="margin-top: 0; color: #fff; font-size: 20px;">✨ This Moon's Energy</h3>
              <p style="color: #cbd5e1; margin: 0; line-height: 1.8;">${moonData.intention}</p>
            </div>
            `
                : ''
            }
            
            <div class="ritual-box">
              <h3 style="margin-top: 0; color: #fff; font-size: 20px;">🌙 New Moon Ritual</h3>
              <p style="color: #cbd5e1; margin-bottom: 12px;">Set your intentions for this lunar cycle:</p>
              <ol style="color: #cbd5e1; padding-left: 20px; margin: 0;">
                <li>Find a quiet space and light a candle</li>
                <li>Write down 3-5 intentions for what you want to manifest</li>
                <li>Speak them aloud or meditate on them</li>
                <li>Visualize these intentions coming to fruition</li>
                <li>Release them to the universe</li>
              </ol>
              ${moonData.ritualSuggestion ? `<p style="color: #cbd5e1; margin-top: 12px; font-style: italic;">${moonData.ritualSuggestion}</p>` : ''}
            </div>
            
            ${
              moonData.tarotSuggestion
                ? `
            <div class="ritual-box">
              <h3 style="margin-top: 0; color: #fff; font-size: 20px;">🔮 Tarot Guidance</h3>
              <p style="color: #cbd5e1; margin: 0;">${moonData.tarotSuggestion}</p>
            </div>
            `
                : ''
            }
            
            <div style="text-align: center;">
              <a href="${baseUrl}/moon-circles?date=${dateStr}" class="cta-button">
                Join the Moon Circle →
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
              The New Moon is a time of darkness and potential. Embrace the quiet, set your intentions, and trust in the cycle of renewal.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.</p>
            <p><a href="${baseUrl}/unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateNewMoonEmailText(
  userName: string,
  moonData: MoonEventData,
): string {
  const dateStr = moonData.date.toISOString().split('T')[0];

  return `
New Moon in ${moonData.moonSign} - Lunary 🌑

Hi ${userName || 'there'},

The New Moon in ${moonData.moonSign} marks a powerful moment of renewal and intention-setting. This is your cosmic blank slate—a time to plant seeds for the lunar cycle ahead.

${moonData.intention ? `\n✨ This Moon's Energy:\n${moonData.intention}\n` : ''}

🌙 New Moon Ritual:
Set your intentions for this lunar cycle:
1. Find a quiet space and light a candle
2. Write down 3-5 intentions for what you want to manifest
3. Speak them aloud or meditate on them
4. Visualize these intentions coming to fruition
5. Release them to the universe

${moonData.ritualSuggestion ? `${moonData.ritualSuggestion}\n` : ''}
${moonData.tarotSuggestion ? `\n🔮 Tarot Guidance:\n${moonData.tarotSuggestion}\n` : ''}

Join the Moon Circle: ${baseUrl}/moon-circles?date=${dateStr}

The New Moon is a time of darkness and potential. Embrace the quiet, set your intentions, and trust in the cycle of renewal.

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}

// Full Moon Email Template
export function generateFullMoonEmailHTML(
  userName: string,
  moonData: MoonEventData,
): string {
  const dateStr = moonData.date.toISOString().split('T')[0];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Full Moon in ${moonData.moonSign} - Lunary</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #0b0b12;
          }
          .container {
            background: linear-gradient(135deg, #312e81 0%, #1e293b 100%);
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 45px rgba(106, 90, 205, 0.25);
            border: 1px solid rgba(147, 112, 219, 0.2);
            color: #f1f1ff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 120px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
          }
          .moon-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }
          .title {
            color: #fff;
            font-size: 32px;
            font-weight: bold;
            margin: 0 0 8px 0;
          }
          .subtitle {
            color: #cbd5e1;
            font-size: 18px;
            margin: 0 0 24px 0;
          }
          .date-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            color: #cbd5e1;
            margin-bottom: 24px;
          }
          .content {
            margin: 30px 0;
          }
          .release-box {
            background: rgba(255, 255, 255, 0.1);
            border-left: 4px solid #ec4899;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .ritual-box {
            background: rgba(255, 255, 255, 0.08);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #94a3b8;
            font-size: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.png" alt="Lunary" class="logo" />
            <div class="moon-icon">🌕</div>
            <h1 class="title">Full Moon in ${moonData.moonSign}</h1>
            <p class="subtitle">A Time for Release & Manifestation</p>
            <span class="date-badge">${moonData.dateLabel}</span>
          </div>
          
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>The Full Moon in <strong>${moonData.moonSign}</strong> illuminates what needs to be seen. This is a time of culmination, release, and celebration—when the seeds you planted at the New Moon come into full bloom.</p>
            
            ${
              moonData.intention
                ? `
            <div class="release-box">
              <h3 style="margin-top: 0; color: #fff; font-size: 20px;">✨ This Moon's Energy</h3>
              <p style="color: #cbd5e1; margin: 0; line-height: 1.8;">${moonData.intention}</p>
            </div>
            `
                : ''
            }
            
            <div class="ritual-box">
              <h3 style="margin-top: 0; color: #fff; font-size: 20px;">🌕 Full Moon Ritual</h3>
              <p style="color: #cbd5e1; margin-bottom: 12px;">Release what no longer serves you:</p>
              <ol style="color: #cbd5e1; padding-left: 20px; margin: 0;">
                <li>Reflect on what you've accomplished since the New Moon</li>
                <li>Write down what you're ready to release</li>
                <li>Burn the paper (safely) or bury it in the earth</li>
                <li>Express gratitude for the lessons learned</li>
                <li>Celebrate your growth and manifestations</li>
              </ol>
              ${moonData.ritualSuggestion ? `<p style="color: #cbd5e1; margin-top: 12px; font-style: italic;">${moonData.ritualSuggestion}</p>` : ''}
            </div>
            
            ${
              moonData.tarotSuggestion
                ? `
            <div class="ritual-box">
              <h3 style="margin-top: 0; color: #fff; font-size: 20px;">🔮 Tarot Guidance</h3>
              <p style="color: #cbd5e1; margin: 0;">${moonData.tarotSuggestion}</p>
            </div>
            `
                : ''
            }
            
            <div style="text-align: center;">
              <a href="${baseUrl}/moon-circles?date=${dateStr}" class="cta-button">
                Join the Moon Circle →
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
              The Full Moon brings clarity and completion. Trust in the process, release with grace, and honor the journey you've taken.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.</p>
            <p><a href="${baseUrl}/unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateFullMoonEmailText(
  userName: string,
  moonData: MoonEventData,
): string {
  const dateStr = moonData.date.toISOString().split('T')[0];

  return `
Full Moon in ${moonData.moonSign} - Lunary 🌕

Hi ${userName || 'there'},

The Full Moon in ${moonData.moonSign} illuminates what needs to be seen. This is a time of culmination, release, and celebration—when the seeds you planted at the New Moon come into full bloom.

${moonData.intention ? `\n✨ This Moon's Energy:\n${moonData.intention}\n` : ''}

🌕 Full Moon Ritual:
Release what no longer serves you:
1. Reflect on what you've accomplished since the New Moon
2. Write down what you're ready to release
3. Burn the paper (safely) or bury it in the earth
4. Express gratitude for the lessons learned
5. Celebrate your growth and manifestations

${moonData.ritualSuggestion ? `${moonData.ritualSuggestion}\n` : ''}
${moonData.tarotSuggestion ? `\n🔮 Tarot Guidance:\n${moonData.tarotSuggestion}\n` : ''}

Join the Moon Circle: ${baseUrl}/moon-circles?date=${dateStr}

The Full Moon brings clarity and completion. Trust in the process, release with grace, and honor the journey you've taken.

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}
