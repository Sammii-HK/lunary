/**
 * Retrograde Pack Content Generator
 *
 * Generates rich PDF content for retrograde survival packs.
 */

import {
  PdfRetrogradePack,
  PdfRetrogradeSurvival,
  PdfRetrogradeRitual,
} from '../schema';

interface RetrogradeData {
  planet: string;
  frequency: string;
  duration: string;
  domains: string[];
  challenges: string[];
  opportunities: string[];
  description: string;
  phases: PdfRetrogradeSurvival[];
  practicalTips: string[];
  journalPrompts: string[];
}

const RETROGRADE_DATA: Record<string, RetrogradeData> = {
  Mercury: {
    planet: 'Mercury',
    frequency: 'Three to four times per year',
    duration: 'Approximately three weeks',
    domains: ['Communication', 'Technology', 'Travel', 'Contracts', 'Thinking'],
    challenges: [
      'Miscommunication and misunderstandings',
      'Technology failures and glitches',
      'Travel delays and disruptions',
      'Contract and document issues',
    ],
    opportunities: [
      'Reviewing and revising past work',
      'Reconnecting with old friends and contacts',
      'Rethinking communication patterns',
      'Slowing down and reflecting',
    ],
    description:
      'Mercury retrograde is perhaps the most famous (and feared) of all retrograde periods. Three to four times per year, the planet of communication appears to move backward, and the domains it rules—communication, technology, travel, and thinking—can become chaotic. But Mercury retrograde is not a curse; it is an invitation to slow down, review, and reconnect.',
    phases: [
      {
        planet: 'Mercury',
        phase: 'Pre-Retrograde Shadow',
        description:
          'The shadow period begins approximately two weeks before Mercury stations retrograde. The themes that will dominate the retrograde start to emerge during this time. Consider it your opportunity to prepare.',
        doList: [
          'Back up all of your devices, files, and important data.',
          'Double-check any travel plans and reservations.',
          'Finalise pending contracts and agreements before the retrograde begins.',
          'Service your car and verify travel routes in advance.',
          'Update software and complete any necessary tech maintenance.',
        ],
        dontList: [
          'Avoid signing major contracts if you can wait.',
          'Avoid making large purchases, especially electronics.',
          'Avoid starting brand new projects during this period.',
          'Do not assume everyone has received your messages.',
        ],
        affirmation:
          'I prepare calmly for the retrograde ahead. I trust my ability to navigate whatever arises.',
      },
      {
        planet: 'Mercury',
        phase: 'Mercury Retrograde',
        description:
          'Mercury appears to move backward through the zodiac for approximately three weeks. Communication, technology, and travel are most affected during this period. This is a time for reflection, not bold action.',
        doList: [
          'Review, revise, and revisit old projects or unfinished work.',
          'Reconnect with people from your past who come to mind.',
          'Reflect honestly on your communication patterns.',
          'Rest and consciously slow down your pace.',
          'Research thoroughly before making any decisions.',
          'Re-read all messages carefully before sending them.',
        ],
        dontList: [
          'Avoid signing contracts without thorough review.',
          'Avoid buying new electronics or vehicles.',
          'Avoid launching new projects or businesses.',
          'Do not assume travel will go smoothly—build in extra time.',
          'Do not send important emails without proofreading.',
          'Avoid making assumptions in conversations.',
        ],
        affirmation:
          'I embrace the slowdown. Mercury retrograde invites me to reflect, not react.',
      },
      {
        planet: 'Mercury',
        phase: 'Direct Station',
        description:
          'Mercury stations direct, appearing to pause before resuming forward motion. This is a pivot point where things may feel stuck or particularly intense just before improvement arrives.',
        doList: [
          'Tie up any loose ends from the retrograde period.',
          'Take time to clarify any lingering miscommunications.',
          'Be patient as forward momentum slowly returns.',
          'Finalise decisions that emerged during your retrograde review.',
          'Express gratitude for the lessons this cycle has brought.',
        ],
        dontList: [
          'Do not rush into new projects immediately.',
          'Do not expect instant clarity—it returns gradually.',
          'Avoid making impulsive decisions.',
          'Do not ignore unresolved issues from the retrograde.',
        ],
        affirmation:
          'I move forward with the wisdom I have gained. The pause has served its purpose.',
      },
      {
        planet: 'Mercury',
        phase: 'Post-Retrograde Shadow',
        description:
          'The shadow period after retrograde lasts approximately two weeks. Mercury retraces its retrograde path, integrating lessons learned. Full forward momentum returns gradually during this time.',
        doList: [
          'Implement the insights you gained during the retrograde.',
          'Complete projects that were paused or delayed.',
          'Move forward confidently with new plans and contracts.',
          'Address anything that may have fallen through the cracks.',
          'Acknowledge your resilience in navigating another Mercury retrograde.',
        ],
        dontList: [
          'Do not forget the lessons you have learned.',
          'Avoid rushing back to full speed immediately.',
          'Do not ignore any lingering communication issues.',
        ],
        affirmation:
          'I integrate the lessons of this retrograde cycle. I move forward wiser and more aware.',
      },
    ],
    practicalTips: [
      'Always have a backup plan for travel during Mercury retrograde periods.',
      'Allow extra time for everything—conversations, travel, and major decisions.',
      'Lean into "re" words: review, revise, reconnect, reflect, and rest.',
      'Old friends and former partners may reappear; decide consciously how you wish to respond.',
      'Technology issues are common during this transit. Patience and regular backups are essential.',
    ],
    journalPrompts: [
      'What area of my life is calling for review and revision right now?',
      'Is there anyone from my past worth consciously reconnecting with?',
      'How can I slow down and become more present during this retrograde?',
      'What communication patterns in my life need attention?',
    ],
  },
  Venus: {
    planet: 'Venus',
    frequency: 'Approximately every 18 months',
    duration: 'About 40 days',
    domains: [
      'Love',
      'Relationships',
      'Beauty',
      'Values',
      'Money',
      'Self-Worth',
    ],
    challenges: [
      'Ex-partners reappearing',
      'Relationship doubts surfacing',
      'Financial reassessment required',
      'Self-worth wounds triggered',
    ],
    opportunities: [
      'Healing past relationship wounds',
      'Clarifying what you truly value',
      'Reconnecting with self-love',
      'Resolving old romantic karma',
    ],
    description:
      'Venus retrograde occurs approximately every 18 months, lasting about 40 days. During this time, matters of the heart come up for review—relationships, values, beauty, and self-worth all receive cosmic attention. Ex-partners may resurface, and old feelings may arise.',
    phases: [
      {
        planet: 'Venus',
        phase: 'Pre-Retrograde Shadow',
        description:
          'The themes of Venus retrograde begin to emerge. You may notice relationship issues surfacing or questions about your values arising.',
        doList: [
          'Reflect on your current relationship patterns.',
          'Assess whether your values align with how you spend your time and money.',
          'Strengthen your self-love practices before the intensity begins.',
          'Address any relationship issues that have been simmering.',
        ],
        dontList: [
          'Avoid making major relationship decisions in haste.',
          'Avoid major beauty procedures or dramatic makeovers.',
          'Do not ignore red flags in new relationships.',
        ],
        affirmation:
          'I prepare my heart for the journey inward. I am worthy of the love I seek.',
      },
      {
        planet: 'Venus',
        phase: 'Venus Retrograde',
        description:
          'Venus moves backward, and matters of the heart come into sharp focus. This is a time for reviewing relationships, not starting new ones. Old loves may return, and old wounds may surface for healing.',
        doList: [
          'Reflect deeply on your relationship patterns and history.',
          'Practice radical self-love and self-care.',
          'Process any returning feelings with compassion.',
          'Revisit your values and assess whether you are living in alignment.',
          'Heal old heartbreak through ritual, therapy, or journaling.',
        ],
        dontList: [
          'Avoid starting new relationships during this period.',
          'Avoid getting back together with an ex without careful consideration.',
          'Avoid major purchases of luxury items or art.',
          'Do not schedule cosmetic procedures.',
          'Avoid making permanent changes to your appearance.',
        ],
        affirmation:
          'I review my heart with honesty and compassion. Old wounds surface to be healed, not to harm.',
      },
      {
        planet: 'Venus',
        phase: 'Direct Station',
        description:
          'Venus stations direct, and clarity begins to return to matters of the heart. Decisions about relationships can now be made with greater wisdom.',
        doList: [
          'Make relationship decisions with the wisdom you have gained.',
          'Implement the self-love practices you have developed.',
          'Move forward with values-aligned choices.',
          'Release relationships or patterns that no longer serve you.',
        ],
        dontList: [
          'Do not expect old feelings to disappear immediately.',
          'Avoid rushing into new relationships.',
          'Do not ignore the lessons this retrograde has taught you.',
        ],
        affirmation:
          'I move forward with a clearer heart. I know what I value and what I deserve.',
      },
    ],
    practicalTips: [
      'Do not be surprised if ex-partners reappear—this is classic Venus retrograde.',
      'Use this time for deep self-love work, not seeking external validation.',
      'Avoid major beauty procedures or dramatic appearance changes.',
      'Review your finances and spending patterns.',
      'Rose quartz and heart-centred practices are especially supportive.',
    ],
    journalPrompts: [
      'What relationship patterns keep repeating in my life?',
      'What do I truly value, and am I living in alignment with those values?',
      'Where do I need to deepen my self-love practice?',
      'What old wounds are ready to be healed?',
    ],
  },
  Mars: {
    planet: 'Mars',
    frequency: 'Approximately every 2 years',
    duration: 'About 10 weeks',
    domains: ['Action', 'Anger', 'Ambition', 'Drive', 'Conflict', 'Sexuality'],
    challenges: [
      'Frustration and blocked energy',
      'Stalled projects and plans',
      'Conflict and aggression surfacing',
      'Low motivation and drive',
    ],
    opportunities: [
      'Reviewing goals and strategies',
      'Processing anger constructively',
      'Resting and rebuilding energy',
      'Redirecting ambition',
    ],
    description:
      'Mars retrograde occurs approximately every two years, lasting about 10 weeks. During this time, forward momentum slows, and frustration can build. Actions taken before may need revision, and suppressed anger may surface. This is a time to review, not to charge ahead.',
    phases: [
      {
        planet: 'Mars',
        phase: 'Pre-Retrograde Shadow',
        description:
          'Mars begins to slow, and you may notice frustration building or projects stalling. This is preparation time.',
        doList: [
          'Complete projects that require urgent action.',
          'Begin anger management or physical practices.',
          'Assess your goals and strategies honestly.',
          'Build in outlets for physical energy.',
        ],
        dontList: [
          'Avoid starting major new initiatives.',
          'Avoid suppressing anger—find healthy outlets.',
          'Do not overcommit your energy.',
        ],
        affirmation:
          'I prepare for the slowdown ahead. I channel my energy wisely.',
      },
      {
        planet: 'Mars',
        phase: 'Mars Retrograde',
        description:
          'Mars moves backward, and forward momentum significantly slows. This is not the time for new battles or bold action—it is the time for strategic retreat and review.',
        doList: [
          'Review your goals and adjust strategies as needed.',
          'Process anger through physical activity, therapy, or ritual.',
          'Rest and conserve your energy for the direct period.',
          'Revisit unfinished business that requires action.',
          'Practice patience with yourself and others.',
        ],
        dontList: [
          'Avoid starting new projects or initiatives.',
          'Avoid major confrontations or battles.',
          'Do not make aggressive moves in career or conflict.',
          'Avoid high-risk physical activities.',
          'Do not suppress frustration—it will only grow.',
        ],
        affirmation:
          'I embrace strategic rest. I redirect my fire inward for review and renewal.',
      },
      {
        planet: 'Mars',
        phase: 'Direct Station',
        description:
          'Mars stations direct, and energy begins to return. You may feel a surge of motivation as the frustration of the retrograde lifts.',
        doList: [
          'Begin implementing the strategic changes you planned.',
          'Take action on projects that have been waiting.',
          'Channel your renewed energy constructively.',
          'Move forward with the wisdom you have gained.',
        ],
        dontList: [
          'Avoid burning out with sudden activity.',
          'Do not forget the patience you cultivated.',
          'Avoid acting on residual anger impulsively.',
        ],
        affirmation:
          'My energy returns, directed by wisdom. I move forward with clarity and purpose.',
      },
    ],
    practicalTips: [
      'Physical exercise is essential for processing Mars retrograde frustration.',
      'Review your goals rather than pushing forward blindly.',
      'Avoid starting new conflicts—old ones may need resolution.',
      'This is an excellent time for strategic planning.',
      'Red jasper and bloodstone support healthy Mars energy.',
    ],
    journalPrompts: [
      'Where am I pushing when I should be pausing?',
      'What anger or frustration needs healthy expression?',
      'Which of my goals need revision or release?',
      'How can I channel my energy more wisely?',
    ],
  },
};

