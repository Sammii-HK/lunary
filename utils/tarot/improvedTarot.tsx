'use client';

import { getTarotCard } from './tarot';
import { tarotCards } from './tarot-cards';
import dayjs from 'dayjs';

type TarotCard = {
  name: string;
  keywords: string[];
  information: string;
};

type TrendAnalysis = {
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number; reading: string }>;
  suitPatterns: Array<{
    suit: string;
    count: number;
    reading: string;
    cards: Array<{ name: string; count: number }>;
  }>;
  numberPatterns: Array<{
    number: string;
    count: number;
    reading: string;
    cards: string[];
  }>;
  arcanaPatterns: Array<{ type: string; count: number; reading: string }>;
  timeFrame: number; // days analyzed
};

type ImprovedReading = {
  daily: TarotCard;
  weekly: TarotCard;
  guidance: {
    dailyMessage: string;
    weeklyMessage: string;
    actionPoints: string[];
  };
  trendAnalysis?: TrendAnalysis;
};

// Get card description from the const objects
const getCardDetails = (
  card: TarotCard,
): { keywords: string[]; information: string } => {
  // Search through major arcana
  for (const [key, cardData] of Object.entries(tarotCards.majorArcana)) {
    if (cardData.name === card.name) {
      return {
        keywords: cardData.keywords,
        information: cardData.information,
      };
    }
  }

  // Search through minor arcana suits
  const minorArcana = tarotCards.minorArcana;
  for (const suit of Object.values(minorArcana)) {
    for (const [key, cardData] of Object.entries(suit)) {
      if (cardData.name === card.name) {
        return {
          keywords: cardData.keywords,
          information: cardData.information,
        };
      }
    }
  }

  // Fallback to card's own data if not found
  return {
    keywords: card.keywords,
    information: card.information,
  };
};

// Get suit from card name
const getCardSuit = (cardName: string): string => {
  if (cardName.includes('Cups')) return 'Cups';
  if (cardName.includes('Wands')) return 'Wands';
  if (cardName.includes('Swords')) return 'Swords';
  if (cardName.includes('Pentacles')) return 'Pentacles';
  return 'Major Arcana';
};

// Get pattern interpretation
const getPatternReading = (cardName: string, count: number): string => {
  if (count >= 4) {
    return `${cardName} appearing ${count} times signals a major theme demanding your attention. This energy is persistently trying to guide you.`;
  } else if (count === 3) {
    return `${cardName} appearing 3 times indicates this lesson is important for your current journey. Pay attention to its message.`;
  }
  return '';
};

// Get number pattern interpretation
const getNumberPatternReading = (
  number: string,
  count: number,
  timeFrame: number,
): string => {
  const meanings: { [key: string]: string } = {
    Ace: 'new beginnings and fresh starts',
    Two: 'balance, partnerships, and choices',
    Three: 'creativity, growth, and expansion',
    Four: 'stability, foundation, and structure',
    Five: 'change, conflict, and challenge',
    Six: 'harmony, healing, and progress',
    Seven: 'spirituality, introspection, and wisdom',
    Eight: 'material success and achievement',
    Nine: 'completion and spiritual fulfillment',
    Ten: 'endings and new cycles',
  };

  const meaning = meanings[number] || 'significant energy';
  return `${number}s appeared ${count} times in ${timeFrame} days - highlighting themes of ${meaning} in your life right now.`;
};

// Get arcana pattern interpretation with statistical significance
const getArcanaReading = (
  type: string,
  count: number,
  total: number,
): string => {
  if (type === 'Major') {
    // Expected Major Arcana rate: 22/78 = 28.2%
    const expectedRate = 22 / 78;
    const actualRate = count / total;
    const significanceRatio = actualRate / expectedRate;

    if (significanceRatio >= 1.5) {
      return `Major Arcana appearing ${Math.round(significanceRatio * 100)}% more than expected - You're in a period of profound spiritual transformation and major life lessons. The universe is guiding significant change.`;
    } else if (significanceRatio >= 1.2) {
      return `Major Arcana appearing ${Math.round((significanceRatio - 1) * 100)}% above normal frequency - Important karmic lessons and spiritual development are active in your life.`;
    } else if (significanceRatio <= 0.5) {
      return `Major Arcana appearing much less than expected - Focus on practical, day-to-day matters. Ground yourself in the material world.`;
    }
  } else {
    // Expected Minor Arcana rate: 56/78 = 71.8%
    const expectedRate = 56 / 78;
    const actualRate = count / total;
    const significanceRatio = actualRate / expectedRate;

    if (significanceRatio >= 1.2) {
      return `Minor Arcana heavily dominant - Strong focus on daily life, practical matters, and incremental progress. Building foundations is key right now.`;
    }
  }
  return '';
};

