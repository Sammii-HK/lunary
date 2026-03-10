/**
 * Pre-uploads carousel slides from local machine (avoids Vercel self-ref timeout).
 * Prints blob URLs to use in Spellcast.
 */
import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

async function preUpload(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${imageUrl}`);
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

const slides = [
  'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=0&totalSlides=6&content=Cold%3F+No.+Playing+chess+while+you+play+checkers.&category=zodiac&variant=cover&v=4&t=1772982883388&symbol=J',
  'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=1&totalSlides=6&content=Element%3A+Earth%0ARuler%3A+Saturn%0AModality%3A+Cardinal&category=zodiac&variant=body&v=4&t=1772982883388&subtitle=Element+%26+Ruler&symbol=J&nextSubtitle=Strengths',
  'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=2&totalSlides=6&content=Responsible%2C+Disciplined%2C+Self-control%2C+Good+managers%2C+Ambitious%2C+Patient&category=zodiac&variant=body&v=4&t=1772982883388&subtitle=Strengths&symbol=J&nextSubtitle=Personality',
  'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=3&totalSlides=6&content=Capricorn+is+the+achiever+of+the+zodiac%2C+bringing+discipline%2C+ambition%2C+and+the+determination+to+reach+the+top.&category=zodiac&variant=body&v=4&t=1772982883388&subtitle=Personality&symbol=J&nextSubtitle=Love+%26+Career',
  'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=4&totalSlides=6&content=Love%3A+loyal+and+long-term.+Career%3A+Capricorn+excels+in+management%2C+finance%2C+and+any+field+requiring+discipline.&category=zodiac&variant=body&v=4&t=1772982883388&subtitle=Love+%26+Career&symbol=J',
  'https://www.lunary.app/api/og/instagram/carousel?title=Capricorn&slideIndex=5&totalSlides=6&content=Get+your+free+birth+chart+reading&category=zodiac&variant=cta&v=4&t=1772982883388',
];

async function main() {
  const blobUrls: string[] = [];
  for (let i = 0; i < slides.length; i++) {
    process.stdout.write(`Uploading slide ${i + 1}/${slides.length}... `);
    try {
      const url = await preUpload(slides[i]);
      blobUrls.push(url);
      console.log('✅');
    } catch (err) {
      console.error('❌', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  }
  console.log('\nBlob URLs:');
  blobUrls.forEach((u, i) => console.log(`  [${i}] ${u}`));
  console.log('\nJSON array:');
  console.log(JSON.stringify(blobUrls, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