function getMercuryRituals(): PdfRetrogradeRitual[] {
  return [
    {
      title: 'Protection Ritual for Devices and Communication',
      description:
        'Protect your technology and communication channels from Mercury retrograde glitches with this simple but powerful ritual.',
      materials: [
        'Clear quartz crystal',
        'Blue or yellow candle',
        'Sage or palo santo',
        'Small piece of paper',
        'Pen',
      ],
      steps: [
        'Cleanse your space with sage or palo santo smoke.',
        'Light the blue or yellow candle, representing clear communication.',
        'Hold the clear quartz and visualise a protective shield around all your devices.',
        'Write "Clear communication, protected technology" on the paper.',
        'Place the paper under the crystal near your candle.',
        'Say aloud: "Mercury, planet of communication, I ask for clarity and protection. May my devices function smoothly, and may my words be understood clearly."',
        'Allow the candle to burn safely for at least 15 minutes.',
        'Carry the crystal with you or place it near your devices during the retrograde.',
      ],
      timing:
        'Perform before Mercury retrograde begins, or during the pre-retrograde shadow period.',
      affirmation:
        'My communication is clear and protected. Technology serves me smoothly.',
    },
    {
      title: 'Travel Safety Spell and Blessing',
      description:
        'Bless your journeys and protect yourself from travel delays and disruptions during Mercury retrograde.',
      materials: [
        'Yellow or orange candle',
        'Turquoise or aventurine crystal',
        'Cinnamon stick or powder',
        'Small travel charm or token',
        'Paper and pen',
      ],
      steps: [
        'Light the yellow or orange candle to represent safe movement.',
        'Hold the crystal and your travel token in your hands.',
        'Write your travel dates and destinations on the paper.',
        'Sprinkle a small amount of cinnamon around the candle (cinnamon is associated with Mercury and safe travel).',
        'Visualise yourself arriving safely and on time at your destination.',
        'Say: "Mercury, guide my path. May my journeys be smooth, my connections timely, and my return safe. I am protected in all my travels."',
        'Place the travel token near the candle and allow it to absorb the protective energy.',
        'Carry the token with you when you travel, and keep the crystal in your luggage or car.',
      ],
      timing:
        'Perform before any travel during Mercury retrograde or its shadow periods.',
      affirmation:
        'I travel safely and arrive on time. All connections align perfectly.',
    },
    {
      title: 'Miscommunication Repair Working',
      description:
        'Heal misunderstandings and repair communication breakdowns that occurred during Mercury retrograde.',
      materials: [
        'Blue candle',
        'Lapis lazuli or sodalite crystal',
        'Lavender or chamomile',
        'Paper and pen',
        'Small bowl of water',
      ],
      steps: [
        'Light the blue candle to represent clear communication.',
        'Write down the miscommunication or misunderstanding on paper.',
        'Hold the crystal and visualise the situation resolving with clarity and understanding.',
        'Place the paper in the bowl of water with a few drops of lavender or chamomile.',
        'Say: "Mercury, I release this misunderstanding. May clarity replace confusion, and may truth be spoken and heard. I forgive and seek to be understood."',
        'Allow the paper to soak in the water for a few minutes, then safely burn it (or dispose of it respectfully).',
        'Pour the water outside or down the drain, releasing the energy.',
        'Reach out to the person involved with clear, direct communication.',
      ],
      timing:
        'Perform when you need to repair a specific miscommunication, ideally during the post-retrograde shadow period.',
      affirmation:
        'I communicate clearly and repair misunderstandings with grace and honesty.',
    },
  ];
}