// Get suit interpretation with statistical significance
const getSuitReading = (suit: string, count: number, total: number): string => {
  // Each minor arcana suit has 14 cards, Major Arcana has 22 cards out of 78 total
  let expectedRate: number;
  let significanceThreshold: number;

  if (suit === 'Major Arcana') {
    expectedRate = 22 / 78; // 28.2%
    significanceThreshold = 1.4; // Higher threshold since Major Arcana is special
  } else {
    expectedRate = 14 / 78; // 17.9% for each minor suit
    significanceThreshold = 1.8; // Need stronger signal for minor suits
  }

  const actualRate = count / total;
  const significanceRatio = actualRate / expectedRate;

  if (significanceRatio >= significanceThreshold) {
    switch (suit) {
      case 'Cups':
        return `Cups appearing strongly - Your emotional and relationship life needs major attention. Heart matters are central to your current journey.`;
      case 'Wands':
        return `Wands dominating your readings - Creative fire and action energy are prominent. Time for bold moves and passion projects.`;
      case 'Swords':
        return `Swords cutting through - Mental challenges and decisions are at the forefront. Your intellect is being tested and refined.`;
      case 'Pentacles':
        return `Pentacles grounding you - Material and practical matters require focused attention. Build solid foundations in the physical world.`;
      case 'Major Arcana':
        return `Major Arcana guiding strongly - Significant spiritual lessons and karmic experiences are unfolding in your life.`;
    }
  } else if (significanceRatio >= 1.2) {
    switch (suit) {
      case 'Cups':
        return `Cups emerging as a theme - Emotional healing and relationships need gentle attention.`;
      case 'Wands':
        return `Wands lighting up - Creative energy and enthusiasm are building. Channel this fire wisely.`;
      case 'Swords':
        return `Swords present - Mental clarity and communication are key themes in your current path.`;
      case 'Pentacles':
        return `Pentacles steady - Practical foundations and material security need strengthening.`;
      case 'Major Arcana':
        return `Major Arcana active - Important spiritual lessons are present in your journey.`;
    }
  }
  return '';
};

