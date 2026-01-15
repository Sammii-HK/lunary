import 'dotenv/config';

type Args = {
  start_date?: string;
  end_date?: string;
  dry_run?: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  argv.forEach((arg) => {
    if (arg === '--dry-run') {
      args.dry_run = true;
      return;
    }
    const [key, value] = arg.split('=');
    if (!value) return;
    if (key === '--start-date') {
      args.start_date = value;
    }
    if (key === '--end-date') {
      args.end_date = value;
    }
  });
  return args;
}

async function main() {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    throw new Error('CRON_SECRET is required in .env.local');
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const body = parseArgs(process.argv.slice(2));

  const response = await fetch(
    `${baseUrl}/api/admin/analytics/reconcile-signups`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Backfill failed: ${response.status} ${text}`);
  }

  console.log(text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
