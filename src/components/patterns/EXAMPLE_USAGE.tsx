/**
 * EXAMPLE USAGE - How to integrate TarotPatternsHub
 *
 * This file shows examples of how to use the new pattern components.
 * DO NOT import this file in production - it's for reference only.
 */

import { TarotPatternsHub } from './TarotPatternsHub';
import type { PatternAnalysis } from '@/lib/patterns/tarot-pattern-types';

// ============================================================================
// Example 1: Integration with AdvancedPatterns.tsx
// ============================================================================

/**
 * Add this to AdvancedPatterns.tsx inside the component function:
 */
function ExampleAdvancedPatternsIntegration() {
  // Existing code...
  // const subscription = useSubscription();
  // const [analysis, setAnalysis] = useState<AdvancedPatternAnalysis | null>(null);

  // NEW: Feature flag for gradual rollout
  const USE_NEW_PATTERNS_HUB = true;

  // NEW: Early return for new hub
  // if (USE_NEW_PATTERNS_HUB && basicPatterns && selectedView !== 'year-over-year') {
  //   const patternAnalysis = transformBasicPatternsToAnalysis(basicPatterns);
  //   const userTier = mapSubscriptionPlanToUserTier(subscription.plan);
  //
  //   return (
  //     <TarotPatternsHub
  //       patterns={patternAnalysis}
  //       userTier={userTier}
  //       subscriptionStatus={subscription.status}
  //       onUpgradeClick={() => {
  //         // Option 1: Redirect to pricing
  //         window.location.href = '/pricing';
  //
  //         // Option 2: Open upgrade modal (if you have one)
  //         // setShowUpgradeModal(true);
  //       }}
  //     />
  //   );
  // }

  // Continue with existing implementation for year-over-year views...
}

// ============================================================================
// Example 2: Standalone Usage (New Pattern Page)
// ============================================================================

function ExampleStandalonePage() {
  // Example pattern data
  const mockPatternData: PatternAnalysis = {
    dominantThemes: [
      { label: 'Emotional Growth', strength: 95, trend: 'up' },
      { label: 'New Beginnings', strength: 78, trend: 'stable' },
      { label: 'Inner Wisdom', strength: 62, trend: 'down' },
    ],
    frequentCards: [
      {
        name: 'The Moon',
        count: 8,
        percentage: 15.4,
        suit: 'Major Arcana',
        meaning: 'Intuition, dreams, and the subconscious',
        appearances: [
          { date: '2026-01-28' },
          { date: '2026-01-25' },
          { date: '2026-01-20' },
          { date: '2026-01-15' },
          { date: '2026-01-10' },
          { date: '2026-01-05' },
          { date: '2026-01-02' },
          { date: '2025-12-30' },
        ],
      },
      {
        name: 'Two of Cups',
        count: 6,
        percentage: 11.5,
        suit: 'Cups',
        meaning: 'Partnership, unity, and mutual attraction',
        appearances: [
          { date: '2026-01-27' },
          { date: '2026-01-22' },
          { date: '2026-01-18' },
          { date: '2026-01-12' },
          { date: '2026-01-08' },
          { date: '2026-01-03' },
        ],
      },
    ],
    suitPatterns: [
      { suit: 'Cups', count: 18, percentage: 35, trend: 'up' },
      { suit: 'Wands', count: 14, percentage: 27, trend: 'stable' },
      { suit: 'Swords', count: 10, percentage: 19, trend: 'down' },
      { suit: 'Pentacles', count: 8, percentage: 15, trend: 'stable' },
      { suit: 'Major Arcana', count: 2, percentage: 4, trend: 'up' },
    ],
    arcanaBalance: {
      major: 12,
      minor: 40,
    },
    totalReadings: 52,
    dateRange: {
      start: '2026-01-01T00:00:00Z',
      end: '2026-01-30T23:59:59Z',
    },
  };

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold text-zinc-200 mb-6'>
        Your Tarot Patterns
      </h1>
      <TarotPatternsHub
        patterns={mockPatternData}
        userTier='lunary_plus_ai' // Change to test different tiers
        subscriptionStatus='active'
        onUpgradeClick={() => alert('Upgrade clicked!')}
      />
    </div>
  );
}

// ============================================================================
// Example 3: Testing Different User Tiers
// ============================================================================

