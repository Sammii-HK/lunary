import { tarotCards } from "../../utils/tarot/tarot-cards";
import seed from 'seed-random'

type TarotSuit = 'cups' | 'swords' | 'wands' | 'pentacles';

const tarotSuits = ['cups', 'swords', 'wands', 'pentacles'];

export const TarotWidget = () => {
  const majorArcana = Object.keys(tarotCards.majorArcana)
  const getAllCardNames = () => {
    const getSuitCards = (suit: TarotSuit) => Object.keys(tarotCards.minorArcana[suit])
    const minorArcana = tarotSuits.flatMap(suit => Object.keys(tarotCards.minorArcana[suit]))
    console.log("minorArcana", minorArcana);
    return [...majorArcana, ...minorArcana]
  }

  const getRandomInt = (max: number) => {
    const today = (new Date()).toDateString();
    const rand = seed("Sammii" + today);
    console.log("randomness", today, rand())
    return Math.floor(rand() * max);
  }

  // const setTarot = setLocalStorage();

  const allCardNames = getAllCardNames()

  console.log("allCardNames", allCardNames, allCardNames.length);

  const getTarotCard = () => {
    const number = getRandomInt(allCardNames.length -1)
    console.log("number", number);
    const tarotCard = allCardNames[number]
    const majorArcanaCard = tarotCards.majorArcana[tarotCard]
    const cupsCard = tarotCards.minorArcana.cups[tarotCard]
    const wandsCard = tarotCards.minorArcana.wands[tarotCard]
    const swordsCard = tarotCards.minorArcana.swords[tarotCard]
    const pentaclesCard = tarotCards.minorArcana.pentacles[tarotCard]
    // const tarotInfo = majorArcanaCard | cupsCard | wandsCard | swordsCard | pentaclesCard
    console.log("majorArcanaCard | cupsCard | wandsCard | swordsCard | pentaclesCard", majorArcanaCard, cupsCard, wandsCard, swordsCard, pentaclesCard);
    
    // console.log("tarotInfo", tarotInfo);
    return { ...majorArcanaCard, ...cupsCard, ...wandsCard, ...swordsCard, ...pentaclesCard }
    
  }

  const tarot = getTarotCard()

  console.log("tarot", tarot);
  
  

  return (
    <div className="p-5 border-1 border-stone-500">
      <p>{tarot.name}</p>
      <p>{tarot.keywords}</p>
      <p>{tarot.information}</p>
    </div>
  )
}