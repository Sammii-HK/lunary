#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that still need BreadcrumbSchema (no schema imports)
const files = [
  'src/app/grimoire/numerology/planetary-days/page.tsx',
  'src/app/grimoire/numerology/year/page.tsx',
  'src/app/grimoire/meditation/grounding/page.tsx',
  'src/app/grimoire/meditation/techniques/page.tsx',
  'src/app/grimoire/decans/[sign]/page.tsx',
  'src/app/grimoire/synastry/generate/page.tsx',
  'src/app/grimoire/[section]/page.tsx',
  'src/app/grimoire/modern-witchcraft/tools/page.tsx',
  'src/app/grimoire/modern-witchcraft/witch-types/page.tsx',
  'src/app/grimoire/modern-witchcraft/famous-witches/page.tsx',
  'src/app/grimoire/birth-chart/houses/page.tsx',
  'src/app/grimoire/houses/[planet]/page.tsx',
  'src/app/grimoire/houses/overview/page.tsx',
  'src/app/grimoire/moon/2026/page.tsx',
  'src/app/grimoire/candle-magic/colors/page.tsx',
  'src/app/grimoire/search/page.tsx',
  'src/app/grimoire/tarot/suits/page.tsx',
  'src/app/grimoire/seasons/[year]/page.tsx',
  'src/app/grimoire/events/2026/page.tsx',
  'src/app/grimoire/aspects/types/page.tsx',
  'src/app/grimoire/aspects/[planet1]/page.tsx',
  'src/app/grimoire/aspects/[planet1]/[aspect]/page.tsx',
  'src/app/grimoire/horoscopes/[sign]/[year]/page.tsx',
  'src/app/grimoire/horoscopes/[sign]/page.tsx',
];

function getBreadcrumbsFromPath(filePath) {
  const route = filePath
    .replace('src/app/grimoire/', '')
    .replace('/page.tsx', '')
    .replace(/\[[^\]]+\]/g, ''); // Remove all dynamic segments

  const segments = route.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Grimoire', url: '/grimoire' }];

  let currentPath = '/grimoire';
  for (const segment of segments) {
    currentPath += '/' + segment;
    const name = segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    breadcrumbs.push({ name, url: currentPath });
  }

  return breadcrumbs;
}

function addSchemaToFile(filePath) {
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

  const breadcrumbs = getBreadcrumbsFromPath(filePath);
  const breadcrumbItems = breadcrumbs
    .map((b) => `      { name: '${b.name}', url: '${b.url}' }`)
    .join(',\n');

  // Add import if not present
  if (!content.includes("from '@/lib/schema'")) {
    // Find the last import line
    const importMatch = content.match(/^import .+ from ['"][^'"]+['"];?\s*$/gm);
    if (importMatch && importMatch.length > 0) {
      const lastImport = importMatch[importMatch.length - 1];
      const schemaImport = `\nimport { createBreadcrumbSchema, renderJsonLd } from '@/lib/schema';`;
      content = content.replace(lastImport, lastImport + schemaImport);
    } else {
      console.log(`⚠️  No imports found: ${filePath}`);
      return false;
    }
  } else {
    // Already has schema import, add createBreadcrumbSchema
    content = content.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/lib\/schema['"]/,
      (match, imports) => {
        if (imports.includes('createBreadcrumbSchema')) return match;
        return `import {\n  ${imports.trim()},\n  createBreadcrumbSchema,\n} from '@/lib/schema'`;
      },
    );
  }

  // Find the return statement and add schema render
  const returnMatch = content.match(
    /return\s*\(\s*\n?\s*<(?:div|article|main|section)/,
  );
  if (returnMatch) {
    const schemaRender = `const breadcrumbSchema = createBreadcrumbSchema([
${breadcrumbItems},
    ]);

  `;

    // Insert before the return
    content = content.replace(returnMatch[0], schemaRender + returnMatch[0]);

    // Add renderJsonLd after the opening tag
    content = content.replace(
      /return\s*\(\s*\n?\s*<(div|article|main|section)([^>]*)>/,
      (match, tag, attrs) => {
        return `${match}\n      {renderJsonLd(breadcrumbSchema)}`;
      },
    );

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  console.log(`⚠️  Could not find return statement: ${filePath}`);
  return false;
}

console.log('Adding BreadcrumbSchema to pages without schema imports...\n');

let updated = 0;
let skipped = 0;

for (const file of files) {
  const result = addSchemaToFile(file);
  if (result) updated++;
  else skipped++;
}

console.log(`\n✅ Updated: ${updated}`);
console.log(`⏭️  Skipped: ${skipped}`);
