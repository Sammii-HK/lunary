/**
 * Birth Chart Pack Content Generator
 *
 * Generates rich PDF content for birth chart packs (Rising Sign, Moon Sign, Houses, etc.).
 */

import { PdfBirthChartPack, PdfBirthChartSection } from '../schema';

const RISING_SIGNS: PdfBirthChartSection[] = [
  {
    placement: 'What Is Your Rising Sign?',
    meaning:
      'Your rising sign (or Ascendant) is the zodiac sign that was ascending on the eastern horizon at the moment of your birth. It represents your outward personality, first impressions, and how you approach new situations. While your Sun sign is your core identity and your Moon sign is your emotional nature, your rising sign is the mask you wear and how the world first perceives you.',
    traits: [
      'Determines your physical appearance and personal style.',
      'Shapes first impressions and social approach.',
      'Influences how you initiate and begin new things.',
      'Sets the tone for your entire birth chart.',
    ],
    guidance:
      'To find your rising sign, you need your exact birth time. Even a few minutes difference can change the rising sign. Once you know yours, read your horoscope for both your Sun and rising sign for a fuller picture.',
  },
  {
    placement: 'Aries Rising',
    sign: 'Aries',
    meaning:
      'You approach the world with directness, courage, and initiative. There is an unmistakable energy about you that commands attention. You are often the one who takes the first step, starts the conversation, or leads the charge.',
    traits: [
      'Bold first impressions',
      'Quick to act and decide',
      'Competitive and driven',
      'Youthful energy at any age',
      'Can appear impatient or headstrong',
    ],
    guidance:
      'Channel your initiating energy into projects that matter. Learn to pause before reacting; your first instinct is powerful, but reflection adds wisdom.',
  },
  {
    placement: 'Taurus Rising',
    sign: 'Taurus',
    meaning:
      'You move through the world with calm, steady presence. Others find you grounding and reliable. Your approach is patient and deliberate, building security through consistent effort.',
    traits: [
      'Calm, reassuring presence',
      'Strong aesthetic sense',
      'Patient and persistent',
      'Sensual and appreciative of comfort',
      'Can appear stubborn or resistant to change',
    ],
    guidance:
      "Your stability is a gift. Allow yourself to enjoy life\'s pleasures without guilt. Practice flexibility when the situation calls for change.",
  },
  {
    placement: 'Gemini Rising',
    sign: 'Gemini',
    meaning:
      'You engage the world through curiosity and communication. Your mind is quick, and you adapt easily to new people and situations. Others find you witty, interesting, and versatile.',
    traits: [
      'Quick-witted and articulate',
      'Curious about everything',
      'Socially adaptable',
      'Youthful in appearance and energy',
      'Can appear scattered or inconsistent',
    ],
    guidance:
      'Embrace your diverse interests while building depth in areas that matter most. Your versatility is a strength, not a weakness.',
  },
  {
    placement: 'Cancer Rising',
    sign: 'Cancer',
    meaning:
      'You approach the world with sensitivity and care. Others sense your nurturing nature immediately. You create safety wherever you go and are deeply attuned to emotional atmospheres.',
    traits: [
      'Warm and nurturing presence',
      'Emotionally intuitive',
      'Protective of loved ones',
      'Home-oriented and family-focused',
      'Can appear moody or defensive',
    ],
    guidance:
      'Your sensitivity is a gift. Create boundaries to protect your energy while remaining open to connection.',
  },
  {
    placement: 'Leo Rising',
    sign: 'Leo',
    meaning:
      'You radiate warmth and confidence. Your presence is magnetic, and others are naturally drawn to your light. You approach life as a creative expression and are meant to be seen.',
    traits: [
      'Magnetic and charismatic',
      'Naturally confident',
      'Creative and expressive',
      'Generous with attention',
      'Can appear attention-seeking or proud',
    ],
    guidance:
      'Let yourself shine without apology. Use your visibility to uplift others. Remember that true confidence includes humility.',
  },
  {
    placement: 'Virgo Rising',
    sign: 'Virgo',
    meaning:
      'You engage the world with precision and helpfulness. Others notice your attention to detail and practical approach. You are the one who improves systems and notices what others miss.',
    traits: [
      'Precise and observant',
      'Helpful and service-oriented',
      'Health-conscious',
      'Modest and understated',
      'Can appear critical or anxious',
    ],
    guidance:
      'Your discerning eye is invaluable. Extend the same compassion to yourself that you so readily offer others. Not everything requires perfection.',
  },
  {
    placement: 'Libra Rising',
    sign: 'Libra',
    meaning:
      'You approach the world seeking harmony and connection. Your charm is immediately apparent. You are a natural diplomat who creates beauty and balance wherever you go.',
    traits: [
      'Charming and diplomatic',
      'Strong aesthetic sense',
      'Partnership-oriented',
      'Fair and balanced',
      'Can appear indecisive or people-pleasing',
    ],
    guidance:
      "Your gift for harmony is invaluable. Practise stating your preferences with clarity. Your peace matters as much as anyone else\'s.",
  },
  {
    placement: 'Scorpio Rising',
    sign: 'Scorpio',
    meaning:
      "You meet the world with intensity and depth. Others sense power beneath your surface. You see through facades and are drawn to life\'s mysteries and transformations.",
    traits: [
      'Intense and magnetic presence',
      'Deeply perceptive',
      'Private and mysterious',
      'Transformative energy',
      'Can appear intimidating or secretive',
    ],
    guidance:
      'Your intensity is not too much. Use your perceptive abilities ethically. Vulnerability with trusted others deepens your power.',
  },
  {
    placement: 'Sagittarius Rising',
    sign: 'Sagittarius',
    meaning:
      'You approach life with optimism and adventure. Others find your enthusiasm contagious. You are a seeker, always looking toward the next horizon and the bigger picture.',
    traits: [
      'Optimistic and enthusiastic',
      'Adventurous and freedom-loving',
      'Philosophical and wise',
      'Honest and direct',
      'Can appear restless or tactless',
    ],
    guidance:
      'Let your quest for meaning guide you. Ground your expansive vision with practical steps. Your honesty is refreshing when delivered with kindness.',
  },
  {
    placement: 'Capricorn Rising',
    sign: 'Capricorn',
    meaning:
      'You engage the world with seriousness and ambition. Others sense your capability and authority. You are climbing toward something meaningful, building legacy through discipline.',
    traits: [
      'Mature and responsible',
      'Ambitious and hardworking',
      'Reserved but reliable',
      'Ages in reverse (becomes lighter over time)',
      'Can appear cold or overly serious',
    ],
    guidance:
      'Your ambition is worthy. Allow yourself rest and pleasure along the climb. Success without joy is empty.',
  },
  {
    placement: 'Aquarius Rising',
    sign: 'Aquarius',
    meaning:
      'You meet the world as an individual, unafraid to be different. Others notice your unique approach and forward-thinking ideas. You are here to innovate and liberate.',
    traits: [
      'Independent and original',
      'Intellectually curious',
      'Humanitarian values',
      'Detached but friendly',
      'Can appear aloof or contrary',
    ],
    guidance:
      'Your uniqueness is essential. Balance your vision for humanity with intimate connection. Being different is not the same as being alone.',
  },
  {
    placement: 'Pisces Rising',
    sign: 'Pisces',
    meaning:
      'You flow through the world with sensitivity and imagination. Others sense your compassion and creative spirit. You dissolve boundaries and connect to the mystical.',
    traits: [
      'Dreamy and imaginative',
      'Deeply empathic',
      'Artistic and creative',
      'Spiritually attuned',
      'Can appear escapist or unclear',
    ],
    guidance:
      'Your sensitivity is a superpower. Create boundaries to prevent overwhelm. Channel your imagination into creative expression.',
  },
];