function getVenusRituals(): PdfRetrogradeRitual[] {
  return [
    {
      title: 'Heart Healing Ritual for Past Relationships',
      description:
        'Heal old relationship wounds and release emotional baggage from past connections during Venus retrograde.',
      materials: [
        'Pink or rose candle',
        'Rose quartz crystal',
        'Rose petals or rose essential oil',
        'Paper and pen',
        'Small box or envelope',
      ],
      steps: [
        'Light the pink or rose candle in a quiet, sacred space.',
        'Hold the rose quartz and breathe deeply, connecting with your heart.',
        'Write down the relationship or wound you wish to heal. Be specific but compassionate.',
        'Place the paper in the box or envelope.',
        'Anoint the box with rose essential oil or place rose petals around it.',
        'Say: "Venus, goddess of love, I release this old wound. I honour what was, learn from what is, and open to what will be. My heart heals and remains open to love."',
        'Visualise pink light surrounding your heart, healing and softening old pain.',
        'Keep the box in a safe place, or bury it in the earth as a symbol of release.',
        'Place the rose quartz on your heart chakra during meditation for continued healing.',
      ],
      timing:
        'Perform during Venus retrograde, especially when old feelings or ex-partners resurface.',
      affirmation:
        'I heal my heart and release the past. Love flows to me and through me.',
    },
    {
      title: 'Self-Worth Affirmation Practice',
      description:
        'Strengthen your sense of self-worth and self-love during Venus retrograde, when self-worth issues often surface.',
      materials: [
        'Mirror',
        'Rose quartz or pink tourmaline',
        'Pink or gold candle',
        'Paper and pen',
      ],
      steps: [
        'Light the pink or gold candle and place it near a mirror.',
        'Hold the crystal and look at yourself in the mirror.',
        'Write down 10 things you love about yourself—your values, strengths, and unique qualities.',
        'Read each item aloud while looking at yourself in the mirror.',
        'After each item, say: "I am worthy of [quality]. I deserve [what you want]."',
        'Place your hand on your heart and say: "I am enough. I am worthy. I am loved."',
        'Keep the list somewhere visible and read it daily during Venus retrograde.',
        'Carry the crystal with you as a reminder of your worth.',
      ],
      timing:
        'Practice daily during Venus retrograde, especially when self-doubt arises.',
      affirmation:
        'I am inherently worthy. My value does not depend on external validation.',
    },
    {
      title: 'Ex-Partner Cord Cutting Ceremony',
      description:
        'Release energetic cords and attachments to past partners who may resurface during Venus retrograde.',
      materials: [
        'Two candles (one for you, one representing the other person)',
        'String or cord (natural fiber like cotton or hemp)',
        'Scissors',
        'Sage or palo santo',
        'Black tourmaline or obsidian',
      ],
      steps: [
        'Cleanse your space with sage or palo santo.',
        'Light both candles, placing them several inches apart.',
        'Tie the cord between the two candles, visualising the energetic connection.',
        'Hold the black tourmaline or obsidian for protection and grounding.',
        'Say: "I acknowledge the connection we shared. I honour what was, and I release what no longer serves. I cut these cords with love and respect, freeing us both to move forward."',
        'Use the scissors to cut the cord between the candles.',
        'Extinguish the other person\'s candle, saying: "I release you with love. May we both find the love we deserve."',
        'Allow your candle to continue burning, visualising yourself free and whole.',
        'Bury or dispose of the cut cord respectfully.',
        'Carry the protective crystal for a few days after the ritual.',
      ],
      timing:
        'Perform when an ex-partner resurfaces or when you feel energetically tied to a past relationship.',
      affirmation:
        'I release old attachments with love. I am free to give and receive love in the present.',
    },
    {
      title: 'Beauty and Self-Care Ritual',
      description:
        'Honour your physical beauty and practice radical self-care during Venus retrograde, when beauty standards may shift.',
      materials: [
        'Rose or pink candle',
        'Rose quartz',
        'Your favourite beauty products',
        'Bath salts or essential oils',
        'Mirror',
      ],
      steps: [
        'Create a sacred self-care space—run a warm bath or prepare your skincare routine.',
        'Light the rose or pink candle.',
        'Place the rose quartz nearby and hold it while setting your intention.',
        'As you care for your body (bathing, moisturising, etc.), speak words of love and appreciation to yourself.',
        'Look at yourself in the mirror and say: "I am beautiful. I honour this body. I care for myself with love."',
        'Use your favourite beauty products with intention, infusing them with self-love energy.',
        'Say: "Venus, I honour my beauty. I care for myself because I am worthy of care and love."',
        'Spend time in gratitude for your body and all it does for you.',
      ],
      timing:
        'Practice regularly during Venus retrograde, especially when beauty or self-image issues arise.',
      affirmation:
        'I am beautiful and worthy of care. Self-love is my foundation.',
    },
    {
      title: 'Values Clarification Spread and Journal',
      description:
        'Use this tarot spread and journal practice to clarify your core values during Venus retrograde, when what you truly value comes into question.',
      materials: [
        'Tarot deck (optional)',
        'Journal and pen',
        'Green or pink candle',
        'Emerald or green aventurine',
      ],
      steps: [
        'Light the green or pink candle and hold the crystal.',
        'If using tarot, shuffle while asking: "What do I truly value?"',
        'Draw three cards: Card 1 = What I thought I valued, Card 2 = What I actually value, Card 3 = How to align my life with my values.',
        'Journal about each card and what it reveals about your values.',
        'Without tarot: Write freely about what matters most to you. What would you fight for? What brings you joy?',
        'Create a list of your top 5-7 core values.',
        'For each value, write: "I value [value] because..." and "I honour this value by..."',
        'Review your current life: Where are you living in alignment? Where are you out of alignment?',
        'Set one intention to better align your actions with your values.',
      ],
      timing:
        'Perform during Venus retrograde, especially when you feel confused about what matters to you.',
      affirmation:
        'I know what I value. I align my life with my deepest truths.',
    },
    {
      title: 'Rose Quartz Working for Venus Energy',
      description:
        'A dedicated practice for working with rose quartz to amplify Venus energy and attract love, beauty, and self-worth during retrograde.',
      materials: [
        'Rose quartz crystal (preferably palm-sized)',
        'Pink or rose candle',
        'Rose petals or rose essential oil',
        'Journal',
      ],
      steps: [
        'Cleanse your rose quartz by holding it under running water or in moonlight.',
        'Light the pink or rose candle.',
        'Anoint the crystal with rose essential oil or place it on rose petals.',
        'Hold the crystal to your heart chakra and breathe deeply.',
        'Visualise pink light flowing from the crystal into your heart, filling you with self-love.',
        'Say: "Rose quartz, stone of love, open my heart to receive and give love. I am worthy of all the beauty and love life offers."',
        'Spend 10-15 minutes meditating with the crystal on your heart.',
        'Journal about what love means to you and how you can invite more love into your life.',
        'Carry the crystal with you daily during Venus retrograde, or place it on your altar.',
        'Each morning, hold it and set an intention for self-love and open-heartedness.',
      ],
      timing:
        'Practice daily during Venus retrograde, especially when self-worth or relationship issues arise.',
      affirmation:
        'I am open to love. I give and receive love freely. My heart is open and protected.',
    },
  ];
}

