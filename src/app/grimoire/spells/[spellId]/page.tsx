import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSpellById, spellDatabase, spellCategories } from '@/lib/spells';
import { Clock, Star, Moon, Leaf } from 'lucide-react';
import { createHowToSchema, renderJsonLd } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { stringToKebabCase } from '../../../../../utils/string';

export async function generateStaticParams() {
  return spellDatabase.map((spell) => ({
    spellId: spell.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spellId: string }>;
}): Promise<Metadata> {
  const { spellId } = await params;
  const spell = getSpellById(spellId);

  if (!spell) {
    return { title: 'Spell Not Found - Lunary Grimoire' };
  }

  const title = `${spell.title}: Step-by-Step Spell Guide - Lunary`;
  const description = `${spell.description} Complete instructions with ingredients, timing, and correspondences for ${spell.title.toLowerCase()}.`;

  return {
    title,
    description,
    keywords: [
      spell.title.toLowerCase(),
      `${spell.category} spell`,
      'spell instructions',
      'witchcraft spell',
      'magic spell',
      ...(spell.correspondences.elements || []),
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/spells/${spellId}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/spells',
          width: 1200,
          height: 630,
          alt: spell.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/grimoire/spells'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/spells/${spellId}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function SpellPage({
  params,
}: {
  params: Promise<{ spellId: string }>;
}) {
  const { spellId } = await params;
  const spell = getSpellById(spellId);

  if (!spell) {
    notFound();
  }

  const categoryInfo = spellCategories[spell.category] ?? {
    name: spell.category,
    description: '',
    icon: '',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'text-lunary-success',
    intermediate: 'text-lunary-accent',
    advanced: 'text-lunary-error',
  };

  const howToSchema = createHowToSchema({
    name: spell.title,
    description: spell.description,
    url: `https://lunary.app/grimoire/spells/${spellId}`,
    totalTime: spell.duration,
    tools: spell.tools,
    supplies: spell.ingredients.map((i) => i.name),
    steps: [
      ...spell.preparation.map((step, idx) => ({
        name: `Preparation Step ${idx + 1}`,
        text: step,
      })),
      ...spell.steps.map((step, idx) => ({
        name: `Ritual Step ${idx + 1}`,
        text: step,
      })),
    ],
  });

  const faqs = [
    {
      question: `What is the purpose of ${spell.title}?`,
      answer: spell.purpose,
    },
    {
      question: `When is the best time to cast ${spell.title}?`,
      answer: `The optimal timing is during ${spell.timing.moonPhase?.join(' or ') || 'any moon phase'}${spell.timing.planetaryDay ? `, on ${spell.timing.planetaryDay.join(' or ')}` : ''}.`,
    },
    {
      question: `What materials do I need for ${spell.title}?`,
      answer: `You will need: ${spell.ingredients.map((i) => i.name).join(', ')}${spell.tools.length > 0 ? `. Tools: ${spell.tools.join(', ')}` : ''}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(howToSchema)}
      <SEOContentTemplate
        title={`${spell.title} - Lunary`}
        h1={spell.title}
        description={spell.description}
        keywords={[
          spell.title.toLowerCase(),
          `${spell.category} spell`,
          'spell instructions',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/spells/${spellId}`}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Spells', href: '/grimoire/spells' },
          { label: spell.title, href: `/grimoire/spells/${spellId}` },
        ]}
        faqs={faqs}
        relatedItems={[
          {
            name: 'All Spells',
            href: '/grimoire/spells',
            type: 'Collection',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon/phases',
            type: 'Timing',
          },
          {
            name: 'Correspondences',
            href: '/grimoire/correspondences',
            type: 'Reference',
          },
          {
            name: 'Candle Magic',
            href: '/grimoire/candle-magic',
            type: 'Practice',
          },
        ]}
        internalLinks={[
          { text: 'View All Spells', href: '/grimoire/spells' },
          { text: 'Moon Phase Calendar', href: '/grimoire/moon/phases' },
          { text: 'Crystal Guide', href: '/grimoire/crystals' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        childrenPosition='after-description'
        ctaText='Get personalized spell timing based on your chart'
        ctaHref='/pricing'
      >
        <div className='space-y-6'>
          <div className='flex flex-wrap gap-3 text-sm'>
            <span className='bg-lunary-primary-900/40 text-lunary-primary-300 px-3 py-1 rounded-full'>
              {categoryInfo.name}
            </span>
            <span className='bg-lunary-secondary-900/40 text-lunary-secondary-300 px-3 py-1 rounded-full'>
              {spell.type.replace('_', ' ')}
            </span>
            <span
              className={`bg-zinc-800 px-3 py-1 rounded-full ${difficultyColors[spell.difficulty]}`}
            >
              {spell.difficulty}
            </span>
            <span className='bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full flex items-center gap-1'>
              <Clock className='w-3 h-3' />
              {spell.duration}
            </span>
          </div>

          <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h2 className='text-xl font-medium text-lunary-primary-400 mb-3 flex items-center gap-2'>
              <Star className='w-5 h-5' />
              Purpose
            </h2>
            <p className='text-zinc-200 leading-relaxed'>{spell.purpose}</p>
          </section>

          <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h2 className='text-xl font-medium text-lunary-secondary mb-3 flex items-center gap-2'>
              <Moon className='w-5 h-5' />
              Optimal Timing
            </h2>
            <div className='space-y-2 text-sm'>
              {spell.timing.moonPhase && (
                <div className='flex gap-2'>
                  <span className='text-zinc-400 min-w-24'>Moon Phase:</span>
                  <div className='flex flex-wrap gap-1'>
                    {spell.timing.moonPhase.map((phase) => (
                      <Link
                        key={phase}
                        href={`/grimoire/moon/phases/${stringToKebabCase(phase)}`}
                        className='text-lunary-primary-300 hover:text-lunary-primary-200 underline'
                      >
                        {phase}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {spell.timing.planetaryDay && (
                <div className='flex gap-2'>
                  <span className='text-zinc-400 min-w-24'>Best Days:</span>
                  <span className='text-zinc-200'>
                    {spell.timing.planetaryDay.join(', ')}
                  </span>
                </div>
              )}
              {spell.timing.timeOfDay && (
                <div className='flex gap-2'>
                  <span className='text-zinc-400 min-w-24'>Time of Day:</span>
                  <span className='text-zinc-200'>
                    {spell.timing.timeOfDay}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h2 className='text-xl font-medium text-lunary-success mb-3 flex items-center gap-2'>
              <Leaf className='w-5 h-5' />
              Ingredients
            </h2>
            <div className='space-y-3'>
              {spell.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className='border-l-4 border-lunary-success-600 pl-4'
                >
                  <div className='flex justify-between items-start mb-1'>
                    <span className='font-medium text-lunary-success-300'>
                      {ingredient.name}
                    </span>
                    {ingredient.amount && (
                      <span className='text-sm text-zinc-400'>
                        {ingredient.amount}
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-zinc-300 mb-1'>
                    {ingredient.purpose}
                  </p>
                  {ingredient.substitutes && (
                    <p className='text-xs text-zinc-400'>
                      Substitutes: {ingredient.substitutes.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {spell.tools.length > 0 && (
            <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
              <h2 className='text-xl font-medium text-lunary-rose mb-3'>
                Tools Needed
              </h2>
              <ul className='space-y-1'>
                {spell.tools.map((tool, index) => (
                  <li
                    key={index}
                    className='text-zinc-200 flex items-center gap-2'
                  >
                    <span className='w-2 h-2 bg-lunary-rose rounded-full' />
                    {tool}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h2 className='text-xl font-medium text-lunary-primary mb-3'>
              Preparation Steps
            </h2>
            <ol className='space-y-2'>
              {spell.preparation.map((step, index) => (
                <li key={index} className='text-zinc-200 flex gap-3'>
                  <span className='flex-shrink-0 w-6 h-6 bg-lunary-primary text-white rounded-full flex items-center justify-center text-sm font-medium'>
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h2 className='text-xl font-medium text-lunary-primary-400 mb-3'>
              Ritual Steps
            </h2>
            <ol className='space-y-3'>
              {spell.steps.map((step, index) => (
                <li key={index} className='text-zinc-200 flex gap-3'>
                  <span className='flex-shrink-0 w-8 h-8 bg-lunary-primary-600 text-white rounded-full flex items-center justify-center font-medium'>
                    {index + 1}
                  </span>
                  <span className='pt-1'>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h2 className='text-xl font-medium text-lunary-accent mb-3'>
              Correspondences
            </h2>
            <div className='space-y-3 text-sm'>
              {spell.correspondences.elements && (
                <div>
                  <span className='text-zinc-400 block mb-1'>Elements:</span>
                  <div className='flex flex-wrap gap-1'>
                    {spell.correspondences.elements.map((element) => (
                      <Link
                        key={element}
                        href={`/grimoire/correspondences/elements`}
                        className='bg-lunary-accent-900/40 text-lunary-accent-300 px-2 py-1 rounded text-xs hover:bg-lunary-accent-900/60'
                      >
                        {element}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {spell.correspondences.colors && (
                <div>
                  <span className='text-zinc-400 block mb-1'>Colors:</span>
                  <div className='flex flex-wrap gap-1'>
                    {spell.correspondences.colors.map((color) => (
                      <Link
                        key={color}
                        href='/grimoire/correspondences/colors'
                        className='bg-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs hover:bg-zinc-600'
                      >
                        {color}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {spell.correspondences.crystals && (
                <div>
                  <span className='text-zinc-400 block mb-1'>Crystals:</span>
                  <div className='flex flex-wrap gap-1'>
                    {spell.correspondences.crystals.map((crystal) => (
                      <Link
                        key={crystal}
                        href={`/grimoire/crystals/${stringToKebabCase(crystal)}`}
                        className='bg-lunary-primary-900/40 text-lunary-primary-300 px-2 py-1 rounded text-xs hover:bg-lunary-primary-900/60'
                      >
                        {crystal}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {spell.correspondences.planets && (
                <div>
                  <span className='text-zinc-400 block mb-1'>Planets:</span>
                  <div className='flex flex-wrap gap-1'>
                    {spell.correspondences.planets.map((planet) => (
                      <Link
                        key={planet}
                        href={`/grimoire/astronomy/planets/${planet.toLowerCase()}`}
                        className='bg-lunary-secondary-900/40 text-lunary-secondary-300 px-2 py-1 rounded text-xs hover:bg-lunary-secondary-900/60'
                      >
                        {planet}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className='bg-lunary-error-900/20 border border-red-800 rounded-lg p-6'>
            <h2 className='text-xl font-medium text-lunary-error mb-3'>
              Safety & Ethics
            </h2>
            <ul className='space-y-2 text-sm'>
              {spell.safety.map((safety, index) => (
                <li
                  key={index}
                  className='text-lunary-error-200 flex items-start gap-2'
                >
                  <span className='text-lunary-error mt-1'>•</span>
                  <span>{safety}</span>
                </li>
              ))}
            </ul>
          </section>

          {spell.variations && spell.variations.length > 0 && (
            <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
              <h2 className='text-xl font-medium text-lunary-secondary mb-3'>
                Variations
              </h2>
              <ul className='space-y-2 text-sm'>
                {spell.variations.map((variation, index) => (
                  <li
                    key={index}
                    className='text-zinc-200 flex items-start gap-2'
                  >
                    <span className='text-lunary-secondary mt-1'>•</span>
                    <span>{variation}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {spell.history && (
            <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
              <h2 className='text-xl font-medium text-lunary-accent mb-3'>
                Historical Context
              </h2>
              <p className='text-zinc-200 text-sm leading-relaxed'>
                {spell.history}
              </p>
            </section>
          )}
        </div>
      </SEOContentTemplate>
    </div>
  );
}