const MOON_SIGNS: PdfBirthChartSection[] = [
  {
    placement: 'What Is Your Moon Sign?',
    meaning:
      'Your Moon sign reveals your emotional nature—how you feel, process emotions, and nurture yourself and others. While your Sun represents your conscious identity, your Moon represents your unconscious self, your instincts, and your emotional needs.',
    traits: [
      'Governs your emotional responses and inner world.',
      'Reveals what you need to feel safe and secure.',
      'Shows how you nurture and wish to be nurtured.',
      'Connects to your relationship with mother/caregivers.',
    ],
    guidance:
      'Understanding your Moon sign helps you honour your emotional needs. When you feel out of sorts, check if your Moon needs are being met.',
  },
  {
    placement: 'Aries Moon',
    sign: 'Aries',
    meaning:
      'You experience emotions quickly and intensely. Your feelings are immediate and action-oriented. You need independence and challenge to feel emotionally alive.',
    traits: [
      'Quick, fiery emotions',
      'Needs independence',
      'Processes through action',
      'Impatient with emotional processing',
      'Fiercely protective of loved ones',
    ],
    guidance:
      'Physical activity helps you process emotions. Allow yourself to feel without immediately acting. Your emotional courage inspires others.',
  },
  {
    placement: 'Taurus Moon',
    sign: 'Taurus',
    meaning:
      'You experience emotions slowly and steadily. You need security, comfort, and sensory pleasure to feel emotionally grounded. Change is difficult but growth is lasting.',
    traits: [
      'Steady, calm emotions',
      'Needs security and comfort',
      'Processes through the senses',
      'Slow to anger but formidable when pushed',
      'Loyal and dependable in love',
    ],
    guidance:
      'Create a comfortable environment that soothes your senses. Practice flexibility while honouring your need for stability.',
  },
  {
    placement: 'Gemini Moon',
    sign: 'Gemini',
    meaning:
      'You experience emotions mentally—processing feelings through talking, writing, and thinking. You need intellectual stimulation and variety to feel emotionally engaged.',
    traits: [
      'Changeable emotions',
      'Needs mental stimulation',
      'Processes through communication',
      'Can intellectualise feelings away',
      'Curious about emotional experiences',
    ],
    guidance:
      'Journaling and talking help you understand your feelings. Learn to sit with emotions before analysing them.',
  },
  {
    placement: 'Cancer Moon',
    sign: 'Cancer',
    meaning:
      'The Moon rules Cancer, making this its most natural expression. Your emotions run deep and you are highly intuitive. Home, family, and belonging are essential to your wellbeing.',
    traits: [
      'Deep, intuitive emotions',
      'Needs security and belonging',
      'Nurturing and protective',
      'Strongly connected to the past',
      'Mood changes with the Moon',
    ],
    guidance:
      'Create a home that feels like a sanctuary. Your sensitivity is a gift—protect it with healthy boundaries.',
  },
  {
    placement: 'Leo Moon',
    sign: 'Leo',
    meaning:
      'You experience emotions dramatically and generously. You need recognition, creative expression, and warmth to feel emotionally fulfilled. Your heart is big and wants to be seen.',
    traits: [
      'Warm, generous emotions',
      'Needs appreciation and recognition',
      'Creative emotional expression',
      'Proud and dignified in feelings',
      'Loyal and dramatic in love',
    ],
    guidance:
      'Express your feelings creatively. Allow yourself to receive the appreciation you so readily give others.',
  },
  {
    placement: 'Virgo Moon',
    sign: 'Virgo',
    meaning:
      'You experience emotions analytically—wanting to understand and improve how you feel. You need order, usefulness, and health routines to feel emotionally stable.',
    traits: [
      'Practical emotions',
      'Needs to be useful',
      'Processes through analysis',
      'Can be self-critical',
      'Shows love through service',
    ],
    guidance:
      'Allow yourself to feel without immediately fixing. Your desire to help is beautiful—extend that care to yourself.',
  },
  {
    placement: 'Libra Moon',
    sign: 'Libra',
    meaning:
      'You experience emotions relationally—needing harmony, partnership, and beauty to feel emotionally balanced. Conflict disturbs you deeply; you seek peace.',
    traits: [
      'Harmonious emotions',
      'Needs partnership and peace',
      'Processes through relationship',
      'Can prioritise others over self',
      'Graceful in emotional expression',
    ],
    guidance:
      'Your need for harmony is valid, but learn to tolerate conflict when necessary. Your peace matters as much as keeping the peace.',
  },
  {
    placement: 'Scorpio Moon',
    sign: 'Scorpio',
    meaning:
      'You experience emotions with profound intensity. Nothing is surface-level for you. You need depth, truth, and transformation to feel emotionally alive.',
    traits: [
      'Intense, deep emotions',
      'Needs authenticity',
      'Processes through transformation',
      'Holds feelings privately',
      'Powerful emotional healing abilities',
    ],
    guidance:
      'Your emotional depth is a gift. Find safe spaces to share your inner world. Transform pain into wisdom.',
  },
  {
    placement: 'Sagittarius Moon',
    sign: 'Sagittarius',
    meaning:
      'You experience emotions expansively—needing freedom, adventure, and meaning to feel emotionally fulfilled. Confinement and routine depress your spirits.',
    traits: [
      'Optimistic emotions',
      'Needs freedom and adventure',
      'Processes through philosophy',
      'Restless when confined',
      'Generous and enthusiastic in love',
    ],
    guidance:
      'Allow your spirit room to roam. Ground your optimism in reality without losing your faith in possibility.',
  },
  {
    placement: 'Capricorn Moon',
    sign: 'Capricorn',
    meaning:
      'You experience emotions with reserve and self-control. You need achievement, structure, and respect to feel emotionally secure. Feelings are private matters.',
    traits: [
      'Reserved emotions',
      'Needs achievement and respect',
      'Processes through work',
      'Controls emotional expression',
      'Reliable and steadfast in love',
    ],
    guidance:
      'Allow yourself to feel without judging your emotions as weak. Your strength includes vulnerability.',
  },
  {
    placement: 'Aquarius Moon',
    sign: 'Aquarius',
    meaning:
      'You experience emotions from a detached, objective perspective. You need intellectual connection, friendship, and causes to feel emotionally engaged.',
    traits: [
      'Detached emotions',
      'Needs intellectual connection',
      'Processes through ideas',
      'Uncomfortable with emotional intensity',
      'Values friendship in love',
    ],
    guidance:
      'Your emotional detachment protects you but can isolate. Let trusted others into your inner world.',
  },
  {
    placement: 'Pisces Moon',
    sign: 'Pisces',
    meaning:
      'You experience emotions as boundless—feeling everything, often absorbing the emotions of others. You need spiritual connection and creative expression for emotional wellbeing.',
    traits: [
      'Boundless emotions',
      'Needs spiritual connection',
      'Processes through imagination',
      'Highly empathic',
      'Romantic and idealistic in love',
    ],
    guidance:
      'Create boundaries to protect your sensitive emotional field. Channel your feelings into art, music, or spiritual practice.',
  },
];