function ExampleTierTesting() {
  const mockData: PatternAnalysis = {
    dominantThemes: [
      { label: 'Love & Relationships', strength: 90 },
      { label: 'Career Growth', strength: 75 },
      { label: 'Spiritual Awakening', strength: 60 },
    ],
    frequentCards: [
      {
        name: 'The Lovers',
        count: 5,
        percentage: 10,
        appearances: [{ date: '2026-01-28' }, { date: '2026-01-25' }],
      },
    ],
    suitPatterns: [
      { suit: 'Cups', count: 20, percentage: 40 },
      { suit: 'Wands', count: 15, percentage: 30 },
      { suit: 'Swords', count: 10, percentage: 20 },
      { suit: 'Pentacles', count: 5, percentage: 10 },
    ],
    arcanaBalance: { major: 10, minor: 40 },
    totalReadings: 50,
    dateRange: {
      start: '2026-01-01T00:00:00Z',
      end: '2026-01-30T23:59:59Z',
    },
  };

  return (
    <div className='space-y-12 p-6'>
      {/* Free Tier - See locked features */}
      <div>
        <h2 className='text-xl font-bold mb-4'>Free Tier View</h2>
        <TarotPatternsHub
          patterns={mockData}
          userTier='free'
          subscriptionStatus='free'
          onUpgradeClick={() => console.log('Free user upgrade')}
        />
      </div>

      {/* Lunary+ Tier - Basic features unlocked */}
      <div>
        <h2 className='text-xl font-bold mb-4'>Lunary+ View</h2>
        <TarotPatternsHub
          patterns={mockData}
          userTier='lunary_plus'
          subscriptionStatus='active'
          onUpgradeClick={() => console.log('Lunary+ user upgrade')}
        />
      </div>

      {/* Pro Monthly - Advanced features */}
      <div>
        <h2 className='text-xl font-bold mb-4'>Pro Monthly View</h2>
        <TarotPatternsHub
          patterns={mockData}
          userTier='lunary_plus_ai'
          subscriptionStatus='active'
          onUpgradeClick={() => console.log('Pro Monthly user')}
        />
      </div>

      {/* Pro Annual - All features */}
      <div>
        <h2 className='text-xl font-bold mb-4'>Pro Annual View</h2>
        <TarotPatternsHub
          patterns={mockData}
          userTier='lunary_plus_ai_annual'
          subscriptionStatus='active'
          onUpgradeClick={() => console.log('Pro Annual user')}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 4: Using Individual Components
// ============================================================================

function ExampleIndividualComponents() {
  return (
    <div className='p-6 space-y-6'>
      {/* Using PatternCard directly */}
      {/* <PatternCard
        title="Custom Pattern"
        subtitle="Your custom visualization"
        color="accent"
        icon={<Star className="w-4 h-4" />}
        badge="New"
      >
        <p>Your custom content here</p>
      </PatternCard> */}

      {/* Using FrequentCardsSection directly */}
      {/* <FrequentCardsSection
        cards={[
          {
            name: 'The Fool',
            count: 3,
            percentage: 10,
            meaning: 'New beginnings, innocence, spontaneity',
            appearances: [
              { date: '2026-01-28' },
              { date: '2026-01-20' },
              { date: '2026-01-15' },
            ],
          },
        ]}
        allowDrillDown={true}
      /> */}

      {/* Using visualizations directly */}
      {/* <SuitDistributionChart
        data={[
          { suit: 'Cups', count: 20, percentage: 40 },
          { suit: 'Wands', count: 15, percentage: 30 },
          { suit: 'Swords', count: 10, percentage: 20 },
          { suit: 'Pentacles', count: 5, percentage: 10 },
        ]}
      /> */}
    </div>
  );
}

// ============================================================================
// Example 5: API Integration Pattern
// ============================================================================

/**
 * Example of fetching pattern data from API and using the hub
 */
// async function ExampleAPIIntegration() {
//   const response = await fetch('/api/patterns/advanced?days=30');
//   const data = await response.json();
//
//   // Transform API response to PatternAnalysis format
//   const patterns: PatternAnalysis = {
//     dominantThemes: data.dominantThemes.map((theme: string, index: number) => ({
//       label: theme,
//       strength: 100 - index * 10,
//     })),
//     frequentCards: data.frequentCards.map((card: any) => ({
//       name: card.name,
//       count: card.count,
//       percentage: (card.count / data.totalCards) * 100,
//       appearances: card.appearances || [],
//     })),
//     // ... rest of the transformation
//   };
//
//   return <TarotPatternsHub patterns={patterns} ... />;
// }

// ============================================================================
// Example 6: Handling Upgrade Clicks
// ============================================================================

/**
 * Different ways to handle upgrade button clicks
 */
// function ExampleUpgradeHandlers() {
//   // Option 1: Redirect to pricing page
//   const handleUpgradeRedirect = () => {
//     window.location.href = '/pricing';
//   };
//
//   // Option 2: Open modal
//   const handleUpgradeModal = () => {
//     setShowUpgradeModal(true);
//   };
//
//   // Option 3: Scroll to upgrade section
//   const handleUpgradeScroll = () => {
//     document.getElementById('upgrade-section')?.scrollIntoView({ behavior: 'smooth' });
//   };
//
//   // Option 4: Open Stripe checkout directly
//   const handleUpgradeStripe = async () => {
//     const response = await fetch('/api/stripe/checkout', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ priceId: 'price_xxx' }),
//     });
//     const { url } = await response.json();
//     window.location.href = url;
//   };
//
//   return (
//     <TarotPatternsHub
//       patterns={mockData}
//       userTier="free"
//       subscriptionStatus="free"
//       onUpgradeClick={handleUpgradeRedirect} // Choose your handler
//     />
//   );
// }

export default function PatternExamples() {
  return (
    <div>
      <h1>Pattern Component Examples</h1>
      <p>See source code for integration examples</p>
    </div>
  );
}
