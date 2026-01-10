'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  calculateExpression,
  calculateLifePath,
  calculateSoulUrge,
  getNumberMeaning,
  type CalculationResult,
} from '@/lib/numerology';
import {
  getNumerologyDetail,
  type NumerologyDetailContext,
} from '@/lib/numerology/numerologyDetails';
import {
  buildHoroscopeNumerologyShareUrl,
  getShareOrigin,
  type NumerologyShareNumber,
} from '@/lib/og/horoscopeShare';
import { useOgShareModal } from '@/hooks/useOgShareModal';
import { ShareImageModal } from '@/components/og/ShareImageModal';
import {
  NumerologyInfoModal,
  type NumerologyModalPayload,
} from '@/components/grimoire/NumerologyInfoModal';
import { Share2 } from 'lucide-react';

interface NumerologyProfileCalculatorProps {
  children?: ReactNode;
}

export interface NumerologyProfileResults {
  fullName: string;
  birthDate: string;
  lifePath: CalculationResult | null;
  expression: CalculationResult | null;
  soulUrge: CalculationResult | null;
}

const NumerologyProfileCalculatorContext =
  createContext<NumerologyProfileResults | null>(null);

export function useNumerologyProfileResults() {
  const context = useContext(NumerologyProfileCalculatorContext);
  if (context === null) {
    throw new Error(
      'NumerologyProfileCalculator extras must be used within NumerologyProfileCalculator',
    );
  }
  return context;
}

const INPUT_INFO = [
  {
    label: 'Full birth name',
    placeholder: 'First Middle Last',
    helper: 'Needed for Expression & Soul Urge',
    type: 'text',
  },
  {
    label: 'Birth date',
    placeholder: '',
    helper: 'Needed for Life Path',
    type: 'date',
  },
];

const STORAGE_KEYS = {
  fullName: 'numerology-fullName',
  birthDate: 'numerology-birthDate',
};