// Analyze patterns for specified time period
const analyzeTrends = (
  userName?: string,
  timeFrameDays: number = 30,
): TrendAnalysis => {
  const pastReadings: TarotCard[] = [];
  const today = dayjs();

  // Collect past readings
  for (let i = 1; i <= timeFrameDays; i++) {
    const date = today.subtract(i, 'day');
    const card = getTarotCard(date.toDate().toDateString(), userName);
    pastReadings.push(card);
  }

  // Count frequencies
  const cardCounts: { [key: string]: number } = {};
  const suitCounts: { [key: string]: number } = {};
  const keywordCounts: { [key: string]: number } = {};
  const numberCounts: { [key: string]: number } = {};
  const arcanaCounts = { major: 0, minor: 0 };

  // Track cards by suit for detailed breakdown
  const suitCardBreakdown: { [suit: string]: { [card: string]: number } } = {};

  pastReadings.forEach((card) => {
    const suit = getCardSuit(card.name);

    // Count cards
    cardCounts[card.name] = (cardCounts[card.name] || 0) + 1;

    // Count suits and track individual cards within suits
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    if (!suitCardBreakdown[suit]) suitCardBreakdown[suit] = {};
    suitCardBreakdown[suit][card.name] =
      (suitCardBreakdown[suit][card.name] || 0) + 1;

    // Count keywords
    card.keywords.forEach((keyword) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });

    // Count numbers (extract from card names)
    const numberMatch = card.name.match(
      /\b(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\b/,
    );
    if (numberMatch) {
      const number = numberMatch[1];
      numberCounts[number] = (numberCounts[number] || 0) + 1;
    }

    // Count arcana types
    if (suit === 'Major Arcana') {
      arcanaCounts.major++;
    } else {
      arcanaCounts.minor++;
    }
  });

  // Find dominant themes (top 3)
  const dominantThemes = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([keyword]) => keyword);

  // Find frequent cards with readings (appeared 3+ times)
  const frequentCards = Object.entries(cardCounts)
    .filter(([, count]) => count >= 3)
    .map(([name, count]) => ({
      name,
      count,
      reading: getPatternReading(name, count),
    }))
    .sort((a, b) => b.count - a.count);

  // Enhanced suit patterns with card breakdown
  const suitPatterns = Object.entries(suitCounts)
    .map(([suit, count]) => {
      const cards = Object.entries(suitCardBreakdown[suit] || {})
        .map(([name, cardCount]) => ({ name, count: cardCount }))
        .sort((a, b) => b.count - a.count);

      return {
        suit,
        count,
        reading: getSuitReading(suit, count, pastReadings.length),
        cards,
      };
    })
    .filter((pattern) => pattern.reading)
    .sort((a, b) => b.count - a.count);

  // Number patterns analysis
  const numberPatterns = Object.entries(numberCounts)
    .filter(([, count]) => count >= 2) // Show numbers that appear 2+ times
    .map(([number, count]) => {
      const cards = pastReadings
        .filter((card) => card.name.includes(number))
        .map((card) => card.name);

      const reading = getNumberPatternReading(number, count, timeFrameDays);

      return {
        number,
        count,
        reading,
        cards: Array.from(new Set(cards)), // Remove duplicates
      };
    })
    .sort((a, b) => b.count - a.count);

  // Arcana patterns
  const arcanaPatterns = [];
  if (arcanaCounts.major > 0) {
    const reading = getArcanaReading(
      'Major',
      arcanaCounts.major,
      pastReadings.length,
    );
    if (reading) {
      arcanaPatterns.push({
        type: 'Major Arcana',
        count: arcanaCounts.major,
        reading,
      });
    }
  }
  if (arcanaCounts.minor > 0) {
    const reading = getArcanaReading(
      'Minor',
      arcanaCounts.minor,
      pastReadings.length,
    );
    if (reading) {
      arcanaPatterns.push({
        type: 'Minor Arcana',
        count: arcanaCounts.minor,
        reading,
      });
    }
  }

  return {
    dominantThemes,
    frequentCards,
    suitPatterns,
    numberPatterns,
    arcanaPatterns,
    timeFrame: timeFrameDays,
  };
};

// Generate clear, point-based guidance
const generateClearGuidance = (
  daily: TarotCard,
  weekly: TarotCard,
  userName?: string,
) => {
  const name = userName || 'seeker';

  // Get detailed card information
  const dailyDetails = getCardDetails(daily);
  const weeklyDetails = getCardDetails(weekly);

  // Create clear messages
  const dailyMessage = `Today, the universe presents "${daily.name}" - ${dailyDetails.information}`;

  const weeklyMessage = `Your weekly energy flows through "${weekly.name}" - ${weeklyDetails.information}`;

  // Create actionable points
  const actionPoints = [
    `Focus on: ${dailyDetails.keywords.slice(0, 2).join(' and ')}`,
    `Weekly theme: ${weeklyDetails.keywords[0]}`,
    `Key insight: ${dailyDetails.keywords[2] || dailyDetails.keywords[0]} is highlighted in your path`,
  ];

  return {
    dailyMessage,
    weeklyMessage,
    actionPoints,
  };
};

export const getImprovedTarotReading = (
  userName?: string,
  includeTrends: boolean = true,
  timeFrameDays: number = 30,
): ImprovedReading => {
  const today = new Date().toDateString();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartString = weekStart.toDateString();

  // Get cards
  const daily = getTarotCard(today, userName);
  const weekly = getTarotCard(weekStartString, userName);

  // Generate guidance
  const guidance = generateClearGuidance(daily, weekly, userName);

  // Get trends if requested
  let trendAnalysis: TrendAnalysis | undefined;
  if (includeTrends) {
    trendAnalysis = analyzeTrends(userName, timeFrameDays);
  }

  return {
    daily,
    weekly,
    guidance,
    trendAnalysis,
  };
};
