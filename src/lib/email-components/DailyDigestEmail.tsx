import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

// ── Deterministic daily themes per sign ──────────────────────────────
// 31 themes per sign — rotated by day-of-year so every day feels fresh
// without requiring an LLM call per user.

const SIGN_THEMES: Record<string, string[]> = {
  Aries: [
    'A bold opportunity is closer than you think. Trust your instincts today.',
    'Your energy is magnetic right now. Channel it into something that matters.',
    'Impatience wants to rush you. Slow down and the path reveals itself.',
    'A conversation today could spark something bigger than you expect.',
    'Your courage is being tested. What you do next sets the tone for weeks.',
    'Creative fire is high. Start something new before the spark fades.',
    'A rivalry or tension is actually pushing you to level up.',
    'Physical energy peaks today. Move your body to clear your mind.',
    "Someone needs your directness. Say what others won't.",
    "Independence is your superpower today. Don't wait for permission.",
    "A risk you've been weighing is ready. The stars favour action.",
    'Your leadership shines when you let others shine too.',
    'Restlessness means growth is knocking. Open the door.',
    'A financial decision benefits from your natural boldness.',
    'Your competitive edge is an asset. Use it with grace.',
    "Today rewards the first move. Don't overthink it.",
    "An old ambition resurfaces. It's ready for a second chance.",
    'Your warmth surprises someone who expected your fire.',
    'A physical challenge or adventure recharges your spirit.',
    "Collaboration feels hard today, but it's where the magic is.",
    'Your honesty cuts through noise. Speak plainly.',
    'The universe matches your pace today. Push forward.',
    'A mentor figure offers wisdom. Be open enough to hear it.',
    'Your enthusiasm is contagious. Use it to rally others.',
    'Something you started weeks ago finally clicks into place.',
    "A boundary you set is being respected. That's growth.",
    'Your instinct about someone was right. Trust it.',
    "Rest isn't weakness. Even warriors need to sharpen the blade.",
    'A surprise invitation leads somewhere unexpected.',
    'Your passion project deserves more of your attention.',
    'Today is about planting seeds. The harvest comes later.',
  ],
  Taurus: [
    'Slow, steady progress is still progress. Trust your pace today.',
    'Something beautiful catches your eye. Follow that thread.',
    "Financial clarity arrives. A decision you've delayed is ready.",
    'Comfort is calling, but a small stretch outside routine pays off.',
    'Your patience is about to be rewarded in a tangible way.',
    'Nature holds a message for you today. Step outside.',
    'A sensory experience shifts your mood entirely.',
    "Someone values your reliability more than they've said.",
    'An investment of time or money starts showing returns.',
    'Your stubbornness is actually perseverance in disguise.',
    'A creative project benefits from your eye for quality.',
    'Material security feels more stable. Breathe into that.',
    'A taste, scent or sound unlocks a buried memory.',
    'Your body is telling you something. Listen.',
    "Luxury doesn't have to cost much. Treat yourself simply.",
    'A practical solution outshines a flashy one today.',
    'Someone tries to rush you. Hold your ground.',
    'Your values clarify. What you tolerate changes.',
    'Home improvements or nesting energy runs high.',
    'A loyalty is tested. Your response reveals your growth.',
    'Abundance thinking shifts a scarcity pattern.',
    'Your voice carries weight today. Choose words carefully.',
    'A routine that felt stale suddenly feels sacred.',
    "Physical touch or closeness heals something words can't.",
    'A deal or agreement lands in your favour.',
    'Beauty is your medicine today. Seek it out.',
    'Your grounded energy calms someone who needs it.',
    'A possession you forgot about brings unexpected joy.',
    'The simple path is the right path today.',
    "Your consistency is building something others can't see yet.",
    'A conversation about money brings clarity and relief.',
  ],
  Gemini: [
    'Your mind is electric today. Capture ideas before they vanish.',
    'A message or call changes your plans for the better.',
    "Curiosity leads you somewhere you didn't expect. Follow it.",
    "Two paths present themselves. You don't have to choose yet.",
    'Your words land with more impact than usual. Use them wisely.',
    'A social connection sparks a new possibility.',
    "Information you've been seeking finally surfaces.",
    'Your adaptability is your greatest asset today.',
    'A sibling, neighbour or local connection matters more than you think.',
    'Write something down today. Your future self will thank you.',
    'A short trip or change of scenery refreshes everything.',
    'Your wit disarms someone. Humour opens doors.',
    'Multitasking works today. Ride the mental energy.',
    'A book, podcast or article holds a personal message.',
    'Your nervous energy wants an outlet. Talk it through.',
    'A dualistic feeling resolves when you stop fighting it.',
    'Teaching or explaining something deepens your own understanding.',
    'Your social battery is full. Connect with people.',
    'A decision about communication or technology is timely.',
    'Your perspective shifts when you hear another side.',
    'Quick thinking saves the day in a small but meaningful way.',
    'A plan you thought was final has room for one more edit.',
    'Your storytelling ability captivates someone today.',
    'Variety is essential. Mix up your routine.',
    'A piece of gossip or news reshapes your understanding.',
    "Your duality isn't a flaw. It's your depth.",
    "A skill you haven't used in a while becomes relevant.",
    'The right words arrive at the right moment.',
    "A mental puzzle that's been nagging you suddenly solves itself.",
    "Your lightheartedness lifts someone's heavy day.",
    'Connections made today carry weight. Be present in them.',
  ],
  Cancer: [
    'Your intuition is especially sharp today. Trust what you feel.',
    'Home holds the answer. Something in your space needs attention.',
    'An emotional wave passes. What remains is clarity.',
    'Someone close needs nurturing. Your care makes a real difference.',
    'A memory surfaces to teach you something new about now.',
    'Your protective instincts serve you well today.',
    'Domestic energy is high. Cook, clean or create at home.',
    'A family connection deepens or shifts.',
    "Your empathy opens a door someone else can't open alone.",
    'Water soothes you today. A bath, the rain, a walk by water.',
    'Nostalgia has a purpose. Let it guide, not trap you.',
    'Your shell is your strength. Retreat when you need to.',
    'A financial matter tied to home or security clarifies.',
    'Someone underestimates your strength. Let your actions speak.',
    'Your cooking, caring or creativity nourishes more than you know.',
    "A mood swing carries information. Don't dismiss it.",
    'The past and present connect in a meaningful way.',
    'Your safe spaces matter. Protect them.',
    "An old wound shows its healing. Notice how far you've come.",
    'A maternal figure or energy appears in your day.',
    'Your sensitivity is a superpower, not a weakness.',
    'Something at home needs repairing, physically or emotionally.',
    'Trust your gut about a person. First impressions run deep for you.',
    'A childhood interest resurfaces with new relevance.',
    'Your loyalty is recognised and reciprocated.',
    "Comfort food isn't avoidance. Sometimes it's medicine.",
    'A private moment of reflection brings a public breakthrough.',
    'Your roots are strong. Build from that foundation.',
    'An emotional conversation clears the air completely.',
    'Your nurturing nature attracts exactly who needs it.',
    'The moon speaks to you today. Notice her phase.',
  ],
  Leo: [
    'Your light draws attention today. Be intentional about what you shine on.',
    "Creative expression isn't optional for you right now. Make something.",
    'Generosity returns to you multiplied. Give freely.',
    'The spotlight feels natural. Step into it.',
    'A child, pet or playful energy brings pure joy.',
    "Your confidence inspires someone who's struggling.",
    'Recognition for past effort arrives. Accept it gracefully.',
    'Drama wants your attention. You get to choose whether to engage.',
    'Your heart knows the answer your head is overcomplicating.',
    'Romance or passion energy is elevated. Act on it.',
    'A performance, presentation or creative reveal goes well.',
    'Your warmth is healing. Share it without expecting return.',
    'Loyalty is tested. Yours runs deeper than most.',
    'A risk in self-expression pays off beautifully.',
    "Your inner child needs play. Don't skip it.",
    'Leadership opportunities arise from being authentically you.',
    'Someone mirrors back your energy. Like what you see.',
    'Your pride and your purpose align today.',
    "A celebration, even small, is exactly what's needed.",
    "Your creative vision is clearer than it's been in weeks.",
    "Joy is productive. Don't guilt yourself out of it.",
    'An audience, even of one, receives your message deeply.',
    'Your dignity in difficulty inspires others quietly.',
    'A compliment you give means more than you realise.',
    'The stage is yours. What story do you want to tell?',
    'Your fixed nature is an anchor for someone adrift.',
    'Something gold, sunny or bright catches your eye for a reason.',
    'Your courage to be seen gives others permission too.',
    "A love language you've been speaking is finally heard.",
    "Your roar doesn't always need volume. Sometimes it's presence.",
    'Today asks you to lead with heart, not ego.',
  ],
  Virgo: [
    'A small detail you notice today saves a larger problem later.',
    'Your body is communicating. Listen to it closely.',
    'Organisation brings peace. Tidy one thing and feel the shift.',
    'A health or wellness insight clicks into practical action.',
    "Your analytical mind solves what others can't see.",
    'Service to others fills your cup today, not drains it.',
    'A routine adjustment creates surprising improvement.',
    'Perfectionism loosens its grip. Good enough is enough.',
    'A list, a plan or a system makes everything easier.',
    'Your discernment is a gift. Use it gently on yourself too.',
    "Nature's patterns mirror something in your own life.",
    'A colleague or collaborator values your precision.',
    'Practical magic: the mundane becomes sacred when done mindfully.',
    'Your criticism of yourself softens. Notice the difference.',
    'A dietary or physical change you made is working. Stay with it.',
    'Helping someone with a practical task deepens your bond.',
    'Your humility is strength, not invisibility.',
    'A messy situation needs your organising energy.',
    'Earth energy grounds you. Touch soil, walk barefoot, be still.',
    'Your nervous system asks for calm. Give it.',
    "An improvement you've been planning is ready to implement.",
    'Words on a page settle your mind. Write or read.',
    'Your attention to quality elevates everything you touch.',
    'A health professional or healer has something useful to offer.',
    'Your inner critic and inner healer make peace today.',
    'A work process you refine saves time for weeks to come.',
    'Simplicity is the ultimate sophistication. Pare back.',
    'Your daily rituals are building something extraordinary.',
    "Someone's chaos is eased by your calm competence.",
    'Gratitude for small things opens a door to larger abundance.',
    'Today rewards the unglamorous work. Keep going.',
  ],
  Libra: [
    'Balance tips back in your favour today. A correction arrives.',
    'Beauty in any form feeds your soul. Seek it out.',
    'A relationship dynamic shifts. The rebalancing is healthy.',
    'Your diplomatic skills resolve something that seemed stuck.',
    'Indecision dissolves when you stop trying to please everyone.',
    'Partnership energy is strong. Lean into it.',
    'Art, music or design lifts your mood instantly.',
    'A justice matter or fairness question reaches resolution.',
    'Your charm opens a door that force could not.',
    'A compromise that honours both sides is within reach.',
    'Your aesthetic sense notices what others miss.',
    'A social gathering or connection feeds you deeply.',
    "Mirror someone's kindness back to them today.",
    "Your need for harmony isn't weakness. It's wisdom.",
    'A one-to-one conversation holds more than a group ever could.',
    'Venus whispers. Follow what attracts you.',
    'A legal, contractual or agreement matter progresses.',
    'Your ability to see both sides is needed right now.',
    'Peace-making is active, not passive. You prove that today.',
    'An outfit, room or space you curate brings deep satisfaction.',
    'Someone you admire reflects qualities you already have.',
    'Your grace under pressure earns quiet respect.',
    'A creative collaboration produces something neither could alone.',
    'The scales settle. A period of turbulence calms.',
    'Your people-reading ability is spot-on today.',
    'A gift, gesture or act of love lands perfectly.',
    'Symmetry appears in your day. Notice the patterns.',
    'Your desire for fairness creates positive change.',
    'A partnership decision becomes clearer with less analysis.',
    "Your presence makes spaces more beautiful. That's enough.",
    "Today's balance isn't static. It's a dance. Enjoy it.",
  ],
  Scorpio: [
    'Something hidden comes to light. Your instinct was right.',
    "Intensity is your frequency today. Don't dilute it.",
    "A transformation you've been resisting is ready to complete.",
    'Trust runs deeper with someone after today.',
    'Your power of observation reveals what others overlook.',
    'A letting go creates space for something better.',
    'Intimacy, emotional or physical, deepens in unexpected ways.',
    "Your resilience inspires someone who's watching quietly.",
    "A secret, yours or someone else's, surfaces with purpose.",
    'Your emotional depth is magnetic. Own it.',
    'A financial matter tied to shared resources clarifies.',
    'The phoenix energy is real. Something ends so something begins.',
    'Your ability to sit with discomfort is rare. Use it.',
    'A research or investigation reveals the missing piece.',
    'Jealousy or possessiveness signals something worth examining.',
    'Your silence communicates more than words today.',
    'A psychological insight lands with precision.',
    'Water energy cleanses. Shower, swim or simply drink more.',
    'Your loyalty is fierce and earned. So is your distance.',
    'A taboo topic is ready for honest conversation.',
    "Control softens into trust. Notice where you're gripping.",
    'Your sexuality or creative intensity peaks.',
    'A power dynamic shifts. You come out on top.',
    'Your ability to regenerate amazes even you.',
    "Something you buried resurfaces. You're ready now.",
    'Your gaze sees through pretence. Use that wisely.',
    'An inheritance, tax or debt matter progresses.',
    "The underworld holds treasure. Don't fear the descent.",
    'Your passion for truth clears away illusion.',
    'A bond forged in difficulty proves its strength.',
    "Today's depth becomes tomorrow's power. Go deep.",
  ],
  Sagittarius: [
    'Adventure calls. Even a small one expands your world.',
    'A philosophical insight reframes a practical problem.',
    'Your optimism is well-placed today. Trust it.',
    'Travel plans, near or far, take a positive turn.',
    'A teacher or teaching moment appears. Stay open.',
    'Your bluntness is refreshing. Someone needed that honesty.',
    'A foreign culture, cuisine or idea enriches your day.',
    "Freedom isn't selfish. It's how you stay alive.",
    'Your faith in something bigger carries you through.',
    'A publishing, broadcasting or sharing opportunity arises.',
    "Restlessness means you're ready for the next chapter.",
    'Your natural philosophy draws curious minds.',
    'A legal or ethical matter benefits from your big-picture thinking.',
    'Laughter is medicine. Seek it out today.',
    'Your arrow flies truest when you aim with joy.',
    'An academic or learning pursuit energises you.',
    'The far horizon holds something worth moving towards.',
    'Your generosity of spirit creates unexpected abundance.',
    'A belief you held tightly softens into wisdom.',
    'Physical movement in open spaces clears your mind.',
    'Your story inspires someone else to begin theirs.',
    "Cultural exchange opens a door you didn't know existed.",
    'A risk that scared you last month feels ready now.',
    'Your independence and your connections both strengthen.',
    'A spontaneous decision leads to a meaningful experience.',
    'Truth-telling is your gift. Deliver it with kindness.',
    'Your quest for meaning finds a new clue.',
    'The road less travelled has your name on it.',
    'A book or journey changes your perspective permanently.',
    'Your fiery enthusiasm ignites a room. Show up.',
    'Today asks you to expand, not contract. Say yes.',
  ],
  Capricorn: [
    'A career or long-term goal takes a concrete step forward.',
    "Your discipline is building something others can't see yet.",
    'Structure creates freedom. Organise one area of your life.',
    'An authority figure recognises your quiet competence.',
    'Your patience with process is about to pay dividends.',
    'A boundary you set professionally earns deeper respect.',
    'Legacy thinking: what you build today outlasts today.',
    'Your ambition and your values align in a new way.',
    'A mentor or elder offers wisdom worth hearing.',
    'The mountain peak is closer than the fog suggests.',
    'Your reputation precedes you in the best way.',
    'A responsibility you carry lightens slightly. Breathe.',
    'Financial planning or budgeting yields clear results.',
    "Your seriousness about craft is exactly what's needed.",
    'Rest is part of your strategy, not separate from it.',
    'A professional relationship deepens into genuine respect.',
    'Your bone-deep resilience amazes even you sometimes.',
    'Time is on your side. Play the long game.',
    'A tradition or established method proves its worth.',
    'Your dry humour lands perfectly. More of that.',
    'An achievement milestone, however small, deserves acknowledgement.',
    "Your reliability makes you irreplaceable in someone's life.",
    'A system you built starts running on its own.',
    'Cold clarity cuts through emotional fog. Trust your logic.',
    'Your father figure or authority archetype teaches you something.',
    'A climb that felt endless shows its summit.',
    "Your standards aren't too high. They're aspirational.",
    'Earth energy steadies you. Stand firm.',
    'A long-delayed recognition arrives. Accept it with grace.',
    'Your commitment to growth compounds daily. Keep going.',
    'Today rewards the steady hand. Yours is the steadiest.',
  ],
  Aquarius: [
    'An unconventional idea proves to be exactly right.',
    'Your community or friend group needs your unique perspective.',
    'Technology or innovation opens an unexpected door.',
    "Your individuality is magnetic today. Don't conform.",
    'A humanitarian impulse leads to meaningful action.',
    'Future thinking: what you envision today shapes tomorrow.',
    'A group dynamic shifts. Your role in it clarifies.',
    "Your detachment isn't coldness. It's clarity.",
    'A friendship deepens in an unexpected direction.',
    'Rebellion has a purpose today. Question the status quo.',
    'Your network holds the answer. Reach out.',
    'An invention, idea or system you create surprises you.',
    "Your quirks aren't flaws. They're features.",
    'A cause you care about gains momentum.',
    'Intellectual connection feeds you more than small talk.',
    'Your vision for the future inspires others to act.',
    'A break from tradition reveals a better way.',
    'Community healing happens through your participation.',
    'Your electric energy sparks something in someone else.',
    'A social media or digital connection holds real value.',
    'Your rational approach solves an emotional tangle.',
    "Freedom and belonging aren't opposites. You prove that.",
    'An unexpected ally appears from an unlikely place.',
    "Your progressive thinking is exactly what's needed now.",
    'A collective project benefits from your unique contribution.',
    'Your independence inspires someone to find theirs.',
    'A flash of insight arrives without warning. Capture it.',
    'Your eccentricity is your trademark. Wear it well.',
    'A future plan crystallises into actionable steps.',
    'Your ability to love humanity while needing space is understood.',
    "Today asks you to be the change. You're ready.",
  ],
  Pisces: [
    'Your dreams carry a message. Pay attention to them.',
    'Creative flow is effortless today. Dive in.',
    'Your compassion heals someone without you even knowing.',
    'A spiritual or mystical experience catches you off guard.',
    'Boundaries between imagination and reality blur beautifully.',
    'Water calls to you. Honour it.',
    'Your artistic expression says what logic cannot.',
    'An escape is needed, but choose the nourishing kind.',
    'Your psychic sensitivity is heightened. Shield yourself gently.',
    "Music, poetry or art unlocks something words can't reach.",
    'A sacrifice you made quietly is noticed and valued.',
    'Your ability to dissolve ego serves everyone around you.',
    "A past life thread weaves into today's experience.",
    'Forgiveness, of yourself or another, frees trapped energy.',
    'Your intuition about timing is perfect. Wait or act accordingly.',
    "A creative collaboration merges your vision with another's skill.",
    'Your tears, if they come, are cleansing. Let them.',
    'A dream you thought was unrealistic gains solid ground.',
    'Your spiritual practice bears fruit. Stay with it.',
    "Solitude recharges you. Don't apologise for needing it.",
    "An act of selfless kindness creates a ripple you won't see.",
    'Your imagination is a portal. Use it consciously.',
    'A sign, symbol or synchronicity confirms your path.',
    'Your gentleness is strength in a world that rewards force.',
    'The veil between worlds thins. Notice what comes through.',
    'Your emotional intelligence reads a room perfectly.',
    'A healing modality or practice calls to you. Try it.',
    "Your surrender isn't giving up. It's letting in.",
    'A film, song or story mirrors your inner life uncannily.',
    'Your connection to the unseen world is your power.',
    "Today asks you to trust the current. Float, don't fight.",
  ],
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '\u2648',
  Taurus: '\u2649',
  Gemini: '\u264A',
  Cancer: '\u264B',
  Leo: '\u264C',
  Virgo: '\u264D',
  Libra: '\u264E',
  Scorpio: '\u264F',
  Sagittarius: '\u2650',
  Capricorn: '\u2651',
  Aquarius: '\u2652',
  Pisces: '\u2653',
};

