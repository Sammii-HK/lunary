import { tarotCards } from "../../utils/tarot/tarot-cards";
import seed from 'seed-random'

type TarotSuit = 'cups' | 'swords' | 'wands' | 'pentacles';

const tarotSuits = ['cups', 'swords', 'wands', 'pentacles'];

export const TarotWidget = () => {
  const majorArcana = Object.keys(tarotCards.majorArcana)
  const getAllCardNames = () => {
    const minorArcana = tarotSuits.flatMap(suit => Object.keys(tarotCards.minorArcana[suit as keyof typeof tarotCards.minorArcana]))
    return [...majorArcana, ...minorArcana]
  }

  const getRandomInt = (max: number) => {
    const today = (new Date()).toDateString();
    const rand = seed("Sammii" + today);
    console.log("randomness", today, rand())
    return Math.floor(rand() * max);
  }

  const allCardNames = getAllCardNames()

  // console.log("allCardNames", allCardNames, allCardNames.length);

  const getTarotCard = () => {
    const number = getRandomInt(allCardNames.length -1)
    // console.log("number", number);
    const tarotCard = allCardNames[number]
    const majorArcanaCard = tarotCards.majorArcana[tarotCard as keyof typeof tarotCards.majorArcana]
    const cupsCard = tarotCards.minorArcana.cups[tarotCard as keyof typeof tarotCards.minorArcana.cups]
    const wandsCard = tarotCards.minorArcana.wands[tarotCard as keyof typeof tarotCards.minorArcana.wands]
    const swordsCard = tarotCards.minorArcana.swords[tarotCard as keyof typeof tarotCards.minorArcana.swords]
    const pentaclesCard = tarotCards.minorArcana.pentacles[tarotCard as keyof typeof tarotCards.minorArcana.pentacles]
    // console.log("card", majorArcanaCard, cupsCard, wandsCard, swordsCard, pentaclesCard);
    
    return { ...majorArcanaCard as any, ...cupsCard as any, ...wandsCard as any, ...swordsCard as any, ...pentaclesCard as any }
    
  }

  const tarot = getTarotCard();

  return (
    <div className="p-5 border border-stone-800 rounded-md">
      <p className="mb-3">{tarot.name}</p>
      {/* <p className="w-full">{tarot.keywords.map((keyword: string) => `${keyword} `)}</p> */}
      <p className="mt-3 text-[12px]">{tarot.information}</p>
    </div>
  )
}