const HOUSE_MEANINGS: PdfBirthChartSection[] = [
  {
    placement: 'The Twelve Houses',
    meaning:
      'The twelve houses represent different areas of life where planetary energies express themselves. Think of your birth chart as a stage—the signs are the costumes, the planets are the actors, and the houses are the scenes or settings where the action takes place.',
    traits: [
      'Houses are determined by your exact birth time and location.',
      'Each house governs specific life themes and experiences.',
      'Planets in houses show where you focus energy in that life area.',
      'Empty houses are still active—ruled by the sign on the cusp.',
    ],
    guidance:
      'To read your houses, you need an accurate birth chart calculated with your exact time and place of birth.',
  },
  {
    placement: '1st House: Self',
    meaning:
      'The House of Self, Identity, and Physical Body. This is your Ascendant—how you present yourself and initiate new experiences. It represents your physical appearance, personal style, and approach to life.',
    traits: [
      'Personal identity and self-image',
      'Physical body and appearance',
      'First impressions you make',
      'How you approach new situations',
    ],
    guidance:
      'Planets here strongly colour your personality and how others perceive you.',
  },
  {
    placement: '2nd House: Values',
    meaning:
      'The House of Money, Possessions, and Self-Worth. This house governs what you value—both materially and internally. It shows your relationship with money, possessions, and your sense of worthiness.',
    traits: [
      'Personal finances and income',
      'Material possessions',
      'Self-worth and values',
      'Talents and resources',
    ],
    guidance: 'Planets here influence how you earn, spend, and value yourself.',
  },
  {
    placement: '3rd House: Communication',
    meaning:
      'The House of Communication, Learning, and Siblings. This house governs how you think, learn, and communicate. It includes relationships with siblings, neighbours, and your local environment.',
    traits: [
      'Communication style',
      'Early education and learning',
      'Siblings and neighbours',
      'Short journeys and local travel',
    ],
    guidance:
      'Planets here shape your mental processes and communication abilities.',
  },
  {
    placement: '4th House: Home',
    meaning:
      'The House of Home, Family, and Roots. This is the foundation of your chart—representing home, family of origin, ancestry, and your inner emotional base. It connects to one parent (often the mother or more nurturing parent).',
    traits: [
      'Home and domestic life',
      'Family of origin',
      'Emotional foundations',
      'Ancestry and roots',
    ],
    guidance:
      'Planets here influence your sense of security and family dynamics.',
  },
  {
    placement: '5th House: Creativity',
    meaning:
      'The House of Creativity, Romance, and Children. This joyful house governs self-expression, creative pursuits, romantic affairs, children, and pleasure. It is where you play and shine.',
    traits: [
      'Creative self-expression',
      'Romance and dating',
      'Children',
      'Fun, hobbies, and pleasure',
    ],
    guidance: 'Planets here enhance your creative expression and joy in life.',
  },
  {
    placement: '6th House: Health',
    meaning:
      'The House of Health, Work, and Service. This house governs daily routines, physical health, work (as service, not career), and how you care for yourself and others.',
    traits: [
      'Daily routines and habits',
      'Physical health and wellness',
      'Work and service',
      'Pets and small animals',
    ],
    guidance:
      'Planets here influence your health patterns and daily life structure.',
  },
  {
    placement: '7th House: Partnership',
    meaning:
      'The House of Partnership and Marriage. Opposite your Ascendant, this house represents committed partnerships—marriage, business partners, and significant one-on-one relationships. It also shows what you project onto others.',
    traits: [
      'Marriage and committed partnership',
      'Business partnerships',
      'Open enemies',
      'What you seek in others',
    ],
    guidance: 'Planets here strongly influence your relationship patterns.',
  },
  {
    placement: '8th House: Transformation',
    meaning:
      'The House of Transformation, Shared Resources, and Death/Rebirth. This deep house governs intimacy, shared finances, inheritance, psychology, and profound transformation.',
    traits: [
      'Shared resources and finances',
      'Intimacy and sexuality',
      'Death, rebirth, transformation',
      'Inheritance and taxes',
    ],
    guidance: 'Planets here bring intensity to these deep life areas.',
  },
  {
    placement: '9th House: Expansion',
    meaning:
      'The House of Philosophy, Higher Learning, and Travel. This expansive house governs belief systems, higher education, long-distance travel, and the search for meaning.',
    traits: [
      'Higher education and philosophy',
      'Long-distance travel',
      'Belief systems and religion',
      'Publishing and broadcasting',
    ],
    guidance: 'Planets here expand your worldview and quest for meaning.',
  },
  {
    placement: '10th House: Career',
    meaning:
      'The House of Career, Public Life, and Legacy. At the top of your chart, this house represents your public image, career, reputation, and the legacy you build. It connects to one parent (often the father or more authoritative parent).',
    traits: [
      'Career and profession',
      'Public reputation',
      'Authority and status',
      'Life direction and legacy',
    ],
    guidance:
      'Planets here significantly shape your career path and public life.',
  },
  {
    placement: '11th House: Community',
    meaning:
      'The House of Friends, Groups, and Hopes. This social house governs friendships, group involvement, social causes, and your hopes and wishes for the future.',
    traits: [
      'Friendships and social circles',
      'Groups and organisations',
      'Hopes and wishes',
      'Humanitarian causes',
    ],
    guidance: 'Planets here influence your social life and future aspirations.',
  },
  {
    placement: '12th House: Spirituality',
    meaning:
      'The House of Spirituality, the Unconscious, and Hidden Matters. This mystical house governs what is hidden—the unconscious, secrets, dreams, spirituality, and self-undoing. It is also where you retreat and find solitude.',
    traits: [
      'Spirituality and the unconscious',
      'Dreams and imagination',
      'Solitude and retreat',
      'Hidden enemies and self-undoing',
    ],
    guidance:
      'Planets here work behind the scenes, often through dreams and intuition.',
  },
];
const SUN_SIGNS: PdfBirthChartSection[] = [
  {
    placement: 'What Is Your Sun Sign?',
    meaning:
      'Your Sun sign represents your core identity—who you are at your essence. It governs your sense of self, vitality, ego, and life purpose. While your Moon reflects your inner emotional world, your Sun reflects how you consciously express yourself and shine in the world.',
    traits: [
      'Represents your core identity and sense of self.',
      'Governs vitality, confidence, and life force.',
      'Shows how you express yourself authentically.',
      'Reflects your life purpose and personal growth path.',
    ],
    guidance:
      'Living in alignment with your Sun sign helps you feel energised and fulfilled. When you feel lost or drained, reconnecting with your Sun qualities restores your sense of purpose.',
  },
  {
    placement: 'Aries Sun',
    sign: 'Aries',
    meaning:
      'You are bold, driven, and instinctively courageous. You thrive when initiating, leading, and forging new paths. Life feels most alive when you are moving forward with passion.',
    traits: [
      'Natural leader',
      'Courageous and assertive',
      'Action-oriented',
      'Thrives on challenge',
      'Independent and pioneering',
    ],
    guidance:
      'Channel your energy into purposeful action. Practice patience and follow-through to ensure your sparks become lasting fires.',
  },
  {
    placement: 'Taurus Sun',
    sign: 'Taurus',
    meaning:
      'You are grounded, steady, and value stability. You build slowly but securely, finding fulfilment through comfort, beauty, and tangible results.',
    traits: [
      'Patient and reliable',
      'Values security and comfort',
      'Strong sense of self-worth',
      'Sensual and appreciative of beauty',
      'Persistent and determined',
    ],
    guidance:
      'Trust your natural pace. Growth does not require force. Flexibility allows your strength to remain supportive rather than rigid.',
  },
  {
    placement: 'Gemini Sun',
    sign: 'Gemini',
    meaning:
      'You are curious, adaptable, and mentally agile. You shine through communication, learning, and connection. Variety keeps your spirit alive.',
    traits: [
      'Quick-thinking and expressive',
      'Adaptable and curious',
      'Loves learning and sharing ideas',
      'Social and communicative',
      'Multifaceted personality',
    ],
    guidance:
      'Focus your attention to avoid scattering your energy. Depth is just as powerful as breadth.',
  },
  {
    placement: 'Cancer Sun',
    sign: 'Cancer',
    meaning:
      'You are nurturing, intuitive, and deeply protective of what matters to you. Your identity is shaped by emotional connection, home, and belonging.',
    traits: [
      'Emotionally intelligent',
      'Protective and caring',
      'Strong intuition',
      'Values family and home',
      'Deeply loyal',
    ],
    guidance:
      'Honour your sensitivity as strength. Balance caring for others with caring for yourself.',
  },
  {
    placement: 'Leo Sun',
    sign: 'Leo',
    meaning:
      'The Sun rules Leo, making this placement powerful and expressive. You are creative, confident, and born to shine. Self-expression is essential to your vitality.',
    traits: [
      'Charismatic and confident',
      'Creative self-expression',
      'Warm and generous',
      'Natural performer or leader',
      'Strong sense of pride',
    ],
    guidance:
      'Lead with heart, not ego. Your light is strongest when it uplifts others as well as yourself.',
  },
  {
    placement: 'Virgo Sun',
    sign: 'Virgo',
    meaning:
      'You are thoughtful, observant, and motivated by improvement. You find purpose through service, skill, and meaningful contribution.',
    traits: [
      'Detail-oriented and analytical',
      'Service-driven',
      'Practical and grounded',
      'Desires usefulness',
      'Refined sense of responsibility',
    ],
    guidance:
      'Release perfectionism. Your worth is not dependent on productivity. Allow space for imperfection and rest.',
  },
  {
    placement: 'Libra Sun',
    sign: 'Libra',
    meaning:
      'You are diplomatic, relational, and guided by balance and fairness. Harmony, beauty, and partnership shape your sense of self.',
    traits: [
      'Charming and diplomatic',
      'Values harmony and justice',
      'Relationship-oriented',
      'Aesthetic sensitivity',
      'Naturally cooperative',
    ],
    guidance:
      'Make decisions based on inner truth, not just external peace. Balance begins within.',
  },
  {
    placement: 'Scorpio Sun',
    sign: 'Scorpio',
    meaning:
      'You are intense, perceptive, and transformative. Your identity is shaped by depth, truth, and emotional honesty.',
    traits: [
      'Deeply intuitive',
      'Emotionally intense',
      'Transformative presence',
      'Private and perceptive',
      'Powerful resilience',
    ],
    guidance:
      'Trust vulnerability as strength. Transformation happens when you allow yourself to be seen.',
  },
  {
    placement: 'Sagittarius Sun',
    sign: 'Sagittarius',
    meaning:
      'You are expansive, optimistic, and driven by meaning. Freedom, exploration, and truth fuel your vitality.',
    traits: [
      'Adventurous spirit',
      'Philosophical mindset',
      'Optimistic and open-hearted',
      'Truth-seeking',
      'Loves growth and expansion',
    ],
    guidance:
      'Ground your vision so it can take form. Wisdom deepens when paired with commitment.',
  },
  {
    placement: 'Capricorn Sun',
    sign: 'Capricorn',
    meaning:
      'You are disciplined, purposeful, and resilient. You build your identity through achievement, responsibility, and long-term vision.',
    traits: [
      'Ambitious and focused',
      'Strong sense of duty',
      'Strategic thinker',
      'Resilient and patient',
      'Values respect and integrity',
    ],
    guidance:
      'Remember that success includes emotional fulfilment. Allow yourself moments of softness and joy.',
  },
  {
    placement: 'Aquarius Sun',
    sign: 'Aquarius',
    meaning:
      'You are innovative, independent, and future-focused. Your identity is shaped by originality, ideals, and collective progress.',
    traits: [
      'Independent thinker',
      'Humanitarian values',
      'Innovative and unconventional',
      'Intellectually driven',
      'Values freedom and authenticity',
    ],
    guidance:
      'Stay connected to your heart as well as your mind. Your ideas have power when they are emotionally grounded.',
  },
  {
    placement: 'Pisces Sun',
    sign: 'Pisces',
    meaning:
      'You are intuitive, compassionate, and spiritually attuned. Your identity is fluid, empathetic, and deeply connected to the unseen.',
    traits: [
      'Highly intuitive',
      'Compassionate and gentle',
      'Imaginative and creative',
      'Spiritually sensitive',
      'Emotionally porous',
    ],
    guidance:
      'Protect your energy with clear boundaries. Your sensitivity is a gift when grounded in self-awareness.',
  },
];

