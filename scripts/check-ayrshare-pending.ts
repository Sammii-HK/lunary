import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.AYRSHARE_API_KEY!;
const PROFILE_KEY = process.env.AYRSHARE_PROFILE_KEY!;

async function main() {
  const res = await fetch(
    'https://app.ayrshare.com/api/history?platform=tiktok&limit=50',
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Profile-Key': PROFILE_KEY,
      },
    },
  );
  const data = (await res.json()) as any;
  const history: any[] = data.history ?? [];
  const pending = history.filter((p: any) => p.status === 'pending');
  console.log(`Pending posts: ${pending.length}`);
  const sorted = pending.sort((a: any, b: any) =>
    (a.scheduleDate || a.created).localeCompare(b.scheduleDate || b.created),
  );
  for (const p of sorted) {
    const postText = Array.isArray(p.post) ? p.post[0] : String(p.post ?? '');
    const firstLine = postText.split('\n')[0].substring(0, 65);
    console.log(`  ${p.scheduleDate ?? '(no date)'} — ${firstLine}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
