export type AppPermission = {
  name: string;
  detail: string;
};

export type ActiveAppPolicy = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  privacySummary: string;
  localData: string[];
  permissions: AppPermission[];
  cloudSync: string;
  purchases: string;
  thirdParties: string[];
  supportTopics: string[];
};

const supportEmail = 'support@lunary.app';
const privacyEmail = 'privacy@lunary.app';
const lastUpdated = 'April 25, 2026';

export const activeAppPolicies: ActiveAppPolicy[] = [
  {
    slug: 'spellbook',
    name: 'Spell Book',
    category: 'Lifestyle reference',
    summary:
      'A private reference library and practice journal for saved correspondences, notes, collections, and ritual frameworks.',
    privacySummary:
      'Spell Book stores your saved reference items and notes locally, with optional iCloud sync for your own Apple devices.',
    localData: [
      'Saved reference items, favourites, notes, collections, and practice logs',
      'In-app settings, reading preferences, and widget preferences',
    ],
    permissions: [
      {
        name: 'Widgets',
        detail:
          'The widget reads shared local app data, such as the item of the day, for display on your device.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, Spell Book uses Apple CloudKit to sync your saved items across devices signed in to your Apple account.',
    purchases:
      'Premium access is processed by Apple in-app purchase and managed with RevenueCat. We do not receive your Apple ID, payment card, or billing address.',
    thirdParties: ['Apple CloudKit', 'Apple in-app purchase', 'RevenueCat'],
    supportTopics: [
      'Restoring premium access',
      'iCloud sync status',
      'Missing saved items after changing devices',
      'Widget display issues',
    ],
  },
  {
    slug: 'ai-voiceover',
    name: 'AI Voiceover',
    category: 'Education',
    summary:
      'A study tool that turns flashcards and study notes into listenable question and answer audio.',
    privacySummary:
      'AI Voiceover stores your study sets, cards, playback preferences, and generated audio files on your device.',
    localData: [
      'Study sets, flashcards, subjects, difficulty labels, and import history',
      'Generated or cached audio tracks, playback settings, sleep timer state, and voice preferences',
    ],
    permissions: [],
    cloudSync:
      'If iCloud sync is enabled, study sets and progress may sync via Apple CloudKit to devices signed in to your Apple account.',
    purchases:
      'Premium access, where offered, is processed by Apple in-app purchase. The app may use RevenueCat to verify entitlement status.',
    thirdParties: [
      'Apple CloudKit',
      'Apple speech synthesis',
      'Apple in-app purchase',
      'RevenueCat, if enabled for subscriptions',
    ],
    supportTopics: [
      'Importing study sets',
      'Playback or generated audio issues',
      'Restoring premium access',
      'iCloud sync status',
    ],
  },
  {
    slug: 'voice-diary',
    name: 'Voice Diary',
    category: 'Journalling',
    summary:
      'A voice-first journal for spoken entries, local transcription, mood tags, and optional cycle-aware reflection.',
    privacySummary:
      'Voice Diary keeps audio, transcripts, mood tags, and journal entries on your device unless you enable iCloud sync.',
    localData: [
      'Voice journal recordings, transcripts, mood tags, diary entries, and timeline history',
      'Cycle snapshots used for in-app reflection when Health access is enabled',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail: 'Used only when you record a voice journal entry.',
      },
      {
        name: 'Speech recognition',
        detail:
          'Used to transcribe entries. On-device recognition is used where available; Apple may process speech if on-device recognition is unavailable.',
      },
      {
        name: 'HealthKit, optional',
        detail:
          'If enabled, reads cycle data to show mood patterns across cycle phases. The app may write mood-related notes only where you choose to enable that feature.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, entries may sync via Apple CloudKit to devices signed in to your Apple account.',
    purchases:
      'Premium access, where offered, is processed by Apple in-app purchase. The app may use RevenueCat to verify entitlement status.',
    thirdParties: [
      'Apple CloudKit',
      'Apple Speech Recognition',
      'Apple HealthKit',
      'Apple in-app purchase',
      'RevenueCat, if enabled for subscriptions',
    ],
    supportTopics: [
      'Microphone or transcription permissions',
      'Exporting entries',
      'HealthKit connection status',
      'iCloud sync status',
    ],
  },
  {
    slug: 'brain-dump',
    name: 'Brain Dump',
    category: 'Journalling',
    summary:
      'A quick voice capture app for parking thoughts, ideas, to-dos, and notes before sleep.',
    privacySummary:
      'Brain Dump stores voice dumps, transcripts, tags, and archive history locally, with optional iCloud sync for Pro features.',
    localData: [
      'Voice recordings, transcripts, tags, archive entries, and export files',
      'Bedtime audio preferences, search history, and local app settings',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail: 'Used only when you record a dump.',
      },
      {
        name: 'Speech recognition',
        detail:
          'Used to transcribe your dumps. On-device recognition is used where available; Apple may process speech if on-device recognition is unavailable.',
      },
    ],
    cloudSync:
      'Free data is stored locally. Pro features may enable Apple CloudKit sync across your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: [
      'Apple CloudKit, if sync is enabled',
      'Apple Speech Recognition',
      'Apple in-app purchase',
    ],
    supportTopics: [
      'Recording and transcription permissions',
      'Daily free limit questions',
      'Exporting dumps',
      'Restoring premium access',
    ],
  },
  {
    slug: 'sleep-cycle-calc',
    name: 'Sleep Cycle Calc',
    category: 'Utilities',
    summary:
      'A sleep timing calculator with local history, optional HealthKit sleep logging, and bundled ambient loops.',
    privacySummary:
      'Sleep Cycle Calc stores sleep calculations, sleep sessions, alarm preferences, and loop settings on your device.',
    localData: [
      'Sleep calculation history, bedtime and wake-time preferences, alarm settings, and ambient loop preferences',
      'Sleep session records stored locally in the app',
    ],
    permissions: [
      {
        name: 'HealthKit, optional',
        detail:
          'If enabled, reads sleep samples to show streaks and weekly trends, and can save bedtime and wake-time samples back to Health.',
      },
      {
        name: 'Notifications, optional',
        detail:
          'Used for local bedtime or wake reminders. Reminder scheduling happens on your device.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, sleep history may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: [
      'Apple CloudKit',
      'Apple HealthKit',
      'Apple in-app purchase',
    ],
    supportTopics: [
      'HealthKit permissions',
      'Alarm or reminder behaviour',
      'Ambient loop playback',
      'Restoring premium access',
    ],
  },
  {
    slug: 'affirmations',
    name: 'Affirmations',
    category: 'Wellbeing',
    summary:
      'A daily affirmation app for recording your own affirmations and scheduling local playback reminders.',
    privacySummary:
      'Affirmations stores your recordings, playback schedules, categories, and preferences on your device.',
    localData: [
      'Recorded affirmations, curated library progress, categories, and playback schedules',
      'Ambient backing preferences, sleep timer settings, and export files',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail: 'Used only when you record an affirmation in your own voice.',
      },
      {
        name: 'Notifications, optional',
        detail: 'Used for local reminder delivery at the times you choose.',
      },
    ],
    cloudSync:
      'If iCloud sync is enabled, recordings and preferences may sync via Apple CloudKit to devices signed in to your Apple account.',
    purchases:
      'Premium access is processed by Apple in-app purchase. The app may use RevenueCat to verify entitlement status.',
    thirdParties: [
      'Apple CloudKit',
      'Apple local notifications',
      'Apple in-app purchase',
      'RevenueCat, if enabled for subscriptions',
    ],
    supportTopics: [
      'Recording permissions',
      'Reminder scheduling',
      'Restoring premium access',
      'Exporting recordings',
    ],
  },
  {
    slug: 'constellation-habits',
    name: 'Constellation Habits',
    category: 'Habits',
    summary:
      'A habit tracker where daily check-ins light up constellation-style progress maps.',
    privacySummary:
      'Constellation Habits stores habits, check-ins, voice notes, progress maps, and cycle-aware settings on your device.',
    localData: [
      'Habit names, check-ins, progress history, constellation types, and insight summaries',
      'Optional voice check-in transcripts and cycle-aware reminder preferences',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail: 'Used only if you record an optional voice check-in.',
      },
      {
        name: 'Speech recognition',
        detail: 'Used to transcribe voice check-ins on device where available.',
      },
      {
        name: 'HealthKit, optional',
        detail:
          'If enabled, reads cycle data to adjust habit nudges. The app does not write to Health by default.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, habits and progress may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase. The app may use RevenueCat to verify entitlement status.',
    thirdParties: [
      'Apple CloudKit',
      'Apple Speech Recognition',
      'Apple HealthKit',
      'Apple in-app purchase',
      'RevenueCat, if enabled for subscriptions',
    ],
    supportTopics: [
      'Habit limits and premium access',
      'Voice check-in permissions',
      'HealthKit permissions',
      'iCloud sync status',
    ],
  },
  {
    slug: '30-day-quest',
    name: '30 Day Quest',
    category: 'Journalling',
    summary:
      'A 30-day guided prompt app for themed personal projects, daily reflections, and optional voice journal entries.',
    privacySummary:
      '30 Day Quest stores quest progress, journal entries, voice entries, and completion records on your device.',
    localData: [
      'Active quests, day progress, journal entries, completion certificates, and vault history',
      'Optional voice recordings, transcripts, and cycle-aware prompt settings',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail: 'Used only when you record a voice journal entry.',
      },
      {
        name: 'Speech recognition',
        detail:
          'Used to transcribe voice journal entries on device where available.',
      },
      {
        name: 'HealthKit, optional',
        detail:
          'If enabled, reads cycle data so daily prompt wording can adapt to your current phase.',
      },
      {
        name: 'Notifications, optional',
        detail: 'Used for local quest reminders scheduled on your device.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, quest progress may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: [
      'Apple CloudKit',
      'Apple Speech Recognition',
      'Apple HealthKit',
      'Apple local notifications',
      'Apple in-app purchase',
    ],
    supportTopics: [
      'Quest progress issues',
      'Voice journal permissions',
      'HealthKit permissions',
      'Restoring premium access',
    ],
  },
  {
    slug: 'daily-cards',
    name: 'Daily Cards',
    category: 'Reflection',
    summary:
      'A daily reflective card app with themed decks, journalling, local insights, and optional cycle-aware deck suggestions.',
    privacySummary:
      'Daily Cards stores card pulls, journal reflections, deck choices, and insight history on your device.',
    localData: [
      'Daily card entries, deck choices, journal reflections, spread history, and local insight summaries',
      'Reminder preferences and optional cycle-aware deck recommendation settings',
    ],
    permissions: [
      {
        name: 'HealthKit, optional',
        detail:
          'If enabled, reads menstrual cycle data to suggest decks aligned with your current phase. The app does not write Health data in current app behaviour.',
      },
      {
        name: 'Notifications, optional',
        detail: 'Used for one local daily reminder at the time you choose.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, entries and deck state may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access and deck purchases are processed by Apple in-app purchase. The app may use RevenueCat to verify entitlement status.',
    thirdParties: [
      'Apple CloudKit',
      'Apple HealthKit',
      'Apple local notifications',
      'Apple in-app purchase',
      'RevenueCat, if enabled for subscriptions',
    ],
    supportTopics: [
      'Daily reminder scheduling',
      'Deck purchases and restores',
      'HealthKit permissions',
      'Missing journal entries',
    ],
  },
  {
    slug: 'bath-ritual',
    name: 'Bath Ritual',
    category: 'Wellbeing',
    summary:
      'A bath planning app for mood-based routines, ingredient notes, breath timing, and optional cycle-aware suggestions.',
    privacySummary:
      'Bath Ritual stores selected moods, saved bath routines, ingredient preferences, and share cards on your device.',
    localData: [
      'Saved bath routines, mood selections, ingredient preferences, and history',
      'Share card exports and optional cycle-aware suggestion settings',
    ],
    permissions: [
      {
        name: 'HealthKit, optional',
        detail:
          'If enabled, reads menstrual cycle data so suggestions can adapt to the phase you are in. Bath Ritual does not write to Health.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, saved routines may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: [
      'Apple CloudKit',
      'Apple HealthKit',
      'Apple in-app purchase',
      'Spotify, only if you choose to open a soundscape externally',
    ],
    supportTopics: [
      'HealthKit permissions',
      'Routine generation behaviour',
      'Share card exports',
      'Restoring premium access',
    ],
  },
  {
    slug: 'wins',
    name: 'Wins',
    category: 'Journalling',
    summary:
      'A daily wins log with local history, optional voice memos, photo attachments, share cards, and year recap exports.',
    privacySummary:
      'Wins stores win entries, categories, voice memos, attached photos, recap data, and share card exports on your device.',
    localData: [
      'Win entries, categories, timeline history, weekly highlights, and year recap state',
      'Optional voice memos, attached photos, share cards, and wallpaper exports',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail: 'Used only if you record a voice memo alongside a win.',
      },
      {
        name: 'Photo library',
        detail:
          'Used if you attach a photo to a win or save share cards and wallpaper exports to Photos.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, win history may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: ['Apple CloudKit', 'Apple Photos', 'Apple in-app purchase'],
    supportTopics: [
      'Photo library permissions',
      'Voice memo permissions',
      'Recap exports',
      'Restoring premium access',
    ],
  },
  {
    slug: 'wheel',
    name: 'Wheel',
    category: 'Utilities',
    summary:
      'A private decision wheel app for saved wheels, weighted options, spin history, custom themes, and share cards.',
    privacySummary:
      'Wheel stores your saved wheels, options, weights, spin history, themes, and preferences locally on your device.',
    localData: [
      'Saved wheels, options, weights, themes, and spin results',
      'Share card exports and local app settings',
    ],
    permissions: [],
    cloudSync:
      'If iCloud is enabled, saved wheels may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: ['Apple CloudKit', 'Apple in-app purchase'],
    supportTopics: [
      'Saved wheel limits',
      'Weighted option behaviour',
      'Share card exports',
      'Restoring premium access',
    ],
  },
  {
    slug: 'glow',
    name: 'Glow',
    category: 'Lifestyle',
    summary:
      'A daily wallpaper app for aesthetic lock-screen and home-screen images, saved wallpapers, widgets, and quote overlays.',
    privacySummary:
      'Glow stores saved wallpapers, aesthetic preferences, quote overlay settings, widget settings, and export history on your device.',
    localData: [
      'Saved wallpapers, selected aesthetics, quote preferences, and library history',
      'Widget preferences, generated wallpaper state, and share card exports',
    ],
    permissions: [
      {
        name: 'Photo library',
        detail: 'Used only when you save a wallpaper or share image to Photos.',
      },
      {
        name: 'Widgets',
        detail:
          'Widgets read local Glow data to display your selected wallpaper or accent.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, saved wallpaper state may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: ['Apple CloudKit', 'Apple Photos', 'Apple in-app purchase'],
    supportTopics: [
      'Saving wallpapers to Photos',
      'Widget display issues',
      'Premium wallpaper access',
      'Restoring premium access',
    ],
  },
  {
    slug: 'clear',
    name: 'Clear',
    category: 'Habits',
    summary:
      'A clarity check-in and slip tracking app for local journalling, patterns, reminders, and optional cycle context.',
    privacySummary:
      'Clear stores check-ins, slip entries, reasons, voice notes, reminder settings, and insight summaries on your device.',
    localData: [
      'Check-ins, slip entries, reasons, journal history, and local insight summaries',
      'Optional voice notes, reminder preferences, share cards, and cycle context',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail:
          'Used only if you record an optional voice note with a check-in.',
      },
      {
        name: 'HealthKit, optional',
        detail:
          'If enabled, reads menstrual cycle data so you can compare clarity patterns with cycle phases. Clear does not write to Health.',
      },
      {
        name: 'Notifications, optional',
        detail: 'Used for local reminders scheduled on your device.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, check-ins and history may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: [
      'Apple CloudKit',
      'Apple HealthKit',
      'Apple local notifications',
      'Apple in-app purchase',
    ],
    supportTopics: [
      'Reminder settings',
      'Voice note permissions',
      'HealthKit permissions',
      'Restoring premium access',
    ],
  },
  {
    slug: 'shelf',
    name: 'Shelf',
    category: 'Books',
    summary:
      'A reading tracker with a visual bookshelf, quote clipping, book stats, ISBN scanning, and year-in-books recap exports.',
    privacySummary:
      'Shelf stores your books, shelves, quotes, reading sessions, notes, and recap state locally on your device.',
    localData: [
      'Books, reading status, custom shelves, quotes, notes, sessions, and reading stats',
      'Share cards, recap exports, ISBN scan results, and local app settings',
    ],
    permissions: [
      {
        name: 'Camera',
        detail: 'Used only when you scan an ISBN barcode to add a book.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, shelf data may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: [
      'Apple CloudKit',
      'Apple camera APIs',
      'Open Library, when you search or scan for book metadata',
      'Apple in-app purchase',
    ],
    supportTopics: [
      'ISBN scanning',
      'Book metadata lookup',
      'Shelf limits and premium access',
      'Recap exports',
    ],
  },
  {
    slug: 'tend',
    name: 'Tend',
    category: 'Habits',
    summary:
      'A quiet habit log book with one-tap check-ins, optional voice notes, weekly insights, and cycle-aware reminders.',
    privacySummary:
      'Tend stores habits, check-ins, voice notes, reminder preferences, and weekly insight history on your device.',
    localData: [
      'Habits, check-ins, history, weekly insights, and reminder preferences',
      'Optional voice notes, share cards, and cycle-aware reminder settings',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail:
          'Used only if you record an optional short voice note alongside a check-in.',
      },
      {
        name: 'HealthKit, optional',
        detail:
          'If enabled, reads menstrual cycle data so reminders can soften during selected phases. Tend does not write to Health.',
      },
      {
        name: 'Notifications, optional',
        detail: 'Used for local habit reminders scheduled on your device.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, habit history may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase using StoreKit.',
    thirdParties: [
      'Apple CloudKit',
      'Apple HealthKit',
      'Apple local notifications',
      'Apple in-app purchase',
    ],
    supportTopics: [
      'Habit history limits',
      'Voice note permissions',
      'HealthKit permissions',
      'Restoring premium access',
    ],
  },
  {
    slug: 'postready',
    name: 'PostReady',
    category: 'Photo and video',
    summary:
      'A video creation app for recording, importing, editing, captioning, and exporting short-form social videos.',
    privacySummary:
      'PostReady processes recordings, imported clips, captions, edits, and exports on your device unless you choose to share them.',
    localData: [
      'Recorded videos, imported clips, edit projects, captions, transcripts, and export files',
      'Camera settings, subtitle styles, beauty filter settings, and render cache files',
    ],
    permissions: [
      {
        name: 'Camera',
        detail: 'Used when you record video clips inside the app.',
      },
      {
        name: 'Microphone',
        detail: 'Used when you capture audio alongside video.',
      },
      {
        name: 'Photo library',
        detail:
          'Used when you import photos or clips as b-roll, or save finished videos and carousels back to Photos.',
      },
    ],
    cloudSync:
      'PostReady is designed for local projects. Project files and media stay on your device unless you export or share them yourself.',
    purchases:
      'Premium access is processed by Apple in-app purchase and managed with RevenueCat. We do not receive your Apple ID, payment card, or billing address.',
    thirdParties: [
      'Apple camera, microphone, Photos, Vision, and AVFoundation frameworks',
      'Apple in-app purchase',
      'RevenueCat',
      'Optional user-provided API providers, only if you add your own key in the app',
    ],
    supportTopics: [
      'Camera, microphone, or Photos permissions',
      'Export failures',
      'Restoring premium access',
      'Caption or render behaviour',
    ],
  },
  {
    slug: 'iprep',
    name: 'iPrep',
    category: 'Education',
    summary:
      'An interview practice app for spoken answers, transcripts, scoring, question banks, and spaced repetition.',
    privacySummary:
      'iPrep stores practice answers, transcripts, scores, question history, and interview prep settings on your device.',
    localData: [
      'Practice sessions, transcripts, scores, question banks, streaks, and answer history',
      'Optional role, company, interview date, API keys, and local feedback settings',
    ],
    permissions: [
      {
        name: 'Microphone',
        detail: 'Used only when you record a practice answer.',
      },
      {
        name: 'Speech recognition',
        detail:
          'Used to transcribe spoken answers. On-device recognition is used where available; Apple may process speech if on-device recognition is unavailable.',
      },
      {
        name: 'Widgets',
        detail:
          'Widgets read local iPrep data, such as practice prompts or streak information, for display on your device.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, practice data may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase and managed with RevenueCat. We do not receive your Apple ID, payment card, or billing address.',
    thirdParties: [
      'Apple CloudKit',
      'Apple Speech Recognition',
      'Apple in-app purchase',
      'RevenueCat',
      'DeepInfra or Anthropic, only if you choose AI feedback that uses your own key or a premium backend route',
    ],
    supportTopics: [
      'Microphone and transcription permissions',
      'AI feedback setup',
      'Restoring premium access',
      'iCloud sync status',
    ],
  },
  {
    slug: 'crystal-index',
    name: 'Crystal Index',
    category: 'Reference',
    summary:
      'A crystal reference index for browsing, saving, learning, and keeping a private collection of notes.',
    privacySummary:
      'Crystal Index stores saved crystals, notes, collection state, widget preferences, and browsing preferences on your device.',
    localData: [
      'Saved crystals, favourites, notes, collection state, and local reference preferences',
      'Widget preferences and premium access state',
    ],
    permissions: [
      {
        name: 'Widgets',
        detail:
          'Widgets read local Crystal Index data to display selected or daily reference items.',
      },
    ],
    cloudSync:
      'If iCloud is enabled, saved crystals and notes may sync via Apple CloudKit to your own devices.',
    purchases:
      'Premium access is processed by Apple in-app purchase and managed with RevenueCat. We do not receive your Apple ID, payment card, or billing address.',
    thirdParties: ['Apple CloudKit', 'Apple in-app purchase', 'RevenueCat'],
    supportTopics: [
      'Missing saved crystals',
      'Widget display issues',
      'Restoring premium access',
      'iCloud sync status',
    ],
  },
];

export const activeAppPolicySlugs = activeAppPolicies.map((app) => app.slug);

export function getActiveAppPolicyBySlug(slug: string) {
  return activeAppPolicies.find((app) => app.slug === slug);
}

export function getActiveAppPolicyOrThrow(slug: string) {
  const app = getActiveAppPolicyBySlug(slug);
  if (!app) {
    throw new Error(`Unknown active app policy slug: ${slug}`);
  }
  return app;
}

export const appPolicyPageMeta = {
  lastUpdated,
  supportEmail,
  privacyEmail,
};
