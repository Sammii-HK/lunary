'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { stringToKebabCase } from '../../../../utils/string';

interface Crystal {
  name: string;
  description?: string;
  metaphysicalProperties?: string;
}

interface CrystalCategory {
  name: string;
  crystals: { name: string; properties: string }[];
}

const Crystals = () => {
  const [crystalCategories, setCrystalCategories] = useState<CrystalCategory[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/grimoire/crystals')
      .then((r) => r.json())
      .then((data) => {
        const categories = data.categories.map((categoryName: string) => {
          const crystalsInCategory = data.crystals.filter(
            (c: Crystal & { category?: string }) => c.category === categoryName,
          );
          return {
            name: categoryName,
            crystals: crystalsInCategory.map((crystal: Crystal) => ({
              name: crystal.name,
              properties:
                crystal.description || crystal.metaphysicalProperties || '',
            })),
          };
        });
        setCrystalCategories(categories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    }
  }, [loading]);

  return (
    <div className='space-y-8'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Crystal Guide
        </h2>
        <p className='text-sm text-zinc-400'>
          Comprehensive crystal guide with daily selections, categories, and how
          to work with crystals for healing and magic
        </p>
      </div>

      {/* Complete Guide Banner */}
      <Link
        href='/grimoire/guides/crystal-healing-guide'
        className='block p-4 rounded-lg bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 border border-lunary-primary-700 hover:border-lunary-primary-500 transition-colors group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium text-lunary-primary-300 group-hover:text-lunary-primary-200 transition-colors'>
              📖 Read the Complete Crystal Healing Guide
            </h3>
            <p className='text-sm text-zinc-400'>
              Learn crystal selection, cleansing, programming, and healing
              practices
            </p>
          </div>
          <span className='text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
            →
          </span>
        </div>
      </Link>

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
        {loading ? (
          <div className='space-y-6'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='animate-pulse'>
                <div className='h-6 bg-zinc-800 rounded w-32 mb-3' />
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {[1, 2, 3].map((j) => (
                    <div key={j} className='h-24 bg-zinc-800/50 rounded-lg' />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-6'>
            {crystalCategories.map((category) => (
              <div key={category.name}>
                <h3 className='text-lg font-medium text-zinc-200 mb-3'>
                  {category.name}
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {category.crystals.map((crystal) => {
                    const crystalSlug = stringToKebabCase(crystal.name);
                    return (
                      <Link
                        key={crystal.name}
                        href={`/grimoire/crystals/${crystalSlug}`}
                        className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
                      >
                        <h4 className='font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                          {crystal.name}
                        </h4>
                        <p className='text-sm text-zinc-300 leading-relaxed'>
                          {crystal.properties}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id='crystal-healing' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>
          Crystal Healing & Practices
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              How often should I cleanse my crystals?
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Cleanse after heavy use, when they feel heavy or dull, after
              others handle them, or monthly as maintenance. Some crystals (like
              Selenite) are self-cleansing and can cleanse other stones.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
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

      <section className='mt-12 pt-8 border-t border-zinc-800/50'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Related Topics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <a
            href='/grimoire/practices'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Spells & Rituals
          </a>
          <a
            href='/grimoire/moon'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Moon Magic
          </a>
          <a
            href='/grimoire/candle-magic'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Candle Magic
          </a>
          <a
            href='/grimoire/correspondences/colors'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Color Correspondences
          </a>
          <a
            href='/grimoire/chakras'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Chakra Healing
          </a>
          <a
            href='/grimoire/correspondences'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Magical Correspondences
          </a>
        </div>
      </section>
    </div>
  );
};

export default Crystals;