export function NumerologyProfileCalculator({
  children,
}: NumerologyProfileCalculatorProps) {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedName = window.localStorage.getItem(STORAGE_KEYS.fullName);
    const savedDate = window.localStorage.getItem(STORAGE_KEYS.birthDate);

    if (savedName) {
      setFullName(savedName);
    }
    if (savedDate) {
      setBirthDate(savedDate);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (fullName) {
      window.localStorage.setItem(STORAGE_KEYS.fullName, fullName);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.fullName);
    }
  }, [fullName]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (birthDate) {
      window.localStorage.setItem(STORAGE_KEYS.birthDate, birthDate);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.birthDate);
    }
  }, [birthDate]);

  const results = useMemo(() => {
    const expression = fullName ? calculateExpression(fullName) : null;
    const soulUrge = fullName ? calculateSoulUrge(fullName) : null;
    const lifePath = birthDate ? calculateLifePath(birthDate) : null;

    return { lifePath, expression, soulUrge };
  }, [birthDate, fullName]);

  const MASTER_NUMBER_LINKS = [11, 22, 33];

  const getResultHref = (
    type: 'life-path' | 'expression' | 'soul-urge',
    value: number,
  ) => {
    if (!value) {
      return null;
    }

    const valueString = value.toString();

    if (type === 'life-path') {
      if (MASTER_NUMBER_LINKS.includes(value)) {
        return `/grimoire/numerology/master-numbers/${valueString}`;
      }
      return `/grimoire/life-path/${valueString}`;
    }

    return `/grimoire/numerology/${type}/${valueString}`;
  };

  const cards: Array<{
    id: 'life-path' | 'expression' | 'soul-urge';
    title: string;
    description: string;
    result: CalculationResult | null;
    helper: string;
  }> = [
    {
      id: 'life-path',
      title: 'Life Path Number',
      description: 'Based on your birth date',
      result: results.lifePath,
      helper: 'Reveals your life purpose',
    },
    {
      id: 'expression',
      title: 'Expression Number',
      description: 'Based on all letters in your name',
      result: results.expression,
      helper: 'Shows your natural talents',
    },
    {
      id: 'soul-urge',
      title: 'Soul Urge Number',
      description: 'Based on the vowels in your name',
      result: results.soulUrge,
      helper: 'Reveals your heart’s desire',
    },
  ];

  const value: NumerologyProfileResults = {
    fullName,
    birthDate,
    lifePath: results.lifePath,
    expression: results.expression,
    soulUrge: results.soulUrge,
  };

  const [numberModal, setNumberModal] = useState<NumerologyModalPayload | null>(
    null,
  );
  const {
    shareTarget,
    sharePreviewUrl,
    shareLoading,
    shareError,
    isOpen: isShareModalOpen,
    openShareModal,
    closeShareModal,
    handleShareImage,
    handleDownloadShareImage,
    handleCopyShareLink,
  } = useOgShareModal();
  const getPageUrl = () =>
    typeof window !== 'undefined'
      ? window.location.href
      : `${getShareOrigin()}/grimoire/numerology`;

  const shareNumber = (label: string, value: number, meaning?: string) => {
    if (!value) return;
    const shareUrl = buildHoroscopeNumerologyShareUrl({
      shareOrigin: getShareOrigin(),
      highlightTitle: label,
      highlight: meaning ?? `${label} ${value}`,
      variant: 'numerology-card',
      numbers: [{ label, value, meaning }],
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    });
    openShareModal({
      title: label,
      description: meaning ?? `${label} ${value}`,
      pageUrl: getPageUrl(),
      ogUrl: shareUrl,
    });
  };

  const shareAllNumbers = () => {
    const shareNumbers: NumerologyShareNumber[] = cards
      .map((card) => {
        const cardValue = card.result?.result ?? 0;
        if (!cardValue) return null;
        return {
          label: card.title,
          value: cardValue,
          meaning: card.result
            ? getNumberMeaning(card.id, cardValue)
            : undefined,
        };
      })
      .filter((entry): entry is NumerologyShareNumber => Boolean(entry));

    if (!shareNumbers.length) return;

    const highlight = shareNumbers
      .map((entry) => `${entry.label} ${entry.value}`)
      .join(' • ');

    const shareUrl = buildHoroscopeNumerologyShareUrl({
      shareOrigin: getShareOrigin(),
      highlightTitle: 'Numerology Snapshot',
      highlight,
      variant: 'numerology-profile',
      numbers: shareNumbers,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    });
    openShareModal({
      title: 'Numerology Snapshot',
      description: highlight,
      pageUrl: getPageUrl(),
      ogUrl: shareUrl,
    });
  };

  return (
    <NumerologyProfileCalculatorContext.Provider value={value}>
      <div className='bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-6'>
        <div className='space-y-5'>
          <div>
            <h3 className='text-xl font-medium text-zinc-100'>
              Try it with your data
            </h3>
            <p className='text-sm text-zinc-400'>
              Enter your name and birth date to preview these numerology
              numbers.
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-zinc-300'>
                {INPUT_INFO[0].label}
              </label>
              <input
                type='text'
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder={INPUT_INFO[0].placeholder}
                className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary-500 focus:border-transparent'
              />
              <p className='text-xs text-zinc-500'>{INPUT_INFO[0].helper}</p>
            </div>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-zinc-300'>
                {INPUT_INFO[1].label}
              </label>
              <input
                type='date'
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-lunary-primary-500 focus:border-transparent'
              />
              <p className='text-xs text-zinc-500'>{INPUT_INFO[1].helper}</p>
            </div>
          </div>
        </div>
        {cards.some((card) => (card.result?.result ?? 0) > 0) && (
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={shareAllNumbers}
              className='inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-lunary-primary-500 hover:text-white'
            >
              <Share2 className='h-4 w-4' />
              Share all numbers
            </button>
          </div>
        )}

        <div className='grid gap-4 md:grid-cols-3'>
          {cards.map((card) => {
            const value = card.result?.result ?? 0;
            const meaning = card.result ? getNumberMeaning(card.id, value) : '';
            const href = value > 0 ? getResultHref(card.id, value) : null;
            const contextType: NumerologyDetailContext =
              card.id === 'expression'
                ? 'expression'
                : card.id === 'soul-urge'
                  ? 'soulUrge'
                  : 'lifePath';
            const detail =
              value > 0 ? getNumerologyDetail(contextType, value) : null;
            const energy = detail?.energy;
            const keywords = detail?.keywords;

            const cardBody = (
              <div className='w-full'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-2'>
                    <div className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
                      {card.description}
                    </div>
                    <div>
                      <p className='text-2xl font-light text-zinc-200'>
                        {card.title}
                      </p>
                      <p className='text-5xl font-light text-lunary-primary-300 mt-2'>
                        {value > 0 ? value : '--'}
                      </p>
                      <p className='text-sm text-zinc-400 mt-1'>
                        {value > 0 ? meaning : card.helper}
                      </p>
                    </div>
                  </div>
                  {value > 0 && (
                    <span
                      role='button'
                      tabIndex={0}
                      aria-label={`Share ${card.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        shareNumber(card.title, value, meaning);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          shareNumber(card.title, value, meaning);
                        }
                      }}
                      className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition hover:border-lunary-primary-500 hover:text-white'
                    >
                      <Share2 className='h-4 w-4' />
                    </span>
                  )}
                </div>
              </div>
            );

            if (value > 0) {
              return (
                <button
                  key={card.id}
                  type='button'
                  onClick={() =>
                    setNumberModal({
                      number: value,
                      contextLabel: card.title,
                      contextDetail: card.description,
                      meaning,
                      description: detail?.description,
                      energy,
                      energyLabel: `${card.title} energy`,
                      keywords,
                      sections: detail?.sections,
                      extraNote: detail?.extraNote,
                      ctaHref: href ?? undefined,
                      ctaLabel: href
                        ? `Read more about ${card.title}`
                        : undefined,
                    })
                  }
                  className='border border-zinc-800 rounded-2xl p-4 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 text-left hover:border-lunary-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lunary-primary-400'
                >
                  {cardBody}
                </button>
              );
            }

            return (
              <div
                key={card.id}
                className='border border-zinc-800 rounded-2xl p-4 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40'
              >
                {cardBody}
              </div>
            );
          })}
        </div>

        {children}
      </div>
      <NumerologyInfoModal
        isOpen={!!numberModal}
        onClose={() => setNumberModal(null)}
        number={numberModal?.number ?? 0}
        contextLabel={numberModal?.contextLabel ?? ''}
        contextDetail={numberModal?.contextDetail}
        meaning={numberModal?.meaning ?? ''}
        description={numberModal?.description}
        energy={numberModal?.energy}
        keywords={numberModal?.keywords}
        sections={numberModal?.sections}
        extraNote={numberModal?.extraNote}
        ctaHref={numberModal?.ctaHref}
        ctaLabel={numberModal?.ctaLabel}
      />
      <ShareImageModal
        isOpen={isShareModalOpen}
        target={shareTarget}
        previewUrl={sharePreviewUrl}
        loading={shareLoading}
        error={shareError}
        onClose={closeShareModal}
        onShare={handleShareImage}
        onDownload={handleDownloadShareImage}
        onCopy={handleCopyShareLink}
      />
    </NumerologyProfileCalculatorContext.Provider>
  );
}
