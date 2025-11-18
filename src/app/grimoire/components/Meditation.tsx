'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { stringToKebabCase } from '../../../../utils/string';

const Meditation = () => {
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
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Meditation & Mindfulness Guide
        </h2>
        <p className='text-sm text-zinc-400'>
          Meditation and mindfulness practices for spiritual growth, energy
          work, and daily well-being. Essential skills for any magical practice.
        </p>
      </div>

      {/* Meditation Techniques Section */}
      <section id='techniques' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Meditation Techniques
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Different meditation techniques serve different purposes. Experiment
            to find what works for you.
          </p>
        </div>
        <div className='space-y-4'>
          {[
            {
              name: 'Guided Meditation',
              description:
                'Follow a recorded or live guide through visualization and relaxation. Great for beginners and specific intentions.',
              bestFor: 'Beginners, specific goals, relaxation, healing',
            },
            {
              name: 'Mindfulness Meditation',
              description:
                'Focus on present-moment awareness without judgment. Observe thoughts, feelings, and sensations as they arise.',
              bestFor: 'Daily practice, stress reduction, emotional regulation',
            },
            {
              name: 'Visualization Meditation',
              description:
                'Create mental images of desired outcomes, places, or experiences. Powerful for manifestation and spiritual work.',
              bestFor:
                'Manifestation, spiritual journeying, healing, energy work',
            },
            {
              name: 'Walking Meditation',
              description:
                'Meditate while walking slowly and mindfully. Focus on each step, breath, and sensation. Connects body and mind.',
              bestFor:
                'Those who struggle with sitting, nature connection, grounding',
            },
            {
              name: 'Mantra Meditation',
              description:
                'Repeat a word, phrase, or sound to focus the mind. Can be spoken aloud or silently. Creates vibration and focus.',
              bestFor: 'Focus, spiritual connection, energy raising',
            },
          ].map((technique) => {
            const techniqueSlug = stringToKebabCase(technique.name);
            return (
              <Link
                key={technique.name}
                href={`/grimoire/meditation/${techniqueSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
              >
                <h3 className='text-lg font-medium text-purple-300 mb-2 group-hover:text-purple-200 transition-colors'>
                  {technique.name}
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
                  {technique.description}
                </p>
                <p className='text-xs text-zinc-400'>
                  Best for: {technique.bestFor}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Breathwork Section */}
      <section id='breathwork' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            <a
              href='/grimoire/breathwork'
              className='hover:text-purple-400 transition-colors'
            >
              Breathwork Techniques
            </a>
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Conscious breathing regulates energy, calms the mind, and prepares
            for magical work. Essential for grounding and centering.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Deep Belly Breathing
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Place hand on belly</p>
              <p>2. Inhale slowly through nose, filling belly (4 counts)</p>
              <p>3. Hold breath (4 counts)</p>
              <p>4. Exhale slowly through mouth (4 counts)</p>
              <p>5. Repeat 5-10 times</p>
              <p className='mt-2'>
                <strong>Use for:</strong> Calming, grounding, before spellwork
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Box Breathing
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Inhale (4 counts)</p>
              <p>2. Hold (4 counts)</p>
              <p>3. Exhale (4 counts)</p>
              <p>4. Hold (4 counts)</p>
              <p>5. Repeat</p>
              <p className='mt-2'>
                <strong>Use for:</strong> Focus, stress relief, energy balance
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Pranayama (Alternate Nostril)
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Close right nostril, inhale through left</p>
              <p>2. Close left nostril, exhale through right</p>
              <p>3. Inhale through right</p>
              <p>4. Close right nostril, exhale through left</p>
              <p>5. Repeat cycle</p>
              <p className='mt-2'>
                <strong>Use for:</strong> Energy balance, mental clarity,
                spiritual connection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grounding Exercises Section */}
      <section id='grounding' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Grounding Exercises
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Grounding connects you with earth energy, stabilizes your energy,
            and is essential before and after magical work.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Tree Root Visualization
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Sit or stand comfortably</p>
              <p>2. Visualize roots growing from your feet into the earth</p>
              <p>3. Feel roots anchoring deep into the ground</p>
              <p>4. Draw earth energy up through roots into your body</p>
              <p>5. Feel stable, centered, and connected</p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Physical Grounding
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>• Walk barefoot on grass or earth</p>
              <p>• Sit on the ground, back against a tree</p>
              <p>
                • Hold grounding crystals (hematite, obsidian, black tourmaline)
              </p>
              <p>• Eat grounding foods (root vegetables, nuts)</p>
              <p>• Spend time in nature</p>
            </div>
          </div>
        </div>
      </section>

      {/* Centering Section */}
      <section id='centering' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>Centering</h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Centering finds your core energy and brings you into balance. It's
            your power source and point of equilibrium.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How to Center
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Take deep breaths</p>
              <p>2. Focus on your center (solar plexus or heart)</p>
              <p>3. Feel your energy gathering at this point</p>
              <p>4. Visualize a bright light or calm space at your center</p>
              <p>5. Feel balanced and aligned</p>
              <p className='mt-2'>
                <strong>When to center:</strong> Before spellwork, when feeling
                scattered, daily practice, after stress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journaling Section */}
      <section id='journaling' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Magical Journaling
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Journaling deepens your practice, tracks progress, and helps you
            understand patterns and growth.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What to Journal
            </h3>
            <ul className='list-disc list-inside space-y-1 text-sm text-zinc-300 ml-4'>
              <li>Daily meditation experiences</li>
              <li>Dreams and interpretations</li>
              <li>Spell results and observations</li>
              <li>Synchronicities and omens</li>
              <li>Emotional patterns and insights</li>
              <li>Moon phases and astrological notes</li>
              <li>Gratitude and reflections</li>
              <li>Questions and curiosities</li>
            </ul>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Journaling Prompts
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>• How did I feel during meditation today?</p>
              <p>• What symbols or images appeared?</p>
              <p>• What am I grateful for today?</p>
              <p>• What patterns am I noticing?</p>
              <p>• What do I need to release?</p>
              <p>• What am I manifesting?</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Meditation;
