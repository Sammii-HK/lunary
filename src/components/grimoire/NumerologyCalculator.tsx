'use client';

import { useState, useMemo } from 'react';
import { NavParamLink } from '@/components/NavParamLink';
import { ArrowRight } from 'lucide-react';
import {
  calculateSoulUrge,
  calculateExpression,
  calculateLifePath,
  calculatePersonalYear,
  getNumberMeaning,
  VOWEL_VALUES,
  type CalculationResult,
} from '@/lib/numerology';

type CalculatorType =
  | 'soul-urge'
  | 'expression'
  | 'life-path'
  | 'personal-year';

interface NumerologyCalculatorProps {
  type: CalculatorType;
}

const CALCULATOR_CONFIG: Record<
  CalculatorType,
  {
    title: string;
    description: string;
    inputLabel: string;
    inputPlaceholder: string;
    inputType: 'text' | 'date';
    resultPath: string;
  }
> = {
  'soul-urge': {
    title: 'Soul Urge Calculator',
    description:
      'Calculate your Soul Urge Number from the vowels in your full birth name.',
    inputLabel: 'Full Birth Name',
    inputPlaceholder: 'Enter your full birth name',
    inputType: 'text',
    resultPath: '/grimoire/numerology/soul-urge',
  },
  expression: {
    title: 'Expression Number Calculator',
    description:
      'Calculate your Expression (Destiny) Number from all letters in your full birth name.',
    inputLabel: 'Full Birth Name',
    inputPlaceholder: 'Enter your full birth name',
    inputType: 'text',
    resultPath: '/grimoire/numerology/expression',
  },
  'life-path': {
    title: 'Life Path Calculator',
    description: 'Calculate your Life Path Number from your birth date.',
    inputLabel: 'Birth Date',
    inputPlaceholder: '',
    inputType: 'date',
    resultPath: '/grimoire/life-path',
  },
  'personal-year': {
    title: 'Personal Year Calculator',
    description: 'Calculate your Personal Year Number for any year.',
    inputLabel: 'Birth Date',
    inputPlaceholder: '',
    inputType: 'date',
    resultPath: '/grimoire/numerology',
  },
};

export function NumerologyCalculator({ type }: NumerologyCalculatorProps) {
  const config = CALCULATOR_CONFIG[type];
  const [input, setInput] = useState('');
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());

  const result: CalculationResult | null = useMemo(() => {
    if (!input || input.length < 2) return null;

    switch (type) {
      case 'soul-urge':
        return calculateSoulUrge(input);
      case 'expression':
        return calculateExpression(input);
      case 'life-path':
        return calculateLifePath(input);
      case 'personal-year':
        return calculatePersonalYear(input, targetYear);
      default:
        return null;
    }
  }, [input, type, targetYear]);

  const meaning = result
    ? getNumberMeaning(
        type === 'personal-year' ? 'life-path' : type,
        result.result,
      )
    : '';

  const resultUrl =
    result && result.result > 0
      ? `${config.resultPath}/${result.result}`
      : config.resultPath;

  return (
    <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 my-8'>
      <h3 className='text-xl font-medium text-zinc-100 mb-2'>{config.title}</h3>
      <p className='text-zinc-400 text-sm mb-6'>{config.description}</p>

      <div className='space-y-4'>
        <div>
          <label
            htmlFor={`${type}-input`}
            className='block text-sm font-medium text-zinc-300 mb-2'
          >
            {config.inputLabel}
          </label>
          {config.inputType === 'text' ? (
            <input
              id={`${type}-input`}
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={config.inputPlaceholder}
              className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary-500 focus:border-transparent'
            />
          ) : (
            <input
              id={`${type}-input`}
              type='date'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-lunary-primary-500 focus:border-transparent'
            />
          )}
        </div>

        {type === 'personal-year' && (
          <div>
            <label
              htmlFor='target-year'
              className='block text-sm font-medium text-zinc-300 mb-2'
            >
              Year to Calculate
            </label>
            <input
              id='target-year'
              type='number'
              value={targetYear}
              onChange={(e) =>
                setTargetYear(
                  parseInt(e.target.value) || new Date().getFullYear(),
                )
              }
              min={1900}
              max={2100}
              className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-lunary-primary-500 focus:border-transparent'
            />
          </div>
        )}
      </div>

      {result && result.result > 0 && (
        <div className='mt-6 pt-6 border-t border-zinc-700'>
          <div className='text-center mb-4'>
            <div className='text-5xl font-light text-lunary-primary-300 mb-2'>
              {result.result}
            </div>
            <div className='text-lg text-zinc-300'>{meaning}</div>
          </div>

          <div className='bg-zinc-800/50 rounded-lg p-4 mb-4'>
            <h4 className='text-sm font-medium text-zinc-400 mb-2'>
              Calculation Steps:
            </h4>
            <ol className='space-y-1 text-sm text-zinc-300'>
              {result.steps.map((step, index) => (
                <li key={index} className='flex gap-2'>
                  <span className='text-zinc-400'>{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {(type === 'soul-urge' || type === 'expression') && (
            <div className='bg-zinc-800/30 rounded-lg p-4 mb-4'>
              <h4 className='text-sm font-medium text-zinc-400 mb-2'>
                {type === 'soul-urge'
                  ? 'Vowel Values (Pythagorean):'
                  : 'Letter Values:'}
              </h4>
              <div className='flex flex-wrap gap-2 text-xs'>
                {type === 'soul-urge' ? (
                  Object.entries(VOWEL_VALUES).map(([letter, value]) => (
                    <span
                      key={letter}
                      className='px-2 py-1 bg-zinc-700 rounded text-zinc-300'
                    >
                      {letter}={value}
                    </span>
                  ))
                ) : (
                  <span className='text-zinc-400'>
                    A-I = 1-9, J-R = 1-9, S-Z = 1-8
                  </span>
                )}
              </div>
            </div>
          )}

          <NavParamLink
            href={resultUrl}
            className='flex items-center justify-center gap-2 w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors'
          >
            Learn more about{' '}
            {type === 'personal-year'
              ? 'Personal Year'
              : type
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}{' '}
            {result.result}
            <ArrowRight className='w-4 h-4' />
          </NavParamLink>
        </div>
      )}
    </div>
  );
}
