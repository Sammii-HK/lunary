import { buildVideoCaption } from '@/lib/social/video-captions';

describe('buildVideoCaption', () => {
  it('formats New Moon caption with search phrase and definition', () => {
    const caption = buildVideoCaption({
      themeName: 'Lunar Cycles',
      facetTitle: 'New Moon',
      scriptText: 'New Moon begins a lunar cycle.',
    });
    const lines = caption.split('\n');
    expect(lines[0]).toBe('new moon meaning');
    expect(lines[1].toLowerCase()).toContain('new moon');
    expect(lines[3]).toBe("Read more in Lunary's Grimoire. Save this.");
  });

  it('formats Void of Course Moon caption with search phrase', () => {
    const caption = buildVideoCaption({
      themeName: 'Lunar Cycles',
      facetTitle: 'Void of Course Moon',
      scriptText: 'Void of course moon describes a gap before sign change.',
    });
    const lines = caption.split('\n');
    expect(lines[0]).toBe('void of course moon meaning');
    expect(lines[1].toLowerCase()).toContain('void of course moon');
    expect(lines[3]).toBe("Read more in Lunary's Grimoire. Save this.");
  });
});
