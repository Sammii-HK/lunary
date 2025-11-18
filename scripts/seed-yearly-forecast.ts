import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';
import { generateYearlyForecast } from '../src/lib/forecast/yearly';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

function parseArgs(): { year: number; source: string } {
  const args = process.argv.slice(2);
  const result: { year?: number; source?: string } = {};

  args.forEach((arg) => {
    if (arg.startsWith('--year=')) {
      result.year = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--source=')) {
      result.source = arg.split('=')[1];
    }
  });

  return {
    year: result.year ?? new Date().getFullYear() + 1,
    source: result.source ?? 'manual',
  };
}

async function main() {
  const argv = parseArgs();
  const year = argv.year;
  if (year < 2025 || year > 2100) {
    throw new Error('Year must be between 2025 and 2100');
  }

  console.log(`🔮 Generating yearly forecast for ${year}...`);
  const forecast = await generateYearlyForecast(year);

  const stats = {
    majorTransits: forecast.majorTransits.length,
    retrogrades: forecast.retrogrades.length,
    eclipses: forecast.eclipses.length,
    keyAspects: forecast.keyAspects.length,
  };

  console.log('💾 Saving forecast to yearly_forecasts table...');
  await sql`
    INSERT INTO yearly_forecasts (year, summary, forecast, stats, source, generated_at, expires_at, updated_at)
    VALUES (
      ${year},
      ${forecast.summary},
      ${JSON.stringify(forecast)}::jsonb,
      ${JSON.stringify(stats)}::jsonb,
      ${argv.source},
      NOW(),
      NULL,
      NOW()
    )
    ON CONFLICT (year)
    DO UPDATE SET
      summary = ${forecast.summary},
      forecast = ${JSON.stringify(forecast)}::jsonb,
      stats = ${JSON.stringify(stats)}::jsonb,
      source = ${argv.source},
      generated_at = NOW(),
      expires_at = NULL,
      updated_at = NOW()
  `;

  console.log(`✅ Yearly forecast for ${year} cached successfully.`);
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Failed to seed yearly forecast:', error);
  process.exit(1);
});
