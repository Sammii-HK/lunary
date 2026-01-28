'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import { BirthChartData } from '../../../utils/astrology/birthChart';
import { createBirthChart } from '../../../utils/astrology/birthChartService';
import {
  calculateSynastry,
  SynastryResult,
  SynastryAspect,
} from '../../../utils/astrology/synastry';
import {
  Heart,
  Sparkles,
  AlertTriangle,
  Check,
  Star,
  Lock as LockIcon,
} from 'lucide-react';
import { SmartTrialButton } from '@/components/SmartTrialButton';

interface PersonData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

function PersonForm({
  person,
  onChange,
  label,
  useMyChart,
  onUseMyChart,
  hasUserChart,
}: {
  person: PersonData;
  onChange: (data: PersonData) => void;
  label: string;
  useMyChart?: boolean;
  onUseMyChart?: () => void;
  hasUserChart?: boolean;
}) {
  return (
    <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-medium text-zinc-100'>{label}</h3>
        {hasUserChart && onUseMyChart && (
          <button
            onClick={onUseMyChart}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              useMyChart
                ? 'bg-lunary-primary-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {useMyChart ? '✓ Using My Chart' : 'Use My Chart'}
          </button>
        )}
      </div>
      <div className='space-y-3'>
        <div>
          <label className='block text-sm text-zinc-400 mb-1'>Name</label>
          <input
            type='text'
            value={person.name}
            onChange={(e) => onChange({ ...person, name: e.target.value })}
            placeholder='Enter name'
            disabled={useMyChart}
            className='w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lunary-primary disabled:opacity-50'
          />
        </div>
        <div>
          <label className='block text-sm text-zinc-400 mb-1'>Birth Date</label>
          <input
            type='date'
            value={person.birthDate}
            onChange={(e) => onChange({ ...person, birthDate: e.target.value })}
            disabled={useMyChart}
            className='w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-lunary-primary disabled:opacity-50'
          />
        </div>
        <div>
          <label className='block text-sm text-zinc-400 mb-1'>
            Birth Time (optional)
          </label>
          <input
            type='time'
            value={person.birthTime}
            onChange={(e) => onChange({ ...person, birthTime: e.target.value })}
            disabled={useMyChart}
            className='w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-lunary-primary disabled:opacity-50'
          />
        </div>
        <div>
          <label className='block text-sm text-zinc-400 mb-1'>
            Birth Location (lat, lng)
          </label>
          <input
            type='text'
            value={person.birthLocation}
            onChange={(e) =>
              onChange({ ...person, birthLocation: e.target.value })
            }
            placeholder='e.g. 51.5074, -0.1278'
            disabled={useMyChart}
            className='w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lunary-primary disabled:opacity-50'
          />
        </div>
      </div>
    </div>
  );
}

function AspectCard({ aspect }: { aspect: SynastryAspect }) {
  const natureColors = {
    harmonious: 'border-lunary-success-600 bg-lunary-success-900/10',
    challenging: 'border-lunary-error-600 bg-lunary-error-900/10',
    neutral: 'border-lunary-accent-600 bg-lunary-accent-900/10',
  };

  return (
    <div className={`p-4 rounded-lg border ${natureColors[aspect.nature]}`}>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>{aspect.aspectSymbol}</span>
          <span className='font-medium text-zinc-100'>
            {aspect.personA.planet} {aspect.aspect} {aspect.personB.planet}
          </span>
        </div>
        <span className='text-xs text-zinc-400'>orb: {aspect.orb}°</span>
      </div>
      <p className='text-sm text-zinc-400'>
        {aspect.personA.planet} in {aspect.personA.sign} {aspect.aspect}{' '}
        {aspect.personB.planet} in {aspect.personB.sign}
      </p>
      <p className='text-sm text-zinc-300 mt-2'>{aspect.description}</p>
    </div>
  );
}

