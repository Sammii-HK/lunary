export function generateReEngagementInsightsEmailHTML(
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
        <h1 style="color: #a855f7; font-size: 24px; margin-bottom: 16px;">✨ Your Monthly Insights Are Ready</h1>
        <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hi ${userName || 'there'},
        </p>
        <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Your personalized monthly cosmic insights are ready to view! Discover your patterns, frequent cards, and cosmic trends.
        </p>
        <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 3px solid #a855f7;">
          <p style="color: #e4e4e7; font-size: 14px; margin: 0;">
            📊 Usage patterns and trends<br>
            🔮 Most frequent tarot cards<br>
            📝 Journal themes and insights<br>
            🌙 Transit impacts summary
          </p>
        </div>
        <a href="${baseUrl}/profile" style="display: inline-block; background-color: #a855f7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          View Your Insights
        </a>
        <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
          If you'd prefer not to receive these emails, you can update your preferences in your profile settings.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function generateReEngagementInsightsEmailText(
  userName: string,
  baseUrl: string,
): string {
  return `
✨ Your Monthly Insights Are Ready

Hi ${userName || 'there'},

Your personalized monthly cosmic insights are ready to view! Discover your patterns, frequent cards, and cosmic trends.

📊 Usage patterns and trends
🔮 Most frequent tarot cards
📝 Journal themes and insights
🌙 Transit impacts summary

View your insights: ${baseUrl}/profile

If you'd prefer not to receive these emails, you can update your preferences in your profile settings.
  `.trim();
}
