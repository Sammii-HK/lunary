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
        { name: 'Shungite', properties: 'EMF protection, ancient wisdom' },
        { name: 'Red Jasper', properties: 'Physical strength, endurance' },
        { name: 'Garnet', properties: 'Courage, protection during travel' },
        { name: 'Onyx', properties: 'Emotional protection, self-control' },
        {
          name: 'Apache Tear',
          properties: 'Grief healing, psychic protection',
        },
        {
          name: 'Fire Agate',
          properties: 'Shield against ill-wishes, vitality',
        },
        {
          name: 'Jet',
          properties: 'Ancient protection, absorbs negative energy',
        },
        { name: 'Bloodstone', properties: 'Courage, protection in conflict' },
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
        { name: 'Pink Tourmaline', properties: 'Emotional healing, self-love' },
        { name: 'Emerald', properties: 'Divine love, loyalty, partnership' },
        {
          name: 'Prehnite',
          properties: 'Unconditional love, healing the healer',
        },
        { name: 'Kunzite', properties: 'Heart healing, emotional balance' },
        {
          name: 'Green Calcite',
          properties: 'Heart chakra cleansing, renewal',
        },
        { name: 'Chrysoprase', properties: 'Heart healing, joy, optimism' },
        { name: 'Unakite', properties: 'Emotional balance, patience in love' },
        {
          name: 'Amazonite',
          properties: 'Heart-throat connection, truth in love',
        },
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
        { name: 'Selenite', properties: 'Crown chakra activation, cleansing' },
        {
          name: 'Lapis Lazuli',
          properties: 'Third eye wisdom, divine connection',
        },
        { name: 'Iolite', properties: 'Vision quests, shamanic journeying' },
        { name: 'Kyanite', properties: 'Psychic alignment, meditation' },
        {
          name: 'Fluorite',
          properties: 'Mental clarity, spiritual discernment',
        },
        { name: 'Moldavite', properties: 'Rapid spiritual transformation' },
        {
          name: 'Angelite',
          properties: 'Angel communication, peaceful awareness',
        },
        { name: 'Azurite', properties: 'Psychic development, divine guidance' },
        { name: 'Charoite', properties: 'Spiritual courage, transmutation' },
        {
          name: 'Lepidolite',
          properties: 'Spiritual transition, stress relief',
        },
      ],
    },
    {
      name: 'Manifestation & Abundance',
      crystals: [
        { name: 'Citrine', properties: 'Solar energy, prosperity attraction' },
        { name: 'Pyrite', properties: 'Confidence, wealth manifestation' },
        { name: 'Green Jade', properties: 'Luck, harmony, prosperity' },
        { name: 'Sunstone', properties: 'Personal power, optimism' },
        { name: 'Tiger Eye', properties: 'Willpower, practical manifestation' },
        { name: 'Peridot', properties: 'Abundance, positive manifestation' },
        { name: 'Carnelian', properties: 'Creative manifestation, motivation' },
        { name: 'Orange Calcite', properties: 'Creative energy, confidence' },
        { name: 'Golden Topaz', properties: 'Manifestation, divine will' },
        { name: 'Aventurine', properties: 'Opportunity, luck, prosperity' },
        { name: 'Malachite', properties: 'Transformation, risk-taking' },
        { name: 'Moss Agate', properties: 'New beginnings, abundance' },
      ],
    },
    {
      name: 'Communication & Clarity',
      crystals: [
        { name: 'Sodalite', properties: 'Logic, clear communication' },
        { name: 'Lapis Lazuli', properties: 'Truth, wisdom, inner vision' },
        { name: 'Aquamarine', properties: 'Honest expression, courage' },
        { name: 'Clear Quartz', properties: 'Amplification, mental clarity' },
        { name: 'Blue Lace Agate', properties: 'Gentle communication, peace' },
        { name: 'Turquoise', properties: 'Honest communication, protection' },
        { name: 'Amazonite', properties: 'Truth, integrity, harmony' },
        { name: 'Blue Calcite', properties: 'Peaceful communication, clarity' },
        { name: 'Celestite', properties: 'Divine communication, tranquility' },
        { name: 'Chalcedony', properties: 'Diplomatic communication' },
      ],
    },
    {
      name: 'Healing & Wellness',
      crystals: [
        { name: 'Amethyst', properties: 'Pain relief, addiction recovery' },
        {
          name: 'Clear Quartz',
          properties: 'Master healer, energy amplification',
        },
        { name: 'Rose Quartz', properties: 'Emotional healing, self-care' },
        { name: 'Fluorite', properties: 'Mental healing, concentration' },
        { name: 'Bloodstone', properties: 'Blood purification, vitality' },
        {
          name: 'Carnelian',
          properties: 'Physical energy, reproductive health',
        },
        { name: 'Chrysocolla', properties: 'Throat healing, feminine wisdom' },
        { name: 'Shungite', properties: 'Detoxification, immune support' },
        { name: 'Malachite', properties: 'Heart healing, inflammation relief' },
        { name: 'Turquoise', properties: 'Overall healing, protection' },
        { name: 'Jade', properties: 'Kidney health, longevity' },
        { name: 'Hematite', properties: 'Blood circulation, grounding' },
      ],
    },
    {
      name: 'Chakra Balancing',
      crystals: [
        { name: 'Red Jasper', properties: 'Root Chakra - Grounding, survival' },
        {
          name: 'Carnelian',
          properties: 'Sacral Chakra - Creativity, sexuality',
        },
        {
          name: 'Citrine',
          properties: 'Solar Plexus - Personal power, confidence',
        },
        { name: 'Rose Quartz', properties: 'Heart Chakra - Love, compassion' },
        {
          name: 'Sodalite',
          properties: 'Throat Chakra - Communication, truth',
        },
        { name: 'Amethyst', properties: 'Third Eye - Intuition, wisdom' },
        {
          name: 'Clear Quartz',
          properties: 'Crown Chakra - Divine connection',
        },
        {
          name: 'Smoky Quartz',
          properties: 'Root Chakra - Protection, grounding',
        },
        {
          name: 'Orange Calcite',
          properties: 'Sacral Chakra - Joy, creativity',
        },
        {
          name: 'Malachite',
          properties: 'Heart Chakra - Transformation, healing',
        },
        {
          name: 'Lapis Lazuli',
          properties: 'Throat/Third Eye - Truth, insight',
        },
        {
          name: 'Selenite',
          properties: 'Crown Chakra - Purification, clarity',
        },
      ],
    },
    {
      name: 'Meditation & Peace',
      crystals: [
        {
          name: 'Amethyst',
          properties: 'Deep meditation, spiritual connection',
        },
        {
          name: 'Selenite',
          properties: 'Mental clarity, crown chakra opening',
        },
        { name: 'Clear Quartz', properties: 'Amplifies meditation intentions' },
        { name: 'Fluorite', properties: 'Mental focus, concentration' },
        { name: 'Lepidolite', properties: 'Calming anxiety, peaceful mind' },
        { name: 'Blue Lace Agate', properties: 'Tranquility, gentle energy' },
        { name: 'Celestite', properties: 'Divine peace, angelic connection' },
        { name: 'Howlite', properties: 'Calming the mind, reducing stress' },
        { name: 'Moonstone', properties: 'Intuitive meditation, cycles' },
        {
          name: 'Labradorite',
          properties: 'Mystical meditation, transformation',
        },
        { name: 'Prehnite', properties: 'Inner peace, divine love' },
        {
          name: 'Angelite',
          properties: 'Peaceful awareness, angel communication',
        },
      ],
    },
    {
      name: 'Creativity & Inspiration',
      crystals: [
        {
          name: 'Carnelian',
          properties: 'Creative fire, artistic inspiration',
        },
        { name: 'Orange Calcite', properties: 'Creative confidence, joy' },
        {
          name: 'Citrine',
          properties: 'Mental clarity, creative manifestation',
        },
        { name: 'Sunstone', properties: 'Creative leadership, originality' },
        { name: 'Tiger Eye', properties: 'Practical creativity, focus' },
        { name: 'Fluorite', properties: 'Mental clarity, innovative thinking' },
        { name: 'Amazonite', properties: 'Creative communication, harmony' },
        { name: 'Moonstone', properties: 'Intuitive creativity, inspiration' },
        {
          name: 'Labradorite',
          properties: 'Imaginative vision, transformation',
        },
        { name: 'Ametrine', properties: 'Creative balance, mental clarity' },
      ],
    },
    {
      name: 'Sleep & Dreams',
      crystals: [
        { name: 'Amethyst', properties: 'Peaceful sleep, prophetic dreams' },
        { name: 'Moonstone', properties: 'Dream recall, lunar rhythms' },
        { name: 'Lepidolite', properties: 'Insomnia relief, calming anxiety' },
        { name: 'Howlite', properties: 'Quieting the mind, restful sleep' },
        { name: 'Rose Quartz', properties: 'Gentle dreams, emotional healing' },
        { name: 'Celestite', properties: 'Angelic dreams, peaceful rest' },
        { name: 'Prehnite', properties: 'Prophetic dreams, inner peace' },
        { name: 'Labradorite', properties: 'Dream work, subconscious access' },
        { name: 'Clear Quartz', properties: 'Dream clarity, amplification' },
        {
          name: 'Blue Lace Agate',
          properties: 'Peaceful sleep, gentle energy',
        },
      ],
    },
    {
      name: 'Study & Learning',
      crystals: [
        { name: 'Fluorite', properties: 'Mental clarity, concentration' },
        { name: 'Clear Quartz', properties: 'Memory enhancement, clarity' },
        { name: 'Sodalite', properties: 'Logic, rational thought' },
        { name: 'Hematite', properties: 'Mental focus, grounding' },
        { name: 'Citrine', properties: 'Mental stamina, confidence' },
        { name: 'Amazonite', properties: 'Clear communication, truth' },
        { name: 'Lapis Lazuli', properties: 'Wisdom, intellectual ability' },
        { name: 'Carnelian', properties: 'Motivation, mental courage' },
        { name: 'Tiger Eye', properties: 'Practical wisdom, discernment' },
        { name: 'Pyrite', properties: 'Mental clarity, confidence' },
      ],
    },
    {
      name: 'Travel & Journey',
      crystals: [
        {
          name: 'Moonstone',
          properties: 'Safe travel, protection on journeys',
        },
        { name: 'Malachite', properties: 'Travel protection, transformation' },
        { name: 'Turquoise', properties: 'Travel safety, communication' },
        { name: 'Hematite', properties: 'Grounding during travel' },
        {
          name: 'Amethyst',
          properties: 'Protection during spiritual journeys',
        },
        {
          name: 'Labradorite',
          properties: 'Psychic protection while traveling',
        },
        { name: 'Garnet', properties: 'Safe return home, courage' },
        { name: 'Aquamarine', properties: 'Water travel protection, courage' },
        { name: 'Jade', properties: 'Safe journeys, good fortune' },
        { name: 'Bloodstone', properties: 'Physical protection, courage' },
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
