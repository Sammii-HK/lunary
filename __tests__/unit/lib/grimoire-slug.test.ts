import { resolveGrimoireSlug } from '@/lib/grimoire/slug';

describe('resolveGrimoireSlug', () => {
  it('resolves exact slug matches', () => {
    const result = resolveGrimoireSlug('crystals/amethyst');

    expect(result.slug).toBe('crystals/amethyst');
    expect(result.matchType).toBe('exact');
  });

  it('handles casing and whitespace via title match', () => {
    const result = resolveGrimoireSlug('  VeNuS  ');

    expect(result.slug).toBe('astronomy/planets/venus');
    expect(result.matchType).toBe('title');
  });

  it('resolves alias matches', () => {
    const result = resolveGrimoireSlug('moon phases');

    expect(result.slug).toBe('moon/phases');
    expect(result.matchType).toBe('alias');
  });

  it('resolves keyword matches', () => {
    const result = resolveGrimoireSlug('concept');

    expect(result.slug).not.toBeNull();
    expect(result.matchType).toBe('keyword');
  });

  it('resolves anchored slugs', () => {
    const result = resolveGrimoireSlug('archetypes#restorer');

    expect(result.slug).toBe('archetypes#restorer');
    expect(result.matchType).toBe('exact');
  });
});
