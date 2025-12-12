#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need BreadcrumbSchema added
const files = [
  'src/app/grimoire/compatibility/[match]/page.tsx',
  'src/app/grimoire/compatibility/page.tsx',
  'src/app/grimoire/placements/[placement]/page.tsx',
  'src/app/grimoire/placements/page.tsx',
  'src/app/grimoire/numerology/planetary-days/page.tsx',
  'src/app/grimoire/numerology/year/page.tsx',
  'src/app/grimoire/a-z/page.tsx',
  'src/app/grimoire/meditation/grounding/page.tsx',
  'src/app/grimoire/meditation/page.tsx',
  'src/app/grimoire/meditation/techniques/page.tsx',
  'src/app/grimoire/decans/page.tsx',
  'src/app/grimoire/decans/[sign]/page.tsx',
  'src/app/grimoire/synastry/generate/page.tsx',
  'src/app/grimoire/astronomy/retrogrades/page.tsx',
  'src/app/grimoire/[section]/page.tsx',
  'src/app/grimoire/astronomy-vs-astrology/page.tsx',
  'src/app/grimoire/chinese-zodiac/page.tsx',
  'src/app/grimoire/modern-witchcraft/tools/page.tsx',
  'src/app/grimoire/modern-witchcraft/witch-types/page.tsx',
  'src/app/grimoire/modern-witchcraft/tools-guide/page.tsx',
  'src/app/grimoire/modern-witchcraft/famous-witches/page.tsx',
  'src/app/grimoire/birth-chart/houses/page.tsx',
  'src/app/grimoire/houses/[planet]/page.tsx',
  'src/app/grimoire/houses/overview/page.tsx',
  'src/app/grimoire/houses/page.tsx',
  'src/app/grimoire/moon/2026/page.tsx',
  'src/app/grimoire/candle-magic/colors/page.tsx',
  'src/app/grimoire/birthday/page.tsx',
  'src/app/grimoire/transits/page.tsx',
  'src/app/grimoire/search/page.tsx',
  'src/app/grimoire/guides/crystal-healing-guide/page.tsx',
  'src/app/grimoire/guides/moon-phases-guide/page.tsx',
  'src/app/grimoire/guides/tarot-complete-guide/page.tsx',
  'src/app/grimoire/lunar-nodes/page.tsx',
  'src/app/grimoire/tarot/suits/page.tsx',
  'src/app/grimoire/seasons/[year]/page.tsx',
  'src/app/grimoire/seasons/page.tsx',
  'src/app/grimoire/cusps/page.tsx',
  'src/app/grimoire/glossary/page.tsx',
  'src/app/grimoire/events/2025/page.tsx',
  'src/app/grimoire/events/2026/page.tsx',
  'src/app/grimoire/page.tsx',
  'src/app/grimoire/aspects/types/page.tsx',
  'src/app/grimoire/aspects/[planet1]/page.tsx',
  'src/app/grimoire/aspects/[planet1]/[aspect]/page.tsx',
  'src/app/grimoire/aspects/page.tsx',
  'src/app/grimoire/horoscopes/page.tsx',
  'src/app/grimoire/horoscopes/[sign]/[year]/page.tsx',
  'src/app/grimoire/horoscopes/[sign]/page.tsx',
];

function getBreadcrumbsFromPath(filePath) {
  // Extract route from file path
  const route = filePath
    .replace('src/app/grimoire/', '')
    .replace('/page.tsx', '')
    .replace('[section]', '')
    .replace('[match]', '')
    .replace('[placement]', '')
    .replace('[sign]', '')
    .replace('[planet]', '')
    .replace('[year]', '')
    .replace('[aspect]', '')
    .replace('[planet1]', '');

  const segments = route.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Grimoire', url: '/grimoire' }];

  let currentPath = '/grimoire';
  for (const segment of segments) {
    if (segment.startsWith('[')) continue; // Skip dynamic segments
    currentPath += '/' + segment;
    const name = segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    breadcrumbs.push({ name, url: currentPath });
  }

  return breadcrumbs;
}

function addBreadcrumbSchema(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip if already has createBreadcrumbSchema
  if (content.includes('createBreadcrumbSchema')) {
    console.log(`⏭️  Already has breadcrumb: ${filePath}`);
    return false;
  }

  // Check if it imports from @/lib/schema
  if (!content.includes("from '@/lib/schema'")) {
    console.log(`⚠️  No schema import: ${filePath}`);
    return false;
  }

  // Add createBreadcrumbSchema to imports
  const importPatterns = [
    /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/lib\/schema['"]/,
  ];

  let modified = false;

  for (const pattern of importPatterns) {
    const match = content.match(pattern);
    if (match) {
      const imports = match[1];
      if (!imports.includes('createBreadcrumbSchema')) {
        const newImports = imports.trimEnd() + ',\n  createBreadcrumbSchema';
        content = content.replace(
          match[0],
          `import {\n  ${newImports},\n} from '@/lib/schema'`,
        );
        modified = true;
        break;
      }
    }
  }

  if (!modified) {
    console.log(`⚠️  Could not modify imports: ${filePath}`);
    return false;
  }

  // Find where to add the renderJsonLd call
  // Look for existing renderJsonLd calls
  const renderMatch = content.match(/\{renderJsonLd\([^)]+\)\}/);
  if (renderMatch) {
    const breadcrumbs = getBreadcrumbsFromPath(filePath);
    const breadcrumbItems = breadcrumbs
      .map((b) => `          { name: '${b.name}', url: '${b.url}' }`)
      .join(',\n');

    const schemaRender = `{renderJsonLd(
        createBreadcrumbSchema([
${breadcrumbItems},
        ])
      )}`;

    // Add after the first renderJsonLd
    content = content.replace(
      renderMatch[0],
      renderMatch[0] + '\n      ' + schemaRender,
    );

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  console.log(`⚠️  No renderJsonLd found: ${filePath}`);
  return false;
}

console.log('Adding BreadcrumbSchema to grimoire pages...\n');

let updated = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const result = addBreadcrumbSchema(file);
  if (result) updated++;
  else skipped++;
}

console.log(`\n✅ Updated: ${updated}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Failed: ${failed}`);