export function generateRisingSignContent(): PdfBirthChartPack {
  const additionalSections: PdfBirthChartSection[] = [
    {
      placement: 'How Your Rising Interacts with Sun and Moon',
      meaning:
        'Your Big Three—Sun, Moon, and Rising—work together to create your unique astrological profile. Understanding how they interact helps you see the full picture of your personality.',
      traits: [
        'Your Rising sign is how you present yourself—your "mask" or first impression.',
        'Your Sun sign is your core identity—who you are at your essence.',
        'Your Moon sign is your emotional nature—how you feel and what you need.',
        'When these align, you may feel more integrated and authentic.',
        'When they conflict, you may experience inner tension or complexity.',
      ],
      guidance:
        'Notice when you feel most yourself—this is likely when your Rising, Sun, and Moon are in harmony. When you feel conflicted, check which placement is being activated.',
      integration:
        'Journal about moments when you feel most authentic versus when you feel like you are wearing a mask. Which placement is dominant in each situation?',
    },
    {
      placement: 'Ascendant Ruler and Its Importance',
      meaning:
        'The planet that rules your Rising sign (your Ascendant ruler) is one of the most important planets in your chart. It shows how you express your Rising sign energy and where you focus much of your life energy.',
      traits: [
        'Each sign has a ruling planet that governs its energy.',
        "Your Ascendant ruler's house placement shows where you focus your Rising sign energy.",
        'The condition of your Ascendant ruler (its sign, aspects, etc.) affects how easily you express your Rising sign.',
        'A strong Ascendant ruler helps you embody your Rising sign qualities naturally.',
        'A challenged Ascendant ruler may make it harder to express your Rising sign authentically.',
      ],
      guidance:
        'To find your Ascendant ruler, identify which planet rules your Rising sign (e.g., Aries Rising = Mars ruler, Taurus Rising = Venus ruler). Then find where that planet is placed in your chart—this shows where your Rising energy is most active.',
      integration:
        "Research your Ascendant ruler and its placement. How does this planet's energy support or challenge your Rising sign expression?",
    },
  ];

  return {
    type: 'birthchart',
    slug: 'rising-sign-guide-pack',
    title: 'Rising Sign Guide',
    subtitle: 'Understanding your Ascendant',
    moodText:
      'Your rising sign is your cosmic first impression—the lens through which you see the world, and how the world first sees you.',
    perfectFor: [
      'Those who are new to understanding their birth chart.',
      'Anyone curious about first impressions and social approach.',
      'Those exploring the difference between Sun and Rising signs.',
    ],
    introText:
      'While your Sun sign represents your core identity, your rising sign shapes how you move through the world. This is the sign that was rising on the eastern horizon at your exact moment of birth—which is why your birth time is essential for accuracy.',
    sections: [...RISING_SIGNS, ...additionalSections],
    journalPrompts: [
      'How do people tend to describe me when they first meet me?',
      'Does my rising sign description resonate with how I approach new situations?',
      'How does my rising sign energy work with (or against) my Sun sign?',
      'What is my Ascendant ruler, and how does it influence my Rising sign expression?',
    ],
    closingText:
      'Thank you for exploring your rising sign with Lunary. Understanding your Ascendant adds valuable depth to your astrological portrait. You are not just one sign—you are a complex and beautiful blend of cosmic influences.',
    optionalAffirmation:
      'I embrace how I show up in the world. My first impression is authentic, and I move through life with intention and presence.',
  };
}

