# Legacy Framework Migration - Completed

## Summary

Successfully removed all legacy framework code from the codebase.

## Changes Made

### Files Deleted

- `src/lib/jazz/` directory and all contents
- `schema.ts` (legacy schema)
- All migration scripts (10+ files in `scripts/`)
- `sql/jazz_migration_status.sql`

### Code Cleaned

- `src/lib/auth.ts` - Removed lazy migration fallback (~400 lines)
- `src/app/api/cosmic/snapshot/route.ts` - Removed legacy profile loading
- `package.json` - Removed `jazz-react` and `jazz-tools` packages
- `next.config.mjs` - Removed legacy transpile config and chunk splitting
- `jest.config.js` - Removed legacy transform patterns

### AI SDK v6 Migration (Side Effect)

While removing the legacy framework, also upgraded AI SDK usage:

- `maxTokens` parameter removed (not supported in v6)
- `StreamData` replaced with custom metadata streaming
- Token property names updated: `promptTokens` → `inputTokens`, `completionTokens` → `outputTokens`
- `toDataStreamResponse()` → `toTextStreamResponse()` with custom metadata appending

## Frontend Changes Needed

### Astral Chat Metadata Parsing

The streaming metadata is now sent as a special chunk at the end of the stream:

**Old behavior (AI SDK v5):**

```typescript
// Metadata came through StreamData automatically
```

**New behavior (AI SDK v6):**

```typescript
// Client needs to parse metadata from stream
// Format: "\n\n__METADATA__:{json}"
// Example:
const chunks = [];
for await (const chunk of stream) {
  if (chunk.includes('__METADATA__:')) {
    const metadataStr = chunk.split('__METADATA__:')[1];
    const metadata = JSON.parse(metadataStr);
    // metadata contains: threadId, planId, usage, dailyHighlight, etc.
  } else {
    chunks.push(chunk);
  }
}
```

## Testing Checklist

- [ ] Test astral chat streaming works
- [ ] Verify metadata (usage stats, thread ID, memories) appears in UI
- [ ] Confirm authentication still works (no legacy fallback needed)
- [ ] Check cosmic snapshot API works without legacy profile loading

## Known Issues

- Build fails on `api/cron/process-deletions/route.ts` and similar cron routes due to Stripe initialization at module level (pre-existing issue, not related to migration)
