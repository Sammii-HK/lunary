# AstronomyContext Defensive Programming Guide

## Overview

The AstronomyContext has multiple layers of defensive programming to ensure the app remains stable even when things go wrong.

## Architecture

### Layer 1: Provider Setup (Should Never Fail)

The `AstronomyContextProvider` is set up in the root layout:

```
app/layout.tsx
  └─ AstronomyProviderWrapper
      └─ Your app components
```

**Location**: `src/app/layout.tsx`

### Layer 2: Safe Hook with Fallback (Emergency Only)

The `useAstronomyContext()` hook includes a fallback that:

- ✅ Returns safe default values
- ✅ Logs detailed error information
- ✅ Sends alerts to monitoring systems (Sentry, PostHog)
- ✅ Shows prominent warnings in development
- ✅ Keeps the app running

**Location**: `src/context/AstronomyContext.tsx`

### Layer 3: Error Boundary (Catch All Errors)

Wrap astronomy-dependent components in `AstronomyErrorBoundary`:

```tsx
import { AstronomyErrorBoundary } from '@/components/AstronomyErrorBoundary';

<AstronomyErrorBoundary fallback={<div>Astronomy data unavailable</div>}>
  <YourAstronomyComponent />
</AstronomyErrorBoundary>;
```

### Layer 4: Safe Hook with Retry (Recommended)

For critical components, use `useSafeAstronomyContext()`:

```tsx
import { useSafeAstronomyContext } from '@/hooks/useSafeAstronomyContext';

function MyComponent() {
  const astronomy = useSafeAstronomyContext();

  if (!astronomy.isReady) {
    return <LoadingSpinner />;
  }

  if (astronomy.isUsingFallback) {
    return <FallbackUI />;
  }

  // Safe to use astronomy data
  return <div>{astronomy.currentMoonPhase}</div>;
}
```

## Monitoring & Debugging

### Development Mode

When the fallback is triggered in development, you'll see:

```
🚨 ASTRONOMY CONTEXT ERROR: Component is not wrapped in AstronomyContextProvider!
📍 Location: /your/route
⏰ Time: 2024-01-27T...
💡 Fix: Ensure this component is rendered inside <AstronomyContextProvider>
📋 Component stack trace: ...
```

### Production Mode

Errors are logged to:

1. **Browser Console** (minimal info)
2. **Sentry** (if configured)
3. **PostHog** (analytics event)

### How to Monitor

1. Check Sentry for `astronomy_context_fallback_used` warnings
2. Check PostHog for fallback usage analytics
3. Review browser console in production for silent warnings

## Best Practices

### ✅ DO:

- Use `AstronomyErrorBoundary` for optional astronomy features
- Use `useSafeAstronomyContext()` when astronomy data is critical
- Check `isReady` before rendering astronomy-dependent UI
- Provide fallback UI for users without astronomy data

### ❌ DON'T:

- Rely on the fallback for normal operation (it should be rare!)
- Ignore warnings in development mode
- Forget to wrap new astronomy components in error boundaries

## Example: Robust Component

```tsx
'use client';

import { AstronomyErrorBoundary } from '@/components/AstronomyErrorBoundary';
import {
  useSafeAstronomyContext,
  hasAstronomyData,
} from '@/hooks/useSafeAstronomyContext';

function MoonPhaseDisplayInner() {
  const astronomy = useSafeAstronomyContext();

  // Loading state
  if (!astronomy.isReady) {
    return (
      <div className='animate-pulse'>
        <div className='h-4 bg-gray-200 rounded w-24'></div>
      </div>
    );
  }

  // Fallback state (context unavailable)
  if (astronomy.isUsingFallback || !hasAstronomyData(astronomy)) {
    return <div className='text-gray-400'>Moon phase unavailable</div>;
  }

  // Normal rendering
  return (
    <div>
      <span>{astronomy.symbol}</span>
      <span>{astronomy.currentMoonPhase}</span>
    </div>
  );
}

export function MoonPhaseDisplay() {
  return (
    <AstronomyErrorBoundary
      fallback={<div className='text-gray-400'>Moon phase unavailable</div>}
    >
      <MoonPhaseDisplayInner />
    </AstronomyErrorBoundary>
  );
}
```

## Troubleshooting

### Issue: Fallback is being used frequently

**Cause**: Component is rendering before provider is mounted
**Fix**:

1. Check that `AstronomyProviderWrapper` is in `app/layout.tsx`
2. Use `useSafeAstronomyContext()` instead of `useAstronomyContext()`
3. Check for race conditions in component mounting

### Issue: Development warnings are annoying

**Cause**: This is intentional! Fix the root cause instead
**Fix**: Wrap your component properly or use error boundaries

### Issue: Astronomy data is empty but no errors

**Cause**: API might be failing silently
**Fix**: Check Network tab for `/api/cosmic/global` requests

## Testing

To test the fallback behavior:

```tsx
// Temporarily remove provider to test fallback
import { useAstronomyContext } from '@/context/AstronomyContext';

function TestComponent() {
  const astronomy = useAstronomyContext(); // Will trigger fallback
  console.log(
    'Using fallback:',
    astronomy.currentAstrologicalChart.length === 0,
  );
  return null;
}
```

## Summary

The defensive layers ensure:

1. **Happy path**: Provider works, data flows normally
2. **Degraded mode**: Fallback kicks in, app continues with reduced features
3. **Monitoring**: We know when fallbacks are used so we can fix root causes
4. **Development feedback**: Loud warnings help developers fix issues quickly

The goal: **Never crash, always know when something's wrong, fix it before users notice.**
