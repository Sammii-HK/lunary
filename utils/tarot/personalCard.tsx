'use client';

import { getTarotCard } from './tarot';
import { tarotCards } from './tarot-cards';
import dayjs from 'dayjs';

type PersonalCardData = {
  name: string;
  keywords: string[];
  information: string;
  calculatedDate: string;
  reason: string;
};

// Calculate personal card based on birth date (unchanging)
const calculatePersonalCard = (
  userBirthday: string,
  userName?: string,
): PersonalCardData => {
  // Use birth year + name for completely static personal card
  const birthDate = dayjs(userBirthday);
  const seed = `${userName || 'seeker'}-${birthDate.year()}-${birthDate.month()}-${birthDate.date()}-personal`;

  const card = getTarotCard(seed, userName, userBirthday);

  // Get detailed card information
  const cardDetails = getCardDetails(card);

  const reason = `Your personal card is determined by your birth date (${dayjs(userBirthday).format('MMMM D, YYYY')}) and reflects your core spiritual essence and life path energy.`;

  return {
    name: card.name,
    keywords: cardDetails.keywords,
    information: cardDetails.information,
    calculatedDate: dayjs().toISOString(),
    reason,
  };
};

// Get card details from tarot constants
const getCardDetails = (card: {
  name: string;
  keywords: string[];
  information: string;
}) => {
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

  // Fallback to card's own data
  return {
    keywords: card.keywords,
    information: card.information,
  };
};

// Save personal card to Jazz profile
export const savePersonalCardToProfile = async (
  profile: any,
  userBirthday: string,
  userName?: string,
): Promise<void> => {
  try {
    console.log('Calculating personal card for:', userName, userBirthday);

    const personalCardData = calculatePersonalCard(userBirthday, userName);

    console.log('Personal card calculated:', personalCardData);

    // Import the schema
    const { PersonalCard } = await import('../../schema');

    // Create personal card as CoValue
    const personalCardCoValue = PersonalCard.create(
      {
        name: personalCardData.name,
        keywords: personalCardData.keywords as any, // Jazz will auto-convert array to CoList
        information: personalCardData.information,
        calculatedDate: personalCardData.calculatedDate,
        reason: personalCardData.reason,
      },
      profile._owner || profile,
    );

    // Save to profile
    profile.$jazz.set('personalCard', personalCardCoValue);

    console.log('Personal card saved to profile as CoValue');
  } catch (error) {
    console.error('Error saving personal card:', error);
  }
};

// Get personal card from Jazz profile
export const getPersonalCardFromProfile = (
  profile: any,
): PersonalCardData | null => {
  try {
    if (!profile?.personalCard) {
      console.log('No personal card data found in profile');
      return null;
    }

    const personalCardCoValue = profile.personalCard;

    // Convert CoValue to plain object
    const personalCard: PersonalCardData = {
      name: personalCardCoValue.name,
      keywords: Array.from(personalCardCoValue.keywords || []),
      information: personalCardCoValue.information,
      calculatedDate: personalCardCoValue.calculatedDate,
      reason: personalCardCoValue.reason,
    };

    console.log('Retrieved personal card from profile:', personalCard);
    return personalCard;
  } catch (error) {
    console.error('Error retrieving personal card data:', error);
    return null;
  }
};

// Check if personal card exists in profile
export const hasPersonalCard = (profile: any): boolean => {
  const hasCard = Boolean(profile?.personalCard);
  console.log('hasPersonalCard check:', {
    profile: Boolean(profile),
    personalCard: hasCard,
    result: hasCard,
  });
  return hasCard;
};
