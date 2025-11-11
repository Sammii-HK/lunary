# A/B Testing Analytics & AI Insights

## Overview

The A/B Testing Analytics page (`/admin/ab-testing`) provides:

1. **Statistical Analysis**: Conversion rates, confidence levels, significance testing
2. **AI-Powered Insights**: Actionable recommendations using OpenAI
3. **Visual Comparison**: Side-by-side variant performance
4. **Time Range Filtering**: 7, 30, or 90 days

## Features

### Statistical Analysis

- **Conversion Rates**: Calculated per variant
- **Confidence Level**: Statistical significance (95%+ = significant)
- **Improvement**: Percentage difference between variants
- **Recommendations**: Data-driven suggestions

### AI Insights

- **Powered by OpenAI GPT-4o-mini**: Analyzes test results
- **Actionable Recommendations**: What to do next
- **Context-Aware**: Understands your app's conversion goals
- **Fallback**: Works without API key (basic insights)

## Setup

### 1. Install OpenAI SDK

```bash
npm install openai
```

### 2. Add API Key (Optional)

```env
OPENAI_API_KEY=sk-...
```

**Note**: AI insights work without API key (uses basic analysis), but AI-powered insights require the key.

## How It Works

### Data Collection

- A/B test variants are tracked in `conversion_events` metadata
- Events include: `app_opened`, `pricing_page_viewed`, `trial_started`, `subscription_started`
- Metadata fields: `abTest`, `abVariant`

### Analysis

1. **Impressions**: Users who saw the variant
2. **Conversions**: Users who converted (trial/subscription)
3. **Conversion Rate**: Conversions / Impressions
4. **Statistical Significance**: Chi-square test approximation
5. **AI Analysis**: Context-aware insights (if API key set)

## Usage

1. Go to `/admin/ab-testing`
2. Select time range (7d, 30d, 90d)
3. View test results with conversion rates
4. Click "Get AI-Powered Insights" for detailed analysis
5. Review recommendations and implement winning variant

## Example Tests

Current tests tracked:

- `pricing_cta`: Pricing page CTA text variants
- `pricing_price`: Price display variants
- `onboarding_flow`: Onboarding experience variants
- `upgrade_prompt`: Upgrade prompt variants

## Interpreting Results

### Confidence Levels

- **95%+**: Statistically significant - safe to implement
- **80-95%**: Likely significant - continue testing
- **<80%**: Not significant - need more data

### Recommendations

- **"Variant B is winning"**: Implement Variant B
- **"Keep Variant A"**: Current version performs better
- **"Need more data"**: Collect at least 100 impressions per variant
- **"Not statistically significant"**: Continue testing

## AI Insights Include

1. **Key Insights**: What's working/not working
2. **Actionable Recommendations**: Next steps
3. **Potential Reasons**: Why variants differ
4. **Optimization Tips**: How to improve further

## Cost

- **OpenAI GPT-4o-mini**: ~$0.15 per 1M tokens
- **Typical insight generation**: ~500 tokens (~$0.000075 per insight)
- **Very cost-effective** for valuable insights

## Best Practices

1. **Run tests for 2+ weeks** before analyzing
2. **Collect 100+ impressions** per variant minimum
3. **Test one thing at a time** for clear results
4. **Use AI insights** to understand why variants differ
5. **Implement winning variants** when statistically significant
