# Lunary Design System Audit

## Brand Colors (Tailwind Config)

### Primary - Nebula Violet (#8458D8)

- Classes: `text-lunary-primary`, `bg-lunary-primary`, `border-lunary-primary`
- Shades: `lunary-primary-50` through `lunary-primary-950`
- Use for: Main brand actions, primary CTAs

### Secondary - Comet Trail (#7B7BE8)

- Classes: `text-lunary-secondary`, `bg-lunary-secondary`
- Shades: `lunary-secondary-50` through `lunary-secondary-950`
- Use for: Secondary actions, supporting elements

### Accent - Galaxy Haze (#C77DFF)

- Classes: `text-lunary-accent`, `bg-lunary-accent`
- Use for: Highlights, special features

### Success - Aurora Green (#6B9B7A)

- Classes: `text-lunary-success`, `bg-lunary-success`
- Shades: `lunary-success-50` through `lunary-success-950`
- Use for: Positive metrics, growth, good status

### Error - Solar Flare (#D06060)

- Classes: `text-lunary-error`, `bg-lunary-error`
- Shades: `lunary-error-50` through `lunary-error-950`
- Use for: Critical issues, errors, negative metrics

### Warning (Missing dedicated color)

- Can use: `lunary-accent` or `lunary-highlight` for warnings
- Alternative: Use zinc/orange tones

### Backgrounds

- Main: `lunary-bg` (#0A0A0A - Event Horizon)
- Deep: `lunary-bg-deep` (#050505 - Singularity)

### Text

- Primary: `lunary-text` (#FFFFFF - Stardust)

## Icon Patterns (Lucide React)

### Current Imports in Analytics

```typescript
import {
  Activity,
  Bell,
  CalendarRange,
  Download,
  Loader2,
  Sparkles,
  Target,
} from 'lucide-react';
```

### Icon Sizing Patterns

- Card header: `h-5 w-5`
- Large metrics: `h-8 w-8`
- Small badges: `h-4 w-4`
- Inline text: `h-4 w-4`

### Icon Colors

- Success: `text-lunary-success-300` (lighter for contrast on dark bg)
- Primary: `text-lunary-primary-300`
- Secondary: `text-lunary-secondary-300`
- Accent: `text-lunary-accent-300`
- Error: `text-lunary-error-300`

## Available UI Components

### Core Components

- **Card**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- **Button**: `Button` with variants
- **Badge**: `Badge` with variants
- **Tabs**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Input**: Form inputs
- **Select**: Dropdown selects
- **Modal**: Modals/dialogs

### Admin Components (Already Created)

- **MiniStat**: Small metric cards with icon, label, value
- **InsightCard**: Insight display with type-based styling
- **StatSection**: Section wrapper with consistent styling
- **MetricTable**: Reusable table with auto-formatting
- **MetricsCard**: Metric card with trend indicators
- **ConversionFunnel**: Funnel visualization

### No Alert Component

- Use Card with colored borders/backgrounds instead
- Pattern: `<Card className="border-lunary-error-700 bg-lunary-error-950/40">`

## Typography & Spacing

### Font Sizes

- Body: `0.875rem` (14px) / `0.9rem` (14.4px) on desktop
- Headings: Use font-semibold or font-medium
- Numbers: Use font-bold for large metrics

### Common Patterns

```tsx
// Section titles
<h2 className="text-sm font-medium text-zinc-200">Section Title</h2>
<p className="text-xs text-zinc-500">Description</p>

// Large metrics
<div className="text-3xl font-bold">{value}</div>
<div className="text-sm text-muted-foreground">Label</div>

// Trend indicators
<span className="text-sm text-lunary-success">+8.3% vs last month</span>
```

## Color Usage Guidelines

### For Status/Health Indicators

- **Excellent/High**: `lunary-success` (green)
- **Good/Normal**: `lunary-primary` (violet)
- **Warning/Medium**: `lunary-accent` (purple) or zinc-yellow
- **Critical/Low**: `lunary-error` (red)

### For Backgrounds

- Main sections: `bg-zinc-950/40` with `border-zinc-800/60`
- Highlighted sections: `bg-lunary-primary-950/20`
- Warning sections: `bg-lunary-accent-950/20`
- Error sections: `bg-lunary-error-950/40`

### For Text

- Primary: `text-white` or `text-zinc-100`
- Secondary: `text-zinc-300`
- Muted: `text-zinc-400` or `text-zinc-500`
- Disabled: `text-zinc-600`

## Recommended Icon Mapping

### Status & Health

- `CheckCircle` - Success, good status (with `text-lunary-success-300`)
- `AlertCircle` - Warning, needs attention (with `text-lunary-accent-300`)
- `XCircle` - Error, critical (with `text-lunary-error-300`)
- `Info` - Informational (with `text-lunary-secondary-300`)

### Metrics

- `TrendingUp` - Growth, positive trend (with `text-lunary-success-300`)
- `TrendingDown` - Decline (with `text-lunary-error-300`)
- `Activity` - General activity
- `BarChart3` - Charts, analytics
- `Users` - User metrics
- `DollarSign` - Revenue
- `RefreshCw` - Retention
- `Target` - Goals
- `Sparkles` - Features

### Actions

- `Download` - Export
- `Settings` - Configuration
- `Filter` - Filtering
- `Search` - Search
- `Eye` - Visibility toggle

## Design System Summary

**Color Philosophy:** Cosmic/space theme with purple/violet as primary
**Typography:** Clean, modern sans-serif
**Components:** shadcn/ui based with custom Lunary styling
**Icons:** Lucide React throughout (NO emojis)
**Layout:** Dark theme with subtle borders and soft backgrounds
