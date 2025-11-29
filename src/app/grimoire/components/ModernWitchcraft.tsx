'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { stringToKebabCase } from '../../../../utils/string';

const ModernWitchcraft = () => {
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
    <div className='space-y-8 pb-16'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Modern Witchcraft Guide
        </h2>
        <p className='text-sm text-zinc-400'>
          Explore different paths of modern witchcraft, essential tools, ethics,
          and practices. Witchcraft is a diverse and personal spiritual path.
        </p>
      </div>

      {/* Witch Types Section */}
      <section id='witch-types' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Types of Witches
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Modern witchcraft encompasses many paths. You may identify with one
            or combine elements from multiple traditions.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {[
            {
              name: 'Green Witch',
              description:
                'Works closely with nature, plants, and earth energy. Focuses on herbalism, gardening, and natural magic. Deep connection to the seasons and natural cycles.',
            },
            {
              name: 'Kitchen Witch',
              description:
                'Practices magic through cooking, baking, and home care. Infuses daily activities with intention. Magic happens in the kitchen and home.',
            },
            {
              name: 'Hedge Witch',
              description:
                'Works between worlds, practices astral travel, and communicates with spirits. Often solitary, focuses on liminal spaces and boundaries between realms.',
            },
            {
              name: 'Sea Witch',
              description:
                'Connected to water, ocean, and tides. Works with sea salt, shells, and water magic. Draws power from lunar cycles and ocean energy.',
            },
            {
              name: 'Cosmic Witch',
              description:
                'Focuses on astrology, planetary magic, and celestial energy. Aligns practice with moon phases, planetary transits, and cosmic events.',
            },
            {
              name: 'Eclectic Witch',
              description:
                'Draws from multiple traditions and creates a personal practice. Adapts and combines different methods based on what resonates. Most common path in modern witchcraft.',
            },
          ].map((witch) => {
            const witchSlug = stringToKebabCase(witch.name);
            return (
              <Link
                key={witch.name}
                href={`/grimoire/witches/${witchSlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
              >
                <h3 className='text-lg font-medium text-purple-300 mb-2 group-hover:text-purple-200 transition-colors'>
                  {witch.name}
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {witch.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Witch Tools Section */}
      <section id='tools' className='space-y-6'>
        <div>
          <Link
            href='/grimoire/witchcraft-tools'
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-purple-400 transition-colors'
          >
            Essential Witch Tools
          </Link>
          <p className='text-sm text-zinc-400 mb-4'>
            Tools enhance your practice but aren't required. The most important
            tool is your intention. Start simple and add tools as needed.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Athame (Ritual Knife)
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Double-edged ritual knife used to direct energy, cast circles, and
              carve symbols. Never used to cut physical objects. Represents the
              element of Air or Fire depending on tradition.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>Wand</h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Used to direct energy and cast spells. Can be made from wood,
              crystal, or metal. Often personalized with carvings, crystals, or
              symbols. Represents the element of Air or Fire.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Cauldron
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Represents the element of Water. Used for burning herbs, mixing
              potions, scrying, and holding offerings. Can be made of cast iron,
              ceramic, or other materials.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Chalice
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Represents the element of Water. Used for holding ritual drinks,
              moon water, or offerings. Can be any cup that feels sacred to you.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Pentacle
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              Five-pointed star in a circle. Represents the element of Earth.
              Used for charging items, protection, and grounding energy. Can be
              made of wood, metal, or drawn.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Other Common Tools
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-300'>
              <div>
                <strong>Candles:</strong> Fire element, intention setting
              </div>
              <div>
                <strong>Incense:</strong> Air element, purification, offerings
              </div>
              <div>
                <strong>Crystals:</strong> Energy amplification, protection
              </div>
              <div>
                <strong>Herbs:</strong> Correspondences, healing, magic
              </div>
              <div>
                <strong>Bells:</strong> Cleansing, calling spirits, protection
              </div>
              <div>
                <strong>Broom:</strong> Cleansing, protection, ritual sweeping
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethics Section */}
      <section id='ethics' className='space-y-6'>
        <div>
          <Link
            href='/grimoire/witchcraft-ethics'
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-purple-400 transition-colors'
          >
            Witchcraft Ethics
          </Link>
          <p className='text-sm text-zinc-400 mb-4'>
            Ethical practice is fundamental to witchcraft. Different traditions
            have different codes, but core principles remain consistent.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              The Wiccan Rede
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              "An it harm none, do what ye will."
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              This means: As long as it harms no one (including yourself), do
              what you want. Your actions should not cause harm to others or
              yourself. This includes not manipulating others' free will.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              The Threefold Law
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              "Whatever you send out returns to you threefold." This means your
              actions (positive or negative) come back to you multiplied. It
              encourages ethical behavior and kindness.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Core Ethical Principles
            </h3>
            <ul className='list-disc list-inside space-y-1 text-sm text-zinc-300'>
              <li>
                <strong>Harm none:</strong> Don't cause harm to others or
                yourself
              </li>
              <li>
                <strong>Respect free will:</strong> Don't manipulate or control
                others
              </li>
              <li>
                <strong>Consent:</strong> Always get permission before working
                with others
              </li>
              <li>
                <strong>Responsibility:</strong> Take responsibility for your
                actions
              </li>
              <li>
                <strong>Respect nature:</strong> Honor and protect the natural
                world
              </li>
              <li>
                <strong>Cultural respect:</strong> Don't appropriate closed
                traditions
              </li>
              <li>
                <strong>Confidentiality:</strong> Keep others' spiritual
                practices private
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Coven vs Solitary Section */}
      <section id='coven-solitary' className='space-y-6'>
        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-2'>
            Coven vs Solitary Practice
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Both paths are valid. Choose what works for your lifestyle, needs,
            and spiritual growth.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Solitary Practice
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              <strong>Benefits:</strong>
            </p>
            <ul className='list-disc list-inside space-y-1 text-sm text-zinc-300 ml-4'>
              <li>Complete freedom and flexibility</li>
              <li>Personal pace and schedule</li>
              <li>No group dynamics or conflicts</li>
              <li>Deep personal connection</li>
              <li>Privacy and discretion</li>
            </ul>
            <p className='text-sm text-zinc-300 leading-relaxed mt-3'>
              <strong>Considerations:</strong> Requires self-discipline, no
              built-in community, must learn independently.
            </p>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Coven Practice
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
              <strong>Benefits:</strong>
            </p>
            <ul className='list-disc list-inside space-y-1 text-sm text-zinc-300 ml-4'>
              <li>Community and support</li>
              <li>Shared knowledge and learning</li>
              <li>Group energy amplification</li>
              <li>Structured learning</li>
              <li>Celebration and ritual together</li>
            </ul>
            <p className='text-sm text-zinc-300 leading-relaxed mt-3'>
              <strong>Considerations:</strong> Requires commitment, group
              dynamics, may have hierarchy or rules.
            </p>
          </div>
        </div>
        <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-4'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            Many witches practice both: solitary most of the time, with
            occasional group work or celebrations. There's no "right" way—only
            what works for you.
          </p>
        </div>
      </section>

      {/* Book of Shadows Section */}
      <section id='book-of-shadows' className='space-y-6'>
        <div>
          <Link
            href='/grimoire/book-of-shadows'
            className='block text-xl font-medium text-zinc-100 mb-2 hover:text-purple-400 transition-colors'
          >
            Book of Shadows
          </Link>
          <p className='text-sm text-zinc-400 mb-4'>
            A Book of Shadows (BOS) is your personal grimoire—a record of your
            spells, rituals, correspondences, and spiritual journey. It's a
            living document that grows with your practice.
          </p>
        </div>
        <div className='space-y-4'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              What to Include
            </h3>
            <ul className='list-disc list-inside space-y-1 text-sm text-zinc-300 ml-4'>
              <li>Spells and rituals you've performed</li>
              <li>Correspondences (colors, herbs, crystals, etc.)</li>
              <li>Moon phases and astrological notes</li>
              <li>Dream interpretations and symbols</li>
              <li>Personal experiences and insights</li>
              <li>Recipes for potions, oils, and incense</li>
              <li>Notes on what worked and what didn't</li>
              <li>Personal reflections and growth</li>
            </ul>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              How to Organize
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>
                <strong>By category:</strong> Spells, rituals, correspondences,
                etc.
              </p>
              <p>
                <strong>Chronologically:</strong> As you learn and practice
              </p>
              <p>
                <strong>By intention:</strong> Love, protection, prosperity,
                etc.
              </p>
              <p>
                <strong>Mixed approach:</strong> Whatever makes sense to you
              </p>
              <p className='mt-2'>
                There's no "correct" way. Organize it so you can find things
                easily. Some witches use digital BOS, others prefer handwritten
                journals.
              </p>
            </div>
          </div>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
            <h3 className='text-lg font-medium text-purple-300 mb-2'>
              Making It Personal
            </h3>
            <div className='space-y-2 text-sm text-zinc-300'>
              <p>• Decorate with drawings, pressed flowers, or symbols</p>
              <p>• Use colors and correspondences that resonate</p>
              <p>• Include personal experiences and feelings</p>
              <p>• Write in your own voice—it's YOUR book</p>
              <p>• Don't worry about perfection—it's a working document</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernWitchcraft;
