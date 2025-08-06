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
): TarotCard => {
  return getTarotCard(date, userName);
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
  const today = new Date().toDateString();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartString = weekStart.toDateString();

  // Daily card for today
  const daily = getTarotCard(today, userName);

  // Weekly card based on start of week
  const weekly = getTarotCard(weekStartString, userName);

  // Personal card based on birthday + current month
  const currentMonth = new Date().getMonth().toString();
  const personalSeed = userBirthday
    ? userBirthday + currentMonth
    : currentMonth;
  const personal = getTarotCard(personalSeed, userName);

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
