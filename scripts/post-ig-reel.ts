import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_URL = (process.env.SPELLCAST_API_URL || '').replace(/\s/g, '');
const API_KEY = (process.env.SPELLCAST_API_KEY || '').replace(/\s/g, '');
const ACCOUNT_SET_ID = process.env.SPELLCAST_LUNARY_ACCOUNT_SET_ID!;
const IG_ACCOUNT_ID = '7a229f88-3160-4adc-9b00-2e9dc4c5e76f';

async function main() {
  // Create draft with postType 'post' and instagramOptions.type = 'reel'
  const createRes = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      content: `Chiron in Leo is the wound of "I'm only worthy when I'm seen."\n\nYou perform to earn love. You shine for an audience, then feel hollow when the crowd goes quiet.\n\nThis placement asks the hardest question: can you be authentically yourself without an audience confirming it?\n\nThe healing is learning to witness yourself.\n\nCheck your chart — link in bio\n\n#chironinleo #chiron #birthchart #astrology #selfworth`,
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-09-chiron-in-leo--being-seen-authentically-without-performing-1772983472307.mp4',
      ],
      scheduledFor: '2026-03-09T22:00:00.000Z',
      accountSetId: ACCOUNT_SET_ID,
      postType: 'post',
      selectedAccountIds: [IG_ACCOUNT_ID],
      platformSettings: {
        instagram: { type: 'reel' },
      },
    }),
  });
  const draft = (await createRes.json()) as any;
  if (!createRes.ok) {
    console.error('Create failed:', draft);
    process.exit(1);
  }
  console.log('Draft:', draft.id);

  const schedRes = await fetch(`${API_URL}/api/posts/${draft.id}/schedule`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const sched = (await schedRes.json()) as any;
  if (!schedRes.ok) {
    console.error('Schedule failed:', sched);
    process.exit(1);
  }
  console.log('✅ Reel scheduled:', JSON.stringify(sched).substring(0, 200));
}

main().catch(console.error);
