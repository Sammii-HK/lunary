// Thematic hashtag arrays for social media posts
const hashtagThemes = {
  tarot: [
    '#tarot',
    '#dailytarot', 
    '#tarotreading',
    '#tarotcards',
    '#tarotguidance',
    '#oraclecard',
    '#divination',
    '#tarotdaily',
    '#mysticaltarot',
    '#tarotinsight',
  ],
  astrology: [
    '#horoscope',
    '#astrology',
    '#zodiac', 
    '#astrologyreading',
    '#cosmicinsight',
    '#planetary',
    '#starguide',
    '#astrologer',
    '#horoscopedaily',
    '#astroguide',
  ],
  moon: [
    '#mooncycles',
    '#moonphases',
    '#lunar',
    '#fullmoon',
    '#newmoon',
    '#moonmagic',
    '#lunarenergy',
    '#moonwisdom',
    '#celestial',
    '#moonritual',
  ],
  spiritual: [
    '#spirituality',
    '#spiritual',
    '#spiritualawakening',
    '#mystic',
    '#cosmic',
    '#energy',
    '#intuition',
    '#mindfulness',
    '#consciousness',
    '#enlightenment',
  ],
  guidance: [
    '#dailyguidance',
    '#cosmicguidance',
    '#spiritualguidance',
    '#dailyoracle',
    '#wisdom',
    '#insight',
    '#guidance',
    '#dailyinsight',
    '#cosmicwisdom',
    '#spiritualinsight',
  ],
  manifestation: [
    '#manifestation',
    '#manifest',
    '#intention',
    '#abundance',
    '#lawofattraction',
    '#positivevibes',
    '#alignment',
    '#vibration',
    '#frequency',
    '#creation',
  ],
};

/**
 * Generates daily hashtags by picking one from each of 3 different themes
 * @param date ISO date string (YYYY-MM-DD)
 * @returns String of 3 hashtags separated by spaces
 */
export function getDailyHashtags(date: string): string {
  // Use date as seed for consistent but varied hashtag selection
  const dateObj = new Date(date);
  const seed = dateObj.getDate() + dateObj.getMonth() * 31;

  const themes = Object.keys(hashtagThemes);
  const selectedHashtags: string[] = [];

  // Pick one hashtag from each of 3 different themes
  for (let i = 0; i < 3; i++) {
    const themeIndex = (seed + i) % themes.length;
    const themeName = themes[themeIndex] as keyof typeof hashtagThemes;
    const themeHashtags = hashtagThemes[themeName];
    const hashtagIndex = (seed + i * 7) % themeHashtags.length;
    selectedHashtags.push(themeHashtags[hashtagIndex]);
  }

  return selectedHashtags.join(' ');
}
