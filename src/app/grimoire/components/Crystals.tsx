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

      <section id='working-with-crystals' className='space-y-4'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Working with Crystals
        </h2>
        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
          <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
            Crystals can be used in various ways for healing and magical work:
          </p>
          <ul className='space-y-2 text-sm text-zinc-300 list-disc list-inside'>
            <li>
              <strong>Meditation:</strong> Hold or place crystals during
              meditation to enhance focus and intention
            </li>
            <li>
              <strong>Grids:</strong> Arrange crystals in sacred geometric
              patterns to amplify energy
            </li>
            <li>
              <strong>Wearable:</strong> Carry crystals as jewelry or in pockets
              for continuous energy support
            </li>
            <li>
              <strong>Cleansing:</strong> Regularly cleanse crystals with sage,
              moonlight, or running water
            </li>
            <li>
              <strong>Programming:</strong> Set intentions with your crystals by
              holding them and focusing on your desired outcome
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Crystals;
