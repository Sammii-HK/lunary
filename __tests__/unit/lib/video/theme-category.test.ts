import { resolveThemeCategory } from '@/lib/video/theme-category';

describe('resolveThemeCategory', () => {
  it('prefers explicit category', () => {
    const result = resolveThemeCategory({
      explicitCategory: 'tarot',
      weeklyCategory: 'zodiac',
      title: 'Moon phases',
    });
    expect(result.category).toBe('tarot');
    expect(result.inferredFrom).toBe('explicit');
  });

  it('maps weekly category aliases', () => {
    const result = resolveThemeCategory({
      weeklyCategory: 'planetary-wisdom',
      title: 'Weekly focus',
    });
    expect(result.category).toBe('astronomy');
    expect(result.inferredFrom).toBe('weeklyData');
  });

  it('infers from title when needed', () => {
    const result = resolveThemeCategory({
      title: 'Lunar cycles and moon phases',
    });
    expect(result.category).toBe('moon');
    expect(result.inferredFrom).toBe('title');
  });

  it('falls back when no match found', () => {
    const result = resolveThemeCategory({
      title: 'Weekly overview',
    });
    expect(result.category).toBe('birth-chart');
    expect(result.inferredFrom).toBe('fallback');
  });
});
