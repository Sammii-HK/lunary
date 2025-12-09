'use client';

import Link from 'next/link';
import { useEffect } from 'react';

const CandleMagic = () => {
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
    <div className='space-y-8'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Candle Magic Guide
        </h2>
        <p className='text-sm text-zinc-400'>
          Learn the art of candle magic: color meanings, carving techniques,
          anointing, safety, and rituals. Candle magic is one of the most
          accessible forms of spellwork.
        </p>
      </div>

      {/* Color Meanings Section */}
      <section id='color-meanings' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Candle Color Meanings
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Each candle color carries specific energy and intention. Choose
            colors that align with your spell's purpose.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-error mb-2'>Red</h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Passion, love, courage, strength, vitality, action. Use for love
              spells, courage, energy, and protection.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-rose mb-2'>Pink</h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Romance, friendship, self-love, emotional healing, compassion. Use
              for romantic love, friendship, and emotional healing.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-rose mb-2'>
              Orange
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Creativity, success, attraction, confidence, ambition. Use for
              career success, creativity, and attracting opportunities.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-accent mb-2'>
              Yellow
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Communication, learning, clarity, confidence, joy. Use for
              communication, studying, mental clarity, and happiness.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-success mb-2'>
              Green
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Prosperity, abundance, growth, healing, nature. Use for money,
              growth, fertility, and physical healing.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-secondary mb-2'>
              Blue
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Peace, healing, protection, wisdom, truth. Use for peace, healing,
              protection, and spiritual growth.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-400 mb-2'>
              Purple
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Spirituality, psychic ability, wisdom, power, transformation. Use
              for spiritual work, divination, and psychic development.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary mb-2'>
              Indigo
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Intuition, meditation, deep wisdom, psychic protection. Use for
              meditation, intuition, and psychic protection.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-white mb-2'>White</h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Purity, protection, peace, clarity, all-purpose. Use for any
              intention, protection, purification, and new beginnings.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-gray-400 mb-2'>Black</h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Banishing, protection, removing negativity, binding. Use for
              banishing, protection, and removing negative energy.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-accent mb-2'>
              Brown
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Grounding, stability, home, animals, earth connection. Use for
              grounding, stability, and home protection.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-silver-400 mb-2'>Silver</h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Intuition, dreams, feminine energy, moon magic. Use for intuition,
              dream work, and moon-related spells.
            </p>
          </div>
        </div>
      </section>

      {/* Carving Techniques Section */}
      <section id='carving' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Carving Techniques
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Carving symbols, words, or sigils into candles charges them with
            your intention. The act of carving focuses energy and creates a
            direct connection to your spell.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              What to Carve
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Words:</strong> Your intention written clearly (e.g.,
                "love," "prosperity")
              </p>
              <p>
                <strong>Names:</strong> Your name or the name of someone you're
                working with (with permission)
              </p>
              <p>
                <strong>Symbols:</strong> Runes, sigils, astrological symbols,
                or personal symbols
              </p>
              <p>
                <strong>Dates:</strong> Specific dates for manifestation or
                release
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              How to Carve
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Hold the candle and focus on your intention</p>
              <p>2. Use an athame, pin, or sharp tool to carve</p>
              <p>
                3. Carve from top to bottom (or bottom to top for banishing)
              </p>
              <p>
                4. Visualize your intention flowing into the candle as you carve
              </p>
              <p>5. Speak your intention aloud while carving if desired</p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Carving Direction
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Top to bottom:</strong> For attracting, manifesting,
                bringing energy in
              </p>
              <p>
                <strong>Bottom to top:</strong> For banishing, releasing,
                sending energy away
              </p>
              <p>
                <strong>Circular:</strong> For continuous energy or protection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Anointing Section */}
      <section id='anointing' className='space-y-6'>
        <div>
          <Link
            href='/grimoire/anointing-candles'
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-lunary-primary-400 transition-colors'
          >
            Anointing Candles with Oils
          </Link>
          <p className='text-sm text-zinc-400 mb-4'>
            Anointing candles with oils adds another layer of intention and
            energy to your spellwork. Essential oils carry specific properties
            that enhance your candle magic.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Anointing Method
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>1. Choose your oil:</strong> Select an oil that matches
                your intention
              </p>
              <p>
                <strong>2. Anoint from center outward:</strong> For attracting
                energy
              </p>
              <p>
                <strong>3. Anoint from ends to center:</strong> For banishing
                energy
              </p>
              <p>
                <strong>4. Visualize:</strong> See your intention flowing into
                the candle
              </p>
              <p>
                <strong>5. Speak your intention:</strong> State your purpose
                clearly
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Common Anointing Oils
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-300'>
              <div>
                <strong>Lavender:</strong> Peace, healing, sleep
              </div>
              <div>
                <strong>Rose:</strong> Love, romance, self-love
              </div>
              <div>
                <strong>Jasmine:</strong> Love, sensuality, psychic ability
              </div>
              <div>
                <strong>Frankincense:</strong> Protection, spirituality,
                purification
              </div>
              <div>
                <strong>Patchouli:</strong> Prosperity, grounding, attraction
              </div>
              <div>
                <strong>Eucalyptus:</strong> Healing, protection, purification
              </div>
              <div>
                <strong>Bergamot:</strong> Success, prosperity, confidence
              </div>
              <div>
                <strong>Sandalwood:</strong> Spirituality, meditation,
                protection
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Candle Safety Section */}
      <section id='safety' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Candle Safety
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Safety is essential in candle magic. Always practice fire safety and
            never leave burning candles unattended.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-lunary-error-700 bg-lunary-error-950 p-4'>
            <h3 className='text-lg font-medium text-lunary-error-300 mb-2'>
              Essential Safety Rules
            </h3>
            <ul className='list-disc list-inside space-y-1 text-sm text-zinc-300'>
              <li>Never leave burning candles unattended</li>
              <li>Keep candles away from flammable materials</li>
              <li>Place candles on heat-resistant surfaces</li>
              <li>Keep candles out of reach of children and pets</li>
              <li>Trim wicks to 1/4 inch before lighting</li>
              <li>Don't burn candles near drafts or air vents</li>
              <li>Extinguish candles if they burn unevenly or too high</li>
              <li>Have a fire extinguisher or water nearby</li>
            </ul>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Safe Alternatives
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>LED candles:</strong> Safe for unattended burning, good
                for continuous spells
              </p>
              <p>
                <strong>Tea lights:</strong> Shorter burn time, safer for quick
                spells
              </p>
              <p>
                <strong>Electric candles:</strong> No fire risk, good for
                long-term intentions
              </p>
              <p className='mt-2'>
                Remember: The magic is in your intention, not the flame. Safe
                alternatives work just as well.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lighting Candles on Altar Section */}
      <section id='altar-lighting' className='space-y-6'>
        <div>
          <Link
            href='/grimoire/lighting-candles-on-altar'
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-lunary-primary-400 transition-colors'
          >
            Lighting Candles on Your Altar
          </Link>
          <p className='text-sm text-zinc-400 mb-4'>
            The order and method of lighting candles on your altar creates a
            powerful ritual structure. Each step builds energy and intention.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Traditional Lighting Order
            </h3>
            <div className='space-y-3 text-sm text-zinc-300'>
              <div>
                <strong>1. White Candle (Protection/Divine Light):</strong>{' '}
                Always light first to create sacred space and protection. Say:
                "By this light, I create sacred space. Only love and light may
                enter this place."
              </div>
              <div>
                <strong>2. Elemental Candles (if using):</strong> Light in
                order: North (Earth/Green/Brown), East (Air/Yellow/White), South
                (Fire/Red/Orange), West (Water/Blue/Silver). Or light your
                intention candle next.
              </div>
              <div>
                <strong>3. Intention Candle:</strong> Your main spell candle.
                Light while stating your intention clearly. This is the focal
                point of your work.
              </div>
              <div>
                <strong>4. Supporting Candles:</strong> Any additional candles
                for specific purposes (e.g., love candle, prosperity candle).
              </div>
              <div>
                <strong>5. Closing:</strong> Always end by thanking the
                elements, spirits, or deities you've called upon. Extinguish in
                reverse order (or let burn completely if that's your intention).
              </div>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              What to Say When Lighting
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>General lighting phrase:</strong> "I light this flame
                with intention clear, may my will be made manifest here."
              </p>
              <p>
                <strong>Before lighting:</strong> State your intention aloud or
                silently. Be specific and clear.
              </p>
              <p>
                <strong>As you light:</strong> Visualize your intention flowing
                into the flame. See it burning brightly with your desired
                outcome.
              </p>
              <p>
                <strong>After lighting:</strong> "By fire and will, so mote it
                be" or "And so it is" to seal your intention.
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Altar Setup for Candle Magic
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>Center:</strong> Place your main intention candle in the
                center
              </p>
              <p>
                <strong>North (Earth):</strong> Green/brown candles, crystals,
                salt
              </p>
              <p>
                <strong>East (Air):</strong> Yellow/white candles, incense,
                feathers
              </p>
              <p>
                <strong>South (Fire):</strong> Red/orange candles, matches,
                fire-safe dish
              </p>
              <p>
                <strong>West (Water):</strong> Blue/silver candles, water bowl,
                shells
              </p>
              <p className='mt-2'>
                Arrange intuitively—there's no single "correct" way. What
                matters is that it feels right to you and supports your
                intention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Candle Color Incantations Section */}
      <section id='color-incantations' className='space-y-6'>
        <div>
          <Link
            href='/grimoire/incantations-by-candle-color'
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-lunary-primary-400 transition-colors'
          >
            Incantations by Candle Color
          </Link>
          <p className='text-sm text-zinc-400 mb-4'>
            Specific incantations to use when lighting candles of different
            colors. Speak with conviction and feel the energy of each color.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-error mb-2'>
              Red Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "By this red flame, passion and strength I claim. Courage flows
              through me, action takes form, my will is made manifest."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Love, courage, strength, action
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-rose mb-2'>
              Pink Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "This pink light brings love and care, romance and friendship fill
              the air. Self-love grows, compassion flows, healing hearts
              wherever it goes."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Romance, self-love, friendship
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-rose mb-2'>
              Orange Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "Orange fire burns bright and bold, success and opportunity
              unfold. Creativity flows, confidence grows, abundance comes as
              this flame glows."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Success, creativity, attraction
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-accent mb-2'>
              Yellow Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "Yellow light brings clarity bright, communication flows day and
              night. Learning comes, joy becomes, mental clarity this flame
              brings."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Communication, learning, clarity
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-success mb-2'>
              Green Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "Green flame of growth and wealth, prosperity comes, abundance
              felt. Healing flows, nature knows, fertile ground where this light
              glows."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Prosperity, healing, growth
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-secondary mb-2'>
              Blue Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "Blue light brings peace and calm, healing waters, protective
              balm. Wisdom flows, truth it knows, spiritual growth this flame
              bestows."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Peace, healing, protection
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-400 mb-2'>
              Purple Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "Purple flame of power and might, psychic vision, spiritual light.
              Transformation comes, wisdom becomes, higher knowledge this flame
              brings."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Spirituality, psychic ability
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-white mb-2'>
              White Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "White light pure and bright, protection, peace, and divine light.
              Purity flows, clarity grows, all-purpose power this flame
              bestows."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Protection, purification, all-purpose
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-gray-400 mb-2'>
              Black Candle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "Black flame absorbs what's not mine, banishing negativity,
              binding what's unkind. Protection strong, removing wrong, only
              good remains where this flame belongs."
            </p>
            <p className='text-xs text-zinc-400'>
              Use for: Banishing, protection, removing negativity
            </p>
          </div>
        </div>
      </section>

      {/* Candle Rituals Section */}
      <section id='rituals' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Basic Candle Rituals
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Simple candle rituals for common intentions. Adapt these to your
            personal practice and needs.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Simple Intention Candle
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Choose a candle color matching your intention</p>
              <p>2. Carve your intention or name into the candle</p>
              <p>3. Anoint with corresponding oil (optional)</p>
              <p>4. Light the candle and focus on your intention</p>
              <p>5. Let it burn completely or extinguish and relight daily</p>
              <p>6. Dispose of wax remnants respectfully (bury or recycle)</p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Seven-Day Candle Spell
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Prepare your candle (carve, anoint, charge)</p>
              <p>2. Light the candle each day for 7 days</p>
              <p>3. Focus on your intention for 5-10 minutes daily</p>
              <p>4. Let it burn for a set time each day (e.g., 1 hour)</p>
              <p>5. Extinguish by snuffing (not blowing) between sessions</p>
              <p>6. On the 7th day, let it burn completely if possible</p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-lunary-primary-300 mb-2'>
              Banishing Candle
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>1. Use a black candle</p>
              <p>2. Carve what you want to banish (bottom to top)</p>
              <p>3. Anoint with banishing oil (optional)</p>
              <p>4. Light and visualize the negative energy being absorbed</p>
              <p>5. Let it burn completely</p>
              <p>6. Dispose of wax away from your home (bury or discard)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Topics Section */}
      <section className='mt-12 pt-8 border-t border-zinc-800/50'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Related Topics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <a
            href='/grimoire/practices'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Spellcraft Fundamentals
          </a>
          <a
            href='/grimoire/practices'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Altar Setup
          </a>
          <a
            href='/grimoire/crystals'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Crystals for Magic
          </a>
          <a
            href='/grimoire/correspondences/herbs'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Herbs & Oils
          </a>
          <a
            href='/grimoire/moon-rituals'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Moon Rituals
          </a>
          <a
            href='/grimoire/correspondences/colors'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Color Correspondences
          </a>
        </div>
      </section>

      {/* HowTo Schema for Simple Intention Candle */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'Simple Intention Candle Ritual',
            description:
              'Learn how to perform a simple candle magic ritual to set intentions and manifest your desires.',
            image: 'https://lunary.app/api/og/cosmic',
            totalTime: 'PT15M',
            tool: [
              {
                '@type': 'HowToTool',
                name: 'Candle (color matching your intention)',
              },
              {
                '@type': 'HowToTool',
                name: 'Lighter or matches',
              },
              {
                '@type': 'HowToTool',
                name: 'Anointing oil (optional)',
              },
            ],
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Choose a candle color',
                text: 'Choose a candle color matching your intention (red for love, green for prosperity, etc.)',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Carve your intention',
                text: 'Carve your intention or name into the candle from top to bottom',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Anoint with oil',
                text: 'Anoint with corresponding oil (optional), visualizing your intention flowing into the candle',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Light the candle',
                text: 'Light the candle and focus on your intention, visualizing your desired outcome',
              },
              {
                '@type': 'HowToStep',
                position: 5,
                name: 'Let it burn',
                text: 'Let it burn completely or extinguish and relight daily for 7 days',
              },
              {
                '@type': 'HowToStep',
                position: 6,
                name: 'Dispose respectfully',
                text: 'Dispose of wax remnants respectfully (bury or recycle)',
              },
            ],
          }),
        }}
      />
    </div>
  );
};

export default CandleMagic;
