# Bundle Analysis Guide

**Date**: November 18, 2025  
**Bundle Analyzer**: @next/bundle-analyzer

## How to View Bundle Analysis

### 1. Open the HTML Reports

The bundle analyzer generates three reports:

```bash
# Client-side bundle (most important for performance)
open .next/analyze/client.html

# Server-side bundle (Node.js)
open .next/analyze/nodejs.html

# Edge runtime bundle
open .next/analyze/edge.html
```

### 2. What to Look For

#### In the Visual Report:

1. **Largest Chunks** (top of the treemap)
   - Identify which dependencies take up the most space
   - Look for opportunities to code-split or lazy-load

2. **Common Patterns to Find**:
   - **Large vendor chunks**: `node_modules` dependencies
   - **Duplicate code**: Same library imported multiple times
   - **Unused code**: Large libraries with only small parts used

3. **Key Metrics**:
   - **Total bundle size**: Should be < 500KB for initial load
   - **First Load JS**: Should be < 200KB
   - **Largest chunk**: Should be < 300KB

### 3. Common Issues & Fixes

#### Issue: Large `node_modules` Chunks

**Symptoms**:

- Large blocks in the treemap from `node_modules`
- Common culprits: `@mui/material`, `lucide-react`, `astronomy-engine`

**Fixes**:

```typescript
// Use dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  ssr: false,
});

// Use optimizePackageImports (already configured)
// In next.config.mjs:
experimental: {
  optimizePackageImports: ['lucide-react', '@mui/material'],
}
```

#### Issue: Duplicate Dependencies

**Symptoms**:

- Same library appears in multiple chunks
- Bundle size larger than expected

**Fixes**:

- Check for multiple versions of same package: `pnpm list <package-name>`
- Use webpack alias to force single version
- Ensure proper code splitting configuration

#### Issue: Large Route Bundles

**Symptoms**:

- Individual route chunks > 200KB
- Slow page transitions

**Fixes**:

- Add dynamic imports for heavy components
- Split vendor chunks from route chunks
- Use route-based code splitting

### 4. Priority Actions Based on Analysis

#### High Priority (Fix Immediately):

1. **Largest dependencies** (> 100KB)
   - Identify and lazy-load
   - Consider alternatives

2. **Duplicate code**
   - Consolidate versions
   - Use webpack deduplication

#### Medium Priority (Fix This Week):

3. **Route bundles** (> 200KB)
   - Add code splitting
   - Lazy-load heavy components

4. **Unused code**
   - Remove unused dependencies
   - Tree-shake unused exports

#### Low Priority (Fix This Month):

5. **Optimization opportunities**
   - Further code splitting
   - Replace heavy libraries with lighter alternatives

---

## Expected Bundle Sizes

### Client Bundle (client.html)

- **Initial Load**: < 200KB (gzipped)
- **Total**: < 500KB (gzipped)
- **Largest Chunk**: < 300KB

### Server Bundle (nodejs.html)

- Less critical for performance
- Should be optimized for build time
- Watch for large dependencies that could be lazy-loaded

### Edge Bundle (edge.html)

- Should be minimal
- Only includes edge-compatible code

---

## Analysis Checklist

- [ ] Open `client.html` and identify largest chunks
- [ ] Check for duplicate dependencies
- [ ] Identify routes with large bundles
- [ ] Look for unused code opportunities
- [ ] Document findings
- [ ] Create optimization plan
- [ ] Implement fixes
- [ ] Re-run analysis to verify improvements

---

## Quick Commands

```bash
# Generate bundle analysis
pnpm analyze

# View client bundle
open .next/analyze/client.html

# Check bundle sizes from build output
pnpm build | grep "First Load JS"

# Find duplicate dependencies
pnpm list | grep -E "(@mui|lucide-react|astronomy-engine)"
```

---

## Next Steps After Analysis

1. **Document Findings**: Create a list of largest dependencies
2. **Prioritize**: Focus on chunks > 100KB first
3. **Plan Fixes**: Determine which can be lazy-loaded vs. replaced
4. **Implement**: Start with highest impact items
5. **Verify**: Re-run analysis after changes

---

## Resources

- [Bundle Analyzer Docs](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Webpack Bundle Analysis](https://webpack.js.org/guides/code-splitting/)
- [Next.js Bundle Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
