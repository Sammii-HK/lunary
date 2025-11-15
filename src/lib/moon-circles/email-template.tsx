import { MoonCircleContent } from './generator';

export function generateMoonCircleEmailHTML(
  content: MoonCircleContent,
  deepLinkUrl: string,
  userName?: string,
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const emoji = content.moonPhase === 'New Moon' ? '🌑' : '🌕';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Moon Circle: ${content.moonPhase} in ${content.moonSign} - Lunary</title>
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
            background: #101020;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 45px rgba(106, 90, 205, 0.25);
            border: 1px solid rgba(147, 112, 219, 0.2);
            color: #f1f1ff;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .moon-symbol {
            font-size: 64px;
            margin-bottom: 16px;
          }
          .title {
            color: #a78bfa;
            font-size: 32px;
            font-weight: bold;
            margin: 0;
          }
          .subtitle {
            color: #d1c4ff;
            font-size: 18px;
            margin: 8px 0 0 0;
          }
          .content {
            margin: 30px 0;
          }
          .section {
            margin: 24px 0;
            padding: 20px;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 12px;
            border-left: 3px solid #a78bfa;
          }
          .section-title {
            color: #a78bfa;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .section-content {
            color: #e1d9ff;
            font-size: 15px;
            line-height: 1.8;
          }
          .journal-questions {
            list-style: none;
            padding: 0;
            margin: 12px 0;
          }
          .journal-questions li {
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
          }
          .journal-questions li:before {
            content: "•";
            color: #a78bfa;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 999px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.35);
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 14px 40px rgba(99, 102, 241, 0.45);
          }
          .cta-container {
            text-align: center;
            margin: 32px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 13px;
            color: #9ca3af;
            border-top: 1px solid rgba(167, 139, 250, 0.2);
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="moon-symbol">${emoji}</div>
            <h1 class="title">Moon Circle</h1>
            <p class="subtitle">${content.moonPhase} in ${content.moonSign}</p>
          </div>
          
          <div class="content">
            <p style="color: #d1c4ff; font-size: 16px;">${greeting}</p>
            
            <div class="section">
              <div class="section-title">${emoji} ${content.moonPhase} Energy</div>
              <div class="section-content">${content.moonSignInfo}</div>
            </div>

            <div class="section">
              <div class="section-title">✨ Guided Ritual</div>
              <div class="section-content">${content.guidedRitual}</div>
            </div>

            <div class="section">
              <div class="section-title">💭 Journal Questions</div>
              <ul class="journal-questions">
                ${content.journalQuestions.map((q) => `<li>${q}</li>`).join('')}
              </ul>
            </div>

            <div class="section">
              <div class="section-title">🔮 Tarot Spread</div>
              <div class="section-content">${content.tarotSpreadSuggestion}</div>
            </div>

            <div class="cta-container">
              <a href="${deepLinkUrl}" class="cta-button">
                Ask Lunary AI for Deep Dive →
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Want to change your notification preferences? <a href="${baseUrl}/profile" style="color: #a78bfa;">Manage Settings</a></p>
            <p style="margin-top: 20px;">© ${new Date().getFullYear()} Lunary. Guided by the stars, powered by magic.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateMoonCircleEmailText(
  content: MoonCircleContent,
  deepLinkUrl: string,
  userName?: string,
): string {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const emoji = content.moonPhase === 'New Moon' ? '🌑' : '🌕';

  return `
Moon Circle: ${content.moonPhase} in ${content.moonSign} - Lunary

${greeting}

${emoji} ${content.moonPhase} Energy
${content.moonSignInfo}

✨ Guided Ritual
${content.guidedRitual}

💭 Journal Questions
${content.journalQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

🔮 Tarot Spread
${content.tarotSpreadSuggestion}

Ask Lunary AI for deep dive: ${deepLinkUrl}

Want to change your notification preferences? Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/profile

© ${new Date().getFullYear()} Lunary. Guided by the stars, powered by magic.
  `.trim();
}
