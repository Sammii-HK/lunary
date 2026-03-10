/**
 * Manually posts today's missing Instagram content:
 * 1. Capricorn carousel (missed 10:00 slot) → schedule for tonight
 * 2. Chiron in Leo reel (missed 15:00 slot) → schedule for tonight
 *
 * Runs from local machine so preUploadImage works (no self-referencing issue).
 */
import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SPELLCAST_URL =
  process.env.NEXT_PUBLIC_POSTIZ_URL || 'https://postiz.sammii.dev';
const SPELLCAST_API_KEY = process.env.POSTIZ_API_KEY!;
// Lunary account set
const ACCOUNT_SET_ID = 'a190e806-5bac-497b-88bd-b1d96ed1f2e8';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

async function preUploadImage(imageUrl: string): Promise<string> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/png';
    const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
    const hash =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const blob = await put(`social-images/${hash}.${ext}`, buffer, {
      access: 'public',
      contentType,
      token: BLOB_TOKEN,
    });
    console.log(`  ✅ Uploaded: ${blob.url}`);
    return blob.url;
  } catch (err) {
    console.error(
      `  ❌ Failed to upload ${imageUrl}:`,
      err instanceof Error ? err.message : err,
    );
    throw err;
  }
}

async function createSpellcastPost(payload: {
  content: string;
  mediaUrls: string[];
  scheduledFor: string;
  postType?: string;
  instagramOptions?: Record<string, unknown>;
}) {
  const body: Record<string, unknown> = {
    content: payload.content,
    date: payload.scheduledFor,
    settings: {
      [ACCOUNT_SET_ID]: {
        instagram: {
          ...(payload.instagramOptions || {}),
        },
      },
    },
    type: 'schedule',
    shortLink: false,
  };

  if (payload.mediaUrls.length > 0) {
    body.media = payload.mediaUrls.map((url) => ({ url }));
  }

  const res = await fetch(`${SPELLCAST_URL}/api/v1/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SPELLCAST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(`Spellcast API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  // ─── 1. Capricorn Carousel ────────────────────────────────────────────────
  console.log('\n🎠 Uploading Capricorn carousel slides...');
  const carouselSlideUrls = [
    'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=0&totalSlides=6&content=Cold%3F+No.+Playing+chess+while+you+play+checkers.&category=zodiac&variant=cover&v=4&t=1772982883388&symbol=J',
    'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=1&totalSlides=6&content=Element%3A+Earth%0ARuler%3A+Saturn%0AModality%3A+Cardinal&category=zodiac&variant=body&v=4&t=1772982883388&subtitle=Element+%26+Ruler&symbol=J&nextSubtitle=Strengths',
    'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=2&totalSlides=6&content=Responsible%2C+Disciplined%2C+Self-control%2C+Good+managers%2C+Ambitious%2C+Patient&category=zodiac&variant=body&v=4&t=1772982883388&subtitle=Strengths&symbol=J&nextSubtitle=Personality',
    'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=3&totalSlides=6&content=Capricorn+is+the+achiever+of+the+zodiac%2C+bringing+discipline%2C+ambition%2C+and+the+determination+to+reach+the+top.+As+a+Cardinal+Earth+sign+ruled+by+Saturn%2C+Capricorn+represents+mastery%2C+structure%2C+and+the+patient+climb+to+success.+Capricorn+natives+build+lasting+legacies+through+persistent+effort.&category=zodiac&variant=body&v=4&t=1772982883388&subtitle=Personality&symbol=J&nextSubtitle=Love+%26+Career',
    'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=4&totalSlides=6&content=Love%3A+Capricorn+loves+with+loyalty+and+long-term+commitment.+They+seek+partners+who+share+their+values+of+stability+and+are+willing+to+build+together.%0A%0ACareer%3A+Capricorn+excels+in+management%2C+government%2C+finance%2C+and+any+field+requiring+discipline.+They+naturally+climb+to+positions+of+authority.&category=zodiac&variant=body&v=4&t=1772982883388&subtitle=Love+%26+Career&symbol=J',
    'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=5&totalSlides=6&content=Get+your+free+birth+chart+reading&category=zodiac&variant=cta&v=4&t=1772982883388',
  ];

  const carouselBlobUrls: string[] = [];
  for (let i = 0; i < carouselSlideUrls.length; i++) {
    console.log(`  Uploading slide ${i + 1}/${carouselSlideUrls.length}...`);
    const blobUrl = await preUploadImage(carouselSlideUrls[i]);
    carouselBlobUrls.push(blobUrl);
  }

  console.log('\n📤 Creating carousel post in Spellcast...');
  try {
    const carouselResult = await createSpellcastPost({
      content: `Capricorn personality — why they're always five steps ahead of everyone else.\n\nSwipe through for everything — personality, strengths, shadow side, love compatibility, and career energy.\n\nSave this if you're a Capricorn or know one.\n\nFull grimoire — link in bio`,
      mediaUrls: carouselBlobUrls,
      scheduledFor: '2026-03-09T21:30:00.000Z',
      instagramOptions: { type: 'carousel' },
    });
    console.log(
      '✅ Carousel created:',
      JSON.stringify(carouselResult).substring(0, 200),
    );
  } catch (err) {
    console.error('❌ Carousel post failed:', err);
  }

  // ─── 2. Chiron in Leo Reel ────────────────────────────────────────────────
  console.log('\n🎬 Creating Chiron in Leo reel in Spellcast...');
  try {
    const reelResult = await createSpellcastPost({
      content: `Chiron in Leo is the wound of "I'm only worthy when I'm seen."\n\nYou perform to earn love. You shine for an audience, then feel hollow when the crowd goes quiet.\n\nThis placement asks the hardest question: can you be authentically yourself without an audience confirming it?\n\nThe healing is learning to witness yourself.\n\nCheck your chart — link in bio.\n\n#chironinleo #chiron #birthchart #astrology #selfworth`,
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-09-chiron-in-leo--being-seen-authentically-without-performing-1772983472307.mp4',
      ],
      scheduledFor: '2026-03-09T22:00:00.000Z',
      instagramOptions: { type: 'reel' },
    });
    console.log(
      '✅ Reel created:',
      JSON.stringify(reelResult).substring(0, 200),
    );
  } catch (err) {
    console.error('❌ Reel post failed:', err);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
