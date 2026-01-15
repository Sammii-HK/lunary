import { promises as fs } from 'fs';
import path from 'path';
import { deriveCosmicConnectionsParams } from '../src/lib/deriveCosmicConnectionsParams';

const GRIMOIRE_ROOT = path.join(process.cwd(), 'src/app/grimoire');
const OUTPUT_PATH = path.join(process.cwd(), 'grimoire-seo-audit.json');
const MIN_WORD_COUNT = 800;
const SEO_COPY_ROOT = path.join(process.cwd(), 'src/lib/grimoire/seoCopy');
const SEO_TEMPLATE_PATH = path.join(
  process.cwd(),
  'src/components/grimoire/SEOContentTemplate.tsx',
);

interface PageStats {
  path: string;
  hasTemplate: boolean;
  hasMetadata: boolean;
  hasIntro: boolean;
  hasMeaningOrTldr: boolean;
  hasTOC: boolean;
  hasInternalLinks: boolean;
  hasRelatedItems: boolean;
  hasFAQs: boolean;
  hasCosmicProp: boolean;
  hasCTA: boolean;
  manualBreadcrumb: boolean;
  rawWordCount: number;
  wordCount: number;
  issues: string[];
  warnings: string[];
}

async function collectPageFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectPageFiles(fullPath)));
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      files.push(fullPath);
    }
  }

  return files;
}

