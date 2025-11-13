import type { Metadata } from 'next';
import Link from 'next/link';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunary.app';

type ShareTarotPageProps = {
  searchParams: {
    card?: string | string[];
    keywords?: string | string[];
    timeframe?: string | string[];
    name?: string | string[];
    date?: string | string[];
    text?: string | string[];
    variant?: string | string[];
  };
};

const toStringParam = (value?: string | string[]) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const toTitleCase = (value?: string) => {
  if (!value) return undefined;
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const parseKeywords = (value?: string | string[]) => {
  const raw = toStringParam(value);
  if (!raw) return [];
  return raw
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 5);
};

const truncate = (value?: string, limit = 140) => {
  if (!value) return undefined;
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1).trimEnd()}…`;
};

const buildOgImageUrl = ({
  card,
  keywords,
  timeframe,
  name,
  date,
  text,
  variant,
}: {
  card?: string;
  keywords: string[];
  timeframe?: string;
  name?: string;
  date?: string;
  text?: string;
  variant?: string;
}) => {
  const params = new URLSearchParams();
  if (card) params.set('card', card);
  if (keywords.length) params.set('keywords', keywords.join(','));
  if (timeframe) params.set('timeframe', timeframe);
  if (name) params.set('name', name);
  if (date) params.set('date', date);
  const textValue = truncate(text, 120);
  if (textValue) params.set('text', textValue);
  if (variant) params.set('variant', variant);

  return `${APP_URL}/api/og/share/tarot?${params.toString()}`;
};

export async function generateMetadata({
  searchParams,
}: ShareTarotPageProps): Promise<Metadata> {
  const card = toStringParam(searchParams.card) ?? 'Your Tarot Card';
  const keywords = parseKeywords(searchParams.keywords);
  const variantRaw = toStringParam(searchParams.variant);
  const variant = variantRaw ? variantRaw.toLowerCase() : undefined;
  const timeframeRaw =
    toStringParam(searchParams.timeframe) ?? (variant === 'pattern' ? 'Tarot Pattern' : 'Daily');
  const timeframe = toTitleCase(timeframeRaw) ?? (variant === 'pattern' ? 'Tarot Pattern' : 'Daily');
  const nameRaw = toStringParam(searchParams.name);
  const name = nameRaw ? toTitleCase(nameRaw) : undefined;
  const isPattern = variant === 'pattern';
  const descriptionText =
    truncate(toStringParam(searchParams.text)) ||
    (keywords.length
      ? `Themes: ${keywords.join(' • ')}`
      : `A ${timeframe.toLowerCase()} tarot ${isPattern ? 'pattern insight' : 'card insight'} from Lunary.`);

  const patternLabel = timeframe.endsWith('Pattern') || timeframe.endsWith('Patterns')
    ? timeframe
    : `${timeframe}${isPattern ? ' Tarot Patterns' : ''}`;
  const title = isPattern
    ? name
      ? `${name}'s ${patternLabel}`
      : `${patternLabel}`
    : name
      ? `${name}'s ${timeframe} Tarot Card: ${card}`
      : `${timeframe} Tarot Spotlight: ${card}`;

  const urlParams = new URLSearchParams();
  if (searchParams.card) urlParams.set('card', toStringParam(searchParams.card)!);
  if (searchParams.keywords)
    urlParams.set('keywords', parseKeywords(searchParams.keywords).join(','));
  if (searchParams.timeframe)
    urlParams.set('timeframe', toStringParam(searchParams.timeframe)!);
  if (searchParams.name) urlParams.set('name', toStringParam(searchParams.name)!);
  if (searchParams.date) urlParams.set('date', toStringParam(searchParams.date)!);
  if (searchParams.text) urlParams.set('text', toStringParam(searchParams.text)!);
  if (searchParams.variant) urlParams.set('variant', toStringParam(searchParams.variant)!);

  const canonical = `${APP_URL}/share/tarot${
    urlParams.toString() ? `?${urlParams.toString()}` : ''
  }`;

  const ogImage = buildOgImageUrl({
    card,
    keywords,
    timeframe: isPattern ? patternLabel : timeframe,
    name,
    date: toStringParam(searchParams.date),
    text: toStringParam(searchParams.text),
    variant: toStringParam(searchParams.variant),
  });

  return {
    title,
    description: descriptionText,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: descriptionText,
      url: canonical,
      siteName: 'Lunary',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: descriptionText,
      images: [ogImage],
    },
  };
}

