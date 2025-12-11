/**
 * Rising Sign Pack
 *
 * A birth chart pack exploring all 12 rising signs and their meanings.
 */

import { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { StandardFonts } from 'pdf-lib';
import { PdfBirthChartPack, PdfBirthChartSection } from '../schema';
import { generateBirthChartPackPdf } from '../templates/BirthChartPackTemplate';

const LOGO_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://lunary.app/press-kit/lunary-logo-light.png'
    : 'http://localhost:3000/press-kit/lunary-logo-light.png';

async function loadLogo(pdfDoc: PDFDocument): Promise<PDFImage | null> {
  try {
    const response = await fetch(LOGO_URL);
    if (!response.ok) return null;
    return pdfDoc.embedPng(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function loadFonts(
  pdfDoc: PDFDocument,
): Promise<{ regular: PDFFont; bold: PDFFont }> {
  pdfDoc.registerFontkit(fontkit);
  try {
    const [regRes, boldRes] = await Promise.all([
      fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-400-normal.ttf',
      ),
      fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-700-normal.ttf',
      ),
    ]);
    if (!regRes.ok || !boldRes.ok) throw new Error('Font fetch failed');
    return {
      regular: await pdfDoc.embedFont(await regRes.arrayBuffer(), {
        subset: true,
      }),
      bold: await pdfDoc.embedFont(await boldRes.arrayBuffer(), {
        subset: true,
      }),
    };
  } catch {
    return {
      regular: await pdfDoc.embedFont(StandardFonts.Courier),
      bold: await pdfDoc.embedFont(StandardFonts.CourierBold),
    };
  }
}

const RISING_SIGN_SECTIONS: PdfBirthChartSection[] = [
  {
    placement: 'What Is Your Rising Sign?',
    meaning:
      'Your rising sign (or Ascendant) is the zodiac sign that was ascending on the eastern horizon at the moment of your birth. It represents your outward personality, first impressions, and how you approach new situations. While your Sun sign is your core identity and your Moon sign is your emotional nature, your rising sign is the mask you wear and how the world first perceives you.',
    traits: [
      'Determines your physical appearance and style',
      'Shapes first impressions and social approach',
      'Influences how you initiate and begin things',
      'Sets the tone for your entire birth chart',
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
      "Your stability is a gift. Allow yourself to enjoy life's pleasures without guilt. Practice flexibility when the situation calls for change.",
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
      "Your gift for harmony is invaluable. Practise stating your preferences with clarity. Your peace matters as much as anyone else's.",
  },
  {
    placement: 'Scorpio Rising',
    sign: 'Scorpio',
    meaning:
      "You meet the world with intensity and depth. Others sense power beneath your surface. You see through facades and are drawn to life's mysteries and transformations.",
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

function buildRisingSignPack(): PdfBirthChartPack {
  return {
    type: 'birthchart',
    slug: 'rising-sign',
    title: 'Rising Sign Guide',
    subtitle: 'Understanding your Ascendant',
    moodText:
      'Your rising sign is your cosmic first impression: the lens through which you see the world and how the world first sees you.',
    perfectFor: [
      'Those new to understanding their birth chart',
      'Anyone curious about first impressions and social approach',
      'Understanding the difference between Sun and Rising signs',
      'Deepening self-awareness through astrology',
    ],
    introText:
      'While your Sun sign represents your core identity, your rising sign shapes how you move through the world. This is the sign that was rising on the eastern horizon at your exact moment of birth, making your birth time essential for accuracy.',
    sections: RISING_SIGN_SECTIONS,
    journalPrompts: [
      'How do people describe me when they first meet me?',
      'Does my rising sign description resonate with how I approach new situations?',
      'How does my rising sign work with (or against) my Sun sign?',
      'What strengths and challenges does my rising sign bring?',
    ],
    closingText:
      'Thank you for exploring your rising sign with Lunary. Understanding your Ascendant adds depth to your astrological portrait. You are not just one sign; you are a complex blend of cosmic influences.',
    optionalAffirmation:
      'I embrace how I show up in the world. My first impression is authentic, and I move through life with intention.',
  };
}

export async function generateRisingSignPdf(): Promise<Uint8Array> {
  const pack = buildRisingSignPack();
  return generateBirthChartPackPdf(pack, loadFonts, loadLogo);
}

export { buildRisingSignPack };
