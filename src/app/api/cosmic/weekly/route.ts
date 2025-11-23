import { NextRequest, NextResponse } from 'next/server';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import { requireUser } from '@/lib/ai/auth';
import { buildLunaryContext } from '@/lib/ai/context';

const getActionableInsight = (
  moonPhase: string,
  moonSign: string,
  transits: Array<{ aspect: string; name: string }>,
): string => {
  // New Moon insights
  if (moonPhase.includes('New Moon')) {
    return 'Perfect time to set intentions and start new projects';
  }
  // Full Moon insights
  if (moonPhase.includes('Full Moon') || moonPhase.includes('Moon')) {
    return 'Ideal for releasing what no longer serves you';
  }
  // Waxing phases
  if (moonPhase.includes('Waxing')) {
    return 'Focus on building momentum and taking action';
  }
  // Waning phases
  if (moonPhase.includes('Waning')) {
    return 'Time for reflection, gratitude, and letting go';
  }
  // Check for significant transits
  const significantTransit = transits.find(
    (t) => t.aspect === 'ingress' || t.aspect === 'retrograde',
  );
  if (significantTransit) {
    if (significantTransit.aspect === 'ingress') {
      return 'Major shift in energy - embrace new opportunities';
    }
    if (significantTransit.aspect === 'retrograde') {
      return 'Review and revise - perfect for inner reflection';
    }
  }
  return 'Steady energy - maintain your current momentum';
};

const getBestActivity = (
  moonPhase: string,
  moonSign: string,
): { activity: string; icon: string } => {
  if (moonPhase.includes('New Moon')) {
    return { activity: 'Set intentions', icon: '✨' };
  }
  if (moonPhase.includes('Full Moon')) {
    return { activity: 'Release rituals', icon: '🌕' };
  }
  if (moonPhase.includes('Waxing')) {
    return { activity: 'Take action', icon: '📈' };
  }
  if (moonPhase.includes('Waning')) {
    return { activity: 'Reflect & rest', icon: '🌙' };
  }
  return { activity: 'Maintain flow', icon: '🌀' };
};

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request).catch(() => null);
    const today = new Date();
    const weekData = [];
    let weeklyTheme = '';
    let personalInsights: string[] = [];

    // Get data for next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const cosmicData = await getGlobalCosmicData(date);

      if (cosmicData) {
        const topTransits = cosmicData.generalTransits.slice(0, 3);
        const moonPhase = cosmicData.moonPhase.name;
        const moonSign = cosmicData.planetaryPositions.Moon?.sign || 'Unknown';

        const actionableInsight = getActionableInsight(
          moonPhase,
          moonSign,
          topTransits,
        );
        const bestActivity = getBestActivity(moonPhase, moonSign);

        weekData.push({
          date: date.toISOString().split('T')[0],
          moonPhase: {
            name: moonPhase,
            emoji: cosmicData.moonPhase.emoji,
            sign: moonSign,
            isSignificant: cosmicData.moonPhase.isSignificant,
          },
          topTransits: topTransits.map((t) => ({
            name: t.name,
            aspect: t.aspect,
            energy: t.energy,
          })),
          actionableInsight,
          bestActivity,
        });
      }
    }

    // Get personalized context if user is authenticated
    if (user) {
      try {
        const { context } = await buildLunaryContext({
          userId: user.id,
          tz: 'Europe/London',
          locale: 'en-GB',
          displayName: user.displayName,
          userBirthday: (user as any).birthday,
          historyLimit: 0,
          includeMood: false,
          now: today,
          useCache: true,
        });

        // Generate weekly theme based on overall transits
        if (context.currentTransits && context.currentTransits.length > 0) {
          const mainTransit = context.currentTransits[0];
          weeklyTheme = `${mainTransit.from} ${mainTransit.aspect} ${mainTransit.to} - This week brings ${mainTransit.aspect === 'conjunction' ? 'powerful alignment' : mainTransit.aspect === 'square' ? 'challenging growth' : 'harmonious flow'}`;
        }

        // Personal insights removed - too generic and not useful
        // Future: Could add specific transit-to-chart insights if we have house data
      } catch (error) {
        console.error('[Weekly Cosmic] Failed to get personal context:', error);
      }
    }

    // Determine overall weekly theme if not personalized
    if (!weeklyTheme && weekData.length > 0) {
      const significantDays = weekData.filter(
        (d) =>
          d.moonPhase.isSignificant ||
          d.topTransits.some((t) => t.aspect === 'ingress'),
      );
      if (significantDays.length > 0) {
        weeklyTheme = `This week features ${significantDays.length} significant cosmic event${significantDays.length > 1 ? 's' : ''} - a powerful time for transformation`;
      } else {
        weeklyTheme =
          'A steady week ahead - perfect for maintaining momentum and building on foundations';
      }
    }

    return NextResponse.json({
      weekData,
      weeklyTheme,
      personalInsights,
    });
  } catch (error) {
    console.error('[Weekly Cosmic] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly data' },
      { status: 500 },
    );
  }
}
