import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateExamples } from '../../../../../scripts/generate-cta-examples';
import { sendDiscordNotification } from '@/lib/discord';

/**
 * Cron job to regenerate CTA examples monthly
 * Runs on the 20th of each month when Sun typically changes signs
 *
 * Schedule: 0 6 20 * * (6 AM UTC on the 20th of each month)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('🌟 Starting CTA examples generation...');
    const startTime = Date.now();

    // Generate examples
    const examples = await generateExamples();

    // Write to output file
    const outputPath = path.join(
      process.cwd(),
      'src',
      'lib',
      'cta-examples.json',
    );
    await fs.writeFile(outputPath, JSON.stringify(examples, null, 2), 'utf-8');

    const duration = Date.now() - startTime;
    console.log(`✅ CTA examples generated successfully in ${duration}ms`);

    // Count examples generated
    const exampleCounts = Object.entries(examples)
      .filter(
        ([key]) =>
          !['generatedAt', 'generatedForDate', 'reference'].includes(key),
      )
      .map(([hub, data]: [string, any]) => ({
        hub,
        count: data?.examples?.length || 0,
      }));

    const totalExamples = exampleCounts.reduce(
      (sum, { count }) => sum + count,
      0,
    );

    // Send Discord notification
    await sendDiscordNotification({
      title: '✨ CTA Examples Generated',
      description: `Monthly CTA examples have been regenerated with current transit data.`,
      fields: [
        {
          name: 'Date',
          value: examples.generatedForDate,
          inline: true,
        },
        {
          name: 'Total Examples',
          value: String(totalExamples),
          inline: true,
        },
        {
          name: 'Duration',
          value: `${duration}ms`,
          inline: true,
        },
        ...exampleCounts.map(({ hub, count }) => ({
          name: hub,
          value: `${count} examples`,
          inline: true,
        })),
      ],
      color: 'success',
      footer: `Generated at ${new Date().toISOString()}`,
      category: 'operations',
      dedupeKey: `cta-examples-${examples.generatedForDate}`,
    });

    return NextResponse.json({
      success: true,
      generatedAt: examples.generatedAt,
      generatedForDate: examples.generatedForDate,
      totalExamples,
      exampleCounts,
      duration,
      outputPath,
    });
  } catch (error) {
    console.error('❌ Error generating CTA examples:', error);

    // Send error notification
    await sendDiscordNotification({
      title: '🚨 CTA Examples Generation Failed',
      description: `Failed to generate monthly CTA examples.`,
      fields: [
        {
          name: 'Error',
          value: error instanceof Error ? error.message : 'Unknown error',
          inline: false,
        },
      ],
      color: 'error',
      footer: `Failed at ${new Date().toISOString()}`,
      category: 'urgent',
      dedupeKey: `cta-examples-error-${new Date().toISOString().split('T')[0]}`,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
