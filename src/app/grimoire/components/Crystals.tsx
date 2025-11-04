'use client';

import { useEffect } from 'react';

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
      ],
    },
    {
      name: 'Prosperity & Abundance',
      crystals: [
        {
          name: 'Citrine',
          properties: 'Manifestation, abundance, success',
        },
        {
          name: 'Green Aventurine',
          properties: 'Opportunity, luck, prosperity',
        },
        {
          name: 'Pyrite',
          properties: 'Business success, wealth attraction',
        },
        { name: 'Jade', properties: 'Prosperity, harmony, wisdom' },
        {
          name: 'Peridot',
          properties: 'Abundance, growth, positive change',
        },
        { name: 'Tiger Eye', properties: 'Practical action, focus' },
        {
          name: 'Malachite',
          properties: 'Transformation, risk-taking, courage',
        },
      ],
    },
    {
      name: 'Healing & Wellness',
      crystals: [
        {
          name: 'Clear Quartz',
          properties: 'Universal healer, amplifies energy',
        },
        {
          name: 'Rose Quartz',
          properties: 'Emotional healing, self-love',
        },
        {
          name: 'Amethyst',
          properties: 'Pain relief, calming, sleep',
        },
        { name: 'Selenite', properties: 'Spiritual cleansing, peace' },
        {
          name: 'Carnelian',
          properties: 'Vitality, motivation, physical energy',
        },
        {
          name: 'Aventurine',
          properties: 'Heart healing, emotional balance',
        },
        {
          name: 'Fluorite',
          properties: 'Mental clarity, focus, organization',
        },
      ],
    },
    {
      name: 'Communication & Creativity',
      crystals: [
        {
          name: 'Blue Lace Agate',
          properties: 'Calm communication, expression',
        },
        {
          name: 'Aquamarine',
          properties: 'Courageous communication, clarity',
        },
        { name: 'Sodalite', properties: 'Logic, truth, self-expression' },
        {
          name: 'Lapis Lazuli',
          properties: 'Wisdom, truth, communication',
        },
        {
          name: 'Amazonite',
          properties: 'Harmony, balance, self-expression',
        },
        {
          name: 'Citrine',
          properties: 'Creativity, inspiration, confidence',
        },
      ],
    },
  ];

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className='space-y-8 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Crystals
        </h1>
        <p className='text-sm text-zinc-400'>
          Comprehensive crystal guide with daily selections, categories, and how
          to work with crystals for healing and magic
        </p>
      </div>

      <section id='daily-selection' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>Daily Selection</h2>
        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
          <p className='text-sm text-zinc-300'>
            Select crystals based on your daily intentions and needs. Choose
            crystals that resonate with your current energy and goals.
          </p>
        </div>
      </section>

      <section id='crystal-categories' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Crystal Categories
        </h2>
        <div className='space-y-6'>
          {crystalCategories.map((category) => (
            <div key={category.name}>
              <h3 className='text-lg font-medium text-zinc-200 mb-3'>
                {category.name}
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {category.crystals.map((crystal) => (
                  <div
                    key={crystal.name}
                    className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
                  >
                    <h4 className='font-medium text-zinc-100 mb-2'>
                      {crystal.name}
                    </h4>
                    <p className='text-sm text-zinc-300 leading-relaxed'>
                      {crystal.properties}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id='crystal-healing' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Crystal Healing & Practices
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Crystal Grids
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Crystal grids amplify energy by arranging crystals in sacred
              geometric patterns. Place a central crystal (master stone) in the
              center, then arrange supporting stones around it. Activate by
              connecting the stones with intention, visualization, or a wand.
              Common patterns include circles, triangles, and flower of life.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Manifestation, protection, healing, abundance
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Crystal Programming
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              Programming sets specific intentions into your crystals. Hold the
              crystal, clear your mind, and visualize your intention flowing
              into the stone. State your intention clearly either aloud or
              silently. The crystal will hold and amplify this energy until
              reprogrammed or cleansed.
            </p>
            <p className='text-xs text-zinc-400'>
              Best for: Setting specific goals, directing crystal energy
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Crystal Cleansing Methods
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <div>
                <strong>Moonlight:</strong> Place crystals under full moon
                overnight (avoid direct sunlight for some crystals)
              </div>
              <div>
                <strong>Sunlight:</strong> Brief exposure to sun (check crystal
                compatibility - some fade)
              </div>
              <div>
                <strong>Water:</strong> Running water or salt water (avoid
                porous/soft crystals)
              </div>
              <div>
                <strong>Smoke:</strong> Pass through sage, palo santo, or
                incense smoke
              </div>
              <div>
                <strong>Sound:</strong> Use singing bowls, bells, or chimes
              </div>
              <div>
                <strong>Earth:</strong> Bury in soil overnight (gentle method)
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Chakra Crystals
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-300'>
              <div>
                <strong>Root:</strong> Red Jasper, Hematite, Black Tourmaline
              </div>
              <div>
                <strong>Sacral:</strong> Carnelian, Orange Calcite, Sunstone
              </div>
              <div>
                <strong>Solar Plexus:</strong> Citrine, Tiger Eye, Yellow Jasper
              </div>
              <div>
                <strong>Heart:</strong> Rose Quartz, Green Aventurine, Jade
              </div>
              <div>
                <strong>Throat:</strong> Blue Lace Agate, Aquamarine, Sodalite
              </div>
              <div>
                <strong>Third Eye:</strong> Amethyst, Lapis Lazuli, Fluorite
              </div>
              <div>
                <strong>Crown:</strong> Clear Quartz, Amethyst, Selenite
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id='faq' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How often should I cleanse my crystals?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Cleanse after heavy use, when they feel heavy or dull, after
              others handle them, or monthly as maintenance. Some crystals (like
              Selenite) are self-cleansing and can cleanse other stones.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Which crystals work well together?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Complementary crystals enhance each other: Rose Quartz + Clear
              Quartz (amplify love), Amethyst + Selenite (spiritual cleansing),
              Black Tourmaline + Clear Quartz (protection with clarity). Avoid
              pairing conflicting energies (e.g., calming and energizing stones
              together).
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Can I put crystals in water?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Some crystals are water-safe (Quartz, Amethyst, Agate), while
              others dissolve or are damaged (Selenite, Halite, Malachite).
              Always research your specific crystal before water exposure. When
              in doubt, use other cleansing methods.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Crystals;
