# Local Speed Testing Guide

## Quick Methods to Test Speed Locally

### Method 1: Chrome DevTools Lighthouse (Easiest)

1. **Open your site:** `http://localhost:3001` (or your dev port)
2. **Open DevTools:** Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. **Go to Lighthouse tab**
4. **Select:**
   - ✅ Performance
   - ✅ Desktop or Mobile
5. **Click "Analyze page load"**
6. **Review scores:**
   - Performance: 90+ is good
   - Accessibility: 90+ is good
   - Best Practices: 90+ is good
   - SEO: 90+ is good

**What to look for:**

- Performance score (aim for 90+)
- Opportunities (things to fix)
- Diagnostics (warnings)

### Method 2: Next.js Built-in Analytics

Next.js has built-in performance monitoring:

```bash
# Run dev server with analytics
ANALYZE=true yarn dev
```

This will show bundle sizes and performance metrics in the terminal.

### Method 3: Web Vitals Extension

1. Install Chrome extension: "Web Vitals"
2. Visit your local site
3. See real-time Core Web Vitals:
   - **LCP** (Largest Contentful Paint) - should be < 2.5s
   - **FID** (First Input Delay) - should be < 100ms
   - **CLS** (Cumulative Layout Shift) - should be < 0.1

### Method 4: Network Tab Analysis

1. Open DevTools → Network tab
2. Reload page (`Cmd+R` / `Ctrl+R`)
3. Check:
   - **Load time** (should be < 3s)
   - **Total size** (should be < 2MB)
   - **Number of requests** (fewer is better)
   - **Waterfall** (see what loads first)

### Method 5: Performance Tab (Detailed)

1. Open DevTools → Performance tab
2. Click Record (circle icon)
3. Reload page
4. Stop recording
5. Analyze:
   - **Main thread** activity
   - **Long tasks** (should be < 50ms)
   - **Paint times**
   - **JavaScript execution time**

## Common Speed Issues & Fixes

### Issue 1: Large Images

**Check:**

- Network tab → Filter by "Img"
- Look for large file sizes (> 500KB)

**Fix:**

- Use Next.js `<Image>` component (already using!)
- Convert to WebP format
- Use `loading="lazy"` for below-fold images

### Issue 2: Large JavaScript Bundles

**Check:**

- Lighthouse → "Reduce JavaScript execution time"
- Network tab → Filter by "JS"

**Fix:**

- Code splitting (Next.js does this automatically)
- Remove unused dependencies
- Use dynamic imports for heavy components

### Issue 3: Render-Blocking Resources

**Check:**

- Lighthouse → "Eliminate render-blocking resources"

**Fix:**

- Defer non-critical CSS
- Use `next/font` for fonts (already using!)
- Inline critical CSS

### Issue 4: Unused CSS

**Check:**

- Lighthouse → "Remove unused CSS"

**Fix:**

- Use Tailwind's purge (already configured!)
- Remove unused styles

## Quick Speed Test Checklist

Run these tests on your local site:

- [ ] **Lighthouse Performance:** Score > 90
- [ ] **First Contentful Paint:** < 1.8s
- [ ] **Largest Contentful Paint:** < 2.5s
- [ ] **Total Blocking Time:** < 200ms
- [ ] **Cumulative Layout Shift:** < 0.1
- [ ] **Speed Index:** < 3.4s
- [ ] **Time to Interactive:** < 3.8s

## Testing Different Pages

Test these key pages locally:

1. **Homepage:** `/`
2. **Grimoire:** `/grimoire/moon`
3. **Blog:** `/blog/week/2025-01-06`
4. **Shop:** `/shop`
5. **Pricing:** `/pricing`

## Production Speed Testing

For production, use:

- **PageSpeed Insights:** https://pagespeed.web.dev/
- **WebPageTest:** https://www.webpagetest.org/
- **GTmetrix:** https://gtmetrix.com/

## Next.js Performance Features (Already Using!)

✅ **Image Optimization:** Using `next/image`
✅ **Font Optimization:** Using `next/font`
✅ **Code Splitting:** Automatic
✅ **CSS Optimization:** Tailwind purge
✅ **Static Generation:** Using `generateStaticParams`

## Quick Commands

```bash
# Run with bundle analyzer
ANALYZE=true yarn dev

# Build and analyze
yarn build
yarn start

# Check bundle sizes
yarn build | grep "First Load JS"
```

## What to Focus On

1. **Images:** Biggest impact, easiest to fix
2. **JavaScript:** Code splitting, lazy loading
3. **CSS:** Remove unused styles
4. **Fonts:** Already optimized with `next/font`

## Expected Scores

**Local Development:**

- Performance: 70-85 (normal, dev mode is slower)
- Production: 90+ (should be excellent)

**Note:** Local dev will always be slower than production because:

- No CDN
- No caching
- Development mode overhead
- Source maps enabled

**For accurate testing, test production builds:**

```bash
yarn build
yarn start
# Then test http://localhost:3000
```