function CompatibilityScore({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score >= 70) return 'text-lunary-success';
    if (score >= 50) return 'text-lunary-accent';
    return 'text-lunary-rose';
  };

  return (
    <div className='text-center p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
      <div className={`text-5xl font-light ${getScoreColor()}`}>{score}</div>
      <div className='text-sm text-zinc-400 mt-1'>Compatibility Score</div>
      <div className='flex justify-center gap-1 mt-2'>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.round(score / 20) ? 'text-lunary-accent fill-lunary-accent' : 'text-zinc-700'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function SynastryGenerator() {
  const { user } = useUser();
  const subscription = useSubscription();
  const hasAccess = hasBirthChartAccess(subscription.status, subscription.plan);

  const [personA, setPersonA] = useState<PersonData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });
  const [personB, setPersonB] = useState<PersonData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });
  const [useMyChartA, setUseMyChartA] = useState(false);
  const [result, setResult] = useState<SynastryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasUserChart = user?.birthChart && user.birthChart.length > 0;

  useEffect(() => {
    if (useMyChartA && user) {
      setPersonA({
        name: user.name || 'You',
        birthDate: user.birthday || '',
        birthTime: '',
        birthLocation: '',
      });
    }
  }, [useMyChartA, user]);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!personA.birthDate || !personB.birthDate) {
        throw new Error('Please enter birth dates for both people');
      }

      let chartA: BirthChartData[];
      let chartB: BirthChartData[];

      if (useMyChartA && user?.birthChart) {
        chartA = user.birthChart;
      } else {
        chartA = await createBirthChart({
          birthDate: personA.birthDate,
          birthTime: personA.birthTime || undefined,
          birthLocation: personA.birthLocation || undefined,
          fallbackTimezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
        });
      }

      chartB = await createBirthChart({
        birthDate: personB.birthDate,
        birthTime: personB.birthTime || undefined,
        birthLocation: personB.birthLocation || undefined,
        fallbackTimezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
      });

      const synastryResult = calculateSynastry(
        chartA,
        chartB,
        personA.name || 'Person A',
        personB.name || 'Person B',
      );

      setResult(synastryResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to calculate synastry',
      );
    } finally {
      setLoading(false);
    }
  };

  // Paywall for non-subscribers
  if (!hasAccess) {
    return (
      <div className='text-center py-12'>
        <LockIcon className='w-16 h-16 text-lunary-primary-400 mx-auto mb-6' />
        <p className='text-zinc-400 mb-8 max-w-md mx-auto'>
          Compare two birth charts to discover relationship compatibility,
          strengths, and growth areas. Available for Lunary subscribers.
        </p>
        <SmartTrialButton size='lg' />
        <Link
          href='/grimoire/synastry'
          className='block mt-4 text-sm text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          Learn about synastry →
        </Link>
      </div>
    );
  }

  // Input form
  if (!result) {
    return (
      <>
        <div className='grid md:grid-cols-2 gap-6 mb-8'>
          <PersonForm
            person={personA}
            onChange={setPersonA}
            label='Person A'
            useMyChart={useMyChartA}
            onUseMyChart={() => setUseMyChartA(!useMyChartA)}
            hasUserChart={hasUserChart}
          />
          <PersonForm person={personB} onChange={setPersonB} label='Person B' />
        </div>

        {error && (
          <div className='mb-6 p-4 rounded-lg bg-lunary-error-900/20 border border-lunary-error-700 flex items-center gap-3'>
            <AlertTriangle className='w-5 h-5 text-lunary-error' />
            <span className='text-lunary-error-300'>{error}</span>
          </div>
        )}

        <button
          onClick={handleCalculate}
          disabled={loading || !personA.birthDate || !personB.birthDate}
          className='w-full py-4 rounded-lg bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:bg-zinc-800 disabled:text-zinc-400 text-white font-medium transition-colors flex items-center justify-center gap-2'
        >
          {loading ? (
            <>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              Calculating...
            </>
          ) : (
            <>
              <Sparkles className='w-5 h-5' />
              Calculate Synastry
            </>
          )}
        </button>
      </>
    );
  }

  // Results
  return (
    <div className='space-y-8'>
      <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
        <div className='flex items-center gap-3 mb-4'>
          <Heart className='w-6 h-6 text-lunary-rose' />
          <h2 className='text-xl font-medium text-zinc-100'>
            {personA.name || 'Person A'} & {personB.name || 'Person B'}
          </h2>
        </div>
        <p className='text-zinc-300'>{result.summary}</p>
      </div>

      <div className='grid md:grid-cols-3 gap-6'>
        <CompatibilityScore score={result.compatibilityScore} />

        <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
          <h3 className='text-sm font-medium text-lunary-success mb-3 flex items-center gap-2'>
            <Check className='w-4 h-4' /> Strengths
          </h3>
          <ul className='space-y-2'>
            {result.strengths.map((s, i) => (
              <li key={i} className='text-sm text-zinc-300'>
                • {s}
              </li>
            ))}
          </ul>
        </div>

        <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'>
          <h3 className='text-sm font-medium text-lunary-rose mb-3 flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4' /> Growth Areas
          </h3>
          <ul className='space-y-2'>
            {result.challenges.map((c, i) => (
              <li key={i} className='text-sm text-zinc-300'>
                • {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Synastry Aspects ({result.aspects.length})
        </h2>
        <div className='grid md:grid-cols-2 gap-4'>
          {result.aspects.map((aspect, i) => (
            <AspectCard key={i} aspect={aspect} />
          ))}
        </div>
      </div>

      <button
        onClick={() => setResult(null)}
        className='w-full py-3 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors'
      >
        Calculate Another Synastry
      </button>
    </div>
  );
}
