import Link from 'next/link';

const Grimoire = () => {
  return (
    <div className="h-[91vh]">
      <h1 className="text-lg font-bold mb-4">Grimoire</h1>
      <p>Search...</p>
      {/* <li>Table of Contents</li> */}
      {/* <h2>Index</h2> */}
      <ul>
        {/* <li>Moon</li>  */}
        <Link href="/grimoire/moon" className="font-bold mt-2">Moon</Link>
        {/* // phases, full moon names */}
            
        <li>Wheel of the Year</li> 
        {/* // sabbats */}
        {/* <li>Sabbat</li> */}
        {/* days of the week */}

        <li>Astrology</li>
        {/* <li>Zodiac</li>
            <li>Tree Zodiac</li> */}

        <li>Tarot</li>
        <li>Runes</li>
        <li>Chakras</li>
        <li>Crystals</li>

        <Link href="/grimoire/correspondences" className="font-bold mt-2">Correspondences</Link>
        <ul>
          <li>Elements</li>
          <li>Colors</li>
          <li>Days</li>
          <li>Deities</li>
          <li>FLowers</li>
          <li>Numbers</li>
          <li>Wood</li>
          <li>Herbs</li>
          <li>Animals</li>
        </ul>

        <Link href="/grimoire/practices" className="font-bold mt-2">Practices</Link>
        <ul>
          <li>Spells</li>
          <li>Rituals</li>
          <li>Recipes</li>
          <li>Divination</li>

        </ul>
      </ul>
    </div>
  );
};

export default Grimoire;