/**
 * Deterministic theme for a sign on a given date.
 * Uses day-of-year so themes rotate daily without needing an LLM.
 */
export function getDailyTheme(sign: string, date: Date): string {
  const themes = SIGN_THEMES[sign];
  if (!themes) return 'The stars have a message for you today.';
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return themes[dayOfYear % themes.length];
}

// ── Email component ──────────────────────────────────────────────────

interface DailyDigestProps {
  userName: string;
  sunSign: string;
  dailyTheme: string;
  dateString: string;
  userEmail?: string;
}

function EmailContainer({ children }: { children: React.ReactNode }) {
  return (
    <Container
      style={{
        background: '#ffffff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid transparent',
        color: '#333',
      }}
    >
      {children}
    </Container>
  );
}

function EmailFooter({
  userEmail,
  baseUrl,
}: {
  userEmail?: string;
  baseUrl: string;
}) {
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}&type=cosmic_insights`
    : `${baseUrl}/unsubscribe`;

  return (
    <Section
      style={{
        textAlign: 'center' as const,
        marginTop: '40px',
        color: '#6b7280',
        fontSize: '14px',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
      }}
    >
      <Text style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} Lunar Computing, Inc. Made with
        &#127769; for your cosmic journey.
      </Text>
      <Text style={{ margin: '10px 0 0 0' }}>
        <Link href={unsubscribeUrl} style={{ color: '#6b7280' }}>
          Unsubscribe from daily digest
        </Link>
        {' | '}
        <Link href={`${baseUrl}/profile`} style={{ color: '#6b7280' }}>
          Manage preferences
        </Link>
      </Text>
    </Section>
  );
}

function CTAButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#ffffff',
        padding: '16px 32px',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '16px',
        textAlign: 'center' as const,
      }}
    >
      {children}
    </Link>
  );
}

export function DailyDigestEmail({
  userName,
  sunSign,
  dailyTheme,
  dateString,
  userEmail,
}: DailyDigestProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';
  const symbol = ZODIAC_SYMBOLS[sunSign] || '';

  return (
    <Html>
      <Head>
        <title>Your daily cosmic snapshot - Lunary</title>
      </Head>
      <Preview>{dailyTheme}</Preview>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: '1.6',
          color: '#333',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#f8f9fa',
        }}
      >
        <EmailContainer>
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '20px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='100'
              style={{ margin: '0 auto 16px', display: 'block' }}
            />
          </Section>

          <Section style={{ margin: '0 0 24px' }}>
            <Text
              style={{
                fontSize: '18px',
                margin: '0 0 4px',
                color: '#374151',
              }}
            >
              Good morning {greeting},
            </Text>
            <Text
              style={{
                fontSize: '14px',
                color: '#9ca3af',
                margin: 0,
              }}
            >
              Your cosmic snapshot for {dateString}
            </Text>
          </Section>

          <Section
            style={{
              background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
              borderLeft: '4px solid #6366f1',
              padding: '20px',
              borderRadius: '6px',
              margin: '0 0 28px',
            }}
          >
            <Heading
              as='h2'
              style={{
                fontSize: '16px',
                color: '#4338ca',
                margin: '0 0 8px',
                fontWeight: '600',
              }}
            >
              {symbol} {sunSign}
            </Heading>
            <Text
              style={{
                color: '#3730a3',
                margin: 0,
                fontSize: '16px',
                lineHeight: '1.6',
              }}
            >
              {dailyTheme}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '0 0 20px' }}>
            <CTAButton
              href={`${baseUrl}/tarot?utm_source=email&utm_medium=daily_digest&utm_campaign=daily_digest`}
            >
              Pull your daily card
            </CTAButton>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '0 0 8px' }}>
            <Link
              href={`${baseUrl}/horoscope?utm_source=email&utm_medium=daily_digest&utm_campaign=daily_digest`}
              style={{
                color: '#6366f1',
                fontSize: '14px',
                textDecoration: 'underline',
              }}
            >
              See today&apos;s transits &rarr;
            </Link>
          </Section>

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

export async function renderDailyDigestEmail(
  props: DailyDigestProps,
): Promise<string> {
  return await render(<DailyDigestEmail {...props} />);
}
