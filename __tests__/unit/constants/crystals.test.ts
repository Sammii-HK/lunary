import { crystalDatabase, getCrystalById } from '@/constants/grimoire/crystals';

describe('Crystal Database', () => {
  it('should have crystals in database', () => {
    expect(crystalDatabase.length).toBeGreaterThan(0);
  });

  it('should have unique crystal IDs', () => {
    const ids = crystalDatabase.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should get crystal by ID', () => {
    const crystal = getCrystalById('rose-quartz');
    expect(crystal).toBeDefined();
    expect(crystal?.id).toBe('rose-quartz');
  });

  it('should return undefined for invalid ID', () => {
    const crystal = getCrystalById('non-existent-crystal');
    expect(crystal).toBeUndefined();
  });

  it('should have required properties for all crystals', () => {
    crystalDatabase.forEach((crystal) => {
      expect(crystal).toHaveProperty('id');
      expect(crystal).toHaveProperty('name');
      expect(crystal).toHaveProperty('properties');
      expect(crystal).toHaveProperty('categories');
      expect(crystal).toHaveProperty('chakras');
      expect(crystal).toHaveProperty('colors');
      expect(crystal).toHaveProperty('ogColor');
    });
  });

  it('should have valid OG colors', () => {
    crystalDatabase.forEach((crystal) => {
      expect(crystal.ogColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
