import { ComparisonData } from '@/components/comparison';

export const comparisonData: Record<string, ComparisonData> = {
  'lunary-vs-costar': {
    competitorName: 'Co-Star',
    competitorSlug: 'lunary-vs-costar',
    tagline: 'Lunary vs Co-Star: Which Astrology App is Right for You?',
    subtitle:
      'A detailed comparison to help you choose between Lunary and Co-Star for your astrological practice.',
    featuresCompared: [
      'Real astronomical calculations with ±1 arcminute accuracy',
      'Complete grimoire with 2000+ pages',
      'Personalized tarot readings based on your chart',
      'Magical tools (spells, rituals, correspondences)',
    ],
    features: [
      {
        name: 'Calculation Method',
        description: 'How birth charts are calculated',
        lunary: {
          type: 'text',
          value: '±1 arcminute accuracy',
          highlight: true,
        },
        competitor: { type: 'check' },
      },
      {
        name: 'Personalized Birth Chart',
        description: 'Based on exact birth time, date, location',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Personalized Horoscopes',
        description: 'Based on YOUR chart vs generic zodiac',
        lunary: { type: 'text', value: 'Chart-Based', highlight: true },
        competitor: { type: 'check' },
      },
      {
        name: 'Grimoire (2000+ pages)',
        description: 'Spells, rituals, correspondences',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        description: 'Personalized to your chart',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Crystal Guidance',
        description: 'Based on your birth chart & current transits',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Moon Circles',
        description: 'New & Full Moon insights',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Solar Return',
        description: 'Birthday chart & yearly forecast',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Pattern Analysis',
        description: 'Identifies patterns across your tarot readings',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        description: 'Patterns detected from your Book of Shadows journaling',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Book of Shadows Journal',
        description: 'Personal magical journal',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Trial',
        description: 'Try before you buy',
        lunary: {
          type: 'text',
          value: '7 days (monthly) / 14 days (annual)',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free tier available' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free + $2.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Real Astronomical Calculations (±1 arcminute accuracy)',
        description:
          'Lunary uses astronomy-engine for calculations accurate to ±1 arcminute based on VSOP87 models, ensuring precise planetary positions from your exact birth time, date, and location.',
      },
      {
        title: 'Complete Grimoire (2000+ pages)',
        description:
          'Lunary includes a comprehensive grimoire with 2000+ pages of spells, rituals, correspondences, and magical knowledge - unique to Lunary and not available in Co-Star.',
      },
      {
        title: 'Chart-Personalized Tarot with Pattern Analysis',
        description:
          'Every tarot reading is personalized to YOUR exact birth chart. Tarot Pattern Analysis identifies recurring themes across your readings over time. Also includes Moon Circles, ritual generator, and personalized crystal recommendations.',
      },
      {
        title: 'Astral Guide with Complete Chart Context',
        description:
          'The Astral Guide has complete context of your birth chart, tarot patterns, readings history, and archetypes to provide comprehensive insights in plain language. It understands your unique astrological profile and how it evolves over time.',
      },
    ],
    competitorStrengths:
      'Co-Star may be a good choice if you prefer their minimalist, text-based interface and social features for comparing charts with friends. Their hyper-personalized push notifications and unique aesthetic appeal to users who want a different astrology app experience.',
    conclusion:
      'Choose Lunary if you want real astronomical calculations with ±1 arcminute accuracy, a complete grimoire with 2000+ pages, and personalized tarot readings based on your exact birth chart. Choose Co-Star if you prefer their minimalist text-based interface and social features for comparing charts with friends.',
  },

  'lunary-vs-chani': {
    competitorName: 'CHANI',
    competitorSlug: 'lunary-vs-chani',
    tagline: 'Lunary vs CHANI: Real Astronomy vs Premium Content',
    subtitle:
      'A detailed comparison between astronomical accuracy with magical tools and premium astrology content.',
    featuresCompared: [
      'Real astronomical calculations',
      'Magical tools (grimoire, tarot, rituals)',
      'Premium content vs personalized insights',
      'Pricing and value',
    ],
    features: [
      {
        name: 'Calculation Method',
        description: 'How birth charts are calculated',
        lunary: {
          type: 'text',
          value: 'Real Astronomical Data',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Standard Astrology' },
      },
      {
        name: 'Content Approach',
        description: 'How insights are delivered',
        lunary: {
          type: 'text',
          value: 'Astral Guide + Astronomical Data',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Expert-Written' },
      },
      {
        name: 'Grimoire Included',
        description: 'Spells, rituals, correspondences',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        description: 'Personalized to your chart',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Pattern Analysis',
        description: 'Identifies patterns across your readings',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Solar Return',
        description: 'Birthday chart & yearly forecast',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Monthly Cosmic Insights',
        description: 'Personalized monthly guidance',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Trial',
        description: 'Try before you buy',
        lunary: {
          type: 'text',
          value: '7 days (monthly) / 14 days (annual)',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: '~$12.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Real Astronomical Calculations',
        description:
          'Lunary uses actual astronomical data and calculations from your exact birth time, date, and location for precise, science-backed astrological insights.',
      },
      {
        title: 'Complete Magical Ecosystem',
        description:
          'Beyond astrology, Lunary includes tarot readings, a comprehensive grimoire with spells and rituals, and magical correspondences—all personalized to your chart.',
      },
      {
        title: 'Affordable Pricing',
        description:
          "At $4.99/month, Lunary offers significantly more value compared to CHANI's premium pricing, making personalized cosmic guidance accessible to everyone.",
      },
    ],
    competitorStrengths:
      'CHANI may be a better choice if you specifically want curated content from professional astrologers and prefer a more editorial approach to astrology. However, this comes at a significantly higher price point.',
    conclusion:
      'Lunary offers a comprehensive, affordable alternative to CHANI with real astronomical calculations, magical tools, and the Astral Guide with complete chart context. For users seeking accurate, data-driven astrology with additional magical practices, Lunary provides exceptional value at a fraction of the cost.',
  },

  'lunary-vs-nebula': {
    competitorName: 'Nebula',
    competitorSlug: 'lunary-vs-nebula',
    tagline: 'Lunary vs Nebula: Real Astronomy vs Chat-Based Readings',
    subtitle:
      'A detailed comparison between astronomical precision with magical tools and chat-based psychic readings.',
    featuresCompared: [
      'Real astronomical calculations vs generic astrology',
      'Magical tools (grimoire, tarot, rituals)',
      'Astral Guide with chart context vs chat-based readings',
      'Subscription vs credit-based pricing',
    ],
    features: [
      {
        name: 'Calculation Method',
        description: 'How birth charts are calculated',
        lunary: {
          type: 'text',
          value: 'Real Astronomical Data',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Generic Astrology' },
      },
      {
        name: 'Reading Style',
        description: 'How insights are delivered',
        lunary: { type: 'text', value: 'Astral Guide + Magical Tools' },
        competitor: { type: 'text', value: 'Chat with Psychics' },
      },
      {
        name: 'Grimoire Included',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Tarot Pattern Analysis',
        description: 'Identifies patterns across your readings',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        description: 'Track planetary transits affecting you',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        description: 'Patterns detected from your Book of Shadows journaling',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing Model',
        lunary: { type: 'text', value: 'Flat Subscription', highlight: true },
        competitor: { type: 'text', value: 'Credit-Based' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by usage' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Transparent, Flat Pricing',
        description:
          'Lunary charges a simple $4.99/month for full access to core personalized features. Nebula uses credit-based pricing that can add up quickly, especially for frequent users.',
      },
      {
        title: 'Real Astronomical Calculations',
        description:
          'Lunary uses actual astronomical data for precise, science-backed insights—not generic astrology content.',
      },
      {
        title: 'Complete Magical Ecosystem',
        description:
          'Beyond readings, Lunary includes a full grimoire with spells, rituals, and correspondences for a complete magical practice.',
      },
    ],
    competitorStrengths:
      'Nebula may be better if you specifically want live chat-based readings with human psychics and prefer a more conversational, on-demand experience. However, this comes at variable costs that can be difficult to predict.',
    conclusion:
      "For users seeking reliable, data-driven astrology with magical tools and predictable pricing, Lunary is the better choice. Nebula's chat-based approach suits those who want human psychic interaction but at variable costs.",
  },

  'lunary-vs-sanctuary': {
    competitorName: 'Sanctuary',
    competitorSlug: 'lunary-vs-sanctuary',
    tagline: 'Lunary vs Sanctuary: Real Astronomy vs Premium Content',
    subtitle:
      'A detailed comparison between astronomical accuracy with magical tools and premium astrologer content.',
    featuresCompared: [
      'Real astronomical calculations',
      'Magical tools (grimoire, tarot, rituals)',
      'Premium astrologer content vs Astral Guide with chart context',
      'Pricing and value',
    ],
    features: [
      {
        name: 'Calculation Method',
        description: 'How birth charts are calculated',
        lunary: {
          type: 'text',
          value: 'Real Astronomical Data',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Standard Astrology' },
      },
      {
        name: 'Content Source',
        description: 'Who creates the insights',
        lunary: {
          type: 'text',
          value: 'Astral Guide + Astronomical Data',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Human Astrologers' },
      },
      {
        name: 'Grimoire Included',
        description: 'Spells, rituals, correspondences',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        description: 'Personalized to your chart',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        description: 'Track planetary transits affecting you',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        description: 'Patterns detected from your Book of Shadows journaling',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Monthly Cosmic Insights',
        description: 'Personalized monthly guidance',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Live Readings',
        description: 'One-on-one with astrologers',
        lunary: { type: 'x' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Trial',
        description: 'Try before you buy',
        lunary: {
          type: 'text',
          value: '7 days (monthly) / 14 days (annual)',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: '~$19.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Real Astronomical Calculations',
        description:
          'Lunary uses actual astronomical data and calculations from your exact birth time, date, and location for precise, science-backed astrological insights.',
      },
      {
        title: 'Complete Magical Ecosystem',
        description:
          'Beyond astrology, Lunary includes tarot readings, a comprehensive grimoire with spells and rituals, and magical correspondences—all personalized to your chart.',
      },
      {
        title: 'Affordable Pricing',
        description:
          "At $4.99/month, Lunary offers significantly more value compared to Sanctuary's premium pricing, making personalized cosmic guidance accessible to everyone.",
      },
    ],
    competitorStrengths:
      'Sanctuary may be a better choice if you specifically want live, one-on-one readings with human astrologers and prefer premium, hand-crafted content over the Astral Guide. However, this comes at a significantly higher price point.',
    conclusion:
      'Lunary offers a comprehensive, affordable alternative to Sanctuary with real astronomical calculations, magical tools, and the Astral Guide with complete chart context. For users seeking accurate, data-driven astrology with additional magical practices, Lunary provides exceptional value at a fraction of the cost.',
  },

  'lunary-vs-pattern': {
    competitorName: 'Pattern',
    competitorSlug: 'lunary-vs-pattern',
    tagline: 'Lunary vs Pattern: Magical Ecosystem vs Psychology',
    subtitle:
      'A detailed comparison between a complete magical ecosystem and psychology-based pattern analysis.',
    featuresCompared: [
      'Complete magical ecosystem',
      'Astrological pattern analysis',
      'Grimoire with spells and rituals',
      'Psychology vs astrology focus',
    ],
    features: [
      {
        name: 'Focus Area',
        description: 'Primary approach to insights',
        lunary: { type: 'text', value: 'Astrology & Magic', highlight: true },
        competitor: { type: 'text', value: 'Psychology-Based' },
      },
      {
        name: 'Pattern Analysis',
        description: 'Analysis of patterns in your life',
        lunary: {
          type: 'text',
          value: 'Astrological Patterns',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Behavioral Patterns',
          highlight: true,
        },
      },
      {
        name: 'Personalized Birth Chart',
        description: 'Based on exact birth time, date, location',
        lunary: { type: 'check' },
        competitor: { type: 'text', value: 'Limited' },
      },
      {
        name: 'Grimoire Included',
        description: 'Spells, rituals, correspondences',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        description: 'Personalized to your chart',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Rituals & Spells',
        description: 'Magical practices and rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Pattern Analysis',
        description: 'Identifies patterns across your tarot readings',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        description: 'Patterns detected from your Book of Shadows journaling',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        description: 'Track planetary transits',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Behavioral Insights',
        description: 'Psychology-based pattern analysis',
        lunary: { type: 'text', value: 'Limited' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Trial',
        description: 'Try before you buy',
        lunary: {
          type: 'text',
          value: '7 days (monthly) / 14 days (annual)',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Complete Magical Ecosystem',
        description:
          'Lunary provides a full magical and astrological ecosystem with a complete grimoire, spells, rituals, correspondences, personalized tarot readings, and magical practices - all in one platform.',
      },
      {
        title: 'Astrological Pattern Analysis',
        description:
          'Lunary offers astrological pattern analysis based on your exact birth chart, calculated using real astronomical data. This provides insights into astrological patterns in your life based on planetary positions and transits.',
      },
      {
        title: 'Tarot Pattern Insights',
        description:
          'Lunary includes personalized tarot readings that provide pattern insights based on your birth chart, combining astrological patterns with tarot wisdom for deeper understanding.',
      },
      {
        title: 'Astral Guide with Complete Chart Context',
        description:
          'The Astral Guide has complete context of your birth chart, patterns, tarot readings, and history to provide personalized insights based on your exact birth chart, combining real astronomy with intelligent pattern recognition.',
      },
    ],
    competitorStrengths:
      "Pattern may be a better choice if you're specifically interested in psychology-based pattern analysis and behavioral insights. Pattern appears to focus on identifying patterns in behavior and psychology, which may appeal to users seeking a more psychology-focused approach to self-understanding. However, if you want a complete magical and astrological ecosystem with grimoire, rituals, spells, and astrological pattern analysis, Lunary is the better choice.",
    conclusion:
      "The key difference between Lunary and Pattern is the focus: Lunary provides a complete magical and astrological ecosystem with grimoire, rituals, spells, and astrological pattern analysis, while Pattern focuses on psychology-based pattern analysis and behavioral insights. If you're looking for an astrology app that provides a complete magical ecosystem with grimoire, tarot, rituals, and astrological pattern analysis, Lunary is the better choice.",
  },

  'lunary-vs-moonly': {
    competitorName: 'Moonly',
    competitorSlug: 'lunary-vs-moonly',
    tagline: 'Lunary vs Moonly: Which Astrology App is Better?',
    subtitle:
      'A detailed comparison to help you choose the right astrology app for your cosmic journey.',
    featuresCompared: [
      'Real astronomical calculations',
      'Personalized birth charts',
      'Grimoire with spells and rituals',
      'Free trial availability',
    ],
    features: [
      {
        name: 'Calculation Method',
        description: 'How birth charts are calculated',
        lunary: {
          type: 'text',
          value: 'Real Astronomical Data',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Generic Astrology' },
      },
      {
        name: 'Personalized Birth Chart',
        description: 'Based on exact birth time, date, location',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Personalized Horoscopes',
        description: 'Based on YOUR chart vs generic zodiac',
        lunary: { type: 'text', value: 'Chart-Based', highlight: true },
        competitor: { type: 'text', value: 'Generic Zodiac' },
      },
      {
        name: 'Grimoire Included',
        description: 'Spells, rituals, correspondences',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        description: 'Personalized to your chart',
        lunary: { type: 'check' },
        competitor: { type: 'text', value: 'Limited' },
      },
      {
        name: 'Astronomical Accuracy',
        description: 'Uses real planetary positions',
        lunary: { type: 'check' },
        competitor: { type: 'text', value: 'Generic' },
      },
      {
        name: 'Solar Return',
        description: 'Birthday chart & yearly forecast',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        description: 'Track planetary transits',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        description: 'Patterns detected from your Book of Shadows journaling',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Trial',
        description: 'Try before you buy',
        lunary: {
          type: 'text',
          value: '7 days (monthly) / 14 days (annual)',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Real Astronomical Calculations',
        description:
          'Lunary uses actual astronomical calculations from your exact birth time, date, and location. Unlike generic astrology apps, Lunary calculates planetary positions using real astronomy.',
      },
      {
        title: 'Truly Personalized Horoscopes',
        description:
          'Every horoscope and insight is based on YOUR exact birth chart, not generic zodiac signs. This means more accurate and relevant guidance for your unique astrological profile.',
      },
      {
        title: 'Complete Grimoire Included',
        description:
          'Lunary includes a complete grimoire with spells, rituals, correspondences, and magical knowledge - unique to Lunary and not available in Moonly.',
      },
      {
        title: 'Free Trial with No Payment During Trial',
        description:
          'Try Lunary free with a 7-day monthly or 14-day annual trial. No card required during the trial, making it easy to explore all features risk-free.',
      },
    ],
    competitorStrengths:
      "Moonly may be a better choice if you're specifically interested in Vedic astrology traditions and lunar calendar tracking. Moonly appears to focus on Vedic astrology, which may appeal to users seeking that particular astrological tradition. However, if you want real astronomical calculations, personalized chart-based horoscopes, and a complete grimoire, Lunary is the better choice.",
    conclusion:
      "Lunary stands out for using real astronomical calculations to create truly personalized birth charts and horoscopes. Combined with a complete grimoire, personalized tarot readings, and a transparent free trial, Lunary offers a comprehensive astrology experience that's personalized to your exact birth chart. If you're looking for an astrology app that uses real astronomy, provides chart-based personalization, and includes magical tools like a grimoire, Lunary is the better choice.",
  },

  'lunary-vs-astroseek': {
    competitorName: 'Astro-Seek',
    competitorSlug: 'lunary-vs-astroseek',
    tagline: 'Lunary vs Astro-Seek: Modern Magic vs Technical Charts',
    subtitle:
      'A detailed comparison between a modern magical app and a technical astrology calculator.',
    featuresCompared: [
      'Modern app experience vs website',
      'Magical tools (grimoire, tarot, rituals)',
      'Astral Guide with chart context vs raw calculations',
      'Beautiful design vs technical focus',
    ],
    features: [
      {
        name: 'Target Audience',
        lunary: { type: 'text', value: 'Everyone', highlight: true },
        competitor: { type: 'text', value: 'Advanced Users' },
      },
      {
        name: 'Design',
        lunary: { type: 'text', value: 'Modern & Beautiful', highlight: true },
        competitor: { type: 'text', value: 'Technical/Functional' },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Advanced Calculations',
        lunary: { type: 'text', value: 'Basic' },
        competitor: { type: 'check' },
      },
      {
        name: 'Astral Guide',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Solar Return',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free', highlight: true },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Accessible to Everyone',
        description:
          'The Astral Guide has complete context of your chart, patterns, and tarot readings to explain everything in plain language—no years of study required to understand your chart.',
      },
      {
        title: 'Complete Magical Practice',
        description:
          'Beyond charts, Lunary offers tarot, grimoire, rituals, and correspondences for a complete spiritual practice.',
      },
      {
        title: 'Beautiful, Modern Experience',
        description:
          'Enjoy a sleek, modern interface that makes exploring your cosmic profile a pleasure.',
      },
    ],
    competitorStrengths:
      "Astro-Seek is excellent for advanced astrologers who need detailed technical calculations, asteroid positions, and specialized chart types. It's free and offers extensive calculation options.",
    conclusion:
      "Lunary is ideal for users who want an accessible, beautiful astrology experience with magical tools. Astro-Seek suits advanced astrologers who need technical calculations and don't need interpretation help.",
  },

  'lunary-vs-arcarae': {
    competitorName: 'Arcarae',
    competitorSlug: 'lunary-vs-arcarae',
    tagline: 'Lunary vs Arcarae: Personalized Charts vs Community',
    subtitle:
      'A detailed comparison between personalized birth chart insights and community-driven spiritual content.',
    featuresCompared: [
      'Personalized birth chart insights',
      'Community vs individual focus',
      'Grimoire with spells and rituals',
      'Real astronomical calculations',
    ],
    features: [
      {
        name: 'Calculation Method',
        description: 'How birth charts are calculated',
        lunary: {
          type: 'text',
          value: 'Real Astronomical Data',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Community Content' },
      },
      {
        name: 'Personalized Birth Chart',
        description: 'Based on exact birth time, date, location',
        lunary: { type: 'check' },
        competitor: { type: 'text', value: 'Limited' },
      },
      {
        name: 'Personalized Horoscopes',
        description: 'Based on YOUR chart vs generic zodiac',
        lunary: { type: 'text', value: 'Chart-Based', highlight: true },
        competitor: { type: 'text', value: 'Generic/Community' },
      },
      {
        name: 'Grimoire Included',
        description: 'Spells, rituals, correspondences',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        description: 'Personalized to your chart',
        lunary: { type: 'check' },
        competitor: { type: 'text', value: 'Limited' },
      },
      {
        name: 'Tarot Pattern Analysis',
        description: 'Identifies patterns across your readings',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Solar Return',
        description: 'Birthday chart & yearly forecast',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        description: 'Patterns detected from your Book of Shadows journaling',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Community Features',
        description: 'Social sharing, community content',
        lunary: { type: 'text', value: 'Limited' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Trial',
        description: 'Try before you buy',
        lunary: {
          type: 'text',
          value: '7 days (monthly) / 14 days (annual)',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Deeply Personalized Insights',
        description:
          'Lunary provides deeply personalized analysis based on your exact birth chart, calculated using real astronomical data. Every horoscope and insight is tailored to YOUR unique astrological profile, not generic community content.',
      },
      {
        title: 'Complete Magical Tools Ecosystem',
        description:
          'Lunary includes a complete grimoire with spells, rituals, correspondences, personalized tarot readings, and magical knowledge - creating a full magical tools ecosystem not available in Arcarae.',
      },
      {
        title: 'Real Astronomical Calculations',
        description:
          'Lunary uses actual astronomical calculations from your exact birth time, date, and location. This provides astronomically accurate birth charts based on real planetary positions.',
      },
      {
        title: 'Individual-Focused Experience',
        description:
          'While Arcarae focuses on community content, Lunary provides an individual-focused experience with insights personalized specifically to your birth chart and astrological profile.',
      },
    ],
    competitorStrengths:
      "Arcarae may be a better choice if you're looking for a community-focused platform with social features and shared spiritual content. Arcarae appears to offer community features, angel numbers content, and social sharing capabilities that may appeal to users seeking a more social, community-driven experience. However, if you want deeply personalized, chart-based insights with a complete magical tools ecosystem, Lunary is the better choice for individual-focused astrological guidance.",
    conclusion:
      "The key difference between Lunary and Arcarae is the focus: Lunary provides deeply personalized, chart-based insights with a complete magical tools ecosystem, while Arcarae focuses on community-driven generic content and social features. If you're looking for an astrology app that provides personalized insights based on your exact birth chart, includes a complete grimoire, and offers magical tools like tarot and rituals, Lunary is the better choice.",
  },

  'lunary-vs-astro-com': {
    competitorName: 'Astro.com',
    competitorSlug: 'lunary-vs-astro-com',
    tagline: 'Lunary vs Astro.com: Modern Magic vs Classic Calculator',
    subtitle:
      'A detailed comparison between a modern magical app and the classic astrology calculation website.',
    featuresCompared: [
      'Modern app experience vs website',
      'Magical tools (grimoire, tarot, rituals)',
      'Astral Guide with chart context vs manual interpretation',
      'User-friendly design vs technical interface',
    ],
    features: [
      {
        name: 'Ease of Use',
        lunary: { type: 'text', value: 'Beginner-Friendly', highlight: true },
        competitor: { type: 'text', value: 'Steep Learning Curve' },
      },
      {
        name: 'Calculation Quality',
        lunary: { type: 'text', value: 'Astronomical Data', highlight: true },
        competitor: {
          type: 'text',
          value: 'Professional Grade',
          highlight: true,
        },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Astral Guide',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Book of Shadows Journal',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free (basic)', highlight: true },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Instant Understanding',
        description:
          'The Astral Guide has complete context of your chart, patterns, and tarot readings to explain everything in plain language—no astrology degree required to understand your cosmic profile.',
      },
      {
        title: 'Integrated Magical Practice',
        description:
          'Combine astrology with tarot, rituals, and grimoire content for a complete spiritual toolkit.',
      },
      {
        title: 'Beautiful Mobile Experience',
        description:
          'Access your cosmic insights anywhere with a modern, mobile-optimized design.',
      },
    ],
    competitorStrengths:
      "Astro.com is the gold standard for professional astrologers who need highly accurate calculations, extensive options, and detailed technical data. It's free for basic charts and trusted by professionals worldwide.",
    conclusion:
      'Lunary is perfect for users who want accessible, personalized astrology with magical tools. Astro.com serves professional astrologers who need technical calculations and can interpret charts themselves.',
    disclaimer:
      'This comparison is based on publicly available information as of 2025. Astro.com is a registered trademark of Astrodienst AG.',
  },

  'lunary-vs-cafe-astrology': {
    competitorName: 'Cafe Astrology',
    competitorSlug: 'lunary-vs-cafe-astrology',
    tagline: 'Lunary vs Cafe Astrology: Modern App vs Free Website',
    subtitle:
      'A detailed comparison between a modern magical app and a traditional astrology website.',
    featuresCompared: [
      'Modern app vs website experience',
      'Magical tools (grimoire, tarot, rituals)',
      'Astral Guide with chart context vs static content',
      'Premium features vs free with ads',
    ],
    features: [
      {
        name: 'Platform',
        lunary: {
          type: 'text',
          value: 'Modern App (Web + Mobile)',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Website Only' },
      },
      {
        name: 'Personalization',
        lunary: { type: 'text', value: 'Astral Guide', highlight: true },
        competitor: { type: 'text', value: 'Static Content' },
      },
      {
        name: 'Birth Chart',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Educational Content',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Transit Calendar',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Monthly Cosmic Insights',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Ad-Free',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free (with ads)', highlight: true },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Astral Guide with Complete Chart Context',
        description:
          'The Astral Guide has complete context of your chart, patterns, and tarot readings to provide truly personalized insights, not just static articles that apply to everyone with your sign.',
      },
      {
        title: 'Complete Magical Ecosystem',
        description:
          "Lunary includes tarot, grimoire, rituals, and correspondences—interactive tools that Cafe Astrology doesn't offer.",
      },
      {
        title: 'Modern, Ad-Free Experience',
        description:
          'Enjoy a beautiful, distraction-free experience without ads cluttering your cosmic journey.',
      },
    ],
    competitorStrengths:
      "Cafe Astrology is a great free resource for learning astrology basics and generating basic birth charts. It's ideal if you want free access to astrology content and don't mind ads.",
    conclusion:
      'While Cafe Astrology is a useful free resource, Lunary offers a significantly better experience with the Astral Guide (complete chart context), interactive magical tools, and an ad-free modern interface—all at an affordable price.',
  },

  'lunary-vs-timepassages': {
    competitorName: 'TimePassages',
    competitorSlug: 'lunary-vs-timepassages',
    tagline: 'Lunary vs TimePassages: Modern Magic vs Traditional Software',
    subtitle:
      'A detailed comparison between modern magical tools and traditional astrology software.',
    featuresCompared: [
      'Modern mobile-first design vs traditional software',
      'Magical tools (grimoire, tarot) vs pure astrology',
      'Subscription vs one-time purchase',
      'Astral Guide with chart context vs manual interpretation',
    ],
    features: [
      {
        name: 'Platform',
        description: 'Where you can use it',
        lunary: { type: 'text', value: 'Web + Mobile', highlight: true },
        competitor: { type: 'text', value: 'Desktop + Mobile' },
      },
      {
        name: 'Design',
        description: 'User interface approach',
        lunary: { type: 'text', value: 'Modern, Minimal', highlight: true },
        competitor: { type: 'text', value: 'Traditional' },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Advanced Chart Features',
        description: 'Synastry, progressions, etc.',
        lunary: { type: 'text', value: 'Basic' },
        competitor: { type: 'check' },
      },
      {
        name: 'Astral Guide',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Monthly Cosmic Insights',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Book of Shadows Journal',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing Model',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'One-time ~$15-50' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Modern, Beautiful Design',
        description:
          "Lunary offers a sleek, modern interface designed for today's users—unlike TimePassages' traditional software aesthetic.",
      },
      {
        title: 'Complete Magical Ecosystem',
        description:
          "Beyond charts, Lunary includes tarot, grimoire, rituals, and correspondences—tools TimePassages doesn't offer.",
      },
      {
        title: 'Astral Guide with Complete Chart Context',
        description:
          'The Astral Guide has complete context of your chart, patterns, and tarot readings to provide personalized insights, making interpretation accessible without years of study.',
      },
    ],
    competitorStrengths:
      "TimePassages may be better if you're an experienced astrologer who needs advanced chart features like detailed synastry, secondary progressions, and solar arc directions. It's also a one-time purchase rather than a subscription.",
    conclusion:
      'Lunary is ideal for users who want a modern, integrated magical practice with astrology, tarot, and rituals in a beautiful interface. TimePassages suits experienced astrologers who need advanced technical features.',
  },

  'lunary-vs-astro-gold': {
    competitorName: 'Astro Gold',
    competitorSlug: 'lunary-vs-astro-gold',
    tagline: 'Lunary vs Astro Gold: Modern Magic vs Professional Software',
    subtitle:
      'A detailed comparison between a modern magical app and professional astrology software.',
    featuresCompared: [
      'Modern web app vs professional mobile software',
      'Magical tools (grimoire, tarot, rituals)',
      'Astral Guide with chart context vs manual interpretation',
      'Subscription vs one-time purchase',
    ],
    features: [
      {
        name: 'Target Audience',
        lunary: { type: 'text', value: 'Everyone', highlight: true },
        competitor: { type: 'text', value: 'Professionals' },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Advanced Chart Types',
        lunary: { type: 'text', value: 'Basic' },
        competitor: { type: 'check' },
      },
      {
        name: 'Astral Guide',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Book of Shadows Journal',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Collections & Folders',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: '~$50 one-time' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Accessible to All Levels',
        description:
          "The Astral Guide has complete context of your chart, patterns, and tarot readings to make astrology accessible—you don't need to be a professional to understand your chart.",
      },
      {
        title: 'Complete Magical Toolkit',
        description:
          'Lunary combines astrology with tarot, grimoire, and rituals for a complete spiritual practice.',
      },
      {
        title: 'Modern Web Experience',
        description:
          'Access Lunary anywhere with a beautiful, responsive web interface—no app download required.',
      },
    ],
    competitorStrengths:
      "Astro Gold is designed for professional astrologers who need advanced chart types, detailed calculations, and extensive customization options. It's a one-time purchase with no ongoing subscription.",
    conclusion:
      'Lunary is ideal for users who want accessible astrology with magical tools and the Astral Guide. Astro Gold suits professional astrologers who need advanced technical features.',
  },

  'lunary-vs-astrofuture': {
    competitorName: 'AstroFuture',
    competitorSlug: 'lunary-vs-astrofuture',
    tagline: 'Lunary vs AstroFuture: Which Astrology App is Better?',
    subtitle:
      'A detailed comparison between real astronomical data with magical tools and AstroFuture.',
    featuresCompared: [
      'Real astronomical calculations with ±1 arcminute accuracy',
      'Magical tools (grimoire, tarot, rituals)',
      'Transparent methodology',
      'Pricing and features',
    ],
    features: [
      {
        name: 'Calculation Method',
        lunary: {
          type: 'text',
          value: '±1 arcminute accuracy',
          highlight: true,
        },
        competitor: { type: 'check' },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Compatibility',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Transparent Methodology',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: '~$9.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Real Astronomical Calculations (±1 arcminute accuracy)',
        description:
          'Lunary uses astronomy-engine for calculations accurate to ±1 arcminute based on VSOP87 models, ensuring precise planetary positions.',
      },
      {
        title: 'Complete Magical Practice',
        description:
          'Lunary includes a 2000+ page grimoire, rituals, and correspondences for a complete spiritual toolkit.',
      },
      {
        title: 'Better Value',
        description:
          'At $4.99/month, Lunary offers more features at a lower price point.',
      },
    ],
    competitorStrengths:
      'AstroFuture may suit users who prefer a different style of astrology content and interface.',
    conclusion:
      'Lunary offers real astronomical calculations with ±1 arcminute accuracy, a complete grimoire with 2000+ pages, and magical tools at a better price.',
  },

  'lunary-vs-astromatrix': {
    competitorName: 'AstroMatrix',
    competitorSlug: 'lunary-vs-astromatrix',
    tagline: 'Lunary vs AstroMatrix: Magical Tools vs Feature Overload',
    subtitle:
      'A detailed comparison between focused magical tools and feature-heavy astrology.',
    featuresCompared: [
      'Real astronomical calculations',
      'Magical tools (grimoire, tarot, rituals)',
      'Clean design vs feature-heavy interface',
      'Pricing and value',
    ],
    features: [
      {
        name: 'Design Philosophy',
        lunary: { type: 'text', value: 'Clean & Focused', highlight: true },
        competitor: { type: 'text', value: 'Feature-Rich' },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Compatibility Reports',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Astral Guide',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Solar Return',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Book of Shadows Journal',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: '~$9.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Focused, Beautiful Experience',
        description:
          "Lunary's clean design puts the most important insights front and center, without overwhelming you with features.",
      },
      {
        title: 'Complete Magical Toolkit',
        description:
          "Lunary includes a grimoire with spells, rituals, and correspondences—tools that AstroMatrix doesn't offer.",
      },
      {
        title: 'Better Value',
        description:
          'At $4.99/month, Lunary offers exceptional value with AI insights and magical tools.',
      },
    ],
    competitorStrengths:
      "AstroMatrix may suit users who want a wide variety of astrology features in one app and don't mind a busier interface with more options to explore.",
    conclusion:
      'Lunary offers a more curated, magical experience with better value and cleaner design. AstroMatrix provides more features but at the cost of simplicity.',
  },

  'lunary-vs-labyrinthos': {
    competitorName: 'Labyrinthos',
    competitorSlug: 'lunary-vs-labyrinthos',
    tagline: 'Lunary vs Labyrinthos: Complete Cosmic Tools vs Tarot Focus',
    subtitle:
      'A detailed comparison between a complete magical toolkit and a tarot-focused learning app.',
    featuresCompared: [
      'Astrology + Tarot integration vs Tarot-only',
      'Grimoire with rituals and correspondences',
      'Real astronomical calculations',
      'Astral Guide with complete chart context',
    ],
    features: [
      {
        name: 'Astrology',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Tarot Education',
        lunary: { type: 'text', value: 'Grimoire' },
        competitor: { type: 'text', value: 'Comprehensive', highlight: true },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Birth Chart',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Chart-Personalized Tarot',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Pattern Analysis',
        description: 'Identifies patterns across your readings',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free + IAP' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Complete Cosmic Integration',
        description:
          'Lunary combines astrology and tarot in one app, with tarot readings personalized to your birth chart for deeper insights.',
      },
      {
        title: 'Full Magical Practice',
        description:
          'Beyond tarot, Lunary includes a grimoire with spells, rituals, correspondences, and crystals—everything for your spiritual practice.',
      },
      {
        title: 'Real Astronomical Data',
        description:
          'Your birth chart and transits are based on actual astronomical calculations, not simplified astrology.',
      },
    ],
    competitorStrengths:
      "Labyrinthos is excellent if you want to deeply study tarot with structured lessons, flashcards, and quizzes. It's focused specifically on tarot education and has beautiful card artwork.",
    conclusion:
      'Lunary is ideal for users who want a complete magical practice combining astrology and tarot with personalization. Labyrinthos suits those who specifically want to learn tarot in depth.',
  },

  'lunary-vs-lunar-guide': {
    competitorName: 'Lunar Guide',
    competitorSlug: 'lunary-vs-lunar-guide',
    tagline: 'Lunary vs Lunar Guide: Which Astrology App is Better?',
    subtitle:
      'A detailed comparison to help you choose between Lunary and Lunar Guide for your astrological practice.',
    featuresCompared: [
      'Real astronomical calculations with ±1 arcminute accuracy',
      'Complete grimoire with 2000+ pages',
      'Personalized tarot readings based on your chart',
      'Magical tools (spells, rituals, correspondences)',
    ],
    features: [
      {
        name: 'Calculation Method',
        description: 'How birth charts are calculated',
        lunary: {
          type: 'text',
          value: '±1 arcminute accuracy',
          highlight: true,
        },
        competitor: { type: 'check' },
      },
      {
        name: 'Personalized Birth Chart',
        description: 'Based on exact birth time, date, location',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Personalized Horoscopes',
        description: 'Based on YOUR chart vs generic zodiac',
        lunary: { type: 'text', value: 'Chart-Based', highlight: true },
        competitor: { type: 'check' },
      },
      {
        name: 'Grimoire (2000+ pages)',
        description: 'Spells, rituals, correspondences',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Readings',
        description: 'Personalized to your chart',
        lunary: { type: 'check' },
        competitor: { type: 'text', value: 'Limited' },
      },
      {
        name: 'Moon Circles',
        description: 'New & Full Moon insights',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Solar Return',
        description: 'Birthday chart & yearly forecast',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Pattern Analysis',
        description: 'Identifies patterns across your readings',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        description: 'Patterns detected from your Book of Shadows journaling',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Book of Shadows Journal',
        description: 'Personal magical journal',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Trial',
        description: 'Try before you buy',
        lunary: {
          type: 'text',
          value: '7 days (monthly) / 14 days (annual)',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Real Astronomical Calculations (±1 arcminute accuracy)',
        description:
          'Lunary uses astronomy-engine for calculations accurate to ±1 arcminute based on VSOP87 models, ensuring precise planetary positions from your exact birth time, date, and location.',
      },
      {
        title: 'Complete Grimoire (2000+ pages)',
        description:
          'Lunary includes a comprehensive grimoire with 2000+ pages of spells, rituals, correspondences, and magical knowledge - unique to Lunary and not available in Lunar Guide.',
      },
      {
        title: 'Chart-Personalized Tarot with Pattern Analysis',
        description:
          'Every tarot reading is personalized to YOUR exact birth chart. Tarot Pattern Analysis identifies recurring themes across your readings over time. Also includes Moon Circles, ritual generator, and personalized crystal recommendations.',
      },
      {
        title: 'Astral Guide with Complete Chart Context',
        description:
          'The Astral Guide has complete context of your birth chart, tarot patterns, readings history, and archetypes to provide comprehensive insights in plain language. It understands your unique astrological profile and how it evolves over time.',
      },
    ],
    competitorStrengths:
      'Lunar Guide may be a good choice if you prefer a different approach to astrology insights. However, if you want real astronomical calculations with ±1 arcminute accuracy, chart-based personalization, and a complete grimoire, Lunary is the better choice.',
    conclusion:
      'Choose Lunary if you want real astronomical calculations with ±1 arcminute accuracy, a complete grimoire with 2000+ pages, and personalized tarot readings based on your exact birth chart. Choose Lunar Guide if you prefer their specific approach to astrology insights.',
  },

  'lunary-vs-moon-calendar': {
    competitorName: 'Moon Calendar',
    competitorSlug: 'lunary-vs-moon-calendar',
    tagline:
      'Lunary vs Moon Calendar: Complete Cosmic Tools vs Simple Calendar',
    subtitle:
      'A detailed comparison between a complete magical toolkit and a simple moon calendar app.',
    featuresCompared: [
      'Full astrology vs calendar-only',
      'Magical tools (grimoire, tarot, rituals)',
      'Birth chart personalization',
      'Astral Guide with chart context vs basic info',
    ],
    features: [
      {
        name: 'Moon Phase Calendar',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Full Astrology',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Birth Chart',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Solar Return',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free + Ads' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Far More Than a Calendar',
        description:
          'Lunary includes full astrology, personalized birth charts, and planetary transits—not just moon phases.',
      },
      {
        title: 'Complete Magical Toolkit',
        description:
          'Add tarot, grimoire, rituals, and correspondences for a comprehensive spiritual practice.',
      },
      {
        title: 'Ad-Free Experience',
        description:
          'Enjoy a beautiful, distraction-free experience without ads interrupting your cosmic journey.',
      },
    ],
    competitorStrengths:
      "Moon Calendar is fine if you only want basic moon phase tracking and don't mind ads. It's free and simple, though limited in scope.",
    conclusion:
      'Lunary provides dramatically more value with complete astrology, tarot, and magical tools. Moon Calendar is only suitable for users who want the most basic moon tracking.',
  },

  'lunary-vs-moonx': {
    competitorName: 'MoonX',
    competitorSlug: 'lunary-vs-moonx',
    tagline: 'Lunary vs MoonX: Complete Cosmic Tools vs Moon Tracking',
    subtitle:
      'A detailed comparison between a complete magical toolkit and a moon-focused tracking app.',
    featuresCompared: [
      'Full astrology vs moon-only tracking',
      'Magical tools (grimoire, tarot, rituals)',
      'Birth chart personalization',
      'Astral Guide with complete chart context',
    ],
    features: [
      {
        name: 'Moon Phases',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Full Astrology',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Birth Chart',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Grimoire & Rituals',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Tarot Integration',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Transit Calendar',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Solar Return',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Archetypes',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: 'Free + from $4.99/mo',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free + Premium' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Complete Cosmic Picture',
        description:
          'Lunary goes beyond moon phases to include full astrology, personalized to your birth chart.',
      },
      {
        title: 'Magical Practice Integration',
        description:
          'Combine moon tracking with tarot, grimoire, and rituals for a complete spiritual toolkit.',
      },
      {
        title: 'Astral Guide with Complete Chart Context',
        description:
          'The Astral Guide has complete context of your chart, patterns, and tarot readings to provide insights tailored to YOUR chart, not generic moon phase information.',
      },
    ],
    competitorStrengths:
      "MoonX is a good choice if you only want simple moon phase tracking without the additional astrology and magical features. It's focused and straightforward.",
    conclusion:
      'Lunary offers significantly more value with complete astrology, tarot, and magical tools. MoonX is suitable for users who only need basic moon tracking.',
  },
};

export function getComparisonData(slug: string): ComparisonData | undefined {
  return comparisonData[slug];
}

export function getAllComparisonSlugs(): string[] {
  return Object.keys(comparisonData);
}
