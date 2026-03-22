/**
 * Verify whether a piece of text contains a Lunar Computing, Inc watermark.
 * If it's a per-buyer canary trap, reveals the buyer's email and purchase date.
 *
 * Usage:
 *   npx tsx scripts/verify-watermark.ts "paste suspected text here"
 *   npx tsx scripts/verify-watermark.ts < file.txt
 *   echo "some text" | npx tsx scripts/verify-watermark.ts
 *
 * Exit codes:
 *   0 — Lunar Computing, Inc watermark confirmed
 *   1 — no watermark found or not a Lunar Computing watermark
 */

import { decodeWatermark, parseWatermark } from '../src/utils/steganography';

async function main() {
  let input: string;

  if (process.argv[2]) {
    input = process.argv[2];
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    input = Buffer.concat(chunks).toString('utf8');
  }

  const decoded = decodeWatermark(input);

  if (!decoded) {
    console.log('❌  No watermark found.');
    process.exit(1);
  }

  const info = parseWatermark(decoded);

  if (!info) {
    console.log(
      '⚠️   Watermark found but not a Lunar Computing, Inc watermark.',
    );
    console.log(`    Raw: ${decoded}`);
    process.exit(1);
  }

  console.log('');
  console.log('✅  Lunar Computing, Inc watermark confirmed.');
  console.log('');
  console.log(`    Owner:      ${info.owner}`);
  console.log(`    Template:   ${info.templateId ?? 'unknown'}`);
  console.log(`    Year:       ${info.year ?? 'unknown'}`);

  if (info.isPerBuyer) {
    console.log('');
    console.log('🎯  Canary trap — buyer identified:');
    console.log(`    Email:      ${info.buyerEmail}`);
    console.log(`    Purchased:  ${info.purchaseDate}`);
  } else {
    console.log('');
    console.log('    (Generic watermark — no buyer info encoded.)');
  }

  console.log('');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
