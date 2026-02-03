# Claude Code Instructions

## Tech Stack

- **Framework**: Next.js 15 with App Router (not Pages Router)
- **Styling**: Tailwind CSS (not CSS modules)
- **Database**: Prisma with PostgreSQL (Neon)
- **Auth**: better-auth
- **Payments**: Stripe
- **Email**: Resend + React Email
- **Analytics**: PostHog
- **Hosting**: Vercel

## Use Existing Dependencies

Before adding a new package, check if we already have a solution:

| Need          | Use                        | Don't use            |
| ------------- | -------------------------- | -------------------- |
| Dates         | `date-fns`, `@date-fns/tz` | moment               |
| Icons         | `lucide-react`             | other icon libs      |
| Class merging | `cn()` from `@/lib/utils`  | manual concatenation |
| Validation    | `zod`                      | yup, joi             |
| AI/LLM        | `ai` (Vercel AI SDK)       | direct API calls     |

## Git Workflow

- **Branch naming**: `feat/`, `fix/`, `chore/`, `refactor/`
- **Commits**: Imperative mood, concise ("Add X" not "Added X")
- **PRs**: Target `main`, include summary and test plan

## Domain: Astrology & Lunar Content

### Key Concepts

- **Planets**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- **Aspects**: Conjunction, sextile, square, trine, opposition (with orbs)
- **Moon phases**: New, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, waning crescent
- **Retrogrades**: Planets appearing to move backward (Mercury most common)
- **Void of Course (VOC)**: Moon between last aspect and next sign entry

### Content Tiers

- **Blog**: Full content, SEO-optimized, publicly accessible
- **Substack Free**: Teaser content with hooks, value ladder to paid
- **Substack Paid**: Full content + rituals, journal prompts, exclusive insights

## Performance

- Prefer Server Components - only use `'use client'` when needed (interactivity, hooks)
- Use Next.js `<Image>` for optimized images
- Lazy load below-fold components with `dynamic()`
- Avoid fetching in client components when server fetch works

## Code Quality Principles

### DRY & Reusability

- **Always check for existing components** before creating new ones - search `src/components/` first
- **Extract repeated logic** into reusable utilities in `src/utils/` or `src/lib/`
- **Reuse existing patterns** - match the style and approach of similar features in the codebase
- If you write similar code twice, refactor it into a shared function or component

### Clean Architecture

- **Keep components focused** - one responsibility per component
- **Separate concerns**: UI components vs data fetching vs business logic
- **Use composition** over inheritance - prefer smaller, composable components
- **Colocate related code** - keep tests, types, and utilities near their usage

### Before Writing Code

1. Search for existing components/utilities that solve the problem
2. Check how similar features are implemented elsewhere
3. Identify opportunities to extend existing code rather than duplicating
4. Plan the minimal changes needed - avoid over-engineering

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components (check here first!)
│   ├── blog/      # Blog-specific components
│   ├── ui/        # Generic UI primitives
│   └── ...
├── lib/           # Core utilities and configurations
├── utils/         # Helper functions and business logic
└── types/         # TypeScript type definitions
```

## Code Style

- **TypeScript**: Use proper types, avoid `any`
- **Components**: Prefer function components with explicit prop types
- **Exports**: Use named exports, barrel files (`index.ts`) for component directories
- **Styling**: Tailwind CSS, use `cn()` for conditional classes
- **Data handling**: Use optional chaining (`?.`) and nullish coalescing (`?? []`) for safety

## Testing

- Unit tests go in `__tests__/unit/`
- E2E tests go in `e2e/`
- Test new business logic, especially calculations and data transformations
- Use descriptive test names that explain the expected behavior

## Common Patterns

### Component with variants

```tsx
interface Props {
  variant?: 'full' | 'compact' | 'teaser';
}
export function Component({ variant = 'full' }: Props) { ... }
```

### Safe data access (for legacy/optional data)

```tsx
const items = data.items || [];
const value = data.nested?.deeply?.value ?? 'default';
```

### Deterministic randomness (for consistent content)

```tsx
function simpleHash(str: string): number { ... }
const seed = simpleHash(`${type}-${id}-${date}`);
```

## Before Committing

1. Run `/lint` or `/fix` to clean up code style
2. Run `/typecheck` to catch type errors
3. Run `/test` for any changed logic
4. Use `/commit-clean` for the full workflow

## Security: SSRF Prevention

**Never use user-provided or dynamic base URLs in fetch requests.**

```tsx
// BAD - SSRF vulnerability (CodeQL: js/request-forgery)
const baseUrl = getBaseUrl(); // or from headers, env, etc.
fetch(`${baseUrl}/api/admin/analytics`);

// GOOD - Use relative URLs for internal API calls
fetch(`/api/admin/analytics`);

// GOOD - If absolute URL needed, use a constant
const API_BASE = process.env.NEXT_PUBLIC_APP_URL;
fetch(`${API_BASE}/api/admin/analytics`);
```

**Rules:**

- Use relative URLs (`/api/...`) for same-origin requests
- For server-side fetches needing absolute URLs, use hardcoded env vars, not derived values
- Never incorporate request headers (like `host` or `origin`) into fetch URLs
- Validate/whitelist any external URLs before fetching

## API Routes

```
src/app/api/
├── auth/          # better-auth endpoints
├── cron/          # Scheduled jobs (daily posts, etc.)
├── stripe/        # Webhooks and checkout
└── [feature]/     # Feature-specific endpoints
```

- Use Route Handlers (not API routes from Pages Router)
- Return `NextResponse.json()` for JSON responses
- Handle errors with appropriate status codes
- Validate input with Zod schemas

## Multi-Agent Workflow

When working alongside other agents:

- **Only commit your own work** - check `git diff` and only stage files you modified
- Don't commit unrelated changes that appear in the working tree
- If unsure whether a change is yours, ask before committing
- Use specific `git add <file>` instead of `git add .` or `git add -A`

## Don't

- Create new components without checking if one exists
- Duplicate logic that could be shared
- Add features beyond what was requested
- Skip reading existing code before modifying it
- Leave dead code or commented-out blocks
- Add new dependencies without checking existing ones
- Use `'use client'` unnecessarily
- Fetch data in client components when server works
- Hardcode values that should be configurable
- Skip type safety with `any` or `as` casts
- Commit changes you didn't make (multi-agent environment)
