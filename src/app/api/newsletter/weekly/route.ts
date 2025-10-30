import { NextRequest, NextResponse } from 'next/server';
import {
  generateWeeklyContent,
  WeeklyCosmicData,
} from '../../../../../utils/blog/weeklyContentGenerator';

export const dynamic = 'force-dynamic';

// Weekly newsletter generation and distribution
export async function POST(request: NextRequest) {
  try {
    const {
      send = false,
      testEmail = null,
      customSubject = null,
      weekOffset = 0, // 0 = this week, 1 = next week, -1 = last week
    } = await request.json();

    console.log(
      `📧 Generating weekly newsletter (weekOffset: ${weekOffset}, send: ${send})`,
    );

    // Calculate target week
    const today = new Date();
    const targetDate = new Date(
      today.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000,
    );

    // Get start of week (Monday)
    const dayOfWeek = targetDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(
      targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
    );

    // Generate weekly cosmic content
    const weeklyData = await generateWeeklyContent(weekStart);

    // Generate newsletter content
    const newsletter = generateNewsletterHTML(weeklyData, customSubject);

    if (send) {
      // Send newsletter (implement with your preferred email service)
      const emailResult = await sendNewsletter(newsletter, testEmail);

      return NextResponse.json({
        success: true,
        message: testEmail
          ? `Test newsletter sent to ${testEmail}`
          : `Newsletter sent to subscriber list`,
        data: {
          subject: newsletter.subject,
          recipients: emailResult.recipients,
          weekData: {
            title: weeklyData.title,
            weekNumber: weeklyData.weekNumber,
            year: weeklyData.year,
            majorEvents:
              weeklyData.planetaryHighlights.length +
              weeklyData.retrogradeChanges.length,
          },
        },
      });
    }

    // Return newsletter preview
    return NextResponse.json({
      success: true,
      preview: true,
      newsletter: {
        subject: newsletter.subject,
        html: newsletter.html,
        text: newsletter.text,
        metadata: {
          weekStart: weeklyData.weekStart,
          weekEnd: weeklyData.weekEnd,
          weekNumber: weeklyData.weekNumber,
          year: weeklyData.year,
          contentSummary: {
            planetaryHighlights: weeklyData.planetaryHighlights.length,
            retrogradeChanges: weeklyData.retrogradeChanges.length,
            majorAspects: weeklyData.majorAspects.length,
            moonPhases: weeklyData.moonPhases.length,
          },
        },
      },
    });
  } catch (error) {
    console.error('Newsletter generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate newsletter',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET endpoint for newsletter preview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get('week') || '0');

    // Generate preview without sending
    const response = await fetch(request.url.replace('/GET', '/POST'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ send: false, weekOffset }),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Preview generation failed' },
      { status: 500 },
    );
  }
}

