import { NextResponse } from 'next/server';
import {
  analyzeContextNeeds,
  estimateContextCost,
  type ContextRequirements,
} from '@/lib/ai/context-optimizer';

/**
 * Test endpoint for context optimization system
 * Shows token savings for different query types
 *
 * Usage: GET /api/test/context-optimization?query=YOUR_QUERY
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || "What's the cosmic weather?";

  // Analyze the query
  const requirements = analyzeContextNeeds(query);
  const { estimatedTokens, components } = estimateContextCost(requirements);

  // Calculate what "full context" would cost
  const fullRequirements: ContextRequirements = {
    needsBasicCosmic: true,
    needsPersonalTransits: true,
    needsNatalPatterns: true,
    needsPlanetaryReturns: true,
    needsProgressedChart: true,
    needsEclipses: true,
    needsTarotPatterns: true,
    needsJournalHistory: true,
  };
  const fullCost = estimateContextCost(fullRequirements);

  // Calculate savings
  const savings = fullCost.estimatedTokens - estimatedTokens;
  const savingsPercent = Math.round((savings / fullCost.estimatedTokens) * 100);

  return NextResponse.json({
    query,
    optimization: {
      estimatedTokens,
      fullContextTokens: fullCost.estimatedTokens,
      tokensSaved: savings,
      savingsPercent: `${savingsPercent}%`,
    },
    requirements: {
      basicCosmic: requirements.needsBasicCosmic,
      personalTransits: requirements.needsPersonalTransits,
      natalPatterns: requirements.needsNatalPatterns,
      planetaryReturns: requirements.needsPlanetaryReturns,
      progressedChart: requirements.needsProgressedChart,
      eclipses: requirements.needsEclipses,
      tarotPatterns: requirements.needsTarotPatterns,
      journalHistory: requirements.needsJournalHistory,
    },
    componentCosts: components,
    breakdown: {
      basic: `${components.basicCosmic} tokens (always included)`,
      conditional: `${estimatedTokens - components.basicCosmic} tokens (based on query)`,
    },
    examples: getExampleQueries(),
  });
}

function getExampleQueries() {
  return [
    {
      query: "What's the cosmic weather?",
      description: 'Simple query - basic cosmic only',
      expectedTokens: '~300',
      expectedSavings: '~80%',
    },
    {
      query: 'Tell me about my Saturn return',
      description: 'Medium query - basic + transits + returns',
      expectedTokens: '~650',
      expectedSavings: '~58%',
    },
    {
      query: 'Give me a deep astrological analysis',
      description: 'Complex query - most modules needed',
      expectedTokens: '~1,200',
      expectedSavings: '~23%',
    },
    {
      query: 'What transits am I experiencing?',
      description: 'Transit-focused - basic + personal transits',
      expectedTokens: '~450',
      expectedSavings: '~71%',
    },
    {
      query: 'Tell me about my progressed chart',
      description: 'Progression-focused',
      expectedTokens: '~550',
      expectedSavings: '~65%',
    },
    {
      query: 'Are there any eclipses affecting me?',
      description: 'Eclipse-focused',
      expectedTokens: '~500',
      expectedSavings: '~68%',
    },
  ];
}
