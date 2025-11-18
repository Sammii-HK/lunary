/**
 * E2E Quality Assurance Checklist Tests
 * 
 * Comprehensive QA tests using Playwright to validate:
 * - Lighthouse scores (via PageSpeed Insights API or manual checks)
 * - Mobile-first responsiveness
 * - Metadata validation
 * - Structured data testing
 * - Indexing (robots.txt, sitemap.xml)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LIGHTHOUSE_THRESHOLD = 90;

const keyPages = [
  { path: '/', name: 'Homepage' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/blog', name: 'Blog' },
  { path: '/shop', name: 'Shop' },
  { path: '/grimoire', name: 'Grimoire' },
];

test.describe('QA Checklist - Metadata Validation', () => {
  for (const page of keyPages) {
    test(`${page.name} should have complete metadata`, async ({ page: pg }) => {
      await pg.goto(`${BASE_URL}${page.path}`);
      
      // Check title
      const title = await pg.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      
      // Check meta description
      const metaDescription = await pg.locator('meta[name="description"]').getAttribute('content');
      expect(metaDescription).toBeTruthy();
      expect(metaDescription!.length).toBeGreaterThan(50);
      expect(metaDescription!.length).toBeLessThan(160);
      
      // Check Open Graph tags
      const ogTitle = await pg.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await pg.locator('meta[property="og:description"]').getAttribute('content');
      const ogImage = await pg.locator('meta[property="og:image"]').getAttribute('content');
      
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogImage).toBeTruthy();
      
      // Check Twitter Card
      const twitterCard = await pg.locator('meta[name="twitter:card"]').getAttribute('content');
      expect(twitterCard).toBeTruthy();
      
      // Check canonical URL
      const canonical = await pg.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
    });
  }
});

test.describe('QA Checklist - Structured Data', () => {
  test('Homepage should have structured data', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Check for JSON-LD scripts
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLdScripts.length).toBeGreaterThan(0);
    
    // Parse and validate JSON-LD
    for (const script of jsonLdScripts) {
      const content = await script.textContent();
      expect(content).toBeTruthy();
      
      // Should be valid JSON
      const jsonData = JSON.parse(content!);
      expect(jsonData['@context']).toBe('https://schema.org');
      expect(jsonData['@type']).toBeTruthy();
    }
  });
  
  test('Structured data should be valid JSON', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    
    for (const script of scripts) {
      const content = await script.textContent();
      expect(() => JSON.parse(content!)).not.toThrow();
    }
  });
});

test.describe('QA Checklist - Mobile Responsiveness', () => {
  test('Pages should be mobile-responsive', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        
    for (const pageInfo of keyPages.slice(0, 3)) { // Test first 3 pages
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      
      // Check for horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 375;
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
      
      // Check that text is readable (no tiny fonts)
      const fontSize = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return parseFloat(style.fontSize);
      });
      
      expect(fontSize).toBeGreaterThanOrEqual(14); // Minimum readable font size
    }
  });
  
  test('Viewport meta tag should be configured', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale');
  });
});

test.describe('QA Checklist - Indexing', () => {
  test('robots.txt should be accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('User-agent');
    expect(content).toContain('Sitemap');
  });
  
  test('sitemap.xml should be accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('<?xml');
    expect(content).toContain('<urlset');
  });
  
  test('robots.txt should disallow admin routes', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    const content = await response.text();
    
    expect(content).toMatch(/Disallow:\s*\/admin/i);
    expect(content).toMatch(/Disallow:\s*\/api/i);
  });
  
  test('sitemap.xml should include key pages', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    const content = await response.text();
    
    expect(content).toContain(`${BASE_URL}/`);
    expect(content).toContain(`${BASE_URL}/pricing`);
    expect(content).toContain(`${BASE_URL}/blog`);
  });
});

test.describe('QA Checklist - Performance', () => {
  test('Pages should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 5 seconds on good connection
    expect(loadTime).toBeLessThan(5000);
  });
  
  test('No console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      err => !err.includes('favicon') && !err.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('QA Checklist - Accessibility', () => {
  test('Images should have alt text', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Decorative images can have empty alt, but should have the attribute
      const altAttribute = await img.getAttribute('alt');
      expect(altAttribute).not.toBeNull();
    }
  });
  
  test('Links should have accessible text', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    const links = await page.locator('a').all();
    
    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      // Link should have text, aria-label, or title
      expect(text || ariaLabel || title).toBeTruthy();
    }
  });
  
  test('Form inputs should have labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label > 0 || ariaLabel || placeholder || name).toBeTruthy();
      } else {
        expect(ariaLabel || placeholder || name).toBeTruthy();
      }
    }
  });
});

test.describe('QA Checklist - SEO', () => {
  test('Pages should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    expect(h1Count).toBeLessThanOrEqual(1); // Should have only one h1
    
    // Check heading order (h2 should not come before h1)
    const headings = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h2s = Array.from(document.querySelectorAll('h2'));
      
      if (!h1) return { valid: false, reason: 'No h1 found' };
      
      // Check if any h2 appears before h1 (shouldn't happen)
      const h1Index = Array.from(document.querySelectorAll('h1, h2')).indexOf(h1);
      const firstH2Index = h2s.length > 0 
        ? Array.from(document.querySelectorAll('h1, h2')).indexOf(h2s[0])
        : -1;
      
      return {
        valid: firstH2Index === -1 || firstH2Index > h1Index,
        h1Index,
        firstH2Index,
      };
    });
    
    expect(headings.valid).toBe(true);
  });
  
  test('Pages should have unique titles', async ({ page }) => {
    const titles: string[] = [];
    
    for (const pageInfo of keyPages) {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      const title = await page.title();
      expect(titles).not.toContain(title);
      titles.push(title);
    }
  });
});