function resolveLocalImport(
  fromFilePath: string,
  specifier: string,
): string | null {
  // Only follow workspace-local imports. Ignore packages.
  let target: string | null = null;

  if (specifier.startsWith('@/')) {
    target = path.join(process.cwd(), 'src', specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    target = path.resolve(path.dirname(fromFilePath), specifier);
  } else {
    return null;
  }

  const candidates = [
    target,
    `${target}.ts`,
    `${target}.tsx`,
    path.join(target, 'index.ts'),
    path.join(target, 'index.tsx'),
  ];

  return (
    candidates.find((p) => {
      try {
        // eslint-disable-next-line no-sync
        require('fs').accessSync(p);
        return true;
      } catch {
        return false;
      }
    }) ?? null
  );
}

function collectImportSpecifiers(content: string): string[] {
  const out: string[] = [];
  const importRegex = /import\s+(?:type\s+)?[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null = null;
  while ((match = importRegex.exec(content))) out.push(match[1]);
  return out;
}

function isSeoCopyFile(filePath: string): boolean {
  return filePath.startsWith(SEO_COPY_ROOT + path.sep);
}

function extractStringLiterals(content: string): string[] {
  const out: string[] = [];

  const backtickRegex = /`([\s\S]*?)`/g;
  let match: RegExpExecArray | null = null;
  while ((match = backtickRegex.exec(content))) {
    out.push(match[1].replace(/\$\{[^}]+\}/g, ' '));
  }

  const singleRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  while ((match = singleRegex.exec(content))) {
    out.push(match[1]);
  }

  const doubleRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
  while ((match = doubleRegex.exec(content))) {
    out.push(match[1]);
  }

  return out;
}

function extractJsxTextNodes(content: string): string {
  return content
    .replace(/`[\s\S]*?`/g, ' ')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
    .replace(/\{[\s\S]*?\}/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function approximateWordCount(content: string): number {
  const literals = extractStringLiterals(content);
  const jsxText = extractJsxTextNodes(content);
  const combined = `${literals.join(' ')} ${jsxText}`;
  return countWordsForAudit(combined);
}

function countWordsForAudit(text: string): number {
  const words = text.match(/\b[A-Za-z0-9']{3,}\b/g) || [];
  return words.length;
}

function extractTemplateLiteral(
  content: string,
  anchor: string,
): string | null {
  const anchorIndex = content.indexOf(anchor);
  if (anchorIndex === -1) return null;
  const slice = content.slice(anchorIndex);
  const match = slice.match(/return\s+`([\s\S]*?)`;/);
  return match?.[1] ?? null;
}

function extractBlock(content: string, anchor: string): string | null {
  const anchorIndex = content.indexOf(anchor);
  if (anchorIndex === -1) return null;
  const slice = content.slice(anchorIndex);
  const endIndex = slice.indexOf('};');
  if (endIndex === -1) return null;
  return slice.slice(0, endIndex + 2);
}

function extractTemplateLiteralsFromBlock(block: string): string[] {
  const out: string[] = [];
  const regex = /`([\s\S]*?)`/g;
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(block))) {
    out.push(match[1]);
  }
  return out;
}

function normalizeTemplateLiteral(text: string): string {
  return text.replace(/\$\{[^}]+\}/g, 'placeholder');
}

function extractFaqBlock(content: string): string[] {
  const start = content.indexOf('const resolvedFaqs');
  const end = content.indexOf('const faqSchema');
  if (start === -1 || end === -1 || end <= start) return [];
  const block = content.slice(start, end);
  const items: string[] = [];
  const questionRegex = /question:\s*`([\s\S]*?)`/g;
  const answerRegex = /answer:\s*`([\s\S]*?)`/g;
  let match: RegExpExecArray | null = null;

  while ((match = questionRegex.exec(block))) {
    items.push(match[1]);
  }
  while ((match = answerRegex.exec(block))) {
    items.push(match[1]);
  }

  return items;
}

type TemplateDefaults = {
  meaningWordCount: number;
  depthBoostWordCount: number;
  faqWordCount: number;
};

async function loadTemplateDefaults(): Promise<TemplateDefaults> {
  let meaningWordCount = 0;
  let depthBoostWordCount = 0;
  let faqWordCount = 0;

  try {
    const content = await fs.readFile(SEO_TEMPLATE_PATH, 'utf8');
    const meaningLiteral = extractTemplateLiteral(
      content,
      'const resolvedMeaning',
    );
    if (meaningLiteral) {
      meaningWordCount = countWordsForAudit(
        normalizeTemplateLiteral(meaningLiteral),
      );
    }

    const depthBlock = extractBlock(content, 'DEPTH_BOOST_VARIANTS');
    if (depthBlock) {
      const depthTemplates = extractTemplateLiteralsFromBlock(depthBlock);
      const counts = depthTemplates.map((template) =>
        countWordsForAudit(normalizeTemplateLiteral(template)),
      );
      if (counts.length > 0) depthBoostWordCount = Math.min(...counts);
    }

    const faqBlock = extractBlock(content, 'DEFAULT_FAQ_VARIANTS');
    if (faqBlock) {
      const faqTemplates = extractTemplateLiteralsFromBlock(faqBlock);
      const variantSize = 8; // 4 FAQs x 2 strings (question + answer)
      let minCount = Infinity;
      for (
        let i = 0;
        i + variantSize <= faqTemplates.length;
        i += variantSize
      ) {
        const chunk = faqTemplates.slice(i, i + variantSize).join(' ');
        const count = countWordsForAudit(normalizeTemplateLiteral(chunk));
        if (count < minCount) minCount = count;
      }
      if (Number.isFinite(minCount)) faqWordCount = minCount;
    }
  } catch {
    // If we can't read the template, keep defaults at 0.
  }

  return {
    meaningWordCount,
    depthBoostWordCount,
    faqWordCount,
  };
}

async function approximateWordCountWithImports(
  entryFilePath: string,
): Promise<number> {
  const visited = new Set<string>();
  const stack = [entryFilePath];
  let total = 0;

  while (stack.length > 0) {
    const filePath = stack.pop()!;
    if (visited.has(filePath)) continue;
    visited.add(filePath);

    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch {
      continue;
    }

    total += approximateWordCount(content);

    const imports = collectImportSpecifiers(content);
    for (const specifier of imports) {
      const resolved = resolveLocalImport(filePath, specifier);
      // Only include explicitly-managed SEO copy modules in word count; otherwise we
      // massively over-count UI/component code that never renders as visible text.
      if (resolved && isSeoCopyFile(resolved) && !visited.has(resolved))
        stack.push(resolved);
    }
  }

  return total;
}

async function analyzePage(
  filePath: string,
  content: string,
  templateDefaults: TemplateDefaults,
): Promise<PageStats> {
  const relativePath = path.relative(process.cwd(), filePath);
  const hasTemplate = content.includes('SEOContentTemplate');
  const hasMetadata =
    /export\s+const\s+metadata/.test(content) ||
    /export\s+async\s+function\s+generateMetadata/.test(content);
  const rawWordCount = await approximateWordCountWithImports(filePath);
  let wordCount = rawWordCount;
  const disablesAutoDepthBoost =
    /disableAutoDepthBoost\s*=\s*(\{)?\s*true\s*(\})?/.test(content) ||
    /disableAutoDepthBoost\s*:\s*true/.test(content);
  const hasMeaningProp = /meaning=/.test(content);
  const hasFaqsProp = /faqs=/.test(content);

  // Intro is effectively covered by the required description + on-page header copy.
  const hasIntro = /intro=/.test(content) || /description=/.test(content);

  // Meaning/TL;DR can be expressed as template props OR as long-form children content.
  const hasMeaningOrTldr =
    /meaning=|tldr=/.test(content) ||
    // Template provides a default Meaning section when meaning isn't provided.
    hasTemplate ||
    wordCount >= MIN_WORD_COUNT;
  const hasTOC =
    /tableOfContents=/.test(content) ||
    // Template auto-builds TOC when any of these sections exist
    /whatIs=/.test(content) ||
    /meaning=/.test(content) ||
    /howToWorkWith=/.test(content) ||
    /rituals=/.test(content) ||
    /journalPrompts=/.test(content) ||
    /tables=/.test(content) ||
    /faqs=/.test(content);
  const hasInternalLinks = /internalLinks=/.test(content);
  const hasRelatedItems = /relatedItems=/.test(content);
  // Template provides a default FAQ block (and FAQ schema) when `faqs` isn't provided.
  const hasFAQs = /faqs=/.test(content) || hasTemplate;
  let hasCosmicProp =
    /cosmicConnections=/.test(content) ||
    /cosmicConnectionsParams=/.test(content);

  // Recognize auto-derived cosmic connections when canonicalUrl is a literal.
  if (!hasCosmicProp) {
    const canonicalMatch =
      content.match(/canonicalUrl\s*=\s*['"]([^'"]+)['"]/) ||
      content.match(/canonicalUrl\s*=\s*\{\s*['"]([^'"]+)['"]\s*\}/) ||
      content.match(/canonicalUrl\s*=\s*`([^`]+)`/) ||
      content.match(/canonicalUrl\s*=\s*\{\s*`([^`]+)`\s*\}/);
    const canonicalUrlRaw = canonicalMatch?.[1];
    const canonicalUrl = canonicalUrlRaw
      ? canonicalUrlRaw.replace(/\$\{[^}]+\}/g, 'placeholder')
      : undefined;
    if (canonicalUrl) {
      const derived = deriveCosmicConnectionsParams(canonicalUrl);
      if (derived) hasCosmicProp = true;
    }
  }
  // Template always renders CosmicConnections when it can derive from canonicalUrl,
  // and derivation has a safe A–Z fallback for unknown grimoire routes.
  if (!hasCosmicProp && hasTemplate) hasCosmicProp = true;
  // Template renders a default CTA for grimoire pages, so treat CTA as present when template is used.
  const hasCTA =
    (/ctaText=/.test(content) && /ctaHref=/.test(content)) || hasTemplate;
  const manualBreadcrumb =
    /<nav[^>]*>/i.test(content) &&
    !content.includes('<Breadcrumbs') &&
    /(→|\/)/.test(content);

  const issues: string[] = [];
  const warnings: string[] = [];

  if (!hasTemplate) issues.push('missing-template');
  if (!hasMetadata) issues.push('missing-metadata');
  if (!hasIntro) warnings.push('missing-intro');
  if (!hasMeaningOrTldr) warnings.push('missing-meaning');
  if (!hasTOC) warnings.push('missing-table-of-contents');
  // Template always renders a universal “Explore the Grimoire” block; internalLinks/relatedItems are additive.
  if (!hasFAQs) warnings.push('missing-faqs');
  if (!hasCosmicProp)
    warnings.push('missing-cosmic-connections-prop-or-override');
  if (!hasCTA) warnings.push('missing-cta');
  if (manualBreadcrumb) issues.push('manual-breadcrumb');
  // Template can auto-boost thin pages with a long-form Deep Dive section unless explicitly disabled.
  if (hasTemplate) {
    if (!hasMeaningProp && templateDefaults.meaningWordCount) {
      wordCount += templateDefaults.meaningWordCount;
    }
    if (!hasFaqsProp && templateDefaults.faqWordCount) {
      wordCount += templateDefaults.faqWordCount;
    }
  }

  if (wordCount < MIN_WORD_COUNT) {
    issues.push(`low-word-count(${wordCount})`);
  }

  return {
    path: relativePath,
    hasTemplate,
    hasMetadata,
    hasIntro,
    hasMeaningOrTldr,
    hasTOC,
    hasInternalLinks,
    hasRelatedItems,
    hasFAQs,
    hasCosmicProp,
    hasCTA,
    manualBreadcrumb,
    rawWordCount,
    wordCount,
    issues,
    warnings,
  };
}

async function main() {
  const pageFiles = await collectPageFiles(GRIMOIRE_ROOT);
  const stats: PageStats[] = [];
  const templateDefaults = await loadTemplateDefaults();

  for (const file of pageFiles) {
    const content = await fs.readFile(file, 'utf8');
    stats.push(await analyzePage(file, content, templateDefaults));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    minWordCount: MIN_WORD_COUNT,
    totalPages: stats.length,
    pages: stats,
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(report, null, 2));

  const pagesWithIssues = stats.filter((page) => page.issues.length > 0);

  console.log(
    `Analyzed ${stats.length} grimoire pages. ${pagesWithIssues.length} have issues.`,
  );

  const topIssues = pagesWithIssues.slice(0, 20);
  topIssues.forEach((page) => {
    console.log(
      `- ${page.path}: ${page.issues.join(', ') || 'ok'} (words: ${page.wordCount})`,
    );
  });

  console.log(`Full report written to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error('Failed to run grimoire SEO audit:', error);
  process.exit(1);
});
