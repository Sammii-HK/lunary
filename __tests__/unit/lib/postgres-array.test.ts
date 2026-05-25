import { formatTextArray } from '@/lib/postgres/formatTextArray';

describe('formatTextArray', () => {
  it('formats values as a Postgres text array literal', () => {
    expect(formatTextArray(['moon phase', 'venus transit'])).toBe(
      '{"moon phase","venus transit"}',
    );
  });

  it('escapes quotes and backslashes inside values', () => {
    expect(formatTextArray(['say "yes"', 'north\\south'])).toBe(
      '{"say \\"yes\\"","north\\\\south"}',
    );
  });
});