export default function ShareTarotPage({
  searchParams,
}: ShareTarotPageProps) {
  const card = toStringParam(searchParams.card) ?? 'Your Tarot Card';
  const keywords = parseKeywords(searchParams.keywords);
  const variantRaw = toStringParam(searchParams.variant);
  const variant = variantRaw ? variantRaw.toLowerCase() : undefined;
  const timeframeBase =
    toStringParam(searchParams.timeframe) ?? (variant === 'pattern' ? 'Tarot Pattern' : 'Daily');
  const timeframe = toTitleCase(timeframeBase) ?? (variant === 'pattern' ? 'Tarot Pattern' : 'Daily');
  const name = toTitleCase(toStringParam(searchParams.name));
  const shareDate = toStringParam(searchParams.date);
  const text = truncate(toStringParam(searchParams.text));
  const isPattern = variant === 'pattern';
  const patternLabel = timeframe.endsWith('Pattern') || timeframe.endsWith('Patterns')
    ? timeframe
    : `${timeframe}${isPattern ? ' Tarot Patterns' : ''}`;
  const shareTitle = isPattern
    ? name
      ? `${name}'s ${patternLabel}`
      : `${patternLabel}`
    : name
      ? `${name}'s ${timeframe} Tarot Card`
      : `${timeframe} Tarot Spotlight`;
  const variantLabel = variant ? toTitleCase(variant) : undefined;

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-zinc-950 via-indigo-950 to-purple-900 text-white'>
      <div className='mx-auto flex min-h-screen max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8'>
        <div className='w-full rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur'>
          <p className='text-xs uppercase tracking-[0.35em] text-purple-200/80'>
            Shared from Lunary
          </p>
          <h1 className='mt-6 text-2xl font-light text-white sm:text-3xl'>
            {shareTitle}
          </h1>
          <p className='mt-2 text-sm text-purple-200/80'>
            {variantLabel ? `${variantLabel} guidance` : 'Personal cosmic insight'}
            {shareDate ? ` · ${shareDate}` : null}
          </p>

          <div className='mt-10 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-8'>
            <p className='text-sm uppercase tracking-[0.3em] text-purple-200/70'>
              Featured Card
            </p>
            <p className='mt-4 text-3xl font-light text-white sm:text-4xl'>
              {card}
            </p>
            {keywords.length > 0 && (
              <p className='mt-4 text-sm text-purple-100/80'>
                {keywords.join(' • ')}
              </p>
            )}
            {text && (
              <p className='mt-6 text-base leading-relaxed text-zinc-100/90'>
                {text}
              </p>
            )}
          </div>

          <div className='mt-12 space-y-4 text-sm text-zinc-200/80'>
            <p>
              Ready to explore your own tarot journey? Lunary creates personalized
              readings using real astronomical data and your unique cosmic
              signature.
            </p>
            <p>
              Discover daily guidance, pattern insights, and shareable cosmic
              highlights that update in real-time with each shuffle of the
              universe.
            </p>
          </div>

          <div className='mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
            <Link
              href='/tarot'
              className='inline-flex items-center rounded-full bg-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-400'
            >
              Get your personalized tarot reading
            </Link>
            <Link
              href='/'
              className='text-sm font-medium text-purple-200/80 transition hover:text-purple-100'
            >
              Explore Lunary →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
