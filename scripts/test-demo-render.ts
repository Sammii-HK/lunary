import { TIKTOK_SCRIPTS } from '../src/lib/video/tiktok-scripts';

const scriptId = process.argv[2] || 'snippet-angel-number';
const script = Object.values(TIKTOK_SCRIPTS).find((s) => s.id === scriptId);

if (!script) {
  console.error(`Script ${scriptId} not found`);
  console.error(
    'Available:',
    Object.values(TIKTOK_SCRIPTS)
      .map((s) => s.id)
      .join(', '),
  );
  process.exit(1);
}

console.log(`\n=== Script: ${script.id} ===`);
console.log(`Hook: "${script.hook.text}"`);
console.log(`Total seconds: ${script.totalSeconds}`);
console.log(`Scenes: ${script.scenes.length}`);
console.log(
  `Voiceover (${script.voiceover.split(' ').length} words): "${script.voiceover}"`,
);
console.log(`\nScene breakdown:`);
let t = script.hook.durationSeconds;
for (const scene of script.scenes) {
  const words = scene.voiceoverLine?.split(' ').length || 0;
  const wps = words / scene.durationSeconds;
  console.log(
    `  [${t.toFixed(1)}s-${(t + scene.durationSeconds).toFixed(1)}s] ${scene.action} | ${words} words (${wps.toFixed(1)} wps): "${scene.voiceoverLine || '(silent)'}"`,
  );
  t += scene.durationSeconds;
}
console.log(
  `  [${t.toFixed(1)}s-${(t + script.outro.durationSeconds).toFixed(1)}s] outro: "${script.outro.text}"`,
);

async function main() {
  console.log('\n--- Generating voiceover with Orpheus/Jess ---');
  const { generateDemoVoiceover } =
    await import('../src/lib/video/demo-voiceover');
  const voiceover = await generateDemoVoiceover(script);
  console.log(`\nAudio duration: ${voiceover.audioDuration.toFixed(2)}s`);
  console.log(`Audio URL: ${voiceover.audioUrl}`);
  console.log(`Whisper words: ${voiceover.whisperWords?.length || 0}`);
  console.log(`Segments: ${voiceover.segments.length}`);
  for (const seg of voiceover.segments) {
    const start = (seg as any).startSeconds ?? (seg as any).startTime ?? 0;
    const end = (seg as any).endSeconds ?? (seg as any).endTime ?? 0;
    console.log(
      `  [${start.toFixed(2)}s-${end.toFixed(2)}s] "${seg.text.substring(0, 80)}"`,
    );
  }

  // Check timing fit
  const scriptDuration =
    script.totalSeconds -
    script.hook.durationSeconds -
    script.outro.durationSeconds;
  if (voiceover.audioDuration > scriptDuration) {
    console.log(
      `\n⚠️  Audio (${voiceover.audioDuration.toFixed(1)}s) exceeds scene time (${scriptDuration.toFixed(1)}s) by ${(voiceover.audioDuration - scriptDuration).toFixed(1)}s`,
    );
  } else {
    console.log(
      `\n✅ Audio fits: ${voiceover.audioDuration.toFixed(1)}s audio in ${scriptDuration.toFixed(1)}s scene time (${(scriptDuration - voiceover.audioDuration).toFixed(1)}s spare)`,
    );
  }
}

main().catch((err) => {
  console.error('Failed:', err.message || err);
  process.exit(1);
});