function getMarsRituals(): PdfRetrogradeRitual[] {
  return [
    {
      title: 'Anger Alchemy Ritual',
      description:
        'Transform anger and frustration into constructive energy during Mars retrograde, when suppressed anger often surfaces.',
      materials: [
        'Red or black candle',
        'Carnelian or red jasper',
        'Paper and pen',
        'Fireproof container',
        'Salt',
      ],
      steps: [
        'Create a safe, private space for this ritual.',
        'Light the red or black candle.',
        'Hold the carnelian or red jasper and connect with your anger. Do not suppress it—acknowledge it fully.',
        'Write down what you are angry about. Be honest and specific.',
        'Read what you wrote aloud, allowing yourself to feel the anger without judgment.',
        'Say: "Mars, I honour this anger. It shows me what matters. I transform this fire into constructive action."',
        'Visualise the anger transforming from destructive fire into focused, powerful energy.',
        'Safely burn the paper in the fireproof container, watching the anger transform.',
        'Sprinkle salt over the ashes to ground the energy.',
        'Write down one constructive action you can take with this transformed energy.',
      ],
      timing:
        'Perform when anger or frustration builds during Mars retrograde.',
      affirmation:
        'I transform anger into wisdom. My fire fuels constructive action, not destruction.',
    },
    {
      title: 'Patience Spell for Frustration',
      description:
        'Cultivate patience and calm during Mars retrograde, when frustration and impatience can be overwhelming.',
      materials: [
        'Blue or green candle (for calm)',
        'Amethyst or blue lace agate',
        'Lavender or chamomile',
        'Paper and pen',
      ],
      steps: [
        'Light the blue or green candle to invoke calm energy.',
        'Hold the amethyst or blue lace agate and breathe deeply.',
        'Write down what is causing you frustration or impatience.',
        'Sprinkle lavender or chamomile around the candle.',
        'Say: "Mars, I honour your fire, but I choose patience. I slow down and trust the timing. Frustration does not serve me—patience does."',
        'Visualise yourself moving through the situation with calm and patience.',
        'Write an affirmation about patience and read it three times.',
        'Carry the crystal with you as a reminder to breathe and be patient.',
      ],
      timing: 'Perform when frustration peaks during Mars retrograde.',
      affirmation:
        'I choose patience over frustration. Timing is perfect, and I trust the process.',
    },
    {
      title: 'Physical Movement Practices for Blocked Mars',
      description:
        'When Mars energy feels blocked during retrograde, physical movement helps release frustration and restore flow.',
      materials: [
        'Comfortable clothing for movement',
        'Red jasper or carnelian (optional)',
        'Space to move',
      ],
      steps: [
        'Choose a movement practice: walking, running, yoga, dancing, martial arts, or any physical activity.',
        'If using a crystal, hold it or place it nearby.',
        'Before moving, set an intention: "I move to release blocked energy. I channel Mars fire constructively."',
        'Begin moving slowly, gradually increasing intensity as feels right.',
        'As you move, visualise frustration and blocked energy leaving your body.',
        'If anger arises, channel it into the movement—punch, kick, or move with intensity.',
        'After 20-30 minutes, slow down and return to stillness.',
        'Place your hands on your heart and solar plexus, feeling the energy flow.',
        'Journal about what came up during movement and how you feel now.',
      ],
      timing:
        'Practice 3-5 times per week during Mars retrograde, especially when frustration builds.',
      affirmation:
        'I move my body to move my energy. Physical action releases what mental worry cannot.',
    },
    {
      title: 'Bloodstone and Red Jasper Workings',
      description:
        'Work with bloodstone and red jasper to support healthy Mars energy, courage, and action during retrograde.',
      materials: [
        'Bloodstone',
        'Red jasper',
        'Red or black candle',
        'Basil or ginger (optional)',
      ],
      steps: [
        'Light the red or black candle.',
        'Hold both crystals in your hands and connect with their grounding, energising properties.',
        'Place bloodstone on your root chakra (base of spine) for grounding and protection.',
        'Place red jasper on your solar plexus (stomach area) for courage and action.',
        'Visualise red energy flowing from the crystals, grounding you and giving you strength.',
        'Say: "Bloodstone and red jasper, stones of Mars, ground my fire and give me courage. I act with wisdom, not impulsivity."',
        'Meditate with the crystals for 10-15 minutes, feeling their supportive energy.',
        'Carry both crystals with you during Mars retrograde, or place them on your altar.',
        'When you need courage or feel blocked, hold them and breathe deeply.',
        'If using herbs, place basil or ginger near the crystals to amplify Mars energy.',
      ],
      timing:
        'Use daily during Mars retrograde, especially when you need courage or feel energy is blocked.',
      affirmation:
        'I am grounded and courageous. My fire burns steadily, not destructively.',
    },
  ];
}

