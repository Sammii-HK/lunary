'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthButtons } from '@/components/AuthButtons';

export default function WelcomePage() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: 'Your Personal Cosmic Profile',
      description:
        "A complete birth chart analysis revealing the planetary positions at your exact moment of birth, creating a unique cosmic fingerprint that's yours alone.",
      details:
        'Every planet, every degree, every aspect calculated to show how celestial energies shape your personality, relationships, and life path.',
    },
    {
      title: 'Daily Insights That Actually Matter',
      description:
        'Thoughtful guidance based on current planetary transits to your personal chart, day-of-week energies, and numerological influences.',
      details:
        'No generic predictions. Every insight considers your unique birth chart, creating truly personalized daily wisdom.',
    },
    {
      title: 'Meaningful Patterns & Trends',
      description:
        'Discover recurring themes in your tarot readings, understand your cosmic cycles, and recognize the subtle patterns that guide your journey.',
      details:
        'Track your spiritual growth through intelligent analysis of your choices, reactions, and cosmic timing.',
    },
    {
      title: 'Ancient Wisdom, Modern Understanding',
      description:
        'Access centuries of astrological knowledge, tarot symbolism, crystal healing, and lunar wisdom presented with clarity and respect.',
      details:
        'Deep, authentic spiritual guidance without the superficial prescriptions or oversimplified advice found elsewhere.',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900'>
      {/* Navigation Header */}
      <nav className='relative z-10 flex justify-between items-center max-w-6xl mx-auto px-6 py-6'>
        <Link href='/' className='text-2xl font-light text-white tracking-wide'>
          Lunary
        </Link>
        <div className='flex space-x-6'>
          <Link
            href='/pricing'
            className='text-zinc-300 hover:text-white transition-colors'
          >
            Pricing
          </Link>
          <Link
            href='/'
            className='text-zinc-300 hover:text-white transition-colors'
          >
            Daily Insights
          </Link>
          <Link
            href='/profile'
            className='text-zinc-300 hover:text-white transition-colors'
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 opacity-50'></div>
        <div className='relative max-w-6xl mx-auto px-6 py-20'>
          <div className='text-center space-y-8'>
            <h1 className='text-5xl md:text-7xl font-light text-white leading-tight tracking-wide'>
              Your Universe,
              <br />
              <span className='bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-normal'>
                Decoded
              </span>
            </h1>

            <p className='text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-light'>
              The only astrology app that truly knows you. Get personalized
              insights calculated from your complete birth chart, not generic
              horoscopes.
            </p>

            <div className='flex flex-wrap justify-center gap-8 text-sm text-zinc-400 max-w-2xl mx-auto'>
              <div className='flex items-center gap-2'>
                <span className='w-2 h-2 bg-purple-400 rounded-full'></span>
                Personal Birth Chart Analysis
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-2 h-2 bg-pink-400 rounded-full'></span>
                Daily Transit Calculations
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-2 h-2 bg-blue-400 rounded-full'></span>
                Intelligent Tarot Patterns
              </div>
            </div>

            <div className='pt-8'>
              <AuthButtons variant='primary' />

              {/* Explore link for existing users */}
              <div className='mt-4 text-center'>
                <Link
                  href='/'
                  className='text-purple-300 hover:text-purple-200 px-8 py-4 font-medium text-lg transition-colors border border-purple-400/30 rounded-full hover:border-purple-300/50 inline-block'
                >
                  Explore Daily Insights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof & Benefits Section */}
      <div className='max-w-5xl mx-auto px-6 py-20'>
        <div className='text-center space-y-12'>
          <div className='space-y-4'>
            <h2 className='text-3xl md:text-4xl font-light text-white'>
              Astrology as it should be
            </h2>
            <p className='text-lg text-zinc-300 max-w-2xl mx-auto'>
              Stop settling for generic horoscopes. Start your journey with
              personalized insights that actually understand who you are.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8 text-center'>
            <div className='space-y-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800'>
              <div className='w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                <span className='text-2xl'>🔍</span>
              </div>
              <h3 className='text-xl font-medium text-white'>
                Precision Astrology
              </h3>
              <p className='text-zinc-400 leading-relaxed'>
                Every insight calculated from your exact birth time, date, and
                location. No more generic sun sign predictions.
              </p>
              <div className='text-sm text-purple-300 font-medium'>
                Complete birth chart analysis
              </div>
            </div>

            <div className='space-y-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800'>
              <div className='w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center'>
                <span className='text-2xl'>🧠</span>
              </div>
              <h3 className='text-xl font-medium text-white'>
                Intelligent Insights
              </h3>
              <p className='text-zinc-400 leading-relaxed'>
                Smart pattern recognition in your tarot readings and planetary
                transits that reveal meaningful trends.
              </p>
              <div className='text-sm text-pink-300 font-medium'>
                AI-powered pattern analysis
              </div>
            </div>

            <div className='space-y-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800'>
              <div className='w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-orange-600 rounded-full flex items-center justify-center'>
                <span className='text-2xl'>🌟</span>
              </div>
              <h3 className='text-xl font-medium text-white'>
                Daily Evolution
              </h3>
              <p className='text-zinc-400 leading-relaxed'>
                Fresh insights every day based on current planetary positions,
                moon phases, and your personal cycles.
              </p>
              <div className='text-sm text-orange-300 font-medium'>
                Never the same twice
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-700/30'>
            <div className='text-center space-y-4'>
              <h3 className='text-xl font-medium text-white'>
                Ready to discover what makes you unique?
              </h3>
              <p className='text-zinc-300 max-w-2xl mx-auto'>
                Your cosmic blueprint is waiting to be decoded. Get insights
                that are actually about you, not everyone born in your month.
              </p>
              <AuthButtons variant='secondary' className='justify-center' />
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className='max-w-6xl mx-auto px-6 py-20'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-light text-white mb-6'>
            What makes us different
          </h2>
          <p className='text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed'>
            While others offer generic horoscopes and prescriptive advice, we
            provide sophisticated insights tailored to your unique cosmic
            signature.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <div className='space-y-8'>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  currentFeature === index
                    ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30'
                    : 'bg-zinc-800/30 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700'
                }`}
                onClick={() => setCurrentFeature(index)}
              >
                <h3 className='text-xl font-medium text-white mb-3'>
                  {feature.title}
                </h3>
                <p className='text-zinc-300 leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className='bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-8 border border-zinc-700'>
            <h4 className='text-2xl font-light text-purple-300 mb-4'>
              {features[currentFeature].title}
            </h4>
            <p className='text-zinc-200 leading-relaxed text-lg'>
              {features[currentFeature].details}
            </p>
          </div>
        </div>
      </div>

      {/* Sample Insights */}
      <div className='max-w-5xl mx-auto px-6 py-20'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-light text-white mb-6'>
            Experience the depth
          </h2>
          <p className='text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed'>
            See how our insights go beyond surface-level predictions to offer
            meaningful guidance rooted in your personal cosmic blueprint.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          <div className='bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700'>
            <h4 className='text-lg font-medium text-blue-300 mb-3'>
              Daily Guidance
            </h4>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              "With your natal Moon in Cancer receiving supportive energy from
              today's Moon in Pisces, this Tuesday's Martian fire energizes
              action and courage. Today's vibration (5) brings freedom and
              adventure to the forefront."
            </p>
            <span className='text-xs text-zinc-500'>
              Based on your birth chart + current transits + numerology
            </span>
          </div>

          <div className='bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700'>
            <h4 className='text-lg font-medium text-green-300 mb-3'>
              Birth Chart Analysis
            </h4>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              "Your Pluto in Scorpio forms a powerful trine to your natal
              Neptune in Pisces, creating deep transformative abilities through
              spiritual and artistic expression. This aspect suggests profound
              intuitive gifts."
            </p>
            <span className='text-xs text-zinc-500'>
              Calculated from exact birth time and location
            </span>
          </div>

          <div className='bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700'>
            <h4 className='text-lg font-medium text-purple-300 mb-3'>
              Tarot Insights
            </h4>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              "The Hermit appears as your guide today, reflecting your current
              Saturn transit. This card's emphasis on inner wisdom aligns with
              your birth chart's emphasis on Capricorn energy, suggesting a time
              for patient self-reflection."
            </p>
            <span className='text-xs text-zinc-500'>
              Readings influenced by your astrological transits
            </span>
          </div>

          <div className='bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700'>
            <h4 className='text-lg font-medium text-orange-300 mb-3'>
              Transit Calendar
            </h4>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              "Your Solar Return approaches in 23 days! This is your year of
              creative expression and communication. Mars enters your 7th house
              next week, bringing new energy to partnerships and
              collaborations."
            </p>
            <span className='text-xs text-zinc-500'>
              Personalized planetary timing for your chart
            </span>
          </div>

          <div className='bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700'>
            <h4 className='text-lg font-medium text-pink-300 mb-3'>
              Tarot Patterns
            </h4>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              "Over the past 90 days, you've drawn 73% Cups cards, indicating a
              focus on emotional growth. The Ace of Pentacles appeared 3 times,
              suggesting recurring opportunities for new beginnings in material
              matters."
            </p>
            <span className='text-xs text-zinc-500'>
              Statistical analysis of your personal tarot history
            </span>
          </div>

          <div className='bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700'>
            <h4 className='text-lg font-medium text-cyan-300 mb-3'>
              Cosmic Synchronicities
            </h4>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              "Your Venus return aligns with drawing The Lovers card three times
              this month. This synchronicity between your personal planets and
              tarot guidance suggests a significant relationship theme
              emerging."
            </p>
            <span className='text-xs text-zinc-500'>
              Connections between astronomical events and tarot patterns
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Section (Subtle) */}
      <div className='max-w-4xl mx-auto px-6 py-20'>
        <div className='bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 rounded-2xl p-8 border border-zinc-700'>
          <h3 className='text-2xl font-light text-white text-center mb-8'>
            A different approach to cosmic guidance
          </h3>

          <div className='grid md:grid-cols-2 gap-8'>
            <div className='space-y-6'>
              <h4 className='text-lg font-medium text-red-300'>
                What we don't do
              </h4>
              <ul className='space-y-3 text-zinc-400'>
                <li className='flex items-start'>
                  <span className='text-red-400 mr-3'>✗</span>
                  Tell you when to cut your hair or exercise
                </li>
                <li className='flex items-start'>
                  <span className='text-red-400 mr-3'>✗</span>
                  Make prescriptive life decisions for you
                </li>
                <li className='flex items-start'>
                  <span className='text-red-400 mr-3'>✗</span>
                  Rely on generic sun sign predictions
                </li>
                <li className='flex items-start'>
                  <span className='text-red-400 mr-3'>✗</span>
                  Oversimplify complex cosmic influences
                </li>
              </ul>
            </div>

            <div className='space-y-6'>
              <h4 className='text-lg font-medium text-green-300'>What we do</h4>
              <ul className='space-y-3 text-zinc-300'>
                <li className='flex items-start'>
                  <span className='text-green-400 mr-3'>✓</span>
                  Honor your intelligence and free will
                </li>
                <li className='flex items-start'>
                  <span className='text-green-400 mr-3'>✓</span>
                  Provide meaningful insights for reflection
                </li>
                <li className='flex items-start'>
                  <span className='text-green-400 mr-3'>✓</span>
                  Calculate from your complete birth chart
                </li>
                <li className='flex items-start'>
                  <span className='text-green-400 mr-3'>✓</span>
                  Respect the depth of astrological wisdom
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className='max-w-4xl mx-auto px-6 py-20 text-center'>
        <div className='space-y-8'>
          <h2 className='text-3xl md:text-4xl font-light text-white'>
            Ready to discover your cosmic blueprint?
          </h2>

          <p className='text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed'>
            Join those who seek authentic astrological wisdom over superficial
            predictions. Your journey into meaningful cosmic understanding
            begins here.
          </p>

          <div className='pt-8'>
            <AuthButtons variant='primary' />

            {/* Explore link for existing users */}
            <div className='mt-6 text-center'>
              <Link
                href='/'
                className='text-purple-300 hover:text-purple-200 px-8 py-4 font-medium text-lg transition-colors inline-block'
              >
                Explore daily insights
              </Link>
            </div>
          </div>

          <p className='text-sm text-zinc-500 pt-8'>
            Free to start • Personalized insights • Respectful guidance
          </p>
        </div>
      </div>
    </div>
  );
}