export function generateMoonSignContent(): PdfBirthChartPack {
  const moonRitualsSection: PdfBirthChartSection = {
    placement: 'Monthly Moon Rituals by Sign',
    meaning:
      'Each Moon sign has specific rituals and practices that honour its emotional nature. These rituals help you connect with your Moon energy and meet your emotional needs throughout the lunar cycle.',
    traits: [
      'Fire Moon Signs (Aries, Leo, Sagittarius): Rituals involving movement, fire, and active expression.',
      'Earth Moon Signs (Taurus, Virgo, Capricorn): Rituals involving grounding, nature, and physical comfort.',
      'Air Moon Signs (Gemini, Libra, Aquarius): Rituals involving communication, social connection, and mental clarity.',
      'Water Moon Signs (Cancer, Scorpio, Pisces): Rituals involving emotional release, water, and intuitive practices.',
    ],
    guidance:
      "During the New Moon in your Moon sign, set emotional intentions. During the Full Moon in your Moon sign, release what no longer serves your emotional wellbeing. Create a monthly ritual that honours your Moon sign's specific needs—whether that is movement for Fire Moons, grounding for Earth Moons, connection for Air Moons, or emotional release for Water Moons.",
    integration:
      'Create a personal Moon ritual based on your Moon sign. Practice it monthly, especially during the New and Full Moons in your Moon sign.',
  };

  return {
    type: 'birthchart',
    slug: 'moon-sign-emotional-blueprint-pack',
    title: 'Moon Sign Emotional Blueprint',
    subtitle: 'Understanding your emotional nature',
    moodText:
      'Your Moon sign reveals your emotional inner world—how you feel, what you need, and how you nurture yourself and others.',
    perfectFor: [
      'Understanding your emotional patterns and needs.',
      'Improving self-care based on your Moon sign.',
      'Deepening emotional intelligence and self-awareness.',
    ],
    introText:
      'While your Sun sign represents your conscious identity, your Moon sign reveals your unconscious emotional nature. Understanding your Moon helps you honour your deepest needs and navigate your inner world with greater awareness.',
    sections: [...MOON_SIGNS, moonRitualsSection],
    journalPrompts: [
      'What do I need to feel emotionally safe and secure?',
      'How do I typically process difficult emotions?',
      'Does my Moon sign description resonate with my inner experience?',
      'What monthly Moon ritual would best honour my emotional nature?',
    ],
    closingText:
      'Thank you for exploring your Moon sign with Lunary. May this understanding help you honour your emotional needs and navigate your inner world with greater compassion.',
    optionalAffirmation:
      'I honour my emotional needs. My feelings are valid, and I nurture myself with the same care I offer others.',
  };
}

