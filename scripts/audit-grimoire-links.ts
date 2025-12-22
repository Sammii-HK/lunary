#!/usr/bin/env tsx
/**
 * Grimoire Link Audit Script
 *
 * Scans all grimoire-related files to extract internal links and verify
 * that all routes exist and are properly configured.
 */

import * as fs from 'fs';
import * as path from 'path';

interface LinkInfo {
  url: string;
  file: string;
  line: number;
  context: string;
}

interface RouteInfo {
  path: string;
  type: 'static' | 'dynamic' | 'generateStaticParams';
  params?: string[];
  file: string;
}

interface AuditReport {
  links: LinkInfo[];
  routes: RouteInfo[];
  missingRoutes: string[];
  orphanedRoutes: string[];
  brokenLinks: LinkInfo[];
}

const GRIMOIRE_BASE = '/grimoire';

// Patterns to extract links
const LINK_PATTERNS = [
  // href="/grimoire/..."
  /href\s*=\s*['"`]([^'"`]*\/grimoire\/[^'"`]+)['"`]/g,
  // url: "/grimoire/..."
  /url\s*:\s*['"`]([^'"`]*\/grimoire\/[^'"`]+)['"`]/g,
  // Template literals
  /href\s*=\s*\{`([^`]*\/grimoire\/[^`]+)`\}/g,
  // href={`/grimoire/...`}
  /href\s*=\s*\{`([^`]*\/grimoire\/[^`]+)`\}/g,
];

// Extract all grimoire links from a file
function extractLinks(filePath: string, content: string): LinkInfo[] {
  const links: LinkInfo[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of LINK_PATTERNS) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const url = match[1];
        if (url.startsWith(GRIMOIRE_BASE) && !url.includes('${')) {
          links.push({
            url,
            file: filePath,
            line: i + 1,
            context: line.trim(),
          });
        }
      }
    }
  }

  return links;
}

// Extract routes from file system
function extractRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const grimoireDir = path.join(process.cwd(), 'src/app/grimoire');

  function scanDirectory(dir: string, basePath: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(grimoireDir, fullPath);

      if (entry.isDirectory()) {
        const newBase = path.join(basePath, entry.name);
        scanDirectory(fullPath, newBase);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        const routePath = basePath.replace(/\\/g, '/');
        const fullRoute = `${GRIMOIRE_BASE}${routePath ? `/${routePath}` : ''}`;

        // Check if it's a dynamic route
        const isDynamic = basePath.includes('[') && basePath.includes(']');
        const params = isDynamic
          ? basePath.match(/\[([^\]]+)\]/g)?.map((p) => p.slice(1, -1)) || []
          : undefined;

        routes.push({
          path: fullRoute,
          type: isDynamic ? 'dynamic' : 'static',
          params,
          file: fullPath,
        });
      }
    }
  }

  if (fs.existsSync(grimoireDir)) {
    scanDirectory(grimoireDir);
  }

  return routes;
}

// Recursively find all files matching pattern
function findFiles(
  dir: string,
  pattern: RegExp,
  fileList: string[] = [],
): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, pattern, fileList);
    } else if (pattern.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Extract generateStaticParams from files
function extractGenerateStaticParams(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const grimoireDir = path.join(process.cwd(), 'src/app/grimoire');
  const files = findFiles(grimoireDir, /\.tsx?$/);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');

    // Look for generateStaticParams function
    const generateStaticParamsMatch = content.match(
      /export\s+(async\s+)?function\s+generateStaticParams[^{]*\{([^}]+)\}/s,
    );

    if (generateStaticParamsMatch) {
      // Extract the route path from file path
      const relativePath = path.relative(
        path.join(process.cwd(), 'src/app/grimoire'),
        file,
      );
      const routePath = relativePath
        .replace(/\\/g, '/')
        .replace(/\/page\.tsx?$/, '')
        .split('/')
        .map((segment) => {
          if (segment.startsWith('[') && segment.endsWith(']')) {
            return `:${segment.slice(1, -1)}`;
          }
          return segment;
        })
        .join('/');

      routes.push({
        path: `${GRIMOIRE_BASE}/${routePath}`,
        type: 'generateStaticParams',
        file,
      });
    }
  }

  return routes;
}

// Normalize route path for comparison
function normalizeRoute(route: string): string {
  // Remove trailing slashes
  let normalized = route.replace(/\/$/, '');

  // Replace dynamic segments with wildcard
  normalized = normalized.replace(/\[[^\]]+\]/g, '*');
  normalized = normalized.replace(/:[^/]+/g, '*');

  return normalized;
}

// Check if a link matches a route
function linkMatchesRoute(link: string, route: RouteInfo): boolean {
  const linkPath = link.split('?')[0].split('#')[0]; // Remove query and hash
  const routePath = route.path;

  // Exact match
  if (linkPath === routePath) return true;

  // Dynamic route match
  if (route.type === 'dynamic' && route.params) {
    const routePattern = routePath
      .replace(/\[([^\]]+)\]/g, '([^/]+)')
      .replace(/:[^/]+/g, '([^/]+)');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(linkPath);
  }

  return false;
}

// Main audit function
function auditGrimoireLinks(): AuditReport {
  console.log('🔍 Starting Grimoire Link Audit...\n');

  // Find all relevant files
  const srcDir = path.join(process.cwd(), 'src');
  const files = findFiles(srcDir, /\.(ts|tsx)$/).filter(
    (file) =>
      !file.includes('node_modules') &&
      !file.includes('.next') &&
      !file.includes('coverage'),
  );

  console.log(`📁 Found ${files.length} files to scan\n`);

  // Extract links
  const allLinks: LinkInfo[] = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const links = extractLinks(file, content);
    allLinks.push(...links);
  }

  console.log(`🔗 Found ${allLinks.length} grimoire links\n`);

  // Extract routes
  const staticRoutes = extractRoutes();
  const dynamicRoutes = extractGenerateStaticParams();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  console.log(`🛣️  Found ${allRoutes.length} routes\n`);

  // Get unique link URLs
  const uniqueLinks = Array.from(
    new Set(allLinks.map((l) => l.url.split('?')[0].split('#')[0])),
  );

  // Find missing routes
  const missingRoutes: string[] = [];
  const brokenLinks: LinkInfo[] = [];

  for (const linkUrl of uniqueLinks) {
    const normalizedLink = normalizeRoute(linkUrl);
    const matchingRoute = allRoutes.find((route) =>
      linkMatchesRoute(linkUrl, route),
    );

    if (!matchingRoute) {
      missingRoutes.push(linkUrl);
      // Find all links pointing to this URL
      const linksToUrl = allLinks.filter(
        (l) => l.url.split('?')[0].split('#')[0] === linkUrl,
      );
      brokenLinks.push(...linksToUrl);
    }
  }

  // Find orphaned routes (routes with no links)
  const linkedPaths = new Set(
    allLinks.map((l) => normalizeRoute(l.url.split('?')[0].split('#')[0])),
  );
  const orphanedRoutes = allRoutes
    .filter((route) => {
      const normalized = normalizeRoute(route.path);
      return !linkedPaths.has(normalized);
    })
    .map((r) => r.path);

  return {
    links: allLinks,
    routes: allRoutes,
    missingRoutes: Array.from(new Set(missingRoutes)),
    orphanedRoutes: Array.from(new Set(orphanedRoutes)),
    brokenLinks,
  };
}

// Generate report
function generateReport(report: AuditReport): void {
  console.log('='.repeat(80));
  console.log('📊 GRIMOIRE LINK AUDIT REPORT');
  console.log('='.repeat(80));
  console.log();

  console.log(`Total Links Found: ${report.links.length}`);
  console.log(`Total Routes Found: ${report.routes.length}`);
  console.log(`Missing Routes (404s): ${report.missingRoutes.length}`);
  console.log(`Orphaned Routes: ${report.orphanedRoutes.length}`);
  console.log();

  if (report.missingRoutes.length > 0) {
    console.log('❌ MISSING ROUTES (404s):');
    console.log('-'.repeat(80));
    for (const route of report.missingRoutes.sort()) {
      console.log(`  ${route}`);
      const links = report.brokenLinks.filter(
        (l) => l.url.split('?')[0].split('#')[0] === route,
      );
      for (const link of links.slice(0, 3)) {
        console.log(`    → ${link.file}:${link.line}`);
      }
      if (links.length > 3) {
        console.log(`    ... and ${links.length - 3} more`);
      }
    }
    console.log();
  }

  if (report.orphanedRoutes.length > 0) {
    console.log('⚠️  ORPHANED ROUTES (no links found):');
    console.log('-'.repeat(80));
    for (const route of report.orphanedRoutes.sort()) {
      console.log(`  ${route}`);
    }
    console.log();
  }

  // Save detailed report to JSON
  const reportPath = path.join(
    process.cwd(),
    'grimoire-link-audit-report.json',
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  console.log();

  // Exit with error code if there are missing routes
  if (report.missingRoutes.length > 0) {
    console.log('❌ Audit failed: Found missing routes (404s)');
    process.exit(1);
  } else {
    console.log('✅ Audit passed: All links point to valid routes');
    process.exit(0);
  }
}

// Run audit
if (require.main === module) {
  try {
    const report = auditGrimoireLinks();
    generateReport(report);
  } catch (error) {
    console.error('❌ Audit failed with error:', error);
    process.exit(1);
  }
}

export { auditGrimoireLinks, generateReport };
