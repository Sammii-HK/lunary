/**
 * Posts today's missing Instagram content via Spellcast API directly.
 * Carousel slides are already blob-uploaded (from upload-carousel-slides.ts).
 * Reel video is already a static blob URL.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_URL = (process.env.SPELLCAST_API_URL || '').replace(/\s/g, '');
const API_KEY = (process.env.SPELLCAST_API_KEY || '').replace(/\s/g, '');
const ACCOUNT_SET_ID = process.env.SPELLCAST_LUNARY_ACCOUNT_SET_ID!;

async function spellcastPost(payload: {
  content: string;
  mediaUrls: string[];
  scheduledFor: string;
  postType: string;
  selectedAccountIds?: string[];
}) {
  // Step 1: create draft
  const createRes = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      content: payload.content,
      mediaUrls: payload.mediaUrls,
      scheduledFor: payload.scheduledFor,
      accountSetId: ACCOUNT_SET_ID,
      postType: payload.postType,
      ...(payload.selectedAccountIds
        ? { selectedAccountIds: payload.selectedAccountIds }
        : {}),
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Create failed (${createRes.status}): ${err}`);
  }

  const draft = (await createRes.json()) as any;
  console.log(`  Draft created: ${draft.id}`);

  // Step 2: schedule
  const schedRes = await fetch(`${API_URL}/api/posts/${draft.id}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!schedRes.ok) {
    const err = await schedRes.text();
    throw new Error(`Schedule failed (${schedRes.status}): ${err}`);
  }

  const scheduled = (await schedRes.json()) as any;
  return scheduled;
}

// Resolve instagram account ID from Lunary account set
async function getInstagramAccountId(): Promise<string | undefined> {
  const res = await fetch(`${API_URL}/api/account-sets/${ACCOUNT_SET_ID}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as any;
  const accounts: any[] = data.socialAccounts ?? [];
  const ig = accounts.find((a: any) => a.platform === 'instagram');
  return ig?.id;
}

async function main() {
  console.log(`API: ${API_URL}`);
  console.log(`Account set: ${ACCOUNT_SET_ID}\n`);

  const igAccountId = await getInstagramAccountId();
  console.log(
    `Instagram account ID: ${igAccountId ?? '(not found, will use all accounts)'}\n`,
  );

  // ── Carousel ──────────────────────────────────────────────────────────────
  console.log('📸 Posting Capricorn carousel...');
  try {
    const carouselResult = await spellcastPost({
      content: `Capricorn personality — why they're always five steps ahead of everyone else.\n\nSwipe through for everything — personality, strengths, shadow side, love compatibility, and career energy.\n\nSave this if you're a Capricorn or know one.\n\nFull grimoire — link in bio\n\n#capricorn #zodiac #astrology #birthchart #astrologytiktok`,
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/social-images/mmjmllhhd4r7qf.png',
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/social-images/mmjmm3553rsna7.png',
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/social-images/mmjmmm0k73hh5v.png',
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/social-images/mmjmn2cvfoybo1.png',
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/social-images/mmjmng1uqio12b.png',
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/social-images/mmjmnvkfpsot1r.png',
      ],
      scheduledFor: '2026-03-09T21:30:00.000Z',
      postType: 'post',
      ...(igAccountId ? { selectedAccountIds: [igAccountId] } : {}),
    });
    console.log(
      '✅ Carousel scheduled:',
      JSON.stringify(carouselResult).substring(0, 150),
    );
  } catch (err) {
    console.error(
      '❌ Carousel failed:',
      err instanceof Error ? err.message : err,
    );
  }

  // ── Reel ──────────────────────────────────────────────────────────────────
  console.log('\n🎬 Posting Chiron in Leo reel...');
  try {
    const reelResult = await spellcastPost({
      content: `Chiron in Leo is the wound of "I'm only worthy when I'm seen."\n\nYou perform to earn love. You shine for an audience, then feel hollow when the crowd goes quiet.\n\nThis placement asks the hardest question: can you be authentically yourself without an audience confirming it?\n\nThe healing is learning to witness yourself.\n\nCheck your chart — link in bio\n\n#chironinleo #chiron #birthchart #astrology #selfworth`,
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-09-chiron-in-leo--being-seen-authentically-without-performing-1772983472307.mp4',
      ],
      scheduledFor: '2026-03-09T22:00:00.000Z',
      postType: 'reel',
      ...(igAccountId ? { selectedAccountIds: [igAccountId] } : {}),
    });
    console.log(
      '✅ Reel scheduled:',
      JSON.stringify(reelResult).substring(0, 150),
    );
  } catch (err) {
    console.error('❌ Reel failed:', err instanceof Error ? err.message : err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
