import { buildPromptSections } from '@/lib/ai/prompt';
import type { LunaryContext } from '@/lib/ai/types';

const baseContext: LunaryContext = {
  user: {
    id: 'user_1',
    tz: 'Europe/London',
    locale: 'en-GB',
    displayName: 'Sammii',
  },
  birthChart: {
    date: '1990-01-01',
    time: '12:00',
    lat: 51.5074,
    lon: -0.1278,
    placements: [
      {
        planet: 'Ascendant',
        sign: 'Scorpio',
        house: 1,
        degree: 0,
      },
    ],
  },
  currentTransits: [
    {
      aspect: 'ingress',
      from: 'Scorpio',
      to: 'Libra',
      exactUtc: '2026-04-29T12:00:00.000Z',
      applying: true,
      strength: 1,
    },
  ],
  moon: null,
  tarot: {},
  history: {
    lastMessages: [],
  },
};

describe('AI prompt transit houses', () => {
  it('labels ingress houses with the destination sign', () => {
    const promptSections = buildPromptSections({
      context: baseContext,
      memorySnippets: [],
      userMessage: 'What house is Scorpio in for me?',
    });

    expect(promptSections.context).toContain('TRANSIT HOUSES: Libra in H12');
    expect(promptSections.context).not.toContain('Scorpio in H12');
  });
});
