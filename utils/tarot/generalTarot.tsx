import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { getTarotCard } from './tarot';

dayjs.extend(dayOfYear);

export type GeneralTarotReading = {
  card: {
    name: string;
    keywords: string[];
    information: string;
    arcana: string;
  };
  dailyMessage: string;
  reason: string;
  moonPhaseConnection: string;
};

// Daily tarot selection based on cosmic energy (not personal data)
export const getGeneralTarotReading = (): GeneralTarotReading => {
  const today = dayjs();

  // Use the day of year and cosmic factors for card selection
  const dayOfYear = today.dayOfYear();
  const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, etc.
  const monthDay = today.date();

  // Create a seed based on date for consistent daily cards
  const seed = `${today.format('YYYY-MM-DD')}-cosmic-energy`;

  // Get today's cosmic tarot card using existing system
  const cosmicCard = getTarotCard(today.format('YYYY-MM-DD'), 'cosmic-energy');

  // Generate different daily guidance themes
  const guidanceThemes = [
    'embracing change and transformation',
    'finding balance in challenging times',
    'trusting your inner wisdom',
    'opening to new opportunities',
    'releasing what no longer serves',
    'cultivating patience and understanding',
    'expressing your authentic self',
    'strengthening your foundation',
    'exploring creative possibilities',
    'practicing compassion and kindness',
    'seeking clarity and truth',
    'honoring your intuitive insights',
    'building meaningful connections',
    'stepping into your personal power',
    'finding peace through acceptance',
  ];

  const themeIndex = (dayOfYear + dayOfWeek) % guidanceThemes.length;
  const dailyTheme = guidanceThemes[themeIndex];

  // Create daily message based on card and cosmic energy
  const dailyMessages = [
    `Today's energy invites you to focus on ${dailyTheme}. ${cosmicCard.name} encourages you to ${cosmicCard.keywords[0]} while staying grounded in your truth.`,
    `The cosmic currents support ${dailyTheme}. Let ${cosmicCard.name} guide you toward ${cosmicCard.keywords[1] || cosmicCard.keywords[0]} and inner wisdom.`,
    `${cosmicCard.name} appears as your cosmic companion for ${dailyTheme}. Embrace its energy of ${cosmicCard.keywords[0]} to navigate today's opportunities.`,
    `Today calls for ${dailyTheme}. ${cosmicCard.name} reminds you that ${cosmicCard.keywords[0]} combined with ${cosmicCard.keywords[1] || 'awareness'} creates powerful transformation.`,
    `The universe highlights the importance of ${dailyTheme}. ${cosmicCard.name} offers the gift of ${cosmicCard.keywords[0]} to support your journey.`,
  ];

  const messageIndex = (monthDay + dayOfWeek) % dailyMessages.length;
  const dailyMessage = dailyMessages[messageIndex];

  // Create reason for card selection
  const reason = `${cosmicCard.name} emerges as today's cosmic messenger, chosen by the universal energies that flow through this ${today.format('dddd')}. Its wisdom of ${cosmicCard.keywords.slice(0, 2).join(' and ')} aligns perfectly with today's celestial atmosphere.`;

  // Moon phase connection
  const moonPhaseConnections = [
    "This card's energy harmonizes with the current lunar cycle, supporting reflection and manifestation.",
    "The moon's influence amplifies this card's message, creating space for intuitive insights.",
    "Today's lunar energy enhances the transformative power of this card's guidance.",
    "The celestial timing brings this card's wisdom into perfect alignment with your spiritual journey.",
    "This card resonates with the moon's current phase, offering clarity and direction.",
  ];

  const moonConnectionIndex = dayOfYear % moonPhaseConnections.length;
  const moonPhaseConnection = moonPhaseConnections[moonConnectionIndex];

  return {
    card: {
      name: cosmicCard.name,
      keywords: cosmicCard.keywords,
      information: cosmicCard.information,
      arcana: 'Universal Wisdom', // General classification for non-personal readings
    },
    dailyMessage,
    reason,
    moonPhaseConnection,
  };
};
