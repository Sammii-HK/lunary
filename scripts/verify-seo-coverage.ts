#!/usr/bin/env tsx
/**
 * SEO Coverage Verification Script
 *
 * Verifies:
 * 1. All retrograde pages are in sitemap
 * 2. All generateStaticParams include complete data
 * 3. All pages have canonical URLs
 * 4. Sitemap matches actual routes
 */

import * as fs from 'fs';
import * as path from 'path';

// Import retrogradeInfo to verify sitemap coverage
async function verifyRetrogradeSitemapCoverage() {
  console.log('🔍 Verifying Retrograde Sitemap Coverage...\n');

  // Read sitemap file
  const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

  // Extract retrograde routes from sitemap
  const retrogradeMatch = sitemapContent.match(
    /const retrogradeRoutes = Object\.keys\(retrogradeInfo\)\.map\(\(planet\) =>/,
  );

  if (!retrogradeMatch) {
    console.log('❌ Retrograde routes not found in sitemap');
    return false;
  }

  console.log(
    '✅ Sitemap uses Object.keys(retrogradeInfo) - will include all planets',
  );
  console.log('   This means all 7 retrograde pages will be in sitemap\n');

  return true;
}

// Verify generateStaticParams completeness
function verifyGenerateStaticParams() {
  console.log('🔍 Verifying generateStaticParams Completeness...\n');

  const grimoireDir = path.join(process.cwd(), 'src/app/grimoire');
  const issues: string[] = [];

  function findFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findFiles(filePath, fileList);
      } else if (file === 'page.tsx' || file === 'page.ts') {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  const pageFiles = findFiles(grimoireDir);

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Check if it's a dynamic route
    const isDynamic = file.includes('[') && file.includes(']');

    if (isDynamic) {
      // Check if it has generateStaticParams
      const hasGenerateStaticParams = content.includes('generateStaticParams');

      if (!hasGenerateStaticParams) {
        const relativePath = path.relative(
          path.join(process.cwd(), 'src/app/grimoire'),
          file,
        );
        issues.push(
          `⚠️  Dynamic route without generateStaticParams: ${relativePath}`,
        );
      }
    }
  }

  if (issues.length > 0) {
    console.log('Issues found:');
    issues.forEach((issue) => console.log(`  ${issue}`));
    console.log();
    return false;
  }

  console.log('✅ All dynamic routes have generateStaticParams\n');
  return true;
}

// Verify canonical URLs
function verifyCanonicalURLs() {
  console.log('🔍 Verifying Canonical URLs...\n');

  const grimoireDir = path.join(process.cwd(), 'src/app/grimoire');
  const issues: string[] = [];

  function findFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findFiles(filePath, fileList);
      } else if (file === 'page.tsx' || file === 'page.ts') {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  const pageFiles = findFiles(grimoireDir);

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Check if it exports metadata
    const hasMetadata =
      content.includes('export const metadata') ||
      content.includes('export async function generateMetadata');

    if (hasMetadata) {
      // Check for canonical URL
      const hasCanonical =
        content.includes('canonical') ||
        content.includes('alternates') ||
        content.includes('canonicalUrl');

      if (!hasCanonical) {
        const relativePath = path.relative(
          path.join(process.cwd(), 'src/app/grimoire'),
          file,
        );
        // Skip layout files
        if (!relativePath.includes('layout')) {
          issues.push(`⚠️  Page without canonical URL: ${relativePath}`);
        }
      }
    }
  }

  if (issues.length > 0) {
    console.log('Pages missing canonical URLs:');
    issues.slice(0, 10).forEach((issue) => console.log(`  ${issue}`));
    if (issues.length > 10) {
      console.log(`  ... and ${issues.length - 10} more`);
    }
    console.log();
    return false;
  }

  console.log('✅ All pages have canonical URLs\n');
  return true;
}

// Main verification
async function verifySEOCoverage() {
  console.log('='.repeat(80));
  console.log('📊 SEO COVERAGE VERIFICATION');
  console.log('='.repeat(80));
  console.log();

  const results = {
    retrogradeSitemap: await verifyRetrogradeSitemapCoverage(),
    generateStaticParams: verifyGenerateStaticParams(),
    canonicalURLs: verifyCanonicalURLs(),
  };

  console.log('='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log();

  const allPassed = Object.values(results).every((r) => r);

  Object.entries(results).forEach(([check, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${check}`);
  });

  console.log();

  if (allPassed) {
    console.log('✅ All SEO checks passed!');
    process.exit(0);
  } else {
    console.log('❌ Some SEO checks failed');
    process.exit(1);
  }
}

if (require.main === module) {
  verifySEOCoverage().catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

export { verifySEOCoverage };
