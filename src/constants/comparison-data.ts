import { ComparisonData } from '@/components/comparison';
import { PRICING_DISPLAY, FREE_TRIAL_DAYS } from './pricing';

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
        name: 'Synastry Analysis',
        description: 'Detailed compatibility with aspects',
        lunary: {
          type: 'text',
          value: '31+ aspects',
          highlight: true,
        },
        competitor: { type: 'text', value: 'Basic %' },
      },
      {
        name: 'Pattern Recognition',
        description: 'Tracks YOUR patterns over time',
        lunary: {
          type: 'text',
          value: 'Your textbook',
          highlight: true,
        },
        competitor: { type: 'x' },
      },
      {
        name: 'Best Times to Connect',
        description: 'Optimal timing for relationships',
        lunary: {
          type: 'text',
          value: 'Pro',
          highlight: true,
        },
        competitor: { type: 'x' },
      },
      {
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: {
          type: 'text',
          value: 'Social features',
          highlight: true,
        },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Personalized (With Ads)',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Yes (free tier)',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free tier available' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free + $2.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Unlike Co-Star's ad-supported free tier, you get a clean, focused experience from day one.",
      },
      {
        title: 'Real Astronomical Calculations (±1 arcminute accuracy)',
        description:
          'Lunary uses astronomy-engine for calculations accurate to ±1 arcminute based on VSOP87 models, ensuring precise planetary positions from your exact birth time, date, and location.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Lunary includes a comprehensive grimoire with 2000+ pages of spells, rituals, correspondences, and magical knowledge - unique to Lunary and not available in Co-Star. All grimoire content is completely free for everyone.',
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
      {
        title: 'Cosmic Circle with Deep Synastry',
        description:
          'Connect with friends and see how your charts interact with 31+ aspects analyzed. Best Times to Connect shows optimal windows for important conversations. Free users get 5 friends with basic compatibility.',
      },
    ],
    competitorStrengths:
      'Co-Star may be a good choice if you prefer their minimalist, text-based interface and social features for comparing charts with friends. Their hyper-personalized push notifications and unique aesthetic appeal to users who want a different astrology app experience.',
    conclusion:
      "Both apps offer free tiers—Lunary's is ad-free with 2000+ grimoire articles, while Co-Star's free tier has ads. Choose Lunary if you want: no ads, real astronomical calculations (±1 arcminute accuracy), a complete grimoire with magical tools, full synastry with 31+ aspects, and personalized tarot readings based on your exact birth chart. Choose Co-Star if you prefer their minimalist text-based interface.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Co-Star?",
        answer:
          "Lunary focuses on astronomical accuracy (±1 arcminute) and includes magical tools like a 2000+ page grimoire, tarot readings personalized to your birth chart, and crystal guidance. Co-Star focuses on minimalist design and social features. Lunary's free tier has no ads, while Co-Star's free tier is ad-supported.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Limited',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'None',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: '~$12.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. You get substantial value before ever paying a cent.",
      },
      {
        title: 'Real Astronomical Calculations',
        description:
          'Lunary uses actual astronomical data and calculations from your exact birth time, date, and location for precise, science-backed astrological insights.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'All 2000+ pages of spells, rituals, correspondences, and magical knowledge are completely free for everyone. No paywall on educational content.',
      },
      {
        title: 'Affordable Pro Pricing',
        description:
          "Starting at $4.99/month, Lunary offers significantly more value compared to CHANI's premium pricing, making personalized cosmic guidance accessible to everyone.",
      },
    ],
    competitorStrengths:
      'CHANI may be a better choice if you specifically want curated content from professional astrologers and prefer a more editorial approach to astrology. However, this comes at a significantly higher price point.',
    conclusion:
      "Both apps offer free tiers, but Lunary's free tier is more generous with 2000+ grimoire articles and no ads. Lunary offers a comprehensive, affordable alternative to CHANI with real astronomical calculations, magical tools, and the Astral Guide with complete chart context. For users seeking accurate, data-driven astrology with additional magical practices, Lunary provides exceptional value at a fraction of the cost.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and CHANI?",
        answer: `Lunary focuses on astronomical accuracy and includes magical tools like a 2000+ page grimoire, tarot readings personalized to your birth chart, and crystal guidance. CHANI focuses on curated, expert-written content. Lunary's free tier is more generous, and paid tiers start at ${PRICING_DISPLAY.paidTiersStart} vs CHANI's ~$12.99/mo.`,
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Limited',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'None',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
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
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by usage' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Nebula's free tier is more limited in comparison.",
      },
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
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Beyond readings, Lunary includes a full grimoire with 2000+ pages of spells, rituals, and correspondences for a complete magical practice. All grimoire content is completely free for everyone.',
      },
    ],
    competitorStrengths:
      'Nebula may be better if you specifically want live chat-based readings with human psychics and prefer a more conversational, on-demand experience. However, this comes at variable costs that can be difficult to predict.',
    conclusion:
      "Both apps offer free tiers—Lunary's is more generous with 2000+ grimoire articles and no ads, while Nebula's is more limited. Choose Lunary if you want: no ads, real astronomical calculations, a complete grimoire with magical tools, and predictable flat pricing. Choose Nebula if you prefer live chat-based readings with human psychics and don't mind variable credit-based costs.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Nebula?",
        answer:
          "Lunary focuses on real astronomical calculations and includes magical tools like a 2000+ page grimoire, tarot readings personalized to your birth chart, and crystal guidance—all with flat, predictable pricing ($4.99/mo). Nebula focuses on live chat-based readings with human psychics using credit-based pricing. Lunary's free tier is more generous with no ads.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Very Limited',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'None',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: '~$19.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Sanctuary's free tier is very limited in comparison.",
      },
      {
        title: 'Real Astronomical Calculations',
        description:
          'Lunary uses actual astronomical data and calculations from your exact birth time, date, and location for precise, science-backed astrological insights.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Beyond astrology, Lunary includes tarot readings, a comprehensive grimoire with 2000+ pages of spells and rituals, and magical correspondences—all personalized to your chart. All grimoire content is completely free for everyone.',
      },
      {
        title: 'Affordable Pricing',
        description:
          "At $4.99/month, Lunary offers significantly more value compared to Sanctuary's premium pricing (~$19.99/mo), making personalized cosmic guidance accessible to everyone.",
      },
    ],
    competitorStrengths:
      'Sanctuary may be a better choice if you specifically want live, one-on-one readings with human astrologers and prefer premium, hand-crafted content over the Astral Guide. However, this comes at a significantly higher price point.',
    conclusion:
      "Both apps offer free tiers, but Lunary's free tier is significantly more generous with 2000+ grimoire articles and no ads. Lunary offers a comprehensive, affordable alternative to Sanctuary with real astronomical calculations, magical tools, and the Astral Guide with complete chart context. For users seeking accurate, data-driven astrology with additional magical practices, Lunary provides exceptional value at a fraction of the cost.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Sanctuary?",
        answer: `Lunary focuses on real astronomical calculations and includes magical tools like a 2000+ page grimoire, tarot readings personalized to your birth chart, and crystal guidance. Sanctuary focuses on live readings with human astrologers and premium content. Lunary's free tier is much more generous, and paid tiers start at ${PRICING_DISPLAY.paidTiersStart} vs Sanctuary's ~$19.99/mo.`,
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Limited',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'None',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Pattern's free tier is more limited in comparison.",
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Lunary provides a full magical and astrological ecosystem with a complete grimoire with 2000+ pages, spells, rituals, correspondences, personalized tarot readings, and magical practices - all in one platform. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's is more generous with 2000+ grimoire articles and no ads. The key difference between Lunary and Pattern is the focus: Lunary provides a complete magical and astrological ecosystem with grimoire, rituals, spells, and astrological pattern analysis, while Pattern focuses on psychology-based pattern analysis and behavioral insights. Choose Lunary if you want: no ads, a complete magical ecosystem with grimoire, tarot, rituals, and astrological pattern analysis.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Pattern?",
        answer:
          "Lunary focuses on astrology and magic with real astronomical calculations, a 2000+ page grimoire, tarot readings personalized to your birth chart, and astrological pattern analysis. Pattern focuses on psychology-based behavioral pattern analysis. Lunary's free tier is more generous with no ads.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Limited (with ads)',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Yes (free tier)',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Unlike Moonly's ad-supported free tier, you get a clean, focused experience from day one.",
      },
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
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Lunary includes a complete grimoire with 2000+ pages of spells, rituals, correspondences, and magical knowledge - unique to Lunary and not available in Moonly. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's is ad-free with 2000+ grimoire articles, while Moonly's free tier has ads. Choose Lunary if you want: no ads, real astronomical calculations to create truly personalized birth charts, chart-based horoscopes, a complete grimoire with magical tools, and personalized tarot readings. Choose Moonly if you're specifically interested in Vedic astrology traditions.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Moonly?",
        answer:
          "Lunary uses real astronomical calculations for truly personalized birth charts and includes magical tools like a 2000+ page grimoire, chart-based horoscopes, and personalized tarot readings. Moonly focuses on Vedic astrology and lunar calendar tracking. Lunary's free tier has no ads, while Moonly's free tier is ad-supported.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Charts (with ads)',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Yes',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'N/A' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free', highlight: true },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Astro-Seek offers free charts but with ads and requires advanced astrological knowledge to interpret.",
      },
      {
        title: 'Accessible to Everyone',
        description:
          'The Astral Guide has complete context of your chart, patterns, and tarot readings to explain everything in plain language—no years of study required to understand your chart.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Beyond charts, Lunary offers tarot, a grimoire with 2000+ pages, rituals, and correspondences for a complete spiritual practice. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's has no ads and includes 2000+ grimoire articles, while Astro-Seek offers free charts with ads. Choose Lunary if you want: no ads, an accessible experience with the Astral Guide explaining everything in plain language, magical tools (tarot, grimoire, rituals), and a beautiful modern interface. Choose Astro-Seek if you're an advanced astrologer who needs technical calculations and can interpret charts yourself.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Astro-Seek?",
        answer:
          "Lunary is a modern app designed for everyone, with the Astral Guide explaining your chart in plain language, plus magical tools like tarot and a 2000+ page grimoire. Astro-Seek is a technical website for advanced astrologers who can interpret raw chart data. Lunary's free tier has no ads, while Astro-Seek shows ads.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Community content',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Varies',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Arcarae focuses on community content rather than personalized insights.",
      },
      {
        title: 'Deeply Personalized Insights',
        description:
          'Lunary provides deeply personalized analysis based on your exact birth chart, calculated using real astronomical data. Every horoscope and insight is tailored to YOUR unique astrological profile, not generic community content.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Lunary includes a complete grimoire with 2000+ pages of spells, rituals, correspondences, personalized tarot readings, and magical knowledge - creating a full magical tools ecosystem not available in Arcarae. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's includes 2000+ grimoire articles with no ads, while Arcarae focuses on community content. Choose Lunary if you want: no ads, deeply personalized chart-based insights (not generic community content), a complete grimoire with magical tools, and real astronomical calculations. Choose Arcarae if you prefer community-driven content and social features.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Arcarae?",
        answer:
          "Lunary focuses on deeply personalized insights based on your exact birth chart with real astronomical calculations, plus a 2000+ page grimoire, tarot readings, and magical tools. Arcarae focuses on community-driven content and social features. Lunary's free tier has no ads and provides substantial personalized content.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Basic charts (with ads)',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Yes',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'N/A' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free (basic)', highlight: true },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Astro.com offers basic free charts with ads and requires advanced knowledge to interpret.",
      },
      {
        title: 'Instant Understanding',
        description:
          'The Astral Guide has complete context of your chart, patterns, and tarot readings to explain everything in plain language—no astrology degree required to understand your cosmic profile.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Combine astrology with tarot, rituals, and a grimoire with 2000+ pages of content for a complete spiritual toolkit. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's has no ads and includes 2000+ grimoire articles, while Astro.com offers basic charts with ads. Choose Lunary if you want: no ads, instant understanding with the Astral Guide (no astrology degree needed), magical tools (tarot, grimoire, rituals), and a beautiful mobile experience. Choose Astro.com if you're a professional astrologer who needs technical calculations and can interpret charts yourself.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Astro.com?",
        answer:
          "Lunary is a modern app designed for everyone, with the Astral Guide explaining your chart in plain language, plus magical tools like tarot and a 2000+ page grimoire. Astro.com is a professional-grade website for astrologers who need technical calculations and can interpret charts themselves. Lunary's free tier has no ads, while Astro.com shows ads on free charts.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Content (with ads)',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Yes',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'N/A' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free (with ads)', highlight: true },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Cafe Astrology offers free content but with ads throughout the site.",
      },
      {
        title: 'Astral Guide with Complete Chart Context',
        description:
          'The Astral Guide has complete context of your chart, patterns, and tarot readings to provide truly personalized insights, not just static articles that apply to everyone with your sign.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          "Lunary includes tarot, a grimoire with 2000+ pages, rituals, and correspondences—interactive tools that Cafe Astrology doesn't offer. All grimoire content is completely free for everyone.",
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
      "Both apps offer free content—Lunary's is ad-free with 2000+ grimoire articles, while Cafe Astrology is ad-supported. Choose Lunary if you want: no ads, the Astral Guide with complete chart context (truly personalized insights), interactive magical tools (tarot, grimoire, rituals), and a modern mobile-optimized interface. Choose Cafe Astrology if you want a simple free website for learning astrology basics and don't mind ads.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Cafe Astrology?",
        answer:
          "Lunary is a modern app with the Astral Guide providing truly personalized insights based on your chart, plus interactive magical tools like tarot and a 2000+ page grimoire. Cafe Astrology is a traditional website with static educational content. Lunary's free tier has no ads, while Cafe Astrology is ad-supported.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Limited',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'None',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies' },
      },
      {
        name: 'Pricing Model',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'One-time ~$15-50' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. TimePassages offers limited free features.",
      },
      {
        title: 'Modern, Beautiful Design',
        description:
          "Lunary offers a sleek, modern interface designed for today's users—unlike TimePassages' traditional software aesthetic.",
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          "Beyond charts, Lunary includes tarot, a grimoire with 2000+ pages, rituals, and correspondences—tools TimePassages doesn't offer. All grimoire content is completely free for everyone.",
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
      "Lunary offers a generous free tier with 2000+ grimoire articles and no ads, while TimePassages has limited free features. Choose Lunary if you want: no ads, a modern beautiful design, the Astral Guide with complete chart context, a complete magical ecosystem (tarot, grimoire, rituals), and accessible pricing. Choose TimePassages if you're an experienced astrologer who needs advanced technical features and prefers a one-time purchase.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and TimePassages?",
        answer:
          'Lunary is a modern app designed for everyone, with beautiful design, the Astral Guide explaining insights in plain language, and magical tools like tarot and a 2000+ page grimoire. TimePassages is traditional astrology software for experienced astrologers. Lunary uses subscription pricing ($4.99/mo), while TimePassages is a one-time purchase (~$15-50).',
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'None',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'None',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'N/A' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: '~$50 one-time' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Astro Gold requires a ~$50 upfront purchase with no free tier.",
      },
      {
        title: 'Accessible to All Levels',
        description:
          "The Astral Guide has complete context of your chart, patterns, and tarot readings to make astrology accessible—you don't need to be a professional to understand your chart.",
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Lunary combines astrology with tarot, a grimoire with 2000+ pages, and rituals for a complete spiritual practice. All grimoire content is completely free for everyone.',
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
      "Lunary offers a generous free tier with 2000+ grimoire articles and no ads, while Astro Gold requires a ~$50 upfront purchase. Choose Lunary if you want: no ads, a generous free tier to start, accessibility for all levels (not just professionals), magical tools (tarot, grimoire, rituals), and the Astral Guide making astrology easy to understand. Choose Astro Gold if you're a professional astrologer who needs advanced technical features.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Astro Gold?",
        answer:
          'Lunary is designed for everyone, with the Astral Guide making astrology accessible, plus magical tools like tarot and a 2000+ page grimoire. Astro Gold is professional-grade software for experienced astrologers. Lunary has a generous free tier and subscription pricing ($4.99/mo), while Astro Gold requires a ~$50 upfront purchase.',
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Limited',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Varies',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: '~$9.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. AstroFuture's free tier is more limited.",
      },
      {
        title: 'Real Astronomical Calculations (±1 arcminute accuracy)',
        description:
          'Lunary uses astronomy-engine for calculations accurate to ±1 arcminute based on VSOP87 models, ensuring precise planetary positions.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Lunary includes a 2000+ page grimoire, rituals, and correspondences for a complete spiritual toolkit. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's is more generous with 2000+ grimoire articles and no ads. Choose Lunary if you want: no ads, real astronomical calculations with ±1 arcminute accuracy, transparent methodology, a complete grimoire with 2000+ pages, magical tools, and better value at $4.99/mo. Choose AstroFuture if you prefer their specific style and don't mind the higher price.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and AstroFuture?",
        answer:
          "Lunary uses real astronomical calculations with ±1 arcminute accuracy and transparent methodology, plus includes a complete 2000+ page grimoire with magical tools. Lunary's free tier is more generous with no ads, and Pro pricing is better value at $4.99/mo vs AstroFuture's ~$9.99/mo.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Limited (with ads)',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Yes (free tier)',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: '~$9.99/mo' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Unlike AstroMatrix's ad-supported free tier, you get a clean, focused experience from day one.",
      },
      {
        title: 'Focused, Beautiful Experience',
        description:
          "Lunary's clean design puts the most important insights front and center, without overwhelming you with features.",
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          "Lunary includes a grimoire with 2000+ pages of spells, rituals, and correspondences—tools that AstroMatrix doesn't offer. All grimoire content is completely free for everyone.",
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
      "Both apps offer free tiers—Lunary's is ad-free with 2000+ grimoire articles, while AstroMatrix's free tier has ads. Choose Lunary if you want: no ads, a focused beautiful experience without feature overload, a complete grimoire with magical tools, the Astral Guide with complete chart context, and better value at $4.99/mo. Choose AstroMatrix if you want a wide variety of astrology features and don't mind ads or a busier interface.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and AstroMatrix?",
        answer:
          "Lunary focuses on clean, beautiful design with magical tools like a 2000+ page grimoire, tarot readings, and rituals—without overwhelming you with features. AstroMatrix is feature-heavy with many options. Lunary's free tier has no ads, while AstroMatrix's free tier is ad-supported. Lunary is better value at $4.99/mo vs ~$9.99/mo.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Basic tarot',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'None',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free + IAP' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Labyrinthos offers basic free tarot but focuses on premium educational content.",
      },
      {
        title: 'Complete Cosmic Integration',
        description:
          'Lunary combines astrology and tarot in one app, with tarot readings personalized to your birth chart for deeper insights.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Beyond tarot, Lunary includes a grimoire with 2000+ pages of spells, rituals, correspondences, and crystals—everything for your spiritual practice. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's includes astrology, 2000+ grimoire articles, and tarot with no ads, while Labyrinthos offers basic free tarot focused on education. Choose Lunary if you want: no ads, complete cosmic integration (astrology + tarot in one app), tarot readings personalized to your birth chart, a complete grimoire with magical practices, and real astronomical data. Choose Labyrinthos if you specifically want to deeply learn tarot with structured lessons.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Labyrinthos?",
        answer:
          "Lunary combines astrology and tarot in one app, with tarot readings personalized to your birth chart, plus a 2000+ page grimoire with magical tools. Labyrinthos is tarot-only, focused specifically on structured tarot education with lessons and flashcards. Lunary's free tier includes both astrology and tarot with no ads.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'check' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Limited',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Varies',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Limited free features' },
      },
      {
        name: 'Pricing',
        description: 'Monthly subscription',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies by plan' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Lunar Guide's free tier is more limited in comparison.",
      },
      {
        title: 'Real Astronomical Calculations (±1 arcminute accuracy)',
        description:
          'Lunary uses astronomy-engine for calculations accurate to ±1 arcminute based on VSOP87 models, ensuring precise planetary positions from your exact birth time, date, and location.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Lunary includes a comprehensive grimoire with 2000+ pages of spells, rituals, correspondences, and magical knowledge - unique to Lunary and not available in Lunar Guide. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's is more generous with 2000+ grimoire articles and no ads. Choose Lunary if you want: no ads, real astronomical calculations with ±1 arcminute accuracy, a complete grimoire with 2000+ pages (100% free), chart-personalized tarot with pattern analysis, and the Astral Guide with complete chart context. Choose Lunar Guide if you prefer their specific approach to astrology insights.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Lunar Guide?",
        answer:
          "Lunary uses real astronomical calculations with ±1 arcminute accuracy and includes a complete 2000+ page grimoire, chart-personalized tarot readings with pattern analysis, and the Astral Guide with complete chart context. Lunar Guide has a different approach to astrology insights. Lunary's free tier is more generous with no ads.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Moon phases (with ads)',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Yes',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'N/A' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free + Ads' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. Moon Calendar only offers basic moon phase tracking with ads.",
      },
      {
        title: 'Far More Than a Calendar',
        description:
          'Lunary includes full astrology, personalized birth charts, and planetary transits—not just moon phases.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Add tarot, a grimoire with 2000+ pages, rituals, and correspondences for a comprehensive spiritual practice. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's is ad-free with complete astrology and 2000+ grimoire articles, while Moon Calendar offers basic moon tracking with ads. Choose Lunary if you want: no ads, far more than a calendar (full astrology, birth charts, transits), a complete magical toolkit (tarot, grimoire, rituals), and personalization to your birth chart. Choose Moon Calendar only if you want the most basic moon phase tracking and don't mind ads.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and Moon Calendar?",
        answer:
          "Lunary includes full astrology (birth charts, planetary transits, horoscopes), a 2000+ page grimoire, tarot readings, and magical tools—far more than just moon phases. Moon Calendar only offers basic moon phase tracking. Lunary's free tier has no ads, while Moon Calendar is ad-supported.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
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
        name: 'Shareable Features',
        description: 'Share your dashboard, birth chart, horoscope',
        lunary: { type: 'check' },
        competitor: { type: 'x' },
      },
      {
        name: 'Free Tier',
        description:
          'Universal horoscopes, 2000+ grimoire articles, moon phases, tarot, no ads',
        lunary: {
          type: 'text',
          value: 'Generous (No Ads)',
          highlight: true,
        },
        competitor: {
          type: 'text',
          value: 'Moon tracking',
        },
      },
      {
        name: 'Ads',
        description: 'Ad-free experience',
        lunary: { type: 'text', value: 'None', highlight: true },
        competitor: {
          type: 'text',
          value: 'Varies',
        },
      },
      {
        name: 'Free Trial',
        description: 'Try Pro features before you buy',
        lunary: {
          type: 'text',
          value: FREE_TRIAL_DAYS.display,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Varies' },
      },
      {
        name: 'Pricing',
        lunary: {
          type: 'text',
          value: PRICING_DISPLAY.range,
          highlight: true,
        },
        competitor: { type: 'text', value: 'Free + Premium' },
      },
    ],
    lunaryAdvantages: [
      {
        title: 'Generous Free Tier with No Ads',
        description:
          "Lunary's free tier includes universal daily horoscopes, 2000+ grimoire articles (all compatibility charts, tarot meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features—all with zero ads. MoonX focuses primarily on moon tracking rather than comprehensive astrology.",
      },
      {
        title: 'Complete Cosmic Picture',
        description:
          'Lunary goes beyond moon phases to include full astrology, personalized to your birth chart.',
      },
      {
        title: 'Complete Grimoire (2000+ pages) - 100% Free',
        description:
          'Combine moon tracking with tarot, a grimoire with 2000+ pages, and rituals for a complete spiritual toolkit. All grimoire content is completely free for everyone.',
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
      "Both apps offer free tiers—Lunary's is ad-free with complete astrology and 2000+ grimoire articles, while MoonX focuses on moon tracking. Choose Lunary if you want: no ads, the complete cosmic picture (full astrology personalized to your birth chart), magical practice integration (tarot, grimoire, rituals), and the Astral Guide with complete chart context. Choose MoonX only if you need basic moon phase tracking without astrology.",
    faqs: [
      {
        question: 'Does Lunary have a free tier?',
        answer: `Yes! Lunary's free tier includes universal daily horoscopes (sun/moon based), 2000+ grimoire articles (all compatibility charts, tarot card meanings, astrological concepts), moon phases, tarot cards, crystal recommendations, and shareable features. Best of all, there are no ads. Paid tiers (${PRICING_DISPLAY.paidTiersRange}) unlock personalization to your specific birth chart.`,
      },
      {
        question: "What's the difference between Lunary and MoonX?",
        answer:
          "Lunary includes full astrology (birth charts, planetary transits, horoscopes) personalized to your exact birth chart, plus a 2000+ page grimoire, tarot readings, and magical tools. MoonX focuses primarily on moon phase tracking. Lunary's free tier has no ads and offers significantly more value.",
      },
      {
        question: "Is Lunary's grimoire really free?",
        answer:
          'Yes! All 2000+ pages of the grimoire are 100% free for everyone. This includes all compatibility charts (all sign combinations), all 78 tarot card meanings, astrological houses, aspects, placements, moon phases, crystal guides, and much more. No paywall, no ads.',
      },
    ],
  },
};

export function getComparisonData(slug: string): ComparisonData | undefined {
  return comparisonData[slug];
}

export function getAllComparisonSlugs(): string[] {
  return Object.keys(comparisonData);
}
