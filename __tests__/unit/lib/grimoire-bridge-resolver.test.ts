import { resolveGrimoireBridge } from '@/lib/grimoire/bridge-resolver';

describe('resolveGrimoireBridge', () => {
  it('filters to tarot results for venus when types are provided', () => {
    const result = resolveGrimoireBridge({
      seed: 'venus',
      types: ['tarot'],
      limit: 5,
    });

    expect(result.links.length).toBeGreaterThan(0);
    result.links.forEach((link) => {
      expect(link.type).toBe('tarot');
    });
    expect(result.links[0]?.slug).toBe('tarot/the-empress');
  });

  it('returns crystal results for amethyst when filtered', () => {
    const result = resolveGrimoireBridge({
      seed: 'amethyst',
      types: ['crystal'],
      limit: 5,
    });

    expect(result.links.length).toBeGreaterThan(0);
    result.links.forEach((link) => {
      expect(link.type).toBe('crystal');
    });
    expect(result.links.some((link) => link.slug === 'crystals/amethyst')).toBe(
      true,
    );
  });

  it('returns mixed types for venus when no types are provided', () => {
    const result = resolveGrimoireBridge({ seed: 'venus', limit: 5 });
    const typeSet = new Set(result.links.map((link) => link.type));

    expect(result.links.length).toBeGreaterThan(1);
    expect(typeSet.size).toBeGreaterThan(1);
  });

  it('resolves alias variants like rose-quartz', () => {
    const result = resolveGrimoireBridge({
      seed: 'rose-quartz',
      types: ['crystal'],
      limit: 5,
    });

    expect(
      result.links.some((link) => link.slug === 'crystals/rose-quartz'),
    ).toBe(true);
  });
});
