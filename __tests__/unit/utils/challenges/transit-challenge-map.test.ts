import {
  CHALLENGE_TEMPLATES,
  getChallengeTemplate,
  getValidTransitKeys,
  getMoonPhaseFallbackKey,
} from '@/utils/challenges/transit-challenge-map';

describe('transit-challenge-map', () => {
  describe('CHALLENGE_TEMPLATES', () => {
    it('has at least 25 templates', () => {
      expect(CHALLENGE_TEMPLATES.length).toBeGreaterThanOrEqual(25);
    });

    it('each template has 7 daily prompts', () => {
      for (const template of CHALLENGE_TEMPLATES) {
        expect(template.dailyPrompts).toHaveLength(7);
      }
    });

    it('each template has a unique transitKey', () => {
      const keys = CHALLENGE_TEMPLATES.map((t) => t.transitKey);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('each template has required fields', () => {
      for (const template of CHALLENGE_TEMPLATES) {
        expect(template.transitKey).toBeTruthy();
        expect(template.title).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.dailyPrompts.every((p) => p.length > 0)).toBe(true);
      }
    });

    it('includes retrograde templates', () => {
      const retrogrades = [
        'mercury_retrograde',
        'venus_retrograde',
        'mars_retrograde',
        'jupiter_retrograde',
        'saturn_retrograde',
      ];
      for (const key of retrogrades) {
        expect(getChallengeTemplate(key)).not.toBeNull();
      }
    });

    it('includes moon phase fallback templates', () => {
      const moonPhases = [
        'new_moon_week',
        'full_moon_week',
        'waxing_week',
        'waning_week',
      ];
      for (const key of moonPhases) {
        expect(getChallengeTemplate(key)).not.toBeNull();
      }
    });

    it('includes aspect energy templates', () => {
      const aspects = [
        'conjunction_energy',
        'trine_energy',
        'square_energy',
        'opposition_energy',
        'sextile_energy',
      ];
      for (const key of aspects) {
        expect(getChallengeTemplate(key)).not.toBeNull();
      }
    });
  });

  describe('getChallengeTemplate', () => {
    it('returns template for valid key', () => {
      const template = getChallengeTemplate('mercury_retrograde');
      expect(template).not.toBeNull();
      expect(template!.title).toBe('Mercury Retrograde Survival');
    });

    it('returns null for invalid key', () => {
      expect(getChallengeTemplate('nonexistent_key')).toBeNull();
    });
  });

  describe('getValidTransitKeys', () => {
    it('returns all transit keys', () => {
      const keys = getValidTransitKeys();
      expect(keys.length).toBe(CHALLENGE_TEMPLATES.length);
      expect(keys).toContain('mercury_retrograde');
      expect(keys).toContain('new_moon_week');
    });
  });

  describe('getMoonPhaseFallbackKey', () => {
    it('returns new_moon_week for New Moon', () => {
      expect(getMoonPhaseFallbackKey('New Moon')).toBe('new_moon_week');
    });

    it('returns full_moon_week for Full Moon', () => {
      expect(getMoonPhaseFallbackKey('Full Moon')).toBe('full_moon_week');
    });

    it('returns waxing_week for Waxing Crescent', () => {
      expect(getMoonPhaseFallbackKey('Waxing Crescent')).toBe('waxing_week');
    });

    it('returns waxing_week for Waxing Gibbous', () => {
      expect(getMoonPhaseFallbackKey('Waxing Gibbous')).toBe('waxing_week');
    });

    it('returns waning_week for Waning Crescent', () => {
      expect(getMoonPhaseFallbackKey('Waning Crescent')).toBe('waning_week');
    });

    it('returns waning_week for Waning Gibbous', () => {
      expect(getMoonPhaseFallbackKey('Waning Gibbous')).toBe('waning_week');
    });

    it('defaults to waning_week for unknown phases', () => {
      expect(getMoonPhaseFallbackKey('Something Else')).toBe('waning_week');
    });
  });
});
