'use client';

import { useEffect } from 'react';

const Divination = () => {
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
          Divination Methods
        </h1>
        <p className='text-sm text-zinc-400'>
          Explore various divination methods beyond tarot: pendulum, scrying,
          dream interpretation, and reading omens. Each method offers unique
          insights.
        </p>
      </div>

      {/* Pendulum Section */}
      <section id='pendulum' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Pendulum Divination
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Pendulums are simple yet powerful divination tools. They answer
            yes/no questions and can help locate objects or energy.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How Pendulums Work
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              Pendulums amplify subtle energy movements from your subconscious
              or spiritual guidance. The movement reflects answers through
              direction and pattern.
            </p>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Yes:</strong> Usually clockwise circle or forward/back
                swing
              </p>
              <p>
                <strong>No:</strong> Usually counterclockwise circle or
                side-to-side swing
              </p>
              <p>
                <strong>Maybe/Unclear:</strong> Erratic movement or no movement
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Calibrating Your Pendulum
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Hold the pendulum steady, allowing it to hang freely</p>
              <p>2. Ask "Show me yes" and observe the movement</p>
              <p>3. Ask "Show me no" and observe the movement</p>
              <p>4. Ask "Show me maybe" and observe the movement</p>
              <p>5. Your pendulum will establish its own language</p>
              <p className='mt-2'>
                <strong>Note:</strong> Each pendulum and person may have
                different movements. Always calibrate before use.
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Asking Questions
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Good questions:</strong>
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Yes/no questions only</li>
                <li>Clear and specific</li>
                <li>Focused on one thing at a time</li>
                <li>Not leading or biased</li>
              </ul>
              <p className='mt-2'>
                <strong>Examples:</strong>
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>"Is this job opportunity right for me?"</li>
                <li>"Should I take this action today?"</li>
                <li>"Is this person trustworthy?"</li>
              </ul>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Pendulum Care
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>• Cleanse your pendulum regularly (moonlight, sage, salt)</p>
              <p>• Store in a protective pouch or box</p>
              <p>• Don't let others handle your pendulum</p>
              <p>• Charge under moonlight or with crystals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scrying Section */}
      <section id='scrying' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>Scrying</h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Scrying is the art of seeing visions in reflective surfaces. Common
            tools include crystal balls, black mirrors, water, and fire.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Scrying Methods
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Crystal Ball:</strong> Most traditional method. Use
                clear quartz or obsidian. Requires practice to see images.
              </div>
              <div>
                <strong>Black Mirror:</strong> Black glass or obsidian mirror.
                Easier for beginners, creates a void for visions.
              </div>
              <div>
                <strong>Water Scrying:</strong> Bowl of water, preferably dark
                or moonlit. Simple and accessible.
              </div>
              <div>
                <strong>Fire Scrying:</strong> Gazing into flames or embers.
                Powerful but requires fire safety.
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How to Scry
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Create a quiet, dimly lit space</p>
              <p>2. Cleanse your scrying tool</p>
              <p>3. Set your intention or ask a question</p>
              <p>4. Gaze softly into the surface (don't focus hard)</p>
              <p>5. Allow images, symbols, or feelings to emerge</p>
              <p>6. Trust your first impressions</p>
              <p>7. Journal what you see immediately after</p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Interpreting Visions
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                Scrying visions can be literal, symbolic, or emotional. Trust
                your intuition and consider:
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Colors and their meanings</li>
                <li>Shapes and symbols</li>
                <li>Emotions you feel during scrying</li>
                <li>Personal associations</li>
                <li>Context of your question</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dream Interpretation Section */}
      <section id='dream-interpretation' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Dream Interpretation
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Dreams are messages from your subconscious and the spiritual realm.
            Learning to interpret dreams opens a powerful channel of guidance.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Keeping a Dream Journal
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Why journal:</strong>
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Improves dream recall</li>
                <li>Reveals patterns and symbols</li>
                <li>Creates a personal symbol dictionary</li>
                <li>Helps track spiritual messages</li>
              </ul>
              <p className='mt-2'>
                <strong>How to journal:</strong>
              </p>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Write immediately upon waking</li>
                <li>Record everything, even fragments</li>
                <li>Note emotions and feelings</li>
                <li>Include colors, numbers, people, places</li>
                <li>Review periodically for patterns</li>
              </ul>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Common Dream Symbols
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-300'>
              <div>
                <strong>Water:</strong> Emotions, subconscious, cleansing
              </div>
              <div>
                <strong>Flying:</strong> Freedom, transcendence, ambition
              </div>
              <div>
                <strong>Teeth falling:</strong> Anxiety, loss, transition
              </div>
              <div>
                <strong>Snakes:</strong> Transformation, healing, hidden
                knowledge
              </div>
              <div>
                <strong>Death:</strong> Endings, transformation, rebirth
              </div>
              <div>
                <strong>Animals:</strong> Instincts, nature, spirit guides
              </div>
              <div>
                <strong>Houses:</strong> Self, different rooms = different
                aspects
              </div>
              <div>
                <strong>Chase:</strong> Running from problems or fears
              </div>
            </div>
            <p className='text-xs text-zinc-400 mt-3'>
              Remember: Symbol meanings are personal. What matters is your
              association with the symbol.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Types of Dreams
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>Prophetic Dreams:</strong> Show future events or
                possibilities. Often feel vivid and memorable.
              </div>
              <div>
                <strong>Visitation Dreams:</strong> Deceased loved ones or
                spirits visit. Usually feel very real and peaceful.
              </div>
              <div>
                <strong>Lucid Dreams:</strong> You're aware you're dreaming. Can
                be used for spiritual work and healing.
              </div>
              <div>
                <strong>Nightmares:</strong> Process fears, trauma, or shadow
                work. Important for healing.
              </div>
              <div>
                <strong>Astral Travel:</strong> Your spirit travels while body
                sleeps. May feel like flying or visiting other places.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Omen Reading Section */}
      <section id='omen-reading' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Reading Omens
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Omens are signs from nature and the universe. Learning to recognize
            and interpret omens connects you with cosmic guidance.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Animal Omens
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-300'>
              <div>
                <strong>Crows/Ravens:</strong> Messages, transformation, magic
              </div>
              <div>
                <strong>Owls:</strong> Wisdom, intuition, seeing hidden truth
              </div>
              <div>
                <strong>Butterflies:</strong> Transformation, new beginnings
              </div>
              <div>
                <strong>Dragonflies:</strong> Change, adaptability, illusion
              </div>
              <div>
                <strong>Spiders:</strong> Creativity, weaving your reality
              </div>
              <div>
                <strong>Birds:</strong> Messages, freedom, spiritual connection
              </div>
              <div>
                <strong>Cats:</strong> Mystery, independence, intuition
              </div>
              <div>
                <strong>Snakes:</strong> Healing, transformation, rebirth
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Natural Omens
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Feathers:</strong> Messages from spirit, protection
              </p>
              <p>
                <strong>Coins:</strong> Prosperity, abundance coming
              </p>
              <p>
                <strong>Repeated numbers:</strong> Angel numbers, synchronicity
              </p>
              <p>
                <strong>Rainbows:</strong> Hope, promise, blessings
              </p>
              <p>
                <strong>Lightning:</strong> Sudden insight, transformation
              </p>
              <p>
                <strong>Finding things:</strong> Gifts from the universe
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How to Read Omens
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Pay attention to what catches your eye</p>
              <p>2. Notice patterns and repetition</p>
              <p>3. Consider timing (what were you thinking about?)</p>
              <p>4. Trust your first feeling or thought</p>
              <p>5. Research traditional meanings but trust intuition</p>
              <p>6. Keep an omen journal to track patterns</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Divination;
