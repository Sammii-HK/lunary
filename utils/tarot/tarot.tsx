import { tarotCards } from './tarot-cards';
import seed from 'seed-random';

type TarotSuit = 'cups' | 'swords' | 'wands' | 'pentacles';

const tarotSuits = ['cups', 'swords', 'wands', 'pentacles'];
const getRandomInt = (
  max: number,
  currentDate: Date,
  userName?: string,
  userBirthday?: string,
  additionalSeed?: string,
) => {
  // Create a unique seed per user by combining userName and userBirthday
  // This ensures different users get different cards even if they don't have a name
  let userSeed = userName || '';
  if (userBirthday) {
    userSeed = userSeed ? `${userSeed}-${userBirthday}` : userBirthday;
  }
  // Fallback to a random identifier if no user data is available
  // This should rarely happen in production
  if (!userSeed) {
    userSeed = 'anonymous-' + currentDate.getTime().toString().slice(-6);
  }

  // Include detailed date information for maximum uniqueness
  const dateComponents = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

  // Include additional seed string if provided (for distinguishing daily vs weekly)
  const seedParts = [
    userSeed,
    dateComponents,
    currentDate.toISOString(),
    additionalSeed || '',
  ].filter(Boolean);

  const seedValue = seedParts.join('-');
  const rand = seed(seedValue);
  return Math.floor(rand() * max);
};

const majorArcana = Object.keys(tarotCards.majorArcana);
const getAllCardNames = () => {
  const minorArcana = tarotSuits.flatMap((suit) =>
    Object.keys(
      tarotCards.minorArcana[suit as keyof typeof tarotCards.minorArcana],
    ),
  );
  return [...majorArcana, ...minorArcana];
};

const allCardNames = getAllCardNames();

type TarotCard = {
  name: string;
  keywords: string[];
  information: string;
};

export const getTarotCard = (
  date: string,
  userName?: string,
  userBirthday?: string,
): TarotCard => {
  // Try to parse the date, but if it fails (e.g., for custom seed strings), use current date
  let dateObj: Date;
  try {
    dateObj = new Date(date);
    // Check if date is invalid
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
  } catch {
    dateObj = new Date();
  }

  // Use the date string itself as part of the seed to ensure uniqueness
  const seedString = date + (userName || '') + (userBirthday || '');
  const number = getRandomInt(
    allCardNames.length - 1,
    dateObj,
    userName,
    userBirthday,
    seedString, // Pass the full seed string to ensure uniqueness
  );
  const tarotCard = allCardNames[number];
  const majorArcanaCard =
    tarotCards.majorArcana[tarotCard as keyof typeof tarotCards.majorArcana];
  const cupsCard =
    tarotCards.minorArcana.cups[
      tarotCard as keyof typeof tarotCards.minorArcana.cups
    ];
  const wandsCard =
    tarotCards.minorArcana.wands[
      tarotCard as keyof typeof tarotCards.minorArcana.wands
    ];
  const swordsCard =
    tarotCards.minorArcana.swords[
      tarotCard as keyof typeof tarotCards.minorArcana.swords
    ];
  const pentaclesCard =
    tarotCards.minorArcana.pentacles[
      tarotCard as keyof typeof tarotCards.minorArcana.pentacles
    ];

  return {
    ...(majorArcanaCard as any),
    ...(cupsCard as any),
    ...(wandsCard as any),
    ...(swordsCard as any),
    ...(pentaclesCard as any),
  };
};
