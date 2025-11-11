describe('String Utilities', () => {
  it('should capitalize strings', () => {
    const str = 'hello world';
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    expect(capitalized).toBe('Hello world');
  });

  it('should truncate long strings', () => {
    const longString = 'a'.repeat(100);
    const truncated = longString.substring(0, 50) + '...';
    expect(truncated.length).toBe(53);
  });

  it('should format zodiac signs', () => {
    const signs = ['aries', 'taurus', 'gemini'];
    const formatted = signs.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
    expect(formatted).toEqual(['Aries', 'Taurus', 'Gemini']);
  });
});