function generateNewsletterHTML(
  data: WeeklyCosmicData,
  customSubject?: string,
): { subject: string; html: string; text: string } {
  const weekRange = `${data.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${data.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const subject = customSubject || `${data.title} | ${weekRange}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${subject}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #2d3748; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f7fafc;
        }
        .container { 
            background: white; 
            border-radius: 12px; 
            padding: 40px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        h1 { 
            color: #2d3748; 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
        }
        .subtitle { 
            color: #718096; 
            font-size: 16px; 
            margin: 10px 0; 
            font-style: italic; 
        }
        .week-range { 
            color: #a0aec0; 
            font-size: 14px; 
            margin: 5px 0; 
        }
        h2 { 
            color: #4a5568; 
            font-size: 22px; 
            margin: 30px 0 15px 0; 
            border-left: 4px solid #667eea; 
            padding-left: 15px; 
        }
        h3 { 
            color: #718096; 
            font-size: 18px; 
            margin: 20px 0 10px 0; 
        }
        .event { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0; 
            border-left: 4px solid #38b2ac; 
        }
        .date { 
            font-weight: 600; 
            color: #2d3748; 
        }
        .significance { 
            display: inline-block; 
            background: #e6fffa; 
            color: #234e52; 
            padding: 2px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase; 
            margin: 5px 0; 
        }
        .guidance { 
            background: #e6fffa; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #38b2ac; 
            margin: 10px 0; 
        }
        .crystal-day { 
            display: flex; 
            align-items: center; 
            padding: 10px; 
            background: #f8f9fa; 
            border-radius: 6px; 
            margin: 8px 0; 
        }
        .crystal-name { 
            font-weight: 600; 
            color: #553c9a; 
            margin-right: 10px; 
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            color: #718096; 
            font-size: 14px; 
        }
        .cta { 
            text-align: center; 
            margin: 30px 0; 
        }
        .cta a { 
            background: #667eea; 
            color: white; 
            padding: 12px 24px; 
            border-radius: 8px; 
            text-decoration: none; 
            font-weight: 600; 
        }
        .emoji { 
            font-size: 1.2em; 
            margin-right: 8px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.title}</h1>
            <div class="subtitle">${data.subtitle}</div>
            <div class="week-range">Week of ${weekRange}</div>
        </div>

        <div style="margin: 20px 0; font-size: 16px; line-height: 1.7;">
            ${data.summary}
        </div>

        ${
          data.planetaryHighlights.length > 0
            ? `
        <h2><span class="emoji">🌟</span>Major Planetary Movements</h2>
        ${data.planetaryHighlights
          .map(
            (highlight: any) => `
        <div class="event">
            <div class="date">${highlight.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <h3>${highlight.planet} ${highlight.event.replace('-', ' ')}</h3>
            <div class="significance">${highlight.significance} significance</div>
            <p>${highlight.description}</p>
        </div>
        `,
          )
          .join('')}
        `
            : ''
        }

        ${
          data.retrogradeChanges.length > 0
            ? `
        <h2><span class="emoji">♻️</span>Retrograde Activity</h2>
        ${data.retrogradeChanges
          .map(
            (change: any) => `
        <div class="event">
            <div class="date">${change.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <h3>${change.planet} ${change.action === 'begins' ? 'Stations Retrograde' : 'Stations Direct'}</h3>
            <p><strong>In ${change.sign}:</strong> ${change.significance}</p>
            <div class="guidance">
                <strong>Guidance:</strong> ${change.guidance}
            </div>
        </div>
        `,
          )
          .join('')}
        `
            : ''
        }

        ${
          data.moonPhases.length > 0
            ? `
        <h2><span class="emoji">🌙</span>Lunar Phases</h2>
        ${data.moonPhases
          .map(
            (phase: any) => `
        <div class="event">
            <div class="date">${phase.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${phase.time}</div>
            <h3>${phase.phase} in ${phase.sign}</h3>
            <p><strong>Energy:</strong> ${phase.energy}</p>
            <div class="guidance">${phase.guidance}</div>
            ${
              phase.ritualSuggestions.length > 0
                ? `
            <div style="margin-top: 10px;">
                <strong>Ritual Ideas:</strong>
                <ul>${phase.ritualSuggestions.map((suggestion: string) => `<li>${suggestion}</li>`).join('')}</ul>
            </div>
            `
                : ''
            }
        </div>
        `,
          )
          .join('')}
        `
            : ''
        }

        <h2><span class="emoji">💎</span>Weekly Crystal Companions</h2>
        <div>
            ${data.crystalRecommendations
              .map(
                (crystal: any) => `
            <div class="crystal-day">
                <span class="crystal-name">${crystal.crystal}</span>
                <span>${crystal.date.toLocaleDateString('en-US', { weekday: 'long' })}: ${crystal.reason}</span>
            </div>
            `,
              )
              .join('')}
        </div>

        <h2><span class="emoji">📅</span>Best Days For...</h2>
        <div>
            ${Object.entries(data.bestDaysFor)
              .map(
                ([activity, guidance]: [string, any]) => `
            <div style="margin: 10px 0;">
                <strong>${activity.charAt(0).toUpperCase() + activity.slice(1)}:</strong> 
                ${(guidance as any).dates.map((d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })).join(', ')} 
                <br><em>${(guidance as any).reason}</em>
            </div>
            `,
              )
              .join('')}
        </div>

        <div class="cta">
            <a href="https://lunary.app">Get Your Personalized Cosmic Guidance</a>
        </div>

        <div class="footer">
            <p>Generated with cosmic intelligence by Lunary</p>
            <p>Visit <a href="https://lunary.app">lunary.app</a> for daily updates and personalized guidance</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="https://lunary.app/newsletter">Manage Preferences</a></p>
        </div>
    </div>
</body>
</html>`;

  // Generate plain text version
  const text = generateTextNewsletter(data);

  return { subject, html, text };
}

function generateTextNewsletter(data: WeeklyCosmicData): string {
  const weekRange = `${data.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${data.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  return `
${data.title}
${data.subtitle}
Week of ${weekRange}

${data.summary}

MAJOR PLANETARY MOVEMENTS
========================
${data.planetaryHighlights
  .map(
    (highlight: any) =>
      `${highlight.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${highlight.planet} ${highlight.event.replace('-', ' ')}
${highlight.description}
Significance: ${highlight.significance}
`,
  )
  .join('\n')}

RETROGRADE ACTIVITY
==================
${data.retrogradeChanges
  .map(
    (change: any) =>
      `${change.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${change.planet} ${change.action === 'begins' ? 'stations retrograde' : 'stations direct'} in ${change.sign}
${change.significance}
Guidance: ${change.guidance}
`,
  )
  .join('\n')}

LUNAR PHASES
============
${data.moonPhases
  .map(
    (phase: any) =>
      `${phase.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${phase.time}: ${phase.phase} in ${phase.sign}
Energy: ${phase.energy}
Guidance: ${phase.guidance}
`,
  )
  .join('\n')}

WEEKLY CRYSTAL COMPANIONS
========================
${data.crystalRecommendations
  .map(
    (crystal: any) =>
      `${crystal.date.toLocaleDateString('en-US', { weekday: 'long' })}: ${crystal.crystal}
${crystal.reason}
Usage: ${crystal.usage}
`,
  )
  .join('\n')}

BEST DAYS FOR...
===============
${Object.entries(data.bestDaysFor)
  .map(
    ([activity, guidance]: [string, any]) =>
      `${activity.toUpperCase()}: ${(guidance as any).dates.map((d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })).join(', ')}
${(guidance as any).reason}
`,
  )
  .join('\n')}

---
Generated with cosmic intelligence by Lunary
Visit lunary.app for daily updates and personalized guidance
`.trim();
}

async function sendNewsletter(
  newsletter: { subject: string; html: string; text: string },
  testEmail?: string,
) {
  const { sendEmail } = await import('@/lib/email');
  const { sql } = await import('@vercel/postgres');

  type BatchEmailResult = {
    success: number;
    failed: number;
    total: number;
    errors: Array<{ email: string; error: string }>;
  };

  console.log(`📧 Sending newsletter: "${newsletter.subject}"`);
  console.log(`📊 HTML length: ${newsletter.html.length} chars`);
  console.log(`📊 Text length: ${newsletter.text.length} chars`);

  // Test email - send to single recipient
  if (testEmail) {
    console.log(`🧪 Test mode: sending to ${testEmail}`);
    try {
      await sendEmail({
        to: testEmail,
        subject: newsletter.subject,
        html: newsletter.html,
        text: newsletter.text,
      });
      return {
        recipients: 1,
        success: 1,
        failed: 0,
        testMode: true,
        email: testEmail,
      };
    } catch (error) {
      console.error('Test email failed:', error);
      return {
        recipients: 1,
        success: 0,
        failed: 1,
        testMode: true,
        email: testEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Production: Get active verified subscribers
  try {
    const subscribers = await sql`
      SELECT email 
      FROM newsletter_subscribers 
      WHERE is_active = true 
      AND is_verified = true
      AND preferences->>'weeklyNewsletter' = 'true'
      ORDER BY created_at ASC
    `;

    const emailList = subscribers.rows.map((row) => row.email);

    if (emailList.length === 0) {
      console.log('📭 No active subscribers found');
      return {
        recipients: 0,
        success: 0,
        failed: 0,
        testMode: false,
        note: 'No active subscribers',
      };
    }

    console.log(`📬 Sending to ${emailList.length} subscribers`);

    // Use batch email function (handles 100 per batch automatically)
    const result = await sendEmail({
      to: emailList,
      subject: newsletter.subject,
      html: newsletter.html,
      text: newsletter.text,
    });

    // Update last_email_sent and increment email_count for successful sends
    if (typeof result === 'object' && 'success' in result) {
      const batchResult = result as BatchEmailResult;

      // Update subscriber records
      const updatePromises = emailList.map(
        (email) =>
          sql`
          UPDATE newsletter_subscribers 
          SET 
            last_email_sent = NOW(),
            email_count = email_count + 1
          WHERE email = ${email}
        `,
      );

      await Promise.allSettled(updatePromises);

      return {
        recipients: emailList.length,
        success: batchResult.success,
        failed: batchResult.failed,
        errors: batchResult.errors,
        testMode: false,
      };
    }

    return {
      recipients: emailList.length,
      success: emailList.length,
      failed: 0,
      testMode: false,
    };
  } catch (error) {
    console.error('Newsletter sending failed:', error);
    throw error;
  }
}
