import Link from 'next/link';

const grimoire: { [key: string]: { title: string; contents?: string[] } } = {
  moon: {
    title: 'Moon',
    contents: [
      'Phases',
      'Full Moon Names',
    ]
  },
  wheelOfTheYear: {
    title: 'Wheel of the Year',
    // contents: [
    //   'sabbats',
    // ]
  },
  astronomy: {
    title: 'Astronomy',
    contents: [
      'Planets',
      'Zodiac',
    ]
  },
  tarot: {
    title: 'Tarot',
    contents: [
      'Arcana',
      'Spreads',
    ]
  },
  runes: {
    title: 'Runes',
  },
  chakras: {
    title: 'Chakras',
  },
  crystals: {
    title: 'Crystals',
  },
  correspondences: {
    title: 'Correspondences',
    contents: [
      'Elements',
      'Colors',
      'Days',
      'Deities',
      'Flowers',
      'Numbers',
      'Wood',
      'Herbs',
      'Animals',
    ]
  },
  practices: {
    title: 'Practices',
    contents: [
      'Spells',
      'Rituals',
      'Recipes',
      'Divination',
    ]
  },
}

const grimoireItems = Object.keys(grimoire);

const Grimoire = () => {
  return (
    <div className="h-[91vh]">
      <h1 className="text-lg font-bold mb-4">Grimoire</h1>
      <p>Search...</p>
      <ul className='flex flex-col'>
        {grimoireItems.map((item: string) => (
          <>
            <Link href={`/grimoire/${item}`} className="mt-3 mb-1 font-bold">{grimoire[item].title}</Link>
            {grimoire[item].contents?.map((content: string) => (
              <Link href={`/grimoire/${item}#${content.replaceAll(' ', '-').toLowerCase()}`} className="font-light mb-1 pl-3">{content}</Link>
            ))}
          </>
        ))}
      </ul>
    </div>
  );
};

export default Grimoire;
