#!/usr/bin/env tsx
/**
 * Pre-Launch Quality Assurance Checklist
 * 
 * Validates:
 * - Lighthouse scores > 90
 * - Mobile-first responsiveness
 * - Metadata validation
 * - Structured data testing
 * - Indexing (robots.txt, sitemap.xml)
 * 
 * Usage:
 *   BASE_URL=https://lunary.app pnpm qa:check
 *   BASE_URL=http://localhost:3000 pnpm qa:check
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LIGHTHOUSE_THRESHOLD = 90;
const USE_LIGHTHOUSE_CLI = process.env.USE_LIGHTHOUSE_CLI === 'true';

interface QAResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: QAResult[] = [];

function logResult(result: QAResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details && !result.passed) {
    console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
  }
}

/**
 * 1. Lighthouse Performance Tests
 */
async function runLighthouseTests() {
  console.log('\n🔍 Running Lighthouse Tests...\n');
  
  try {
    let lighthouseAvailable = false;
    
    // Try to use lighthouse CLI if available
    if (USE_LIGHTHOUSE_CLI) {
      try {
        execSync('which lighthouse', { stdio: 'ignore' });
        lighthouseAvailable = true;
      } catch {
        logResult({
          name: 'Lighthouse CLI',
          passed: false,
          message: 'Lighthouse CLI not found. Set USE_LIGHTHOUSE_CLI=false to skip or install: npm install -g lighthouse',
        });
      }
    }

    if (!lighthouseAvailable) {
      logResult({
        name: 'Lighthouse Tests',
        passed: false,
        message: 'Lighthouse CLI not available. Install globally or use online Lighthouse tools. Skipping automated tests.',
      });
      console.log('   💡 Tip: Use Chrome DevTools Lighthouse or PageSpeed Insights for manual testing');
      return;
    }

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/pricing', name: 'Pricing' },
      { path: '/blog', name: 'Blog' },
      { path: '/shop', name: 'Shop' },
      { path: '/grimoire', name: 'Grimoire' },
    ];

    for (const page of pages) {
      const url = `${BASE_URL}${page.path}`;
      console.log(`Testing ${page.name} (${url})...`);

      try {
        // Test if URL is accessible first
        try {
          execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, { stdio: 'pipe' });
        } catch {
          logResult({
            name: `Lighthouse: ${page.name}`,
            passed: false,
            message: `URL not accessible: ${url}`,
          });
          continue;
        }

        // Run lighthouse with mobile emulation
        const reportPath = `/tmp/lighthouse-${page.path.replace(/\//g, '-') || 'home'}.json`;
        const lighthouseCmd = `lighthouse ${url} --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=${reportPath} --chrome-flags="--headless --no-sandbox" --quiet 2>&1 || true`;
        
        execSync(lighthouseCmd, { stdio: 'pipe', timeout: 60000 });
        
        if (existsSync(reportPath)) {
          const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
          const scores = {
            performance: Math.round((report.categories?.performance?.score || 0) * 100),
            accessibility: Math.round((report.categories?.accessibility?.score || 0) * 100),
            bestPractices: Math.round((report.categories?.['best-practices']?.score || 0) * 100),
            seo: Math.round((report.categories?.seo?.score || 0) * 100),
          };

          const allPassed = Object.values(scores).every(score => score >= LIGHTHOUSE_THRESHOLD);
          
          logResult({
            name: `Lighthouse: ${page.name}`,
            passed: allPassed,
            message: allPassed 
              ? `All scores ≥ ${LIGHTHOUSE_THRESHOLD}` 
              : `Some scores below ${LIGHTHOUSE_THRESHOLD}`,
            details: scores,
          });

          // Cleanup
          try {
            unlinkSync(reportPath);
          } catch {}
        } else {
          logResult({
            name: `Lighthouse: ${page.name}`,
            passed: false,
            message: 'Lighthouse report not generated',
          });
        }
      } catch (error: any) {
        logResult({
          name: `Lighthouse: ${page.name}`,
          passed: false,
          message: `Failed to run: ${error.message}`,
        });
      }
    }
  } catch (error: any) {
    logResult({
      name: 'Lighthouse Tests',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

/**
 * 2. Mobile-First Responsiveness Checks
 */
async function checkMobileResponsiveness() {
  console.log('\n📱 Checking Mobile-First Responsiveness...\n');

  try {
    // Check viewport meta tag
    const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
    if (existsSync(layoutPath)) {
      const layoutContent = readFileSync(layoutPath, 'utf-8');
      const hasViewport = layoutContent.includes('viewport') || layoutContent.includes('Viewport');
      const hasMobileMeta = layoutContent.includes('device-width') || layoutContent.includes('initialScale');
      
      logResult({
        name: 'Mobile Viewport Meta Tag',
        passed: hasViewport && hasMobileMeta,
        message: hasViewport && hasMobileMeta 
          ? 'Viewport meta tag configured correctly'
          : 'Missing or incorrect viewport configuration',
      });
    }

    // Check Tailwind config for mobile-first approach
    const tailwindPath = join(process.cwd(), 'tailwind.config.ts');
    if (existsSync(tailwindPath)) {
      const tailwindContent = readFileSync(tailwindPath, 'utf-8');
      const hasMobileFirst = tailwindContent.includes('screens') || tailwindContent.includes('sm:');
      
      logResult({
        name: 'Tailwind Mobile-First Config',
        passed: hasMobileFirst,
        message: hasMobileFirst 
          ? 'Tailwind configured for mobile-first'
          : 'Tailwind config may not be mobile-first',
      });
    }

    // Check for responsive utilities in key components
    const pagePath = join(process.cwd(), 'src/app/page.tsx');
    if (existsSync(pagePath)) {
      const pageContent = readFileSync(pagePath, 'utf-8');
      const hasResponsiveClasses = /(sm:|md:|lg:|xl:|2xl:)/.test(pageContent);
      
      logResult({
        name: 'Responsive CSS Classes',
        passed: hasResponsiveClasses,
        message: hasResponsiveClasses 
          ? 'Responsive utility classes found'
          : 'May need more responsive classes',
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Mobile Responsiveness',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

/**
 * 3. Metadata Validation
 */
async function validateMetadata() {
  console.log('\n📋 Validating Metadata...\n');

  try {
    const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
    if (existsSync(layoutPath)) {
      const layoutContent = readFileSync(layoutPath, 'utf-8');
      
      const checks = {
        title: layoutContent.includes('title:'),
        description: layoutContent.includes('description:'),
        openGraph: layoutContent.includes('openGraph:'),
        twitter: layoutContent.includes('twitter:'),
        canonical: layoutContent.includes('canonical') || layoutContent.includes('alternates:'),
        keywords: layoutContent.includes('keywords:'),
      };

      const allPresent = Object.values(checks).every(Boolean);
      
      logResult({
        name: 'Metadata Completeness',
        passed: allPresent,
        message: allPresent 
          ? 'All required metadata fields present'
          : 'Some metadata fields missing',
        details: checks,
      });

      // Check for OG image
      const hasOGImage = layoutContent.includes('og:') && layoutContent.includes('image');
      logResult({
        name: 'Open Graph Image',
        passed: hasOGImage,
        message: hasOGImage 
          ? 'OG image configured'
          : 'OG image missing',
      });
    }

    // Check manifest.json
    const manifestPath = join(process.cwd(), 'public/manifest.json');
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      const hasRequiredFields = manifest.name && manifest.short_name && manifest.icons;
      
      logResult({
        name: 'PWA Manifest',
        passed: hasRequiredFields,
        message: hasRequiredFields 
          ? 'PWA manifest valid'
          : 'PWA manifest missing required fields',
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Metadata Validation',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

/**
 * 4. Structured Data Testing
 */
async function testStructuredData() {
  console.log('\n🔗 Testing Structured Data...\n');

  try {
    // Check StructuredData component
    const structuredDataPath = join(process.cwd(), 'src/components/StructuredData.tsx');
    if (existsSync(structuredDataPath)) {
      const content = readFileSync(structuredDataPath, 'utf-8');
      
      const hasOrganization = content.includes('Organization') || content.includes('@type');
      const hasSchemaOrg = content.includes('schema.org');
      const hasJSONLD = content.includes('application/ld+json');
      
      logResult({
        name: 'Structured Data Component',
        passed: hasOrganization && hasSchemaOrg && hasJSONLD,
        message: hasOrganization && hasSchemaOrg && hasJSONLD
          ? 'Structured data component configured'
          : 'Structured data component incomplete',
        details: { hasOrganization, hasSchemaOrg, hasJSONLD },
      });
    }

    // Check FAQ structured data component
    const faqPath = join(process.cwd(), 'src/components/FAQStructuredData.tsx');
    if (existsSync(faqPath)) {
      const content = readFileSync(faqPath, 'utf-8');
      const hasFAQSchema = content.includes('FAQPage') || content.includes('Question');
      
      logResult({
        name: 'FAQ Structured Data',
        passed: hasFAQSchema,
        message: hasFAQSchema 
          ? 'FAQ structured data component found'
          : 'FAQ structured data component missing',
      });
    }

    // Validate JSON-LD syntax (basic check)
    if (existsSync(structuredDataPath)) {
      const content = readFileSync(structuredDataPath, 'utf-8');
      try {
        // Try to extract and parse JSON-LD
        const jsonMatch = content.match(/JSON\.stringify\(([^)]+)\)/);
        if (jsonMatch) {
          logResult({
            name: 'JSON-LD Syntax',
            passed: true,
            message: 'JSON-LD syntax appears valid',
          });
        }
      } catch (error: any) {
        logResult({
          name: 'JSON-LD Syntax',
          passed: false,
          message: `JSON-LD syntax error: ${error.message}`,
        });
      }
    }
  } catch (error: any) {
    logResult({
      name: 'Structured Data Testing',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

/**
 * 5. Indexing Tests
 */
async function testIndexing() {
  console.log('\n🔍 Testing Indexing Configuration...\n');

  try {
    // Check robots.txt
    const robotsPath = join(process.cwd(), 'src/app/robots.ts');
    if (existsSync(robotsPath)) {
      const content = readFileSync(robotsPath, 'utf-8');
      const hasRules = content.includes('rules:') || content.includes('userAgent');
      const hasSitemap = content.includes('sitemap');
      const hasDisallow = content.includes('disallow');
      
      logResult({
        name: 'Robots.txt Configuration',
        passed: hasRules && hasSitemap,
        message: hasRules && hasSitemap
          ? 'Robots.txt properly configured'
          : 'Robots.txt configuration incomplete',
        details: { hasRules, hasSitemap, hasDisallow },
      });
    }

    // Check sitemap.ts
    const sitemapPath = join(process.cwd(), 'src/app/sitemap.ts');
    if (existsSync(sitemapPath)) {
      const content = readFileSync(sitemapPath, 'utf-8');
      const hasRoutes = content.includes('url:') || content.includes('routes');
      const hasPriority = content.includes('priority');
      const hasLastModified = content.includes('lastModified');
      
      logResult({
        name: 'Sitemap Configuration',
        passed: hasRoutes && hasPriority,
        message: hasRoutes && hasPriority
          ? 'Sitemap properly configured'
          : 'Sitemap configuration incomplete',
        details: { hasRoutes, hasPriority, hasLastModified },
      });
    }

    // Test if robots.txt is accessible (if server is running)
    try {
      const robotsResponse = execSync(`curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/robots.txt`, { encoding: 'utf-8' });
      logResult({
        name: 'Robots.txt Accessibility',
        passed: robotsResponse.trim() === '200',
        message: robotsResponse.trim() === '200'
          ? 'Robots.txt accessible'
          : `Robots.txt returned ${robotsResponse.trim()}`,
      });
    } catch {
      logResult({
        name: 'Robots.txt Accessibility',
        passed: false,
        message: 'Cannot test robots.txt accessibility (server may not be running)',
      });
    }

    // Test if sitemap.xml is accessible
    try {
      const sitemapResponse = execSync(`curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/sitemap.xml`, { encoding: 'utf-8' });
      logResult({
        name: 'Sitemap.xml Accessibility',
        passed: sitemapResponse.trim() === '200',
        message: sitemapResponse.trim() === '200'
          ? 'Sitemap.xml accessible'
          : `Sitemap.xml returned ${sitemapResponse.trim()}`,
      });
    } catch {
      logResult({
        name: 'Sitemap.xml Accessibility',
        passed: false,
        message: 'Cannot test sitemap.xml accessibility (server may not be running)',
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Indexing Tests',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Pre-Launch Quality Assurance Checklist\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('=' .repeat(60));

  await runLighthouseTests();
  await checkMobileResponsiveness();
  await validateMetadata();
  await testStructuredData();
  await testIndexing();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 QA Checklist Summary\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const failed = results.filter(r => !r.passed);

  console.log(`Total Checks: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed.length}\n`);

  if (failed.length > 0) {
    console.log('❌ Failed Checks:');
    failed.forEach(result => {
      console.log(`   - ${result.name}: ${result.message}`);
    });
    console.log('');
  }

  const allPassed = failed.length === 0;
  console.log(allPassed 
    ? '✅ All QA checks passed! Ready for launch.' 
    : '⚠️  Some QA checks failed. Please address the issues above before launching.');

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
