import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Inline the pure JS parser for testing
function getMP3DurationFromBuffer(buffer: Buffer): number {
  const bitrateTable: Record<string, number[]> = {
    '3-3': [
      0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448,
    ],
    '3-2': [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
    '3-1': [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    '2-3': [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
    '2-1': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  };
  bitrateTable['2-2'] = bitrateTable['2-1'];
  bitrateTable['0-3'] = bitrateTable['2-3'];
  bitrateTable['0-1'] = bitrateTable['2-1'];
  bitrateTable['0-2'] = bitrateTable['2-1'];

  let offset = 0;
  if (
    buffer.length > 10 &&
    buffer[0] === 0x49 &&
    buffer[1] === 0x44 &&
    buffer[2] === 0x33
  ) {
    const tagSize =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f);
    offset = 10 + tagSize;
  }

  while (offset < buffer.length - 4) {
    if (buffer[offset] === 0xff && (buffer[offset + 1] & 0xe0) === 0xe0) {
      const header = buffer.readUInt32BE(offset);
      const version = (header >> 19) & 0x03;
      const layer = (header >> 17) & 0x03;
      const bitrateIdx = (header >> 12) & 0x0f;
      const sampleRateIdx = (header >> 10) & 0x03;
      if (
        version === 1 ||
        layer === 0 ||
        bitrateIdx === 0 ||
        bitrateIdx === 15 ||
        sampleRateIdx === 3
      ) {
        offset++;
        continue;
      }
      const vKey = version === 3 ? 3 : 2;
      const key = `${vKey}-${layer}`;
      const bitrates = bitrateTable[key];
      if (!bitrates) {
        offset++;
        continue;
      }
      const bitrate = bitrates[bitrateIdx];
      if (!bitrate) {
        offset++;
        continue;
      }
      const audioBytes = buffer.length - offset;
      return audioBytes / (bitrate * 125);
    }
    offset++;
  }
  return 0;
}

async function main() {
  // Test with one of the cached audio files from today's render
  const cacheKey = 'audio/shorts/tara-tts-1-hd-s100';

  // Use Vercel Blob to find a cached audio file
  const testUrls = [
    'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/temp/audio-1774009424972-pJqKpWPUfwNUc2ij4VfcOb1Mh5jvJD.mp3',
  ];

  // Also test with the background music
  const bgMusic = await fetch(
    'https://lunary.app/audio/series/lunary-bed-v1.mp3',
  );
  const bgBuffer = Buffer.from(await bgMusic.arrayBuffer());
  const bgDuration = getMP3DurationFromBuffer(bgBuffer);
  console.log(
    `Background music: JS=${bgDuration.toFixed(1)}s (${(bgBuffer.length / 1024 / 1024).toFixed(1)}MB)`,
  );

  // Test with a TTS audio file if available
  for (const url of testUrls) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        const buffer = Buffer.from(await resp.arrayBuffer());
        const jsDuration = getMP3DurationFromBuffer(buffer);
        console.log(
          `TTS audio: JS=${jsDuration.toFixed(1)}s (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`,
        );
      }
    } catch (e) {
      console.log(`Failed to fetch: ${url}`);
    }
  }
}

main().catch(console.error);