function getRetrogradeCorrespondences(planet: string): {
  crystals: string[];
  herbs: string[];
  colors: string[];
} {
  const correspondences: Record<
    string,
    { crystals: string[]; herbs: string[]; colors: string[] }
  > = {
    Mercury: {
      crystals: [
        'Clear Quartz',
        'Citrine',
        'Fluorite',
        'Sodalite',
        'Blue Lace Agate',
      ],
      herbs: ['Lavender', 'Mint', 'Lemongrass', 'Eucalyptus', 'Sage'],
      colors: ['Yellow', 'Orange', 'Light Blue', 'Silver'],
    },
    Venus: {
      crystals: [
        'Rose Quartz',
        'Pink Tourmaline',
        'Emerald',
        'Green Aventurine',
        'Pearl',
      ],
      herbs: ['Rose', 'Jasmine', 'Lavender', 'Yarrow', 'Apple'],
      colors: ['Pink', 'Green', 'White', 'Light Blue'],
    },
    Mars: {
      crystals: ['Red Jasper', 'Carnelian', 'Bloodstone', 'Garnet', 'Ruby'],
      herbs: ['Basil', 'Ginger', 'Pepper', 'Nettle', "Dragon's Blood"],
      colors: ['Red', 'Orange', 'Black', 'Dark Brown'],
    },
  };

  return correspondences[planet] || correspondences.Mercury;
}

