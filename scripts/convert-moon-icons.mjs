import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const icons = [
  { src: 'new-moon.svg', dest: 'ic_moon_new' },
  { src: 'waxing-cresent-moon.svg', dest: 'ic_moon_waxing_crescent' },
  { src: 'first-quarter.svg', dest: 'ic_moon_first_quarter' },
  { src: 'waxing-gibbous-moon.svg', dest: 'ic_moon_waxing_gibbous' },
  { src: 'full-moon.svg', dest: 'ic_moon_full' },
  { src: 'waning-gibbous-moon.svg', dest: 'ic_moon_waning_gibbous' },
  { src: 'last-quarter.svg', dest: 'ic_moon_last_quarter' },
  { src: 'waning-cresent-moon.svg', dest: 'ic_moon_waning_crescent' },
];

const densities = [
  { folder: 'drawable-mdpi', size: 48 },
  { folder: 'drawable-hdpi', size: 72 },
  { folder: 'drawable-xhdpi', size: 96 },
  { folder: 'drawable-xxhdpi', size: 144 },
  { folder: 'drawable-xxxhdpi', size: 192 },
];

const srcDir = join(rootDir, 'public/icons/moon-phases');
const androidResDir = join(rootDir, 'android/app/src/main/res');

for (const density of densities) {
  const destDir = join(androidResDir, density.folder);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  for (const icon of icons) {
    const svgPath = join(srcDir, icon.src);
    const pngPath = join(destDir, `${icon.dest}.png`);

    try {
      const svg = readFileSync(svgPath, 'utf8');
      const resvg = new Resvg(svg, {
        fitTo: {
          mode: 'width',
          value: density.size,
        },
      });
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      writeFileSync(pngPath, pngBuffer);
      console.log(`✓ ${icon.dest}.png (${density.folder})`);
    } catch (err) {
      console.error(`✗ ${icon.src}: ${err.message}`);
    }
  }
}

console.log('\nDone! PNG icons generated for Android.');
