# Build Speed Optimization Guide

## Current Status

- **Build Time**: ~3 minutes (slow)
- **Project Size**: 176 files in `src/app`, 1GB `node_modules`
- **Tree Shaking**: Enabled by default in Next.js, but can be improved

## Tree Shaking Status

✅ **Enabled**: Next.js automatically tree-shakes unused code
⚠️ **Can Improve**: Some large dependencies are imported statically

## Optimization Opportunities

### 1. Large Dependencies to Optimize

#### Heavy Libraries (should use dynamic imports):

- `@astrodraw/astrochart` (~500KB) - Only used in birth chart pages
- `@mui/material` (~300KB) - Only used in some admin pages
- `pdf-lib` (~200KB) - Only used in API routes for PDF generation
- `astronomy-engine` (~150KB) - Used in multiple places but could be optimized
- `lucide-react` - Large icon library, use named imports

#### Current Issues:

- `GrimoireLayout.tsx` imports all grimoire components statically
- `@mui/material` imported in admin pages statically
- `pdf-lib` imported in API routes (server-side, but still affects build)

### 2. Build Speed Improvements

#### A. Enable SWC Minification (already enabled in Next.js 15)

- ✅ Already using SWC compiler

#### B. Optimize Webpack Configuration

Add to `next.config.mjs`:

```javascript
webpack: (config, { isServer }) => {
  // ... existing config ...

  // Optimize chunk splitting
  if (!isServer) {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for large libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Separate chunk for MUI
          mui: {
            name: 'mui',
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          // Separate chunk for astrochart
          astrochart: {
            name: 'astrochart',
            test: /[\\/]node_modules[\\/]@astrodraw[\\/]/,
            chunks: 'all',
            priority: 30,
          },
        },
      },
    };
  }

  return config;
};
```

#### C. Use Dynamic Imports for Heavy Components

**GrimoireLayout.tsx** - Currently imports all components statically:

```typescript
// ❌ Current: All components loaded upfront
import Moon from './components/Moon';
import WheelOfTheYear from './components/WheelOfTheYear';
// ... 10+ more imports

// ✅ Better: Dynamic imports
const Moon = dynamic(() => import('./components/Moon'));
const WheelOfTheYear = dynamic(() => import('./components/WheelOfTheYear'));
```

**Admin Pages** - MUI components:

```typescript
// ❌ Current
import { Button, TextField } from '@mui/material';

// ✅ Better: Dynamic import or use lighter alternatives
const MUIButton = dynamic(() => import('@mui/material/Button'));
```

#### D. Optimize Icon Imports

**Current**: `lucide-react` imports entire library

```typescript
// ❌ Current
import { ChevronDownIcon, ChevronRightIcon, Menu, X } from 'lucide-react';

// ✅ Better: Use individual imports (tree-shakeable)
import ChevronDownIcon from 'lucide-react/dist/esm/icons/chevron-down';
```

#### E. Server-Side Only Imports

Move heavy server-only libraries to API routes with dynamic imports:

```typescript
// ✅ In API routes
export async function POST() {
  const { PDFDocument } = await import('pdf-lib');
  // ... use PDFDocument
}
```

### 3. TypeScript Optimization

**tsconfig.json** improvements:

```json
{
  "compilerOptions": {
    // ... existing ...
    "skipLibCheck": true, // ✅ Already enabled
    "incremental": true, // ✅ Already enabled

    // Add these:
    "isolatedModules": true, // ✅ Already enabled
    "moduleResolution": "bundler" // ✅ Already enabled
  }
}
```

### 4. Next.js Configuration Optimizations

Add to `next.config.mjs`:

```javascript
const nextConfig = {
  // ... existing config ...

  // Experimental features for faster builds
  experimental: {
    // Enable SWC minification (default in Next.js 15)
    swcMinify: true,

    // Optimize package imports
    optimizePackageImports: [
      '@mui/material',
      'lucide-react',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
  },

  // Reduce build output
  output: 'standalone', // For production deployments

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};
```

### 5. Dependency Optimization

#### Consider Alternatives:

- **MUI** → Consider replacing with lighter alternatives (Radix UI, shadcn/ui)
- **lucide-react** → Use `lucide-react/dist/esm/icons/` for tree-shaking
- **pdf-lib** → Only load in API routes that need it

#### Bundle Analysis:

```bash
# Install bundle analyzer
yarn add -D @next/bundle-analyzer

# Add to next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true yarn build
```

### 6. Code Splitting Improvements

#### Route-Based Splitting:

- ✅ Already using dynamic imports on homepage
- ⚠️ Need to add to grimoire pages
- ⚠️ Need to add to admin pages

#### Component-Based Splitting:

```typescript
// Heavy components should be dynamically imported
const BirthChart = dynamic(() => import('@/components/BirthChart'), {
  loading: () => <Skeleton />,
  ssr: false, // If component doesn't need SSR
});
```

## Implementation Priority

### High Impact (Do First):

1. ✅ Dynamic imports for GrimoireLayout components
2. ✅ Optimize lucide-react imports
3. ✅ Add webpack chunk splitting
4. ✅ Enable optimizePackageImports

### Medium Impact:

5. Dynamic imports for MUI in admin pages
6. Move pdf-lib to dynamic imports in API routes
7. Bundle analysis to identify other large chunks

### Low Impact:

8. Consider replacing MUI with lighter alternatives
9. Further optimize icon usage

## Expected Results

- **Build Time**: 3 min → ~1.5-2 min (50% improvement)
- **Bundle Size**: Reduced by 30-40% with proper code splitting
- **Initial Load**: Faster with better code splitting

## Monitoring

After implementing:

1. Run `yarn build` and measure time
2. Use bundle analyzer to verify improvements
3. Check Lighthouse scores for bundle size
4. Monitor production build times in CI/CD
