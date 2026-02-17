type PinterestBoard = { boardId: string; boardName: string };

const BOARDS: Record<string, PinterestBoard> = {
  tarot: { boardId: '988329149416134011', boardName: 'Tarot Card Meanings' },
  crystals: { boardId: '988329149416134028', boardName: 'Crystal Meanings' },
  spells: { boardId: '988329149416134036', boardName: 'Spells & Witchcraft' },
  numerology: { boardId: '988329149416134018', boardName: 'Angel Numbers' },
  runes: { boardId: '988329149416134043', boardName: 'Grimoire' },
  chakras: { boardId: '988329149416134043', boardName: 'Grimoire' },
  zodiac: { boardId: '988329149416133979', boardName: 'Zodiac Signs' },
  moon: { boardId: '988329149416134042', boardName: 'Moon Phases' },
  birth_chart: { boardId: '988329149416133982', boardName: 'Birth Chart' },
  conjunctions: { boardId: '988329149416086194', boardName: 'Conjunctions' },
  saturn_return: { boardId: '988329149416134045', boardName: 'Saturn Return' },
  quotes: { boardId: '988329149415975039', boardName: 'Lunary' },
};

const DEFAULT_BOARD: PinterestBoard = {
  boardId: '988329149415975039',
  boardName: 'Lunary',
};

export function getPinterestBoard(contentKey?: string): PinterestBoard {
  if (!contentKey) return DEFAULT_BOARD;
  return BOARDS[contentKey] ?? DEFAULT_BOARD;
}
