const Crystals = () => {
  const crystalCategories = [
    {
      name: 'Protection & Grounding',
      crystals: [
        {
          name: 'Black Tourmaline',
          properties: 'Shields from negativity, grounds excess energy',
        },
        {
          name: 'Obsidian',
          properties: 'Powerful protection, reveals hidden truths',
        },
        { name: 'Hematite', properties: 'Mental focus, physical grounding' },
        {
          name: 'Smoky Quartz',
          properties: 'Gentle grounding, negativity clearing',
        },
      ],
    },
    {
      name: 'Love & Heart Healing',
      crystals: [
        {
          name: 'Rose Quartz',
          properties: 'Unconditional love, emotional healing',
        },
        {
          name: 'Green Aventurine',
          properties: 'Heart chakra healing, good fortune',
        },
        { name: 'Rhodonite', properties: 'Forgiveness, self-love' },
        { name: 'Morganite', properties: 'Divine love, compassionate healing' },
      ],
    },
    {
      name: 'Spiritual & Intuitive',
      crystals: [
        {
          name: 'Amethyst',
          properties: 'Third eye opening, spiritual protection',
        },
        {
          name: 'Labradorite',
          properties: 'Psychic abilities, transformation',
        },
        { name: 'Moonstone', properties: 'Lunar cycles, feminine wisdom' },
        { name: 'Celestite', properties: 'Angelic communication, peace' },
      ],
    },
    {
      name: 'Manifestation & Abundance',
      crystals: [
        { name: 'Citrine', properties: 'Solar energy, prosperity attraction' },
        { name: 'Pyrite', properties: 'Confidence, wealth manifestation' },
        { name: 'Green Jade', properties: 'Luck, harmony, prosperity' },
        { name: 'Sunstone', properties: 'Personal power, optimism' },
      ],
    },
    {
      name: 'Communication & Clarity',
      crystals: [
        { name: 'Sodalite', properties: 'Logic, clear communication' },
        { name: 'Lapis Lazuli', properties: 'Truth, wisdom, inner vision' },
        { name: 'Aquamarine', properties: 'Honest expression, courage' },
        { name: 'Clear Quartz', properties: 'Amplification, mental clarity' },
      ],
    },
  ];

  return (
    <div className='h-[91vh]'>
      <h1 className='text-lg font-bold mb-3 pt-12'>Crystals</h1>

      <h2 id='daily-selection' className='text-lg font-bold mb-4 pt-12'>
        Daily Crystal Selection
      </h2>
      <div className='mb-3 text-xs'>
        <h3 className='font-bold pb-1'>Personalized Algorithm</h3>
        <p className='pb-1'>
          Your daily crystal is selected through a sophisticated cosmic
          alignment analysis that considers multiple astrological and
          numerological factors.
        </p>
      </div>

      <div className='mb-3 text-xs'>
        <h3 className='font-bold pb-1'>Selection Factors</h3>
        <p className='pb-1'>
          <strong>Birth Chart Analysis:</strong> Your Sun, Moon, and planetary
          placements
        </p>
        <p className='pb-1'>
          <strong>Current Transits:</strong> Today&apos;s planetary positions
          and their aspects to your natal chart
        </p>
        <p className='pb-1'>
          <strong>Numerological Influence:</strong> Universal Day Number and
          Personal Day Number
        </p>
        <p className='pb-1'>
          <strong>Planetary Day Ruler:</strong> Each day is ruled by a specific
          planet (Sunday-Sun, Monday-Moon, etc.)
        </p>
        <p>
          Additional factors include elemental balance, challenging vs
          harmonious aspects, and daily variation algorithms
        </p>
      </div>

      <div className='mb-3 text-xs'>
        <h3 className='font-bold pb-1'>Why This Method</h3>
        <p className='pb-1'>
          Crystals work through resonance - their molecular structure vibrates
          at frequencies that can align with and support your energy field.
        </p>
        <p>
          By matching crystal properties to your current astrological
          influences, we ensure you receive the most beneficial vibrational
          support for your daily journey.
        </p>
      </div>

      <h2 id='crystal-categories' className='text-lg font-bold mb-4 pt-12'>
        Crystal Categories
      </h2>
      {crystalCategories.map((category) => (
        <div key={category.name} className='mb-4'>
          <h3 className='font-bold pb-1 text-sm'>{category.name}</h3>
          {category.crystals.map((crystal) => (
            <div key={crystal.name} className='mb-2 text-xs pl-2'>
              <h4 className='font-medium pb-1'>{crystal.name}</h4>
              <p className='text-zinc-400'>{crystal.properties}</p>
            </div>
          ))}
        </div>
      ))}

      <h2 id='working-with-crystals' className='text-lg font-bold mb-4 pt-12'>
        Working with Crystals
      </h2>
      <div className='mb-3 text-xs'>
        <h3 className='font-bold pb-1'>Daily Practice</h3>
        <p className='pb-1'>
          Hold your daily crystal during meditation, carry it with you, or place
          it on your workspace
        </p>
        <p className='pb-1'>
          Set an intention that aligns with both the crystal&apos;s properties
          and your daily astrological influences
        </p>
        <p>
          Take a moment to connect with the stone&apos;s energy and visualize
          its support throughout your day
        </p>
      </div>

      <div className='mb-3 text-xs'>
        <h3 className='font-bold pb-1'>Cleansing & Charging</h3>
        <p className='pb-1'>
          Clear accumulated energies using moonlight, sage, or running water
          (check crystal compatibility)
        </p>
        <p className='pb-1'>
          Charge crystals under the full moon or with selenite to restore their
          natural vibration
        </p>
        <p>
          Programming involves holding the crystal and clearly stating your
          intention for its use
        </p>
      </div>

      <div className='mb-3 text-xs'>
        <h3 className='font-bold pb-1'>Astrological Timing</h3>
        <p className='pb-1'>
          New Moon: Ideal for setting intentions with manifestation stones like
          Citrine
        </p>
        <p className='pb-1'>
          Full Moon: Perfect for charging and releasing with stones like
          Moonstone
        </p>
        <p className='pb-1'>
          Mercury Retrograde: Use grounding stones like Hematite for stability
        </p>
        <p>
          Eclipse Periods: Powerful times for transformation crystals like
          Labradorite
        </p>
      </div>
    </div>
  );
};

export default Crystals;
