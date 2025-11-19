# Quality Assurance Checklist Implementation

This directory contains the QA checklist implementation for pre-launch validation.

## Files

- `qa-checklist.ts` - Static analysis script that checks code structure and configuration
- `../e2e/qa-checklist.spec.ts` - E2E tests using Playwright for comprehensive validation

## Usage

### Quick Validation (No Server Required)
```bash
pnpm qa:check
```

### Full E2E Validation (Requires Server)
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm qa:e2e
```

### Production Validation
```bash
pnpm qa:e2e:prod
```

## What Gets Checked

### ✅ Lighthouse Score > 90
- Performance, Accessibility, Best Practices, SEO
- Requires Lighthouse CLI for automated testing
- Can be validated manually via Chrome DevTools

### ✅ Mobile-First Checks
- Viewport configuration
- Responsive CSS classes
- Mobile viewport testing (375px, 390px, etc.)
- Touch target sizes
- No horizontal scrolling

### ✅ Metadata Validated
- Title tags
- Meta descriptions
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- PWA manifest

### ✅ Structured Data Tested
- JSON-LD syntax validation
- Schema.org compliance
- Organization schema
- WebApplication schema
- FAQ schema (where applicable)

### ✅ Indexing Tested
- robots.txt accessibility and configuration
- sitemap.xml accessibility and completeness
- Proper disallow rules
- Sitemap includes all public pages

## Exit Codes

- `0` - All checks passed ✅
- `1` - One or more checks failed ❌

## Integration

See `../docs/QA_CHECKLIST.md` for complete documentation including:
- Detailed checklist items
- Manual testing procedures
- CI/CD integration
- Troubleshooting guide
