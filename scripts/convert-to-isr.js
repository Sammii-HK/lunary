#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const REVALIDATE_30_DAYS = 2592000;

function updatePageToISR(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if already has revalidate
  const hasRevalidate = /export\s+const\s+revalidate\s*=/.test(content);

  // Check if has generateStaticParams
  const hasGenerateStaticParams =
    /export\s+async\s+function\s+generateStaticParams/.test(content);

  if (!hasGenerateStaticParams && hasRevalidate) {
    console.log(`✓ ${filePath} - already converted`);
    return false;
  }

  // Add revalidate after imports if not present
  if (!hasRevalidate) {
    // Find the end of all imports by tracking open braces
    const lines = content.split('\n');
    let insertIndex = 0;
    let inImport = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Track if we're inside a multi-line import
      if (line.startsWith('import ')) {
        inImport = true;
      }

      // Check if import statement ends
      if (
        inImport &&
        (line.includes(';') || line.endsWith("';") || line.endsWith('";'))
      ) {
        inImport = false;
        insertIndex = i + 1;
      } else if (
        (!inImport && line.startsWith('//')) ||
        line === '' ||
        line.startsWith('/*') ||
        line.startsWith('*')
      ) {
        insertIndex = i + 1;
      } else if (
        !inImport &&
        line &&
        !line.startsWith('export const revalidate') &&
        !line.startsWith('import')
      ) {
        break;
      }
    }

    lines.splice(
      insertIndex,
      0,
      '',
      `// 30-day ISR revalidation`,
      `export const revalidate = ${REVALIDATE_30_DAYS};`,
    );
    content = lines.join('\n');
    modified = true;
  }

  // Remove generateStaticParams function
  if (hasGenerateStaticParams) {
    // Match the entire generateStaticParams function - handle nested braces
    let depth = 0;
    let start = -1;
    let end = -1;

    for (let i = 0; i < content.length; i++) {
      if (
        start === -1 &&
        content
          .substring(i)
          .startsWith('export async function generateStaticParams')
      ) {
        start = i;
      }

      if (start !== -1) {
        if (content[i] === '{') depth++;
        if (content[i] === '}') depth--;

        if (depth === 0 && start !== -1) {
          end = i + 1;
          break;
        }
      }
    }

    if (start !== -1 && end !== -1) {
      content =
        content.substring(0, start) +
        '// Removed generateStaticParams - using pure ISR for faster builds\n// Pages are generated on-demand and cached with 30-day revalidation' +
        content.substring(end);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${filePath} - converted to ISR`);
    return true;
  }

  return false;
}

// Get all page.tsx files in grimoire
function findGrimoirePages(dir, pages = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findGrimoirePages(filePath, pages);
    } else if (
      file === 'page.tsx' &&
      filePath.includes('/grimoire/') &&
      !filePath.includes('/horoscopes/')
    ) {
      pages.push(filePath);
    }
  }

  return pages;
}

const grimoireDir = path.join(__dirname, '..', 'src', 'app', 'grimoire');
const pages = findGrimoirePages(grimoireDir);

let convertedCount = 0;
for (const page of pages) {
  if (updatePageToISR(page)) {
    convertedCount++;
  }
}

console.log(`\n✓ Converted ${convertedCount} pages to ISR`);
