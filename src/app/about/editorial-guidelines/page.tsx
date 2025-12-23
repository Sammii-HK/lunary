import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Editorial Guidelines - Lunary Content Standards',
  description:
    'Learn how Lunary creates, verifies, and maintains its astrology, tarot, and spiritual content. Our commitment to accuracy, transparency, and responsible AI use.',
  openGraph: {
    title: 'Editorial Guidelines - Lunary',
    description:
      'How we create and verify our astrology and spiritual content.',
    url: 'https://lunary.app/about/editorial-guidelines',
  },
  alternates: { canonical: 'https://lunary.app/about/editorial-guidelines' },
};

const sections = [
  {
    title: 'Content Creation Process',
    content: `All Lunary content is created with careful attention to accuracy and user value. Our process involves:
    
• Research from multiple authoritative sources in astrology, tarot, and spiritual traditions
• Cross-referencing with established texts and contemporary interpretations
• Technical verification of astronomical data using the Astronomy Engine library
• Iterative refinement based on user feedback and expert review`,
  },
  {
    title: 'Quality Standards',
    content: `Every piece of content on Lunary meets these standards:

• Accuracy: All astronomical calculations are verified against ephemeris data
• Clarity: Complex concepts are explained accessibly without oversimplification
• Depth: Content provides genuine value, not superficial clickbait
• Balance: We present multiple interpretive traditions where applicable
• Respect: We honor the cultural origins and significance of these practices`,
  },
  {
    title: 'How Pages Are Updated',
    content: `We maintain content freshness through:

• Regular audits of key pages for accuracy and relevance
• Annual updates to transit and eclipse calendars
• Continuous improvement based on user questions and feedback
• Immediate corrections when errors are identified
• Version tracking for significant content changes`,
  },
  {
    title: 'How AI Is Used Responsibly',
    content: `Lunary uses AI thoughtfully and transparently:

• AI assists with personalised horoscope generation based on real astronomical data
• The AI Astral Guide provides conversation, not fortune-telling or medical advice
• All AI outputs are bounded by verified astrological principles
• We never present AI-generated content as prophetic or deterministic
• Users are informed when interacting with AI features
• Human oversight ensures AI responses align with our values`,
  },
  {
    title: 'Human Review Process',
    content: `AI-assisted content undergoes human review:

• All foundational content (guides, glossary, reference pages) is human-written
• AI-generated personalised content uses human-created templates and rules
• User-reported issues trigger immediate human review
• Quality sampling ensures ongoing AI output quality
• Complex topics always receive expert human attention`,
  },
  {
    title: 'Sourcing Policy',
    content: `Our content draws from:

• Classical astrological texts and modern interpretations
• Traditional tarot systems (Rider-Waite-Smith, Marseille, Thoth)
• Peer-reviewed astronomical data and ephemeris
• Established crystal healing and spiritual practice literature
• Direct study and practice by our founding team

We respect intellectual traditions and avoid appropriation. When drawing from specific cultural practices, we acknowledge origins and context.`,
  },
];

export default function EditorialGuidelinesPage() {
  return (
    <>
      <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col'>
        <div className='flex-1 max-w-4xl mx-auto px-4 py-12'>
          <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-8'>
            <Link href='/' className='hover:text-zinc-300'>
              Home
            </Link>
            <span>/</span>
            <Link href='/about' className='hover:text-zinc-300'>
              About
            </Link>
            <span>/</span>
            <span className='text-zinc-400'>Editorial Guidelines</span>
          </nav>

          <header className='mb-12'>
            <h1 className='text-4xl md:text-5xl font-light mb-4'>
              Editorial Guidelines
            </h1>
            <p className='text-xl text-zinc-400 leading-relaxed'>
              Our commitment to creating trustworthy, valuable content for the
              spiritual wellness community.
            </p>
          </header>

          <div className='space-y-8'>
            {sections.map((section, index) => (
              <section
                key={index}
                className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'
              >
                <h2 className='text-xl font-medium mb-4 text-lunary-primary-300'>
                  {section.title}
                </h2>
                <div className='text-zinc-300 whitespace-pre-line leading-relaxed'>
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <section className='mt-12 p-6 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20'>
            <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
              Questions or Corrections?
            </h2>
            <p className='text-zinc-300 mb-4'>
              We welcome feedback on our content. If you spot an error or have
              suggestions for improvement, please let us know.
            </p>
            <a
              href='mailto:hello@lunary.app'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
            >
              hello@lunary.app
            </a>
          </section>

          <div className='mt-8 flex gap-4'>
            <Link
              href='/about/sammii'
              className='text-zinc-400 hover:text-zinc-300 text-sm'
            >
              ← About the Founder
            </Link>
            <Link
              href='/about/methodology'
              className='text-zinc-400 hover:text-zinc-300 text-sm'
            >
              Technical Methodology →
            </Link>
          </div>
        </div>
        <MarketingFooter />
      </div>
    </>
  );
}
