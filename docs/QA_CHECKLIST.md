# Pre-Launch Quality Assurance Checklist

This document outlines the comprehensive QA checklist that should be run before launching any major feature or the application itself.

## Quick Start

```bash
# Run basic QA checks against localhost (requires dev server running)
pnpm qa:check

# Run comprehensive E2E QA tests (requires dev server running)
pnpm qa:e2e

# Run QA checks against production
pnpm qa:check:prod

# Run E2E tests against production
pnpm qa:e2e:prod

# Run with Lighthouse CLI (requires global installation)
pnpm qa:check:lighthouse
```

## Test Types

### 1. Basic QA Script (`qa:check`)
Fast static analysis that checks:
- File structure and configuration
- Metadata presence in code
- Structured data components
- robots.txt and sitemap.ts configuration

**Use when**: Quick validation without running a server

### 2. E2E QA Tests (`qa:e2e`)
Comprehensive browser-based tests that validate:
- Actual metadata in rendered HTML
- Structured data validity
- Mobile responsiveness
- Accessibility
- Performance metrics
- SEO best practices

**Use when**: Full validation with a running server (recommended)

## Checklist Items

### 1. Lighthouse Score > 90 ✅

**Requirement**: All Lighthouse scores (Performance, Accessibility, Best Practices, SEO) must be ≥ 90.

**How to Test**:
- **Automated**: Run `pnpm qa:check:lighthouse` (requires Lighthouse CLI installed globally)
- **Manual**: 
  - Open Chrome DevTools → Lighthouse tab
  - Select "Mobile" device
  - Run audit on key pages:
    - Homepage (`/`)
    - Pricing (`/pricing`)
    - Blog (`/blog`)
    - Shop (`/shop`)
    - Grimoire (`/grimoire`)

**Key Metrics**:
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

**Common Issues to Fix**:
- Large images (optimize with Next.js Image component)
- Unused JavaScript (code splitting, dynamic imports)
- Render-blocking resources (defer non-critical CSS/JS)
- Missing alt text on images
- Poor color contrast
- Missing meta tags

### 2. Mobile-First Checks ✅

**Requirement**: Application must be fully responsive and mobile-optimized.

**How to Test**:
- **Automated**: Run `pnpm qa:check` (checks viewport config and responsive classes)
- **Manual**:
  - Open Chrome DevTools → Toggle device toolbar
  - Test on multiple devices:
    - iPhone SE (375px)
    - iPhone 12 Pro (390px)
    - Pixel 5 (393px)
    - iPad (768px)
    - Desktop (1920px)
  - Verify:
    - Text is readable without zooming
    - Touch targets are ≥ 44x44px
    - No horizontal scrolling
    - Navigation is accessible
    - Forms are usable

**Key Checks**:
- ✅ Viewport meta tag configured (`device-width`, `initial-scale=1`)
- ✅ Tailwind mobile-first breakpoints used (`sm:`, `md:`, `lg:`)
- ✅ Responsive images (Next.js Image component)
- ✅ Touch-friendly UI elements
- ✅ Mobile navigation menu

### 3. Metadata Validated ✅

**Requirement**: All pages must have complete and valid metadata.

