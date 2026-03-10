import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.AYRSHARE_API_KEY!;
const PROFILE_KEY = process.env.AYRSHARE_PROFILE_KEY!;

interface PostPayload {
  post: string;
  platforms: string[];
  mediaUrls: string[];
  scheduleDate: string;
  label?: string;
}

async function submitPost(label: string, payload: PostPayload): Promise<void> {
  const res = await fetch('https://app.ayrshare.com/api/post', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Profile-Key': PROFILE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as any;
  const id = data?.id ?? data?.postIds?.[0] ?? null;
  const status = data?.status ?? data?.errors?.[0]?.action ?? 'unknown';
  console.log(`[${label}] ${status} — id: ${id}`);
  if (status !== 'scheduled' && status !== 'success') {
    console.log('  Full response:', JSON.stringify(data));
  }
}

const posts: Array<{ label: string; payload: PostPayload }> = [
  // Mon 14:00 UTC — 333 (errored previously, resubmit)
  {
    label: 'Mon 14:00 — 333',
    payload: {
      post: `Seeing 333 everywhere lately?

That's not a coincidence. It's a direct message from your ascended masters — they're saying: "We see you. We're with you. Keep going."

333 shows up when you need confirmation you're not alone. When the doubt creeps in, that's when they send it.

Next time you see it, say thank you. Then keep moving.

#333 #angelnumbers #spiritualtiktok #manifestation #spiritualawakening`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-09-333-1772983814869.mp4',
      ],
      scheduleDate: '2026-03-09T14:00:00Z',
    },
  },

  // Mon 21:00 UTC — Ranking signs: most likely to ghost you
  {
    label: 'Mon 21:00 — Ranking signs',
    payload: {
      post: `Ranking the signs most likely to ghost you 👻

We went there.

Some of these answers will surprise you. Some won't. But the ones you're already thinking of right now? Probably in the top 3.

Drop your sign below and let's see if you made the list.

#zodiacsigns #astrology #astrologytiktok #horoscope #zodiac`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-09-ranking-signs--most-likely-to-ghost-you-1772983978042.mp4',
      ],
      scheduleDate: '2026-03-09T21:00:00Z',
    },
  },

  // Tue 21:00 UTC — Chiron in Virgo
  {
    label: 'Tue 21:00 — Chiron in Virgo',
    payload: {
      post: `Chiron in Virgo is the "I'm never good enough" wound.

You do everything perfectly and still feel like you failed. You help everyone around you but can't accept help yourself. You know exactly what needs fixing — but only in other people.

That's the Chiron in Virgo pattern.

The healing isn't about becoming perfect. It's about realising you're worthy before you've fixed anything.

Do you have this placement in your chart?

#chironinvirgo #birthchart #astrology #spiritualtiktok #zodiac`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-10-chiron-in-virgo--being-good-enough-without-perfection-1772984160165.mp4',
      ],
      scheduleDate: '2026-03-10T21:00:00Z',
    },
  },

  // Wed 14:00 UTC — 555
  {
    label: 'Wed 14:00 — 555',
    payload: {
      post: `555 means your life is already changing.

Not might change. Is changing. Right now.

Doors closing, new ones opening. Relationships shifting. Your nervous system is probably in overdrive.

This number shows up when the universe has already started moving things — before you even said yes.

Trust the transition. You asked for this.

#555 #angelnumbers #spiritualtiktok #numerology #manifestation`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-11-555-1772984215999.mp4',
      ],
      scheduleDate: '2026-03-11T14:00:00Z',
    },
  },

  // Wed 17:00 UTC — Why is Aries the first sign?
  {
    label: 'Wed 17:00 — Aries first sign',
    payload: {
      post: `Aries is the first sign because it represents the moment the Sun crosses into spring.

New cycle, new energy, zero hesitation. That's why Aries people are built the way they are.

They didn't choose to be first. The cosmos literally starts with them.

If you're an Aries, you're basically the alarm clock of the zodiac. And honestly? We need you.

#aries #astrology #zodiac #astrologytiktok #birthchart`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-11-why-is-aries-the-first-sign--1772984290463.mp4',
      ],
      scheduleDate: '2026-03-11T17:00:00Z',
    },
  },

  // Wed 21:00 UTC — Angel Number 777
  {
    label: 'Wed 21:00 — 777',
    payload: {
      post: `777 is not just luck.

It's spiritual alignment. It means you've done the inner work and the universe is responding.

Most people chase 777 without realising it only shows up after consistent growth, faith, and action. You can't shortcut your way to it.

So if you're seeing 777 right now — well done. The work is paying off.

#777 #angelnumbers #spiritualtiktok #numerology #manifestation`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-11-angel-number-777-1772984363766.mp4',
      ],
      scheduleDate: '2026-03-11T21:00:00Z',
    },
  },

  // Thu 17:00 UTC — Angel Number 888 (replacing Mercury Pisces #1)
  {
    label: 'Thu 17:00 — 888 (replacing Mercury Pisces)',
    payload: {
      post: `888 is the abundance code. But not in the way most people think.

It's not about money falling from the sky. It's about cycles completing. What you've been building is about to pay off.

The number 8 on its side is infinity. Three 8s means you're in a loop of return — give, receive, give, receive.

If you're seeing 888 right now, your harvest season is starting.

#888 #angelnumbers #numerology #spiritualtiktok #manifestation`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-12-angel-number-888-1772983698447.mp4',
      ],
      scheduleDate: '2026-03-12T17:00:00Z',
    },
  },

  // Fri 17:00 UTC — Mercury in Pisces (keeping one, making it excellent)
  {
    label: 'Fri 17:00 — Mercury in Pisces',
    payload: {
      post: `Mercury in Pisces hits different when you understand what it actually does.

Your mind stops thinking in logic and starts thinking in feelings. Words are harder to find but poetry comes easily. Conversations go deeper but you say less.

It's not confusion. It's your brain shifting from analytical to intuitive.

Mercury won't be here long. Use it to write, create, dream, and have the conversations you've been putting off.

What are you feeling called to do right now?

#mercuryinpisces #mercury #pisces #astrology #astrologytiktok`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-13-mercury-pisces-1772984827822.mp4',
      ],
      scheduleDate: '2026-03-13T17:00:00Z',
    },
  },

  // Fri 21:00 UTC — Virgo: this week's energy
  {
    label: 'Fri 21:00 — Virgo weekly energy',
    payload: {
      post: `Virgo energy this week is about reclaiming your standards.

You've been bending to keep the peace. Adjusting your needs to fit everyone else's schedule. Shrinking to make others more comfortable.

This week, that stops.

Your time is valuable. Your attention is valuable. Stop treating it like it isn't.

Virgo energy always comes with receipts — what have you been tolerating that you shouldn't be?

#virgo #astrology #zodiac #astrologytiktok #birthchart`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-13-virgo--this-week-s-energy-1772984911649.mp4',
      ],
      scheduleDate: '2026-03-13T21:00:00Z',
    },
  },

  // Sat 21:00 UTC — Bay Leaves Manifestation (replacing Mercury Pisces #3)
  {
    label: 'Sat 21:00 — Bay leaves manifestation (replacing Mercury Pisces)',
    payload: {
      post: `Bay leaves have been used in manifestation rituals for centuries.

Write your wish on a leaf. Burn it. Release the intention with the smoke.

The fire transforms your thought from energy to intention. The smoke carries it out.

Simple. Free. Genuinely ancient.

This is the kind of ritual that works because it's been working for thousands of years — not because someone on the internet told you to try it.

#manifestation #bayleaves #spiritualtiktok #witchtok #lawofattraction`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-10-did-you-know--bay-leaves-have-been-used-in-manifestation-for-centuries--wr----1772983555600.mp4',
      ],
      scheduleDate: '2026-03-14T21:00:00Z',
    },
  },

  // Sun 14:00 UTC — Jupiter
  {
    label: 'Sun 14:00 — Jupiter',
    payload: {
      post: `Jupiter in your birth chart shows where you're meant to grow, expand, and attract luck.

It's the most generous planet in astrology. Wherever Jupiter sits, that area of life gets extra energy and opportunity.

Jupiter in the 2nd house? Money and values grow naturally. In the 7th? Relationships are your golden door. In the 10th? Career is where you shine.

What house is your Jupiter in? Check your chart at Lunary.

#jupiter #astrology #birthchart #astrologytiktok #zodiac`,
      platforms: ['tiktok'],
      mediaUrls: [
        'https://yo9jcrudb2lcgu5l.public.blob.vercel-storage.com/videos/shorts/daily/2026-03-15-jupiter-1772985872410.mp4',
      ],
      scheduleDate: '2026-03-15T14:00:00Z',
    },
  },
];

async function main() {
  console.log(`Submitting ${posts.length} posts to Ayrshare TikTok...\n`);
  for (const { label, payload } of posts) {
    await submitPost(label, payload);
    // Small delay between submissions
    await new Promise((r) => setTimeout(r, 800));
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
