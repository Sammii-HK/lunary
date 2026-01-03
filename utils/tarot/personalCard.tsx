'use client';

import { getTarotCard } from './tarot';
import { tarotCards } from './tarot-cards';
import dayjs from 'dayjs';
import { parseIsoDateOnly } from '@/lib/date-only';

export type PersonalCardData = {
  name: string;
  keywords: string[];
  information: string;
  calculatedDate: string;
  reason: string;
};

export const calculatePersonalCard = (
  userBirthday: string,
  userName?: string,
): PersonalCardData => {
  const parsedBirthDate = parseIsoDateOnly(userBirthday);
  const birthDate = parsedBirthDate
    ? dayjs(parsedBirthDate)
    : dayjs(userBirthday);
  const seed = `${userName || 'seeker'}-${birthDate.year()}-${birthDate.month()}-${birthDate.date()}-personal`;

  const card = getTarotCard(seed, userName, userBirthday);
  const cardDetails = getCardDetails(card);

  const reason = `Your personal card is determined by your birth date (${birthDate.format('MMMM D, YYYY')}) and reflects your core spiritual essence and life path energy.`;

  return {
    name: card.name,
    keywords: cardDetails.keywords,
    information: cardDetails.information,
    calculatedDate: dayjs().toISOString(),
    reason,
  };
};

const getCardDetails = (card: {
  name: string;
  keywords: string[];
  information: string;
}) => {
  for (const [, cardData] of Object.entries(tarotCards.majorArcana)) {
    if (cardData.name === card.name) {
      return {
        keywords: cardData.keywords,
        information: cardData.information,
      };
    }
  }

  const minorArcana = tarotCards.minorArcana;
  for (const suit of Object.values(minorArcana)) {
    for (const [, cardData] of Object.entries(suit)) {
      if (cardData.name === card.name) {
        return {
          keywords: cardData.keywords,
          information: cardData.information,
        };
      }
    }
  }

  return {
    keywords: card.keywords,
    information: card.information,
  };
};

export const hasPersonalCard = (
  personalCard: PersonalCardData | null | undefined,
): boolean => {
  return !!personalCard && !!personalCard.name;
};
