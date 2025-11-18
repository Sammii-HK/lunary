import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Moon Rituals by Phase: Complete Lunar Magic Guide - Lunary',
  description:
    'Complete guide to moon rituals for each lunar phase. Learn New Moon, Waxing Moon, Full Moon, and Waning Moon rituals for manifestation, release, and magic.',
  openGraph: {
    title: 'Moon Rituals by Phase: Complete Lunar Magic Guide - Lunary',
    description:
      'Complete guide to moon rituals for each lunar phase. Learn New Moon, Waxing Moon, Full Moon, and Waning Moon rituals for manifestation, release, and magic.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Moon Rituals by Phase: Complete Lunar Magic Guide - Lunary',
    description:
      'Complete guide to moon rituals for each lunar phase. Learn New Moon, Waxing Moon, Full Moon, and Waning Moon rituals for manifestation, release, and magic.',
  },
};

export default function MoonRitualsPage() {
  return (
    <SEOContentTemplate
      title='Moon Rituals by Phase: Complete Lunar Magic Guide - Lunary'
      h1='Moon Rituals by Phase'
      description='Each moon phase offers unique energy for different types of magical work. Align your rituals with the lunar cycle for enhanced effectiveness.'
      keywords={[
        'moon rituals',
        'lunar rituals',
        'moon phase rituals',
        'new moon ritual',
        'full moon ritual',
        'moon magic',
      ]}
      canonicalUrl='https://lunary.app/grimoire/moon-rituals'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Moon Phases', href: '/grimoire/moon' },
        { label: 'Moon Rituals', href: '/grimoire/moon-rituals' },
      ]}
      meaning={`Each moon phase offers unique energy for different types of magical work. Align your rituals with the lunar cycle for enhanced effectiveness.

**New Moon Ritual:**
Set intentions, begin new projects, plant seeds for future growth. Write down goals, create vision boards, or perform manifestation rituals. Best for: New beginnings, intention setting, planning. Ritual ideas: Write intentions on paper and burn or bury, create a vision board for the coming cycle, plant seeds (literal or symbolic) with intentions, perform a simple candle ritual with intention-setting, meditate on what you want to manifest.

**Waxing Moon Ritual:**
Build momentum, attract abundance, and work toward goals. Perform prosperity spells, growth rituals, or action-oriented magic. Best for: Growth, attraction, building energy. Ritual ideas: Charge crystals and tools in moonlight, perform attraction spells for love, money, or opportunities, take action toward your New Moon intentions, create abundance grids with crystals, water plants with moon-charged water.

**Full Moon Ritual:**
Release what no longer serves, celebrate achievements, charge crystals and tools. Perform gratitude rituals, release ceremonies, or charging rituals. Best for: Release, gratitude, charging, manifestation. Ritual ideas: Write what you want to release and burn it, charge crystals, tools, and water under moonlight, perform a gratitude ceremony, take a ritual bath with moon-charged water, meditate under the full moon.

**Waning Moon Ritual:**
Let go, banish negativity, break bad habits, and clear obstacles. Perform banishing spells, cleansing rituals, or removal magic. Best for: Release, banishing, breaking habits, clearing. Ritual ideas: Clean and cleanse your space, perform banishing spells for negative energy, break bad habits with symbolic actions, cut cords with people or situations, release old patterns through journaling.

**General Moon Ritual Tips:**
- Always cleanse your space before moon rituals
- Set clear intentions for what you want to achieve
- Work with moon phases that align with your goals
- Keep a moon ritual journal to track results
- Be patient—manifestation takes time
- Respect the moon's energy and don't force rituals`}
      internalLinks={[
        { text: 'Moon Phases Guide', href: '/grimoire/moon' },
        { text: 'Moon Signs & Daily Influence', href: '/grimoire/moon-signs' },
        { text: 'Spellcraft Practices', href: '/grimoire/practices' },
      ]}
    />
  );
}
