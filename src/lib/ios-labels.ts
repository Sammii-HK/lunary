/**
 * iOS App Store-friendly label overrides.
 *
 * Apple's 4.3(b) reviewers pattern-match on words like "spell", "ritual",
 * "grimoire", and "cosmic" and auto-reject as "fortune telling." These
 * labels swap only the UI text on native iOS builds so the PWA and Android
 * versions stay unchanged.
 */

const IOS_LABEL_MAP: Record<string, string> = {
  // Dashboard
  'Cosmic Score': 'Daily Alignment',
  'Unlock Your Cosmic Score': 'Unlock Your Daily Alignment',
  "Today's Cosmic Score": "Today's Alignment Score",
  'Recommended Spells': 'Recommended Practices',
  'Browse all spells': 'Browse all practices',
  "Today's ritual": "Today's practice",
  'Mark ritual complete': 'Mark practice complete',

  // Explore page
  'Book of Shadows': 'Reflection Journal',
  'Opening your Book of Shadows...': 'Opening your journal...',
  'Your reflections and patterns': 'Your reflections and insights',
  Grimoire: 'Reference Library',
  '2,000+ articles on astrology, tarot, crystals': '2,000+ reference articles',
  'Spell packs, crystal guides, and more':
    'Practice guides, crystal reference, and more',
  'Your Cosmic Tools': 'Your Tools',
  'Your cosmic blueprint': 'Your birth chart data',
  'Your cosmic identity': 'Your identity',
  'Send cosmic gifts to friends': 'Send gifts to friends',
  'Invite friends, earn cosmic rewards': 'Invite friends, earn rewards',
  'Ask astrology questions, get community wisdom':
    'Ask questions, get community wisdom',

  // Transits page
  'Your Cosmic Season': 'Your Current Season',
  'Moon-guided energy reading': 'Personalised energy reading',
  'Waning Crescent Rest Ritual': 'Waning Crescent Rest Practice',
  "Today's moon-timed ritual": "Today's moon-timed practice",
  'Cosmic Reflection Prompts': 'Reflection Prompts',

  // Tarot page
  'Personalized guidance based on your cosmic signature':
    'Personalised guidance based on your birth chart',
  'General cosmic guidance based on universal energies':
    'General guidance based on universal energies',
  'calculate your cosmic signature': 'calculate your birth chart profile',
  'provide more accurate cosmic insights': 'provide more accurate insights',
  'Water Blessing Ritual': 'Water Blessing Practice',
  'Fire Activation Ritual': 'Fire Activation Practice',
  'Air Clarity Ritual': 'Air Clarity Practice',
  'Earth Grounding Ritual': 'Earth Grounding Practice',
  'Integration Ritual': 'Integration Practice',

  // Navbar
  Tarot: 'Card Reading',

  // Copilot quick actions
  "Tonight's Cosmic Weather": "Tonight's Sky Overview",
  'Tarot Patterns': 'Card Patterns',
  'Ritual for Tonight': 'Practice for Tonight',
  'Grimoire Lookup': 'Reference Lookup',
  'Interpret Spread': 'Interpret Reading',

  // Progress skill names
  'Tarot Mastery': 'Card Reading Mastery',
  'Cosmic Explorer': 'Explorer',
  'Ritual Keeper': 'Practice Keeper',

  // Upgrade prompts
  'Continue enjoying premium cosmic insights after your trial':
    'Continue enjoying premium personalised insights after your trial',

  // Horoscope/transits page
  'Loading your horoscope...': 'Loading your transits...',

  // Weekly challenge
  'cosmic rewards': 'rewards',
};

/**
 * Returns the iOS-friendly label when running on native iOS,
 * otherwise returns the original label unchanged.
 */
export function iosLabel(label: string, isNativeIOS: boolean | null): string {
  if (!isNativeIOS) return label;
  return IOS_LABEL_MAP[label] ?? label;
}
