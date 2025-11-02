'use client';

import { getTarotCard } from './tarot';

type TarotCard = {
  name: string;
  keywords: string[];
  information: string;
};

export const getPersonalizedTarotCard = (
  date: string,
  userName?: string,
  userBirthday?: string,
): TarotCard => {
  return getTarotCard(date, userName, userBirthday);
};

export const getPersonalizedTarotReading = (
  userName?: string,
  userBirthday?: string,
): {
  daily: TarotCard;
  weekly: TarotCard;
  personal: TarotCard;
  advice: string;
} => {
  const today = new Date();
  const todayString = today.toDateString();

  // Calculate week start and week number for unique weekly seed
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  // Get week number of year and other date components
  const weekStartYear = weekStart.getFullYear();
  const weekStartMonth = weekStart.getMonth() + 1;
  const weekStartDate = weekStart.getDate();
  const dayOfYear = Math.floor(
    (weekStart.getTime() - new Date(weekStartYear, 0, 0).getTime()) / 86400000,
  );
  const weekNumber = Math.floor(dayOfYear / 7);

  // Create UNIQUE weekly seed - must be completely different from daily seed
  const weeklySeed = `weekly-${weekStartYear}-W${weekNumber}-${weekStartMonth}-${weekStartDate}`;

  // Daily card for today - prefix with "daily-" to ensure uniqueness
  const daily = getTarotCard(`daily-${todayString}`, userName, userBirthday);

  // Weekly card based on week number and date
  const weekly = getTarotCard(weeklySeed, userName, userBirthday);

  // Personal card based on birthday + current month
  const currentMonth = new Date().getMonth().toString();
  const personalSeed = userBirthday
    ? userBirthday + currentMonth
    : currentMonth;
  const personal = getTarotCard(personalSeed, userName, userBirthday);

  // Generate personalized advice
  const advice = generatePersonalizedAdvice(daily, weekly, personal, userName);

  return {
    daily,
    weekly,
    personal,
    advice,
  };
};

const generatePersonalizedAdvice = (
  daily: TarotCard,
  weekly: TarotCard,
  personal: TarotCard,
  userName?: string,
): string => {
  const name = userName || 'seeker';

  return `${name}, today's energy of "${daily.name}" emphasizes ${daily.keywords[0].toLowerCase()}. Your weekly influence "${weekly.name}" brings focus to ${weekly.keywords[1]?.toLowerCase() || weekly.keywords[0].toLowerCase()}. The personal card "${personal.name}" suggests that ${personal.keywords[0].toLowerCase()} is particularly relevant for your current path.`;
};