export function generateHouseMeaningsContent(): PdfBirthChartPack {
  const worksheetSection: PdfBirthChartSection = {
    placement: 'Worksheet: Mapping Your Chart Houses',
    meaning:
      'Use this worksheet to map your personal birth chart houses and understand where planetary energies are active in your life.',
    traits: [
      'List all 12 houses and note which sign is on the cusp of each house.',
      'Identify which houses contain planets (these are your most active life areas).',
      'Note which houses are empty (still important—ruled by the sign on the cusp).',
      "Identify your house rulers (the planet that rules each house's sign).",
      'Note which houses are angular (1, 4, 7, 10), succedent (2, 5, 8, 11), or cadent (3, 6, 9, 12).',
    ],
    guidance:
      'Create a chart with 12 sections, one for each house. For each house, write: the sign on the cusp, any planets in that house, the house ruler, and key life themes. This visual map helps you see where energy is concentrated in your chart.',
    integration:
      'Complete this worksheet with your birth chart. Notice patterns—are most planets in angular houses (action-oriented) or cadent houses (adaptable)? This reveals your life approach.',
  };

  return {
    type: 'birthchart',
    slug: 'house-meanings-pack',
    title: 'House Meanings Guide',
    subtitle: 'The twelve arenas of life',
    moodText:
      'The twelve houses represent different areas of life where planetary energies play out—from identity to spirituality, relationships to career.',
    perfectFor: [
      'Understanding where life themes manifest in your chart.',
      'Reading your birth chart more deeply.',
      'Knowing which houses transits will affect.',
    ],
    introText:
      'Think of your birth chart as a stage. The planets are the actors, the signs are their costumes, and the houses are the scenes where the action takes place. Understanding houses helps you see where in your life each planetary energy expresses itself.',
    sections: [...HOUSE_MEANINGS, worksheetSection],
    journalPrompts: [
      'Which houses have planets in my chart, and what does that suggest?',
      'Which life areas feel most active or challenging for me?',
      'How might understanding houses change my approach to transits?',
      'What patterns do I notice when mapping my houses?',
    ],
    closingText:
      "Thank you for exploring the houses with Lunary. May this knowledge help you understand where life\'s themes are playing out in your unique chart.",
    optionalAffirmation:
      'I understand the different arenas of my life. Each house offers lessons, and I navigate them all with awareness.',
  };
}

export function generateSunSignContent() {
  return {
    title: 'Your Sun Sign',
    sections: [
      {
        heading: 'Core Identity',
        body: 'Your Sun sign represents your core essence, ego, vitality, and sense of purpose. It describes who you are becoming and what fuels your life force.',
      },
      {
        heading: 'Strengths and Expression',
        body: 'This placement highlights your natural strengths, creative expression, and how you shine when fully aligned with yourself.',
      },
      {
        heading: 'Life Direction',
        body: 'Your Sun sign points to the themes you are here to embody and the lessons that shape your growth.',
      },
    ],
  };
}

export function generateBig3Content(): PdfBirthChartPack {
  const big3Sections: PdfBirthChartSection[] = [
    {
      placement: 'How Your Big 3 Work Together',
      meaning:
        'Your Sun, Moon, and Rising signs form a trinity that creates your unique astrological identity. Understanding how they interact reveals the complexity and richness of your personality.',
      traits: [
        'Sun (Core Identity) + Moon (Emotional Nature) + Rising (Social Mask) = Your Complete Self',
        'When all three align in element or modality, you may feel more integrated.',
        'When they conflict, you may experience inner complexity or tension.',
        'Each placement brings different qualities to your personality.',
        'The interplay between them creates your unique expression.',
      ],
      guidance:
        'Notice when you feel most yourself—this is likely when all three placements are in harmony. When you feel conflicted, identify which placement is being activated and honour its needs.',
      integration:
        'Journal about how your Sun, Moon, and Rising interact. When do they support each other? When do they create tension? How can you honour all three?',
    },
    {
      placement: '144 Big 3 Combination Interpretations',
      meaning:
        'With 12 possible signs for each placement (Sun, Moon, Rising), there are 12 × 12 × 12 = 1,728 possible combinations. However, certain patterns emerge that help interpret how your specific Big 3 work together.',
      traits: [
        'Element combinations: All Fire (passionate, action-oriented), All Earth (grounded, practical), All Air (intellectual, social), All Water (emotional, intuitive), or Mixed (balanced or complex).',
        'Modality combinations: All Cardinal (initiating), All Fixed (stable), All Mutable (adaptable), or Mixed (flexible approach).',
        "Ruler combinations: When your Sun, Moon, and Rising share a ruling planet, that planet's energy is amplified.",
        'Opposition patterns: When placements oppose each other (e.g., Aries Sun, Libra Rising), you may experience tension or need balance.',
        'Trine patterns: When placements trine each other (e.g., Fire signs together), energy flows easily.',
      ],
      guidance:
        'While we cannot list all 1,728 combinations, understanding element, modality, and aspect patterns helps you interpret your unique Big 3. Focus on how your specific combination creates your unique expression.',
      integration:
        "Identify your Big 3's elements, modalities, and any aspect patterns. How do these patterns create your unique personality blend?",
    },
    {
      placement: 'Integration Worksheet for Your Specific Combo',
      meaning:
        'Use this worksheet to deeply understand how your unique Sun, Moon, and Rising combination creates your personality and life experience.',
      traits: [
        'Section 1: List your Sun, Moon, and Rising signs with their key qualities.',
        'Section 2: Identify how they support each other (compatible elements, harmonious aspects).',
        'Section 3: Identify where they create tension (conflicting needs, opposing energies).',
        'Section 4: Write how you can honour all three placements in daily life.',
        'Section 5: Note which placement feels most dominant and which needs more expression.',
        'Section 6: Create affirmations that honour all three placements.',
      ],
      guidance:
        'Complete this worksheet thoughtfully. There are no right or wrong answers—only deeper understanding of your unique astrological makeup. Revisit it as you grow and change.',
      integration:
        'Fill out this worksheet with your specific Big 3 combination. Use it as a reference for understanding yourself and making decisions that honour all parts of your nature.',
    },
    {
      placement: 'Ritual for Honouring Your Big 3',
      meaning:
        'Create a personal ritual to honour and integrate your Sun, Moon, and Rising signs. This practice helps you connect with all three parts of your astrological identity.',
      traits: [
        'Gather three candles (one for each placement) in colours that represent each sign.',
        'Set up a sacred space with symbols or items representing your Sun, Moon, and Rising.',
        "Light each candle while speaking about that placement's qualities.",
        'Meditate on how all three work together in your life.',
        'Create an intention that honours all three placements.',
        'Close by thanking each placement for its gifts.',
      ],
      guidance:
        'Perform this ritual monthly, especially during the New Moon. It helps you stay connected to all parts of your astrological identity and integrate their energies consciously.',
      integration:
        'Create and perform this ritual. Notice how it helps you feel more integrated and authentic. Adjust it over time as you deepen your understanding of your Big 3.',
    },
  ];

  return {
    type: 'birthchart',
    slug: 'big-3-bundle-pack',
    title: 'Your Big 3 Astrology Blueprint',
    subtitle: 'Sun, Moon, and Rising',
    sections: [...SUN_SIGNS, ...MOON_SIGNS, ...RISING_SIGNS, ...big3Sections],
    moodText:
      'Your Big Three—Sun, Moon, and Rising—form the foundation of your astrological identity. Understanding how they work together reveals the complexity and beauty of who you are.',
    perfectFor: [
      'Those seeking to understand their core astrological identity.',
      'Anyone curious how their placements interact.',
      'Those building a foundation for deeper chart study.',
    ],
    introText:
      'Your Sun sign is your core identity, your Moon sign is your emotional nature, and your Rising sign is how you present yourself to the world. Together, they create your unique astrological blueprint.',
    journalPrompts: [
      'How do my Sun, Moon, and Rising signs work together?',
      'Which placement feels most dominant in my daily life?',
      'How can I honour all three placements more fully?',
      'What does my Big 3 combination reveal about my life path?',
    ],
    closingText:
      'Thank you for exploring your Big 3 with Lunary. You are not just one sign—you are a beautiful, complex blend of cosmic influences. Honour all parts of yourself.',
    optionalAffirmation:
      'I honour my Sun, Moon, and Rising. All parts of my astrological identity are valid and valuable.',
  };
}
