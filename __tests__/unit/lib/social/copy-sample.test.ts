import { categoryThemes } from '@/lib/social/weekly-themes';
import {
  buildSourcePack,
  buildFallbackCopy,
} from '@/lib/social/social-copy-generator';

describe('social copy comparison sample', () => {
  it('logs the new caption content versus fallback for manual QA', async () => {
    const theme = categoryThemes.find(
      (candidate) => candidate.category === 'lunar',
    );
    const facet = theme?.facets?.[0];
    if (!theme || !facet) {
      throw new Error('Unable to find lunar facet for sample');
    }
    const pack = buildSourcePack({
      topic: facet.title,
      theme,
      platform: 'tiktok',
      postType: 'video_caption',
      facet,
    });
    const fallback = await buildFallbackCopy(pack);
    console.log('=== Sample Topic ===');
    console.log('Topic:', pack.topicTitle);
    console.log('Category context:', pack.categoryContextClause);
    console.log('Search keyword:', pack.searchKeyword);
    console.log('Fallback caption:\n', fallback.content);
    console.log('Hashtags:', fallback.hashtags.join(' '));
    expect(typeof fallback.content).toBe('string');
  });
});
