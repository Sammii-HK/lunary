#!/usr/bin/env tsx
/**
 * Find Orphaned Grimoire Pages
 *
 * Identifies pages that are:
 * - Not in sitemap
 * - Not linked from anywhere
 * - Have noindex robots directive
 * - Missing canonical URLs
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const GRIMOIRE_PATH = path.join(PROJECT_ROOT, 'src/app/grimoire');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'src/app/sitemap.ts');

interface PageInfo {
  route: string;
  file: string;
  inSitemap: boolean;
  hasNoindex: boolean;
  hasCanonical: boolean;
  linkedFrom: string[];
}

// Get all grimoire routes from file system
async function getAllGrimoireRoutes(): Promise<Map<string, string>> {
  const routes = new Map<string, string>();
  const pageFiles = await glob('**/page.tsx', { cwd: GRIMOIRE_PATH });

  for (const file of pageFiles) {
    const filePath = path.join(GRIMOIRE_PATH, file);
    const relativePath = file.replace(/\/page\.tsx$/, '');

    // Convert file path to route
    let route = `/grimoire/${relativePath}`;
    route = route.replace(/\[(\w+)\]/g, ':$1'); // Convert [param] to :param

    routes.set(route, filePath);
  }

  return routes;
}

// Extract routes from sitemap
function getSitemapRoutes(): Set<string> {
  const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const routes = new Set<string>();

  // Find all URL patterns in sitemap
  const urlMatches = sitemapContent.matchAll(
    /url:\s*[`'"](\/grimoire[^`'"]*)[`'"]/g,
  );
  for (const match of urlMatches) {
    routes.add(match[1]);
  }

  // Also check for template literals
  const templateMatches = sitemapContent.matchAll(
    /url:\s*`\$\{baseUrl\}\/grimoire\/([^`]+)`/g,
  );
  for (const match of templateMatches) {
    routes.add(`/grimoire/${match[1]}`);
  }

  return routes;
}

// Check if page has noindex
function hasNoindex(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return (
      content.includes('noindex') ||
      content.includes('robots: { index: false') ||
      content.includes("robots: { 'noindex'")
    );
  } catch {
    return false;
  }
}

// Check if page has canonical URL
function hasCanonical(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return (
      content.includes('canonical') ||
      content.includes('alternates') ||
      content.includes('canonicalUrl')
    );
  } catch {
    return false;
  }
}

// Find all internal links to a route
function findLinksToRoute(route: string): string[] {
  const links: string[] = [];
  const searchPattern = route.replace(/:/g, '\\[').replace(/\//g, '/') + '\\]';
  const regex = new RegExp(
    `href=['"]${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
    'g',
  );

  // Search in all TSX/TS files
  const files = glob.sync('**/*.{ts,tsx}', {
    cwd: PROJECT_ROOT,
    ignore: ['**/node_modules/**', '**/.next/**'],
  });

  for (const file of files) {
    const filePath = path.join(PROJECT_ROOT, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (regex.test(content) || content.includes(route)) {
        links.push(file);
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return links;
}

// Main function
async function findOrphanedPages() {
  console.log('🔍 Finding Orphaned Grimoire Pages...\n');

  const allRoutes = await getAllGrimoireRoutes();
  const sitemapRoutes = getSitemapRoutes();

  const issues: PageInfo[] = [];
  const allPages: PageInfo[] = [];

  for (const [route, filePath] of allRoutes) {
    const inSitemap = Array.from(sitemapRoutes).some((sitemapRoute) => {
      // Check if route matches sitemap route (handle dynamic segments)
      const normalizedRoute = route.replace(/:[^/]+/g, '*');
      const normalizedSitemap = sitemapRoute.replace(/\[[^\]]+\]/g, '*');
      return (
        normalizedRoute === normalizedSitemap || sitemapRoute.includes(route)
      );
    });

    const hasNoindexFlag = hasNoindex(filePath);
    const hasCanonicalFlag = hasCanonical(filePath);
    const linkedFrom = findLinksToRoute(route);

    const pageInfo: PageInfo = {
      route,
      file: path.relative(PROJECT_ROOT, filePath),
      inSitemap,
      hasNoindex: hasNoindexFlag,
      hasCanonical: hasCanonicalFlag,
      linkedFrom,
    };

    allPages.push(pageInfo);

    // Check for issues
    if (
      !inSitemap ||
      hasNoindexFlag ||
      !hasCanonicalFlag ||
      linkedFrom.length === 0
    ) {
      issues.push(pageInfo);
    }
  }

  // Report
  console.log('='.repeat(80));
  console.log('📊 ORPHANED PAGES REPORT');
  console.log('='.repeat(80));
  console.log();

  console.log(`Total pages found: ${allPages.length}`);
  console.log(`Pages with issues: ${issues.length}\n`);

  const notInSitemap = issues.filter((p) => !p.inSitemap);
  const hasNoindexPages = issues.filter((p) => p.hasNoindex);
  const missingCanonical = issues.filter((p) => !p.hasCanonical);
  const notLinked = issues.filter((p) => p.linkedFrom.length === 0);

  if (notInSitemap.length > 0) {
    console.log(`❌ Pages NOT in sitemap (${notInSitemap.length}):`);
    notInSitemap.slice(0, 10).forEach((page) => {
      console.log(`   ${page.route}`);
      console.log(`   → ${page.file}`);
    });
    if (notInSitemap.length > 10) {
      console.log(`   ... and ${notInSitemap.length - 10} more`);
    }
    console.log();
  }

  if (hasNoindexPages.length > 0) {
    console.log(`⚠️  Pages with noindex (${hasNoindexPages.length}):`);
    hasNoindexPages.slice(0, 10).forEach((page) => {
      console.log(`   ${page.route}`);
      console.log(`   → ${page.file}`);
    });
    if (hasNoindexPages.length > 10) {
      console.log(`   ... and ${hasNoindexPages.length - 10} more`);
    }
    console.log();
  }

  if (missingCanonical.length > 0) {
    console.log(
      `⚠️  Pages missing canonical URLs (${missingCanonical.length}):`,
    );
    missingCanonical.slice(0, 10).forEach((page) => {
      console.log(`   ${page.route}`);
      console.log(`   → ${page.file}`);
    });
    if (missingCanonical.length > 10) {
      console.log(`   ... and ${missingCanonical.length - 10} more`);
    }
    console.log();
  }

  if (notLinked.length > 0) {
    console.log(`⚠️  Pages not linked from anywhere (${notLinked.length}):`);
    notLinked.slice(0, 10).forEach((page) => {
      console.log(`   ${page.route}`);
      console.log(`   → ${page.file}`);
    });
    if (notLinked.length > 10) {
      console.log(`   ... and ${notLinked.length - 10} more`);
    }
    console.log();
  }

  if (issues.length === 0) {
    console.log(
      '✅ No orphaned pages found! All pages are properly indexed and linked.',
    );
  }

  // Save detailed report
  const reportPath = path.join(PROJECT_ROOT, 'orphaned-pages-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        allPages,
        issues,
        summary: { total: allPages.length, issues: issues.length },
      },
      null,
      2,
    ),
    'utf-8',
  );
  console.log(`📄 Detailed report saved to: ${reportPath}`);
}

if (require.main === module) {
  findOrphanedPages().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { findOrphanedPages };