export function generateRetrogradePackContent(
  planet: string,
): PdfRetrogradePack {
  const data = RETROGRADE_DATA[planet];
  if (!data) {
    throw new Error(`Unknown retrograde planet: ${planet}`);
  }

  // Get planet-specific rituals
  const rituals =
    planet === 'Mercury'
      ? getMercuryRituals()
      : planet === 'Venus'
        ? getVenusRituals()
        : planet === 'Mars'
          ? getMarsRituals()
          : [];

  // Get correspondences
  const correspondences = getRetrogradeCorrespondences(planet);

  return {
    type: 'retrograde',
    slug: `${planet.toLowerCase()}-retrograde-pack`,
    title: `${planet} Retrograde`,
    subtitle: 'Your survival guide',
    planet: data.planet,
    moodText: `${planet} retrograde is not a curse—it is an invitation to slow down, review, and work with this energy consciously. This guide helps you navigate each phase with awareness and grace.`,
    perfectFor: [
      `Anyone who feels anxious about ${planet} retrograde.`,
      'Those seeking practical navigation strategies.',
      `Understanding the different phases of ${planet} retrograde.`,
    ],
    introText: data.description,
    survivalGuide: data.phases,
    rituals,
    correspondences,
    practicalTips: data.practicalTips,
    journalPrompts: data.journalPrompts,
    closingText: `Thank you for navigating ${planet} retrograde with Lunary. Remember: this transit is not about punishment—it is about pause and review. Every retrograde offers a chance to catch what you may have missed and return to what truly matters.`,
    optionalAffirmation: `I flow with ${planet} retrograde rather than fighting against it. Slowdowns reveal what speed so often hides.`,
  };
}