**How to Test**:
- **Automated**: Run `pnpm qa:check` (validates metadata structure)
- **Manual**:
  - Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
  - Use [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
  - Check HTML source for:
    - `<title>` tag
    - `<meta name="description">`
    - Open Graph tags (`og:title`, `og:description`, `og:image`)
    - Twitter Card tags
    - Canonical URL

**Required Metadata**:
- ✅ Page title (unique per page)
- ✅ Meta description (150-160 characters)
- ✅ Open Graph image (1200x630px)
- ✅ Canonical URL
- ✅ Keywords (optional but recommended)
- ✅ PWA manifest

**Key Pages to Check**:
- Homepage
- Pricing
- Blog posts
- Shop products
- Grimoire sections

### 4. Structured Data Tested ✅

**Requirement**: Structured data (JSON-LD) must be valid and complete.

**How to Test**:
- **Automated**: Run `pnpm qa:check` (validates structured data components)
- **Manual**:
  - Use [Google Rich Results Test](https://search.google.com/test/rich-results)
  - Use [Schema.org Validator](https://validator.schema.org/)
  - Check HTML source for `<script type="application/ld+json">` tags

**Required Structured Data**:
- ✅ Organization schema (homepage)
- ✅ WebApplication schema (homepage)
- ✅ FAQPage schema (where applicable)
- ✅ Article schema (blog posts)
- ✅ Product schema (shop items)

**Validation**:
- JSON-LD syntax must be valid
- Schema.org types must be correct
- Required properties must be present

### 5. Indexing Tested ✅

**Requirement**: Search engines must be able to crawl and index the site.

**How to Test**:
- **Automated**: Run `pnpm qa:check` (validates robots.txt and sitemap)
- **Manual**:
  - Verify `robots.txt` is accessible: `https://lunary.app/robots.txt`
  - Verify `sitemap.xml` is accessible: `https://lunary.app/sitemap.xml`
  - Use [Google Search Console](https://search.google.com/search-console)
  - Submit sitemap to Google Search Console
  - Check for crawl errors

**Required Files**:
- ✅ `robots.txt` (properly configured)
- ✅ `sitemap.xml` (includes all public pages)
- ✅ Proper `disallow` rules for admin/API routes
- ✅ Sitemap reference in robots.txt

**Key Checks**:
- Admin routes are disallowed (`/admin/`, `/api/`)
- Auth routes are disallowed (`/auth/`)
- Test routes are disallowed (`/test-*`, `/pwa-*`)
- Public pages are allowed
- Sitemap includes all important pages
- Sitemap has proper priorities and change frequencies

## Running the Full Checklist

### Prerequisites

1. **For local testing**: Start the dev server
   ```bash
   pnpm dev
   ```

2. **For Lighthouse CLI** (optional):
   ```bash
   npm install -g lighthouse
   ```

### Execution

```bash
# Basic checks (no Lighthouse, no server needed)
pnpm qa:check

# E2E tests (requires server running)
pnpm qa:e2e

# Production basic checks
pnpm qa:check:prod

# Production E2E tests
pnpm qa:e2e:prod

# With Lighthouse (requires CLI)
pnpm qa:check:lighthouse
```

### Recommended Workflow

1. **During Development**:
   ```bash
   pnpm dev  # Terminal 1
   pnpm qa:e2e  # Terminal 2
   ```

2. **Before Commit**:
   ```bash
   pnpm qa:check  # Quick validation
   ```

3. **Pre-Launch**:
   ```bash
   pnpm qa:e2e:prod  # Full validation on production
   pnpm qa:check:lighthouse  # Performance validation
   ```

### Expected Output

The script will output:
- ✅ Passed checks
- ❌ Failed checks with details
- Summary with total passed/failed
- Exit code 0 if all passed, 1 if any failed

## Manual Testing Checklist

In addition to automated checks, perform manual testing:

### Performance
- [ ] Page loads in < 3 seconds on 3G
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth scrolling
- [ ] Fast navigation between pages

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text on all images

### Mobile Experience
- [ ] No horizontal scroll
- [ ] Touch targets are large enough
- [ ] Forms are easy to fill
- [ ] Navigation is thumb-friendly
- [ ] Text is readable without zoom

### SEO
- [ ] Unique titles and descriptions
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Internal linking structure
- [ ] Fast page speed
- [ ] Mobile-friendly

## Continuous Monitoring

After launch, monitor:
- Google Search Console for indexing issues
- PageSpeed Insights for performance
- Lighthouse CI in CI/CD pipeline
- Real User Monitoring (RUM) tools

## Troubleshooting

### Lighthouse CLI Not Found
```bash
npm install -g lighthouse
# or
pnpm add -g lighthouse
```

### Server Not Running
```bash
# Start dev server first
pnpm dev
# Then in another terminal
pnpm qa:check
```

### Failed Checks
Review the detailed output and fix issues:
1. Check the specific error message
2. Review the file mentioned
3. Fix the issue
4. Re-run the check

## Integration with CI/CD

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Build
  run: pnpm build

- name: Start server
  run: |
    pnpm start &
    sleep 10

- name: Run QA Checks
  run: pnpm qa:e2e

- name: Run Lighthouse (optional)
  run: pnpm qa:check:lighthouse
  continue-on-error: true  # Lighthouse CLI may not be available
```

### Pre-commit Hook (Optional)

Add to `.husky/pre-commit`:
```bash
#!/bin/sh
pnpm qa:check
```

## Additional Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web.dev Best Practices](https://web.dev/learn/)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
