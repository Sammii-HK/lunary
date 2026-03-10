/**
 * Pre-uploads and schedules the 3 remaining static Instagram posts:
 * - ID 8884: Pisces meme (Tue 2026-03-10 12:00 UTC)
 * - ID 8886: one_word love language (Thu 2026-03-12 12:00 UTC)
 * - ID 8887: Scorpio/Taurus compatibility (Fri 2026-03-13 12:00 UTC)
 */
import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_URL = (process.env.SPELLCAST_API_URL || '').replace(/\s/g, '');
const API_KEY = (process.env.SPELLCAST_API_KEY || '').replace(/\s/g, '');
const ACCOUNT_SET_ID = process.env.SPELLCAST_LUNARY_ACCOUNT_SET_ID as string;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN as string;
const IG_ACCOUNT_ID = '7a229f88-3160-4adc-9b00-2e9dc4c5e76f';

async function preUpload(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(60000) });
  if (!res.ok)
    throw new Error(`HTTP ${res.status} for ${imageUrl.substring(0, 80)}`);
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || 'image/png';
  const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
  const hash = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const blob = await put(`social-images/${hash}.${ext}`, buffer, {
    access: 'public',
    contentType,
    token: BLOB_TOKEN,
  });
  return blob.url;
}

async function spellcastPost(payload: {
  content: string;
  mediaUrls: string[];
  scheduledFor: string;
}) {
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
      postType: 'post',
      selectedAccountIds: [IG_ACCOUNT_ID],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Create failed (${createRes.status}): ${err}`);
  }

  const draft = (await createRes.json()) as any;
  console.log(`  Draft created: ${draft.id}`);

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

  return await schedRes.json();
}

const posts = [
  {
    label: 'Pisces meme (ID 8884)',
    imageUrl:
      'https://www.lunary.app/api/og/instagram/meme?sign=pisces&setup=Everyone+thinks+Pisces+is+being+dramatic+but+honestly+they%27re+one+song+away+from+a+full+emotional+breakdown&punchline=&template=hot_take&category=cosmic_truth&v=4&t=1772982884710',
    scheduledFor: '2026-03-10T12:00:00.000Z',
    content: `Pisceans, explain yourselves\n\nDouble tap if this is you.\nTag someone who needs to see this.\nSave this for your Pisces collection.\n\nFollow @lunary.app for daily zodiac content\n\n#zodiacfacts #astrologymemes #pisces #piscesseason #piscesmeme`,
  },
  {
    label: 'Love language in one word (ID 8886)',
    imageUrl:
      'https://www.lunary.app/api/og/instagram/carousel?title=Your+sign%27s+love+language+in+one+word&slideIndex=0&totalSlides=14&content=Which+word+is+yours%3F+Swipe+%E2%86%92&category=zodiac&variant=cover&v=4&t=1772982885388',
    scheduledFor: '2026-03-12T12:00:00.000Z',
    content: `The love language of every zodiac sign in one word. Save this.\n\nSwipe through all 12 signs.\nComment your sign and word below.\n\nFollow for daily zodiac content\n\n#zodiacsigns #zodiacenergy #astrologyfacts #lovelanguage #astrology`,
  },
  {
    label: 'Scorpio x Taurus compatibility (ID 8887)',
    imageUrl:
      'https://www.lunary.app/api/og/instagram/compatibility?sign1=scorpio&sign2=taurus&score=85&element1=Water&element2=Earth&headline=Cosmic+soulmates&v=4&t=1772982885625',
    scheduledFor: '2026-03-13T12:00:00.000Z',
    content: `If you're a Scorpio dating a Taurus, you already know\n\nSave this and send it to them.\nTag your person and see if they agree.\nDrop your signs in the comments.\n\nFull compatibility reading free at lunary.app\n\n#scorpio #taurus #zodiaccompatibility #astrology #cosmicsoulmates`,
  },
];

async function main() {
  console.log(`API: ${API_URL}`);
  console.log(`Account set: ${ACCOUNT_SET_ID}`);
  console.log(`IG account: ${IG_ACCOUNT_ID}\n`);

  for (const post of posts) {
    console.log(`\n📸 Processing: ${post.label}`);
    try {
      console.log('  Uploading image to blob...');
      const blobUrl = await preUpload(post.imageUrl);
      console.log(`  Blob URL: ${blobUrl}`);

      const result = await spellcastPost({
        content: post.content,
        mediaUrls: [blobUrl],
        scheduledFor: post.scheduledFor,
      });
      console.log(
        `  ✅ Scheduled: ${JSON.stringify(result).substring(0, 150)}`,
      );
    } catch (err) {
      console.error(`  ❌ Failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
