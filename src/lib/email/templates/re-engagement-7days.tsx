export function generateReEngagement7DaysEmailHTML(
  userName: string,
  baseUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e4e4e7; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 12px; padding: 32px; border: 1px solid #3f3f46;">
        <h1 style="color: #a855f7; font-size: 24px; margin-bottom: 16px;">We miss you! 🌙</h1>
        <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hi ${userName || 'there'},
        </p>
        <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          It's been a week since you last checked in with Lunary. Your cosmic journey is waiting for you!
        </p>
        <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 3px solid #a855f7;">
          <p style="color: #e4e4e7; font-size: 14px; margin: 0;">
            ✨ New insights are ready<br>
            🔮 Your tarot patterns are evolving<br>
            🌙 Cosmic energies are shifting
          </p>
        </div>
        <a href="${baseUrl}/app" style="display: inline-block; background-color: #a855f7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          Return to Your Journey
        </a>
        <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
          If you'd prefer not to receive these emails, you can update your preferences in your profile settings.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function generateReEngagement7DaysEmailText(
  userName: string,
  baseUrl: string,
): string {
  return `
We miss you! 🌙

Hi ${userName || 'there'},

It's been a week since you last checked in with Lunary. Your cosmic journey is waiting for you!

✨ New insights are ready
🔮 Your tarot patterns are evolving
🌙 Cosmic energies are shifting

Return to your journey: ${baseUrl}/app

If you'd prefer not to receive these emails, you can update your preferences in your profile settings.
  `.trim();
}
