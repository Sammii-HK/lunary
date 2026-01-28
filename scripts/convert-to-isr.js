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
    const lines = content.split('\n');
    let insertIndex = 0;
    let lastImportLine = -1;
    let braceDepth = 0;
    let inImport = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Start tracking import
      if (trimmed.startsWith('import ')) {
        inImport = true;
      }

      // Track braces in imports for destructuring
      if (inImport) {
        for (const char of line) {
          if (char === '{') braceDepth++;
          if (char === '}') braceDepth--;
        }

        // Import ends when we have a semicolon and all braces are closed
        if (line.includes(';') && braceDepth === 0) {
          inImport = false;
          lastImportLine = i;
        }
      }
    }

    // If we found imports, insert after the last one
    // Otherwise insert at the beginning
    if (lastImportLine >= 0) {
      insertIndex = lastImportLine + 1;

      // Skip any empty lines or comments immediately after last import
      for (let i = insertIndex; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed === '' || trimmed.startsWith('//')) {
          insertIndex = i + 1;
        } else {
          break;
        }
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

        if (depth === 0 && start !== -1 && content[i] === '}') {
          end = i + 1;
          // Skip any trailing whitespace or newlines after the closing brace
          while (end < content.length && /[\s\n]/.test(content[end])) {
            end++;
          }
          break;
        }
      }
    }

    if (start !== -1 && end !== -1) {
      content =
        content.substring(0, start) +
        '// Removed generateStaticParams - using pure ISR for faster builds\n// Pages are generated on-demand and cached with 30-day revalidation\n\n' +
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
