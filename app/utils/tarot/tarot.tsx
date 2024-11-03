import { tarotCards } from "../../utils/tarot/tarot-cards";
import seed from 'seed-random'

type TarotSuit = 'cups' | 'swords' | 'wands' | 'pentacles';

const tarotSuits = ['cups', 'swords', 'wands', 'pentacles'];
const getRandomInt = (max: number, currentDate: Date) => {
  const rand = seed("Sammii" + currentDate);
  return Math.floor(rand() * max);
}

const majorArcana = Object.keys(tarotCards.majorArcana)
  const getAllCardNames = () => {
    const minorArcana = tarotSuits.flatMap(suit => Object.keys(tarotCards.minorArcana[suit as keyof typeof tarotCards.minorArcana]))
    return [...majorArcana, ...minorArcana]
  }

const allCardNames = getAllCardNames()

type TarotCard = {
  name: string;
  keywords: string[];
  information: string;
}

export const getTarotCard = (date: string): TarotCard => {
  const number = getRandomInt(allCardNames.length -1, new Date(date))
  const tarotCard = allCardNames[number]
  const majorArcanaCard = tarotCards.majorArcana[tarotCard as keyof typeof tarotCards.majorArcana]
  const cupsCard = tarotCards.minorArcana.cups[tarotCard as keyof typeof tarotCards.minorArcana.cups]
  const wandsCard = tarotCards.minorArcana.wands[tarotCard as keyof typeof tarotCards.minorArcana.wands]
  const swordsCard = tarotCards.minorArcana.swords[tarotCard as keyof typeof tarotCards.minorArcana.swords]
  const pentaclesCard = tarotCards.minorArcana.pentacles[tarotCard as keyof typeof tarotCards.minorArcana.pentacles]
  
  return { ...majorArcanaCard as any, ...cupsCard as any, ...wandsCard as any, ...swordsCard as any, ...pentaclesCard as any }
  
}