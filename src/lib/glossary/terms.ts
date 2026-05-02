/**
 * Glossary library for astrological terms.
 *
 * Used by `<AutoLinkText>`, `<GlossaryTooltip>`, and `<GlossarySheet>`
 * to surface inline definitions in horoscope copy, transit cards, and
 * aspect modals. Tone is warm, second-person where natural, no academic
 * jargon-on-jargon.
 */

export type GlossaryCategory =
  | 'planet'
  | 'sign'
  | 'house'
  | 'aspect'
  | 'concept'
  | 'point'
  | 'phase';

export type GlossaryTerm = {
  /** Stable id used for routing/linking, e.g. 'mercury', 'aspect-conjunction', 'house-7'. */
  id: string;
  /** Canonical display name. */
  term: string;
  /** Alternate spellings, abbreviations, and shorthand the matcher should also catch. */
  aliases: string[];
  category: GlossaryCategory;
  /** One-sentence summary, surfaced in the tooltip. */
  short: string;
  /** 2-4 sentence expanded definition, surfaced in the sheet. */
  long: string;
  /** Glyph if applicable (planet/sign/aspect symbol). */
  symbol?: string;
};

// ---------------------------------------------------------------------------
// PLANETS
// ---------------------------------------------------------------------------

const PLANETS: GlossaryTerm[] = [
  {
    id: 'sun',
    term: 'Sun',
    aliases: ['the Sun', 'solar', 'sol'],
    category: 'planet',
    symbol: '\u2609',
    short: 'Your core identity and creative life-force.',
    long: 'The Sun is who you are at the center of everything — your vitality, ego, and the part of you that wants to shine. It rules creative self-expression, leadership, and the life path you are here to walk.',
  },
  {
    id: 'moon',
    term: 'Moon',
    aliases: ['the Moon', 'lunar', 'luna'],
    category: 'planet',
    symbol: '\u263D',
    short: 'Your inner life, feelings, and emotional muscle memory.',
    long: 'The Moon rules your private world: moods, instincts, what soothes you, what makes you feel safe. She moves fastest of all the bodies and colors your day-to-day emotional weather. Your Moon sign is often closer to who you are at home than your Sun.',
  },
  {
    id: 'mercury',
    term: 'Mercury',
    aliases: ['Hermes'],
    category: 'planet',
    symbol: '\u263F',
    short: 'How you think, speak, learn, and connect dots.',
    long: 'Mercury rules the mind in motion — language, curiosity, the way information moves through you. It governs commerce, siblings, short trips, and any kind of translation between worlds. When Mercury goes retrograde, communication and tech feel slippery.',
  },
  {
    id: 'venus',
    term: 'Venus',
    aliases: ['Aphrodite'],
    category: 'planet',
    symbol: '\u2640',
    short: 'What you love, how you love, and what you find beautiful.',
    long: 'Venus rules attraction, pleasure, art, and value — both money and self-worth. She shapes your taste and the way you draw things in. Where Venus sits in your chart is where you most easily say yes to beauty.',
  },
  {
    id: 'mars',
    term: 'Mars',
    aliases: ['Ares'],
    category: 'planet',
    symbol: '\u2642',
    short: 'Drive, desire, and how you go after what you want.',
    long: 'Mars is the engine — assertion, anger, courage, sex, the way you fight. It rules action and the muscle behind your wanting. A well-used Mars feels like clean, directed force; a stuck one shows up as frustration or burnout.',
  },
  {
    id: 'jupiter',
    term: 'Jupiter',
    aliases: ['Jove', 'Zeus'],
    category: 'planet',
    symbol: '\u2643',
    short: 'Growth, luck, and the stories that expand you.',
    long: 'Jupiter rules expansion in every direction: travel, teaching, belief, abundance, generosity. He is the planet of more — more opportunity, more meaning, sometimes more than you can hold. Where Jupiter touches your chart, life wants to enlarge.',
  },
  {
    id: 'saturn',
    term: 'Saturn',
    aliases: ['Cronus', 'Kronos'],
    category: 'planet',
    symbol: '\u2644',
    short: 'Structure, discipline, and the gift inside the limit.',
    long: 'Saturn rules time, responsibility, mastery, and the part of you that has to grow up. It is the inner taskmaster — sometimes painful, always teaching. The areas Saturn touches mature slowly but build something durable.',
  },
  {
    id: 'uranus',
    term: 'Uranus',
    aliases: [],
    category: 'planet',
    symbol: '\u2645',
    short: 'Lightning, rebellion, and sudden becoming.',
    long: 'Uranus rules disruption, awakening, and the shocks that pry you loose from a smaller life. It governs technology, freedom, and anything that breaks the pattern. Where Uranus moves, the unexpected becomes the doorway.',
  },
  {
    id: 'neptune',
    term: 'Neptune',
    aliases: ['Poseidon'],
    category: 'planet',
    symbol: '\u2646',
    short: 'Dream, myth, and dissolving boundaries.',
    long: 'Neptune rules imagination, spirituality, music, and the longing for something beyond. He blurs edges, both beautifully (compassion, art, mysticism) and confusingly (fog, illusion, escapism). Neptune asks what you are willing to surrender to.',
  },
  {
    id: 'pluto',
    term: 'Pluto',
    aliases: ['Hades'],
    category: 'planet',
    symbol: '\u2647',
    short: 'Power, depth, and the soul\u2019s cauldron.',
    long: 'Pluto rules transformation through death and rebirth — what gets stripped away so the truth can come through. He governs power dynamics, obsession, taboo, and the underworld in you. Pluto transits remake the territory they touch.',
  },
];

// ---------------------------------------------------------------------------
// ASTEROIDS / POINTS
// ---------------------------------------------------------------------------

const POINTS: GlossaryTerm[] = [
  {
    id: 'chiron',
    term: 'Chiron',
    aliases: ['the wounded healer'],
    category: 'point',
    symbol: '\u26B7',
    short: 'The wound that becomes the medicine.',
    long: 'Chiron points to a place in your life where something hurts in a way that never fully closes — and exactly because of that, where you can hold the same pain in others. Where Chiron sits, you become a quiet teacher.',
  },
  {
    id: 'lilith',
    term: 'Lilith',
    aliases: ['Black Moon Lilith', 'BML'],
    category: 'point',
    short: 'The exiled feminine — your refusal to be tamed.',
    long: 'Black Moon Lilith marks the part of you that will not be domesticated, edited, or made smaller for someone else\u2019s comfort. Her placement shows where you have been shamed or pushed underground, and where reclaiming her is non-negotiable.',
  },
  {
    id: 'north-node',
    term: 'North Node',
    aliases: ['Rahu', 'NN'],
    category: 'point',
    symbol: '\u260A',
    short: 'The growth edge — the unfamiliar work of this life.',
    long: 'The North Node is the direction your soul is reaching toward this lifetime. It rarely feels easy at first; it asks for new muscles. Following it tends to feel slightly uncomfortable and deeply right.',
  },
  {
    id: 'south-node',
    term: 'South Node',
    aliases: ['Ketu', 'SN'],
    category: 'point',
    symbol: '\u260B',
    short: 'The familiar — gifts you already carry.',
    long: 'The South Node is what you arrived knowing how to do. It is the comfortable groove, the talents that come effortlessly, and also the place you can hide. Used well, it fuels the journey to the North Node.',
  },
  {
    id: 'part-of-fortune',
    term: 'Part of Fortune',
    aliases: ['Lot of Fortune', 'Fortuna', 'Pars Fortunae'],
    category: 'point',
    short: 'Where ease, luck, and natural flourishing live.',
    long: 'Calculated from your Sun, Moon, and Ascendant, the Part of Fortune marks where joy, prosperity, and a sense of rightness come most easily. It is a clue to what kind of life actually feels good in your body.',
  },
  {
    id: 'vertex',
    term: 'Vertex',
    aliases: ['fated point'],
    category: 'point',
    short: 'The fated meeting point — where destiny knocks.',
    long: 'The Vertex is often called the third angle. It tends to activate in pivotal encounters and turning points that feel arranged by something larger. Aspects to the Vertex often mark people and moments that change your trajectory.',
  },
  {
    id: 'ascendant',
    term: 'Ascendant',
    aliases: ['Asc', 'AC', 'Rising', 'Rising Sign'],
    category: 'point',
    short: 'The mask you arrive in — your first impression and life approach.',
    long: 'The Ascendant is the sign rising on the eastern horizon at your birth. It colors how you meet the world, your physical presence, and the first chapter of any new beginning. It also rules your body and the shape of this life.',
  },
  {
    id: 'descendant',
    term: 'Descendant',
    aliases: ['DC', 'DSC'],
    category: 'point',
    short: 'What you meet in others — the partnership mirror.',
    long: 'The Descendant is the cusp opposite the Ascendant: it describes the qualities you draw close through one-on-one relationships. Often, it shows traits you do not own in yourself yet, and so meet through other people.',
  },
  {
    id: 'midheaven',
    term: 'Midheaven',
    aliases: ['MC', 'Medium Coeli'],
    category: 'point',
    short: 'Your public face, vocation, and highest reach.',
    long: 'The Midheaven is the highest point of your chart. It points to career, reputation, calling, and what you are visible for. It is less the job title and more the shape of your contribution.',
  },
  {
    id: 'ic',
    term: 'IC',
    aliases: ['Imum Coeli', 'Nadir'],
    category: 'point',
    short: 'Your roots, home, and inner foundation.',
    long: 'The IC is the lowest point of your chart, opposite the Midheaven. It rules family of origin, ancestry, the literal home, and the private self that hardly anyone sees. Healing here is generational.',
  },
  {
    id: 'ceres',
    term: 'Ceres',
    aliases: ['Demeter'],
    category: 'point',
    short: 'How you nurture and how you grieve.',
    long: 'Ceres rules nourishment, food, the cycles of giving care and losing it, and the way you grieve and recover. Her placement shows how you parent yourself and others, and what makes you feel truly fed.',
  },
  {
    id: 'pallas',
    term: 'Pallas',
    aliases: ['Pallas Athena', 'Athena'],
    category: 'point',
    short: 'Strategic intelligence and pattern recognition.',
    long: 'Pallas Athena rules the way you see structure, solve problems, and weave clever solutions. She is the warrior-strategist: a mind that fights with insight rather than force.',
  },
  {
    id: 'juno',
    term: 'Juno',
    aliases: ['Hera'],
    category: 'point',
    short: 'The terms of your committed partnership.',
    long: 'Juno describes what you actually need in a long-term partner — the bond style, the deal-breakers, the loyalty contract. She is less about attraction and more about who you stay with.',
  },
  {
    id: 'vesta',
    term: 'Vesta',
    aliases: ['Hestia'],
    category: 'point',
    short: 'Sacred focus — the hearth you keep alight.',
    long: 'Vesta rules devoted, single-pointed attention: the work, person, or practice you tend like a flame. Her placement shows where you are willing to be monastic to keep something pure.',
  },
];

// ---------------------------------------------------------------------------
// SIGNS
// ---------------------------------------------------------------------------

const SIGNS: GlossaryTerm[] = [
  {
    id: 'aries',
    term: 'Aries',
    aliases: ['the Ram'],
    category: 'sign',
    symbol: '\u2648',
    short: 'Cardinal Fire, ruled by Mars — the spark that starts.',
    long: 'Aries is the first sign of the zodiac: pure beginning, pure go. The Aries archetype is brave, blunt, impulsive, and protective. It rules new chapters and the courage it takes to lead.',
  },
  {
    id: 'taurus',
    term: 'Taurus',
    aliases: ['the Bull'],
    category: 'sign',
    symbol: '\u2649',
    short: 'Fixed Earth, ruled by Venus — the steady sensualist.',
    long: 'Taurus is grounded, slow, embodied, and devoted to pleasure that lasts. It rules the body, money, the things you touch every day, and the patience required to grow real value over time.',
  },
  {
    id: 'gemini',
    term: 'Gemini',
    aliases: ['the Twins'],
    category: 'sign',
    symbol: '\u264A',
    short: 'Mutable Air, ruled by Mercury — the curious connector.',
    long: 'Gemini is the messenger: quick, witty, plural, fascinated by everything. It rules language, siblings, near-by movement, and the talent for holding two truths at once.',
  },
  {
    id: 'cancer',
    term: 'Cancer',
    aliases: ['the Crab'],
    category: 'sign',
    symbol: '\u264B',
    short: 'Cardinal Water, ruled by the Moon — the homemaker.',
    long: 'Cancer feels everything and remembers it. It rules family, home, food, mothering, and the protective shell that lets the soft inside survive. The Cancer archetype is fiercely loyal and emotionally attuned.',
  },
  {
    id: 'leo',
    term: 'Leo',
    aliases: ['the Lion'],
    category: 'sign',
    symbol: '\u264C',
    short: 'Fixed Fire, ruled by the Sun — the radiant heart.',
    long: 'Leo is here to be seen, loved, and to give back the same warmth. It rules creative self-expression, romance, play, children, and the courage to say this is mine.',
  },
  {
    id: 'virgo',
    term: 'Virgo',
    aliases: ['the Virgin', 'the Maiden'],
    category: 'sign',
    symbol: '\u264D',
    short: 'Mutable Earth, ruled by Mercury — the careful craftswoman.',
    long: 'Virgo refines. She rules health, daily ritual, service, and the loving discipline of getting better at the small things. The Virgo archetype is precise, devoted, and secretly tender.',
  },
  {
    id: 'libra',
    term: 'Libra',
    aliases: ['the Scales'],
    category: 'sign',
    symbol: '\u264E',
    short: 'Cardinal Air, ruled by Venus — the relational diplomat.',
    long: 'Libra is the sign of we. It rules partnership, beauty, fairness, and the art of holding tension between two sides. Libra teaches that grace is itself a kind of strength.',
  },
  {
    id: 'scorpio',
    term: 'Scorpio',
    aliases: ['the Scorpion'],
    category: 'sign',
    symbol: '\u264F',
    short: 'Fixed Water, ruled by Pluto/Mars — the depth alchemist.',
    long: 'Scorpio is intensity that does not flinch. It rules sex, death, shared resources, secrets, and transformation. The Scorpio archetype goes all the way to the bottom and brings something back.',
  },
  {
    id: 'sagittarius',
    term: 'Sagittarius',
    aliases: ['the Archer'],
    category: 'sign',
    symbol: '\u2650',
    short: 'Mutable Fire, ruled by Jupiter — the wide-eyed seeker.',
    long: 'Sagittarius is the truth-teller and the traveler. It rules belief systems, foreign places, higher learning, and the holy refusal to live a small life. Optimism, with an edge.',
  },
  {
    id: 'capricorn',
    term: 'Capricorn',
    aliases: ['the Goat', 'the Sea-Goat'],
    category: 'sign',
    symbol: '\u2651',
    short: 'Cardinal Earth, ruled by Saturn — the long-haul builder.',
    long: 'Capricorn is mastery over time. It rules ambition, legacy, structure, and the patient climb. The Capricorn archetype is dry, disciplined, and quietly hilarious once you are in the inner circle.',
  },
  {
    id: 'aquarius',
    term: 'Aquarius',
    aliases: ['the Water-Bearer'],
    category: 'sign',
    symbol: '\u2652',
    short: 'Fixed Air, ruled by Saturn/Uranus — the future-builder.',
    long: 'Aquarius is the sign of the collective and the outsider both. It rules friendship, networks, technology, and the visions that pull humanity forward. Cool on the surface, radically loyal underneath.',
  },
  {
    id: 'pisces',
    term: 'Pisces',
    aliases: ['the Fishes'],
    category: 'sign',
    symbol: '\u2653',
    short: 'Mutable Water, ruled by Jupiter/Neptune — the dreaming heart.',
    long: 'Pisces is where the borders between self and other thin out. It rules art, mysticism, compassion, and dissolution. The Pisces archetype is intuitive, sensitive, and quietly mystical even in normal clothes.',
  },
];

// ---------------------------------------------------------------------------
// HOUSES
// ---------------------------------------------------------------------------

const HOUSES: GlossaryTerm[] = [
  {
    id: 'house-1',
    term: '1st House',
    aliases: ['First House', 'house of self', 'Ascendant house'],
    category: 'house',
    short: 'Self, body, and the way you arrive.',
    long: 'The 1st House describes how you show up — your appearance, vibe, and the way new chapters begin. It is the doorway to your life. The sign on the cusp here is your Rising Sign.',
  },
  {
    id: 'house-2',
    term: '2nd House',
    aliases: ['Second House', 'house of money', 'house of values'],
    category: 'house',
    short: 'Money, values, and the body as resource.',
    long: 'The 2nd House rules what you own and what you treasure — earnings, possessions, self-worth, the body, and the things that feel solid. It is the slow build of value, both inner and outer.',
  },
  {
    id: 'house-3',
    term: '3rd House',
    aliases: ['Third House', 'house of communication'],
    category: 'house',
    short: 'Mind, voice, siblings, and the near-at-hand.',
    long: 'The 3rd House rules everyday communication, learning, short journeys, neighborhood, and the bond with siblings. It is the realm of the moving mind and the thousand small exchanges that make a life.',
  },
  {
    id: 'house-4',
    term: '4th House',
    aliases: ['Fourth House', 'house of home', 'IC house'],
    category: 'house',
    short: 'Home, family, roots, and the inner sanctum.',
    long: 'The 4th House rules family of origin, ancestry, the literal home, and the most private self. Healing here often reaches back several generations. The cusp here is the IC.',
  },
  {
    id: 'house-5',
    term: '5th House',
    aliases: ['Fifth House', 'house of pleasure', 'house of creativity'],
    category: 'house',
    short: 'Play, romance, creativity, and children.',
    long: 'The 5th House is the joy room: art, flirtation, dating, performance, hobbies, and children (literal or creative). It rules the part of you that creates for the love of it.',
  },
  {
    id: 'house-6',
    term: '6th House',
    aliases: ['Sixth House', 'house of health', 'house of work'],
    category: 'house',
    short: 'Daily routine, health, work, and service.',
    long: 'The 6th House rules the rhythms that keep you alive — sleep, food, exercise, work tasks, pets, and the way you serve others. The small repetitions here build the larger life.',
  },
  {
    id: 'house-7',
    term: '7th House',
    aliases: ['Seventh House', 'house of partnership', 'Descendant house'],
    category: 'house',
    short: 'Partnership, the close other, and one-to-one mirrors.',
    long: 'The 7th House rules committed partnerships — marriage, business partners, close adversaries — and the qualities you tend to draw close through other people. The cusp here is the Descendant.',
  },
  {
    id: 'house-8',
    term: '8th House',
    aliases: [
      'Eighth House',
      'house of transformation',
      'house of sex and death',
    ],
    category: 'house',
    short: 'Intimacy, shared resources, transformation, and taboo.',
    long: 'The 8th House rules deep intimacy, sex, death, inheritance, debt, therapy, and the parts of life shared with another. It is the underworld house — the place you go to be remade.',
  },
  {
    id: 'house-9',
    term: '9th House',
    aliases: ['Ninth House', 'house of philosophy', 'house of travel'],
    category: 'house',
    short: 'Belief, study, foreign lands, and the long view.',
    long: 'The 9th House rules higher learning, religion, philosophy, publishing, and travel that changes you. It is the search for meaning that pulls you past the familiar.',
  },
  {
    id: 'house-10',
    term: '10th House',
    aliases: ['Tenth House', 'house of career', 'MC house'],
    category: 'house',
    short: 'Career, public role, calling, and reputation.',
    long: 'The 10th House rules vocation, status, and the part of life you are visible for. It is less the job description and more the shape of your contribution. The cusp here is the Midheaven.',
  },
  {
    id: 'house-11',
    term: '11th House',
    aliases: ['Eleventh House', 'house of friends', 'house of community'],
    category: 'house',
    short: 'Friendship, community, networks, and shared dreams.',
    long: 'The 11th House rules chosen family, the groups you belong to, and the futures you build together. It is also the house of long-term hopes — the things you want, even if they take years.',
  },
  {
    id: 'house-12',
    term: '12th House',
    aliases: ['Twelfth House', 'house of the unconscious', 'house of secrets'],
    category: 'house',
    short: 'The unconscious, solitude, and what is hidden.',
    long: 'The 12th House rules dreams, retreat, hospitals, prisons, secret enemies, mystical practice, and the parts of you that live below the line of awareness. It is where you go to rest and to dissolve.',
  },
];

// ---------------------------------------------------------------------------
// ASPECTS
// ---------------------------------------------------------------------------

const ASPECTS: GlossaryTerm[] = [
  {
    id: 'aspect-conjunction',
    term: 'Conjunction',
    aliases: ['conj'],
    category: 'aspect',
    symbol: '\u260C',
    short: '0\u00B0 — fusion. Two energies blend into one.',
    long: 'A conjunction happens when two planets sit on top of each other in the sky. Their themes merge and amplify each other — for better or worse, you cannot have one without the other. Tone: intense, defining.',
  },
  {
    id: 'aspect-opposition',
    term: 'Opposition',
    aliases: ['opp'],
    category: 'aspect',
    symbol: '\u260D',
    short: '180\u00B0 — tension. Two energies pull in opposite directions.',
    long: 'An opposition is a face-off between two planets across the chart. It often shows up as projection (you meet the energy through other people) until you can hold both ends at once. Tone: challenging but balancing.',
  },
  {
    id: 'aspect-trine',
    term: 'Trine',
    aliases: [],
    category: 'aspect',
    symbol: '\u25B3',
    short: '120\u00B0 — flow. Two energies cooperate effortlessly.',
    long: 'A trine is the easy aspect: the two planets share an element and pour into each other without friction. Tone: harmonious, gifted, sometimes too easy to notice you have it.',
  },
  {
    id: 'aspect-square',
    term: 'Square',
    aliases: [],
    category: 'aspect',
    symbol: '\u25A1',
    short: '90\u00B0 — friction. Two energies grind against each other.',
    long: 'A square is the muscle-builder of aspects. Two planets in the same modality but different elements push at each other until you do something about it. Tone: challenging, generative — squares are where the work happens.',
  },
  {
    id: 'aspect-sextile',
    term: 'Sextile',
    aliases: [],
    category: 'aspect',
    symbol: '\u26B9',
    short: '60\u00B0 — opportunity. Two energies offer a hand if you take it.',
    long: 'A sextile is a low-effort, high-yield aspect: it opens a door but does not push you through. Tone: harmonious, possibility — easier to act on than a trine because the contrast wakes you up.',
  },
  {
    id: 'aspect-quincunx',
    term: 'Quincunx',
    aliases: ['inconjunct'],
    category: 'aspect',
    symbol: '\u26BB',
    short:
      '150\u00B0 — adjustment. Two energies that do not quite speak the same language.',
    long: 'A quincunx links two planets that share neither element nor modality. The two themes need ongoing tweaking to coexist. Tone: awkward, fertile — usually pointed at health, work, or the body.',
  },
  {
    id: 'aspect-semi-square',
    term: 'Semi-square',
    aliases: ['semisquare'],
    category: 'aspect',
    short: '45\u00B0 — minor friction. A small itch.',
    long: 'A semi-square is half a square. The themes mildly chafe and ask for low-grade adjustments. Tone: minor challenging — easy to ignore, but often the source of background irritation.',
  },
  {
    id: 'aspect-sesquiquadrate',
    term: 'Sesquiquadrate',
    aliases: ['sesquisquare'],
    category: 'aspect',
    short: '135\u00B0 — minor tension. A delayed friction.',
    long: 'A sesquiquadrate is one and a half squares. It tends to surface as recurring small frictions, especially around timing. Tone: minor challenging.',
  },
  {
    id: 'aspect-quintile',
    term: 'Quintile',
    aliases: [],
    category: 'aspect',
    short: '72\u00B0 — creative talent.',
    long: 'A quintile points to a creative or unusual gift — a particular talent for combining the two planet\u2019s energies in an artistic way. Tone: subtle, talent-bearing.',
  },
];

// ---------------------------------------------------------------------------
// CONCEPTS
// ---------------------------------------------------------------------------

const CONCEPTS: GlossaryTerm[] = [
  {
    id: 'retrograde',
    term: 'Retrograde',
    aliases: ['retro', 'rx'],
    category: 'concept',
    symbol: '\u211E',
    short: 'When a planet appears to move backward — review time.',
    long: 'A retrograde planet looks, from Earth, like it is reversing course. The themes it rules turn inward: review, revise, reconsider. It is rarely the time to launch new things in that area.',
  },
  {
    id: 'stationary',
    term: 'Stationary',
    aliases: ['station'],
    category: 'concept',
    short: 'When a planet pauses before changing direction.',
    long: 'A stationary planet is one that, from Earth, appears to stand still as it shifts between direct and retrograde motion. Stations are unusually loud — whatever the planet rules tends to peak in your life around the station.',
  },
  {
    id: 'direct',
    term: 'Direct',
    aliases: ['direct motion'],
    category: 'concept',
    short: 'When a planet is moving forward through the zodiac.',
    long: 'Direct is the normal forward motion of a planet through the zodiac, opposite of retrograde. After a retrograde, going direct is the moment plans you have been reworking can finally move ahead.',
  },
  {
    id: 'ingress',
    term: 'Ingress',
    aliases: ['enters'],
    category: 'concept',
    short: 'When a planet moves into a new sign.',
    long: 'An ingress is the moment a planet crosses from one sign into the next. The vibe shift can be subtle or huge depending on the planet — Moon ingresses happen every 2-3 days, Pluto ingresses are once-a-generation.',
  },
  {
    id: 'eclipse',
    term: 'Eclipse',
    aliases: ['solar eclipse', 'lunar eclipse'],
    category: 'concept',
    short: 'A high-octane new or full Moon near the Nodes.',
    long: 'Eclipses are turbo-charged lunations that happen near the Lunar Nodes, in pairs or triplets, twice a year. They speed up timelines, end chapters, and open new ones — best treated with rest, not big launches.',
  },
  {
    id: 'new-moon',
    term: 'New Moon',
    aliases: ['new lunation'],
    category: 'phase',
    short: 'Sun and Moon meet — the seed of a new cycle.',
    long: 'At the New Moon, the Sun and Moon are conjunct: the sky is dark and a new lunar cycle begins. It is a time for intention-setting, planting, and quiet starts in the area of life ruled by its sign and house.',
  },
  {
    id: 'full-moon',
    term: 'Full Moon',
    aliases: ['full lunation'],
    category: 'phase',
    short: 'Sun and Moon oppose — illumination and release.',
    long: 'At the Full Moon, the Sun and Moon sit on opposite sides of the sky. Whatever was seeded at the prior New Moon comes to light. Themes: culmination, revelation, completion, release.',
  },
  {
    id: 'void-of-course',
    term: 'Void of Course Moon',
    aliases: ['void Moon', 'VOC', 'v/c Moon'],
    category: 'phase',
    short: 'Moon between aspects — a liminal pause.',
    long: 'The Moon goes void of course between her last major aspect in one sign and her ingress into the next. Decisions made in this window often go nowhere. Best for rest, dreaming, low-stakes admin.',
  },
  {
    id: 'solar-return',
    term: 'Solar Return',
    aliases: ['birthday chart'],
    category: 'concept',
    short: 'The Sun returns home — your astrological new year.',
    long: 'A solar return is the moment, once a year, when the Sun comes back to its exact birth position. The chart cast for that moment becomes a snapshot of the year ahead. It happens on or near your birthday.',
  },
  {
    id: 'lunar-return',
    term: 'Lunar Return',
    aliases: [],
    category: 'concept',
    short: 'The Moon returns home — your monthly emotional reset.',
    long: 'A lunar return happens once every 27-28 days, when the Moon returns to her natal position. Many people feel a quiet emotional reset around it. The chart for that moment hints at the month\u2019s feeling-tone.',
  },
  {
    id: 'saturn-return',
    term: 'Saturn Return',
    aliases: [],
    category: 'concept',
    short: 'Saturn comes home — the great growing-up transit.',
    long: 'Saturn returns to its natal position roughly every 29.5 years, so most people meet it around 29-30, again around 58-59, and (if they live long) at 88. It is the classic threshold transit: who you are pretending to be falls off, what is yours stays.',
  },
  {
    id: 'jupiter-return',
    term: 'Jupiter Return',
    aliases: [],
    category: 'concept',
    short: 'Jupiter comes home — a 12-year expansion gate.',
    long: 'Jupiter returns to its natal position every 12 years (around ages 12, 24, 36, 48, 60, 72, 84). It tends to mark seasons of growth, opportunity, and visible expansion in the area of life Jupiter sits in.',
  },
  {
    id: 'out-of-bounds',
    term: 'Out of Bounds',
    aliases: ['OOB'],
    category: 'concept',
    short: 'A planet beyond the Sun\u2019s usual range — feral energy.',
    long: 'When a planet\u2019s declination goes beyond about 23\u00B027\u2032 north or south, it is called out of bounds. The planet behaves more wildly, off-script, less domesticated by the Sun\u2019s rules.',
  },
  {
    id: 'combust',
    term: 'Combust',
    aliases: [],
    category: 'concept',
    short: 'A planet too close to the Sun — burned by the king.',
    long: 'A planet within roughly 8.5 degrees of the Sun is called combust. Its themes get washed out by the Sun\u2019s glare, which can mean lost objectivity in that area, or being too identified with the planet to see it.',
  },
  {
    id: 'cazimi',
    term: 'Cazimi',
    aliases: ['in the heart of the Sun'],
    category: 'concept',
    short: 'A planet within ~17\u2032 of the Sun — strengthened, not burned.',
    long: 'Cazimi is the magical exception to combustion. When a planet sits in the heart of the Sun (within 17 arc minutes of an exact conjunction), it is considered enthroned and unusually powerful.',
  },
  {
    id: 'element',
    term: 'Element',
    aliases: ['elements'],
    category: 'concept',
    short: 'Fire, Earth, Air, Water — the four temperaments.',
    long: 'The twelve signs split across four elements. Fire is spirit and action; Earth is body and resource; Air is mind and connection; Water is feeling and depth. Elements describe a sign\u2019s essential mood.',
  },
  {
    id: 'fire',
    term: 'Fire',
    aliases: ['fire sign', 'fire signs'],
    category: 'concept',
    short: 'The element of spirit, action, and inspiration.',
    long: 'Fire signs (Aries, Leo, Sagittarius) move on instinct and warmth. They generate, lead, inspire — and need to be careful not to burn out the people around them.',
  },
  {
    id: 'earth',
    term: 'Earth',
    aliases: ['earth sign', 'earth signs'],
    category: 'concept',
    short: 'The element of body, resource, and slow time.',
    long: 'Earth signs (Taurus, Virgo, Capricorn) build, tend, and last. They prize what can be touched, useful, and made real. Their gift is patience; their shadow is rigidity.',
  },
  {
    id: 'air',
    term: 'Air',
    aliases: ['air sign', 'air signs'],
    category: 'concept',
    short: 'The element of mind, language, and connection.',
    long: 'Air signs (Gemini, Libra, Aquarius) live in idea and exchange. They thrive on conversation, perspective, and seeing how all the pieces fit. Their shadow is staying in the head.',
  },
  {
    id: 'water',
    term: 'Water',
    aliases: ['water sign', 'water signs'],
    category: 'concept',
    short: 'The element of feeling, intuition, and depth.',
    long: 'Water signs (Cancer, Scorpio, Pisces) feel everything, often before they think it. They make space for the unspoken. Their shadow is over-merging with what they feel.',
  },
  {
    id: 'modality',
    term: 'Modality',
    aliases: ['quality', 'modalities'],
    category: 'concept',
    short: 'Cardinal, Fixed, Mutable — how a sign moves.',
    long: 'Each sign has a modality. Cardinal signs initiate, Fixed signs stabilize, Mutable signs adapt. Modality tells you the role a sign plays inside its season.',
  },
  {
    id: 'cardinal',
    term: 'Cardinal',
    aliases: ['cardinal sign', 'cardinal signs'],
    category: 'concept',
    short: 'The starters of the zodiac.',
    long: 'Cardinal signs (Aries, Cancer, Libra, Capricorn) begin each season. They lead, initiate, and create momentum. Their shadow is starting more than they finish.',
  },
  {
    id: 'fixed',
    term: 'Fixed',
    aliases: ['fixed sign', 'fixed signs'],
    category: 'concept',
    short: 'The stabilizers of the zodiac.',
    long: 'Fixed signs (Taurus, Leo, Scorpio, Aquarius) hold the middle of each season. They build, sustain, and refuse to be moved. Their shadow is stubbornness.',
  },
  {
    id: 'mutable',
    term: 'Mutable',
    aliases: ['mutable sign', 'mutable signs'],
    category: 'concept',
    short: 'The adapters of the zodiac.',
    long: 'Mutable signs (Gemini, Virgo, Sagittarius, Pisces) close out each season. They flex, translate, and prepare the ground for the next chapter. Their shadow is scattering.',
  },
  {
    id: 'synastry',
    term: 'Synastry',
    aliases: ['relationship astrology'],
    category: 'concept',
    short: 'Two charts overlaid — relational chemistry.',
    long: 'Synastry compares two birth charts to see how the planets in one relate to the planets in the other. It shows the felt chemistry between two people: where you flow, where you grind, where you grow each other up.',
  },
  {
    id: 'composite',
    term: 'Composite',
    aliases: ['composite chart'],
    category: 'concept',
    short: 'A single chart for the relationship itself.',
    long: 'A composite chart is built from the midpoints of two people\u2019s planets, creating one chart that describes the relationship as its own entity — its purpose, its strengths, its blindspots.',
  },
  {
    id: 'progressed-chart',
    term: 'Progressed Chart',
    aliases: ['secondary progressions', 'progressions'],
    category: 'concept',
    short: 'Your inner chart, slow-motion forward.',
    long: 'A progressed chart moves your natal chart forward symbolically — typically one day equals one year of life. It shows interior development: how your Moon, Sun, and inner planets evolve as you mature.',
  },
  {
    id: 'transits',
    term: 'Transits',
    aliases: ['transit', 'current transits'],
    category: 'concept',
    short: 'Today\u2019s sky in conversation with your natal chart.',
    long: 'Transits are where the planets are right now and the aspects they form to your natal placements. They describe the current weather of your life: what is being activated, challenged, or supported.',
  },
  {
    id: 'natal',
    term: 'Natal',
    aliases: ['natal chart', 'birth chart'],
    category: 'concept',
    short: 'Your birth blueprint — the sky at your first breath.',
    long: 'Your natal chart is a map of the sky at your exact moment and place of birth. It is the reference chart against which everything else (transits, returns, progressions) is read.',
  },
  {
    id: 'birth-chart',
    term: 'Birth Chart',
    aliases: ['birthchart', 'natal chart'],
    category: 'concept',
    short: 'The map of the sky at your birth.',
    long: 'Your birth chart shows where every planet, point, and house cusp was at your moment of birth. It is the foundational document of your astrology — your soul-shape, your strengths, your assignments.',
  },
];

// ---------------------------------------------------------------------------
// CALENDAR
// ---------------------------------------------------------------------------

const CALENDAR: GlossaryTerm[] = [
  {
    id: 'equinox',
    term: 'Equinox',
    aliases: [
      'spring equinox',
      'autumn equinox',
      'fall equinox',
      'vernal equinox',
    ],
    category: 'concept',
    short: 'Sun enters Aries or Libra — day and night meet.',
    long: 'An equinox is one of two moments in the year (around March 20 and September 22) when day and night are equal. Astrologically, the Sun ingresses into a cardinal sign — Aries (spring in the north) or Libra (autumn).',
  },
  {
    id: 'solstice',
    term: 'Solstice',
    aliases: ['winter solstice', 'summer solstice'],
    category: 'concept',
    short: 'Sun enters Cancer or Capricorn — the longest day or night.',
    long: 'The solstices (around June 21 and December 21) mark the longest and shortest days of the year. Astrologically, the Sun ingresses into Cancer (summer in the north) or Capricorn (winter).',
  },
  {
    id: 'cross-quarter',
    term: 'Cross-quarter Days',
    aliases: ['cross-quarter day', 'cross quarter', 'sabbat'],
    category: 'concept',
    short:
      'The four points between equinox and solstice — Imbolc, Beltane, Lammas, Samhain.',
    long: 'Cross-quarter days fall halfway between the solstices and equinoxes. They mark the seasonal turning points in the Wheel of the Year — Imbolc, Beltane, Lammas (Lughnasadh), and Samhain — and have been celebrated as sabbats for thousands of years.',
  },
];

// ---------------------------------------------------------------------------
// AGGREGATE
// ---------------------------------------------------------------------------

const ALL_TERMS: GlossaryTerm[] = [
  ...PLANETS,
  ...POINTS,
  ...SIGNS,
  ...HOUSES,
  ...ASPECTS,
  ...CONCEPTS,
  ...CALENDAR,
];

export const GLOSSARY: Record<string, GlossaryTerm> = ALL_TERMS.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, GlossaryTerm>,
);

export const GLOSSARY_LIST: GlossaryTerm[] = ALL_TERMS;

// ---------------------------------------------------------------------------
// LOOKUP / MATCHER
// ---------------------------------------------------------------------------

/**
 * Cached lookup table mapping every alias (lowercased) -> GlossaryTerm.
 * Built once on module load.
 */
const ALIAS_INDEX: Map<string, GlossaryTerm> = (() => {
  const map = new Map<string, GlossaryTerm>();
  for (const t of ALL_TERMS) {
    const keys = [t.term, ...t.aliases];
    for (const k of keys) {
      const lower = k.toLowerCase();
      // First-write-wins so canonical terms beat aliases on collision.
      if (!map.has(lower)) {
        map.set(lower, t);
      }
    }
  }
  return map;
})();

/**
 * All searchable phrases sorted by descending length, so multi-word terms
 * like "Saturn Return" match before "Saturn".
 */
const SEARCH_PHRASES: string[] = (() => {
  const set = new Set<string>();
  for (const t of ALL_TERMS) {
    set.add(t.term);
    for (const a of t.aliases) set.add(a);
  }
  return Array.from(set).sort((a, b) => b.length - a.length);
})();

/**
 * Case-insensitive lookup for a single phrase. Returns the matching
 * GlossaryTerm or null.
 */
export function findTerm(text: string): GlossaryTerm | null {
  if (!text) return null;
  return ALIAS_INDEX.get(text.trim().toLowerCase()) ?? null;
}

export type TermMatch = {
  term: GlossaryTerm;
  /** Inclusive start index into the original text. */
  start: number;
  /** Exclusive end index. */
  end: number;
  /** The original substring as it appeared (preserves casing). */
  matchedText: string;
};

/**
 * Word-boundary check that respects unicode letters and apostrophes.
 * Uses the input string and the candidate range [start, end).
 */
function isAtWordBoundary(text: string, start: number, end: number): boolean {
  const before = start === 0 ? '' : text[start - 1];
  const after = end >= text.length ? '' : text[end];
  const isWordChar = (ch: string) => !!ch && /[\p{L}\p{N}_]/u.test(ch);
  return !isWordChar(before) && !isWordChar(after);
}

/**
 * Scan `text` and return every glossary match, longest-first, with
 * overlapping ranges removed. Stable across renders.
 */
export function findAllTerms(text: string): TermMatch[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matches: TermMatch[] = [];

  for (const phrase of SEARCH_PHRASES) {
    const phraseLower = phrase.toLowerCase();
    const phraseLen = phraseLower.length;
    if (phraseLen === 0) continue;

    let from = 0;
    while (from <= lower.length - phraseLen) {
      const idx = lower.indexOf(phraseLower, from);
      if (idx === -1) break;

      const start = idx;
      const end = idx + phraseLen;

      if (isAtWordBoundary(text, start, end)) {
        const term = ALIAS_INDEX.get(phraseLower);
        if (term) {
          matches.push({
            term,
            start,
            end,
            matchedText: text.slice(start, end),
          });
        }
      }
      from = idx + 1;
    }
  }

  // Sort by start ascending, then by length descending so longer wins on ties.
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });

  // Remove overlaps, keeping the earliest+longest already-sorted match.
  const result: TermMatch[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    result.push(m);
    cursor = m.end;
  }
  return result;
}

/**
 * Convenience: terms in the same category, excluding the given id.
 * Used by GlossarySheet to render related links.
 */
export function relatedTerms(id: string, max = 6): GlossaryTerm[] {
  const seed = GLOSSARY[id];
  if (!seed) return [];
  return ALL_TERMS.filter(
    (t) => t.id !== id && t.category === seed.category,
  ).slice(0, max);
}
