import type { Metadata } from 'next';
import Link from 'next/link';
import { SOCIAL_TAGS } from '@/constants/socialHandles';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunary.app';

type ShareTarotSearchParams = {
  card?: string | string[];
  keywords?: string | string[];
  timeframe?: string | string[];
  name?: string | string[];
  date?: string | string[];
  text?: string | string[];
  variant?: string | string[];
  total?: string | string[];
  major?: string | string[];
  minor?: string | string[];
  topSuit?: string | string[];
  topSuitCount?: string | string[];
  suitInsight?: string | string[];
  element?: string | string[];
  insights?: string | string[];
  moonPhase?: string | string[];
  moonTip?: string | string[];
  transit?: string | string[];
  action?: string | string[];
  platform?: string | string[];
};

type ShareTarotPageProps = {
  searchParams?: Promise<ShareTarotSearchParams>;
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

const toNumberParam = (value?: string | string[]) => {
  const raw = toStringParam(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parsePipeList = (value?: string | string[], limit = 4) => {
  const raw = toStringParam(value);
  if (!raw) return [];
  return raw
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, limit);
};

const buildOgImageUrl = ({
  card,
  keywords,
  timeframe,
  name,
  date,
  text,
  variant,
  totalCards,
  major,
  minor,
  topSuit,
  topSuitCount,
  suitInsight,
  element,
  insights,
  moonPhase,
  moonTip,
  transit,
  action,
  platform,
}: {
  card?: string;
  keywords: string[];
  timeframe?: string;
  name?: string;
  date?: string;
  text?: string;
  variant?: string;
  totalCards?: number;
  major?: number;
  minor?: number;
  topSuit?: string;
  topSuitCount?: number;
  suitInsight?: string;
  element?: string;
  insights?: string[];
  moonPhase?: string;
  moonTip?: string;
  transit?: string;
  action?: string;
  platform?: string;
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
  if (typeof totalCards === 'number') params.set('total', String(totalCards));
  if (typeof major === 'number') params.set('major', String(major));
  if (typeof minor === 'number') params.set('minor', String(minor));
  if (topSuit) params.set('topSuit', topSuit);
  if (typeof topSuitCount === 'number')
    params.set('topSuitCount', String(topSuitCount));
  if (suitInsight) params.set('suitInsight', suitInsight);
  if (element) params.set('element', element);
  if (insights?.length) params.set('insights', insights.join('|'));
  if (moonPhase) params.set('moonPhase', moonPhase);
  if (moonTip) params.set('moonTip', moonTip);
  if (transit) params.set('transit', transit);
  if (action) params.set('action', action);
  if (platform) params.set('platform', platform);

  return `${APP_URL}/api/og/share/tarot?${params.toString()}`;
};

export async function generateMetadata({
  searchParams,
}: ShareTarotPageProps): Promise<Metadata> {
  const resolved =
    (await (searchParams ?? Promise.resolve({}))) ?? ({} as const);
  const resolvedSearchParams = resolved as ShareTarotSearchParams;
  const card = toStringParam(resolvedSearchParams.card) ?? 'Your Tarot Card';
  const keywords = parseKeywords(resolvedSearchParams.keywords);
  const variantRaw = toStringParam(resolvedSearchParams.variant);
  const variant = variantRaw ? variantRaw.toLowerCase() : undefined;
  const timeframeRaw =
    toStringParam(resolvedSearchParams.timeframe) ??
    (variant === 'pattern' ? 'Tarot Pattern' : 'Daily');
  const timeframe =
    toTitleCase(timeframeRaw) ??
    (variant === 'pattern' ? 'Tarot Pattern' : 'Daily');
  const nameRaw = toStringParam(resolvedSearchParams.name);
  const name = nameRaw ? toTitleCase(nameRaw) : undefined;
  const isPattern = variant === 'pattern';
  const totalCards = toNumberParam(resolvedSearchParams.total);
  const majorCount = toNumberParam(resolvedSearchParams.major);
  const minorCount = toNumberParam(resolvedSearchParams.minor);
  const topSuitRaw = toStringParam(resolvedSearchParams.topSuit);
  const topSuit = topSuitRaw ? toTitleCase(topSuitRaw) : undefined;
  const topSuitCount = toNumberParam(resolvedSearchParams.topSuitCount);
  const suitInsight = toStringParam(resolvedSearchParams.suitInsight);
  const elementRaw = toStringParam(resolvedSearchParams.element);
  const element = elementRaw ? toTitleCase(elementRaw) : undefined;
  const sharedInsights = parsePipeList(resolvedSearchParams.insights);
  const moonPhaseRaw = toStringParam(resolvedSearchParams.moonPhase);
  const moonPhase = moonPhaseRaw ? toTitleCase(moonPhaseRaw) : undefined;
  const moonTip = toStringParam(resolvedSearchParams.moonTip);
  const transitImpact = toStringParam(resolvedSearchParams.transit);
  const actionPrompt = truncate(toStringParam(resolvedSearchParams.action));
  const platformTag = toStringParam(resolvedSearchParams.platform);
  const descriptionText =
    truncate(toStringParam(resolvedSearchParams.text)) ||
    (keywords.length
      ? `Themes: ${keywords.join(' • ')}`
      : `A ${timeframe.toLowerCase()} tarot ${isPattern ? 'pattern insight' : 'card insight'} from Lunary.`);

  const patternLabel =
    timeframe.endsWith('Pattern') || timeframe.endsWith('Patterns')
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
  if (resolvedSearchParams.card)
    urlParams.set('card', toStringParam(resolvedSearchParams.card)!);
  if (resolvedSearchParams.keywords)
    urlParams.set(
      'keywords',
      parseKeywords(resolvedSearchParams.keywords).join(','),
    );
  if (resolvedSearchParams.timeframe)
    urlParams.set('timeframe', toStringParam(resolvedSearchParams.timeframe)!);
  if (resolvedSearchParams.name)
    urlParams.set('name', toStringParam(resolvedSearchParams.name)!);
  if (resolvedSearchParams.date)
    urlParams.set('date', toStringParam(resolvedSearchParams.date)!);
  if (resolvedSearchParams.text)
    urlParams.set('text', toStringParam(resolvedSearchParams.text)!);
  if (resolvedSearchParams.variant)
    urlParams.set('variant', toStringParam(resolvedSearchParams.variant)!);
  if (resolvedSearchParams.total)
    urlParams.set('total', toStringParam(resolvedSearchParams.total)!);
  if (resolvedSearchParams.major)
    urlParams.set('major', toStringParam(resolvedSearchParams.major)!);
  if (resolvedSearchParams.minor)
    urlParams.set('minor', toStringParam(resolvedSearchParams.minor)!);
  if (resolvedSearchParams.topSuit)
    urlParams.set('topSuit', toStringParam(resolvedSearchParams.topSuit)!);
  if (resolvedSearchParams.topSuitCount)
    urlParams.set(
      'topSuitCount',
      toStringParam(resolvedSearchParams.topSuitCount)!,
    );
  if (resolvedSearchParams.suitInsight)
    urlParams.set(
      'suitInsight',
      toStringParam(resolvedSearchParams.suitInsight)!,
    );
  if (resolvedSearchParams.element)
    urlParams.set('element', toStringParam(resolvedSearchParams.element)!);
  if (resolvedSearchParams.insights)
    urlParams.set('insights', toStringParam(resolvedSearchParams.insights)!);
  if (resolvedSearchParams.moonPhase)
    urlParams.set('moonPhase', toStringParam(resolvedSearchParams.moonPhase)!);
  if (resolvedSearchParams.moonTip)
    urlParams.set('moonTip', toStringParam(resolvedSearchParams.moonTip)!);
  if (resolvedSearchParams.transit)
    urlParams.set('transit', toStringParam(resolvedSearchParams.transit)!);
  if (resolvedSearchParams.action)
    urlParams.set('action', toStringParam(resolvedSearchParams.action)!);
  if (resolvedSearchParams.platform)
    urlParams.set('platform', toStringParam(resolvedSearchParams.platform)!);

  const canonical = `${APP_URL}/share/tarot${
    urlParams.toString() ? `?${urlParams.toString()}` : ''
  }`;

  const ogImage = buildOgImageUrl({
    card,
    keywords,
    timeframe: isPattern ? patternLabel : timeframe,
    name,
    date: toStringParam(resolvedSearchParams.date),
    text: toStringParam(resolvedSearchParams.text),
    variant: toStringParam(resolvedSearchParams.variant),
    totalCards,
    major: majorCount,
    minor: minorCount,
    topSuit,
    topSuitCount,
    suitInsight,
    element,
    insights: sharedInsights,
    moonPhase,
    moonTip,
    transit: transitImpact,
    action: actionPrompt,
    platform: platformTag,
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

export default async function ShareTarotPage({
  searchParams,
}: ShareTarotPageProps) {
  const resolved =
    (await (searchParams ?? Promise.resolve({}))) ?? ({} as const);
  const resolvedSearchParams = resolved as ShareTarotSearchParams;
  const card = toStringParam(resolvedSearchParams.card) ?? 'Your Tarot Card';
  const keywords = parseKeywords(resolvedSearchParams.keywords);
  const variantRaw = toStringParam(resolvedSearchParams.variant);
  const variant = variantRaw ? variantRaw.toLowerCase() : undefined;
  const timeframeBase =
    toStringParam(resolvedSearchParams.timeframe) ??
    (variant === 'pattern' ? 'Tarot Pattern' : 'Daily');
  const timeframe =
    toTitleCase(timeframeBase) ??
    (variant === 'pattern' ? 'Tarot Pattern' : 'Daily');
  const name = toTitleCase(toStringParam(resolvedSearchParams.name));
  const shareDate = toStringParam(resolvedSearchParams.date);
  const text = truncate(toStringParam(resolvedSearchParams.text));
  const isPattern = variant === 'pattern';
  const patternLabel =
    timeframe.endsWith('Pattern') || timeframe.endsWith('Patterns')
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
  const sharedCardCount = toNumberParam(resolvedSearchParams.total);
  const sharedMajor = toNumberParam(resolvedSearchParams.major);
  const sharedMinor = toNumberParam(resolvedSearchParams.minor);
  const sharedTopSuitRaw = toStringParam(resolvedSearchParams.topSuit);
  const sharedTopSuit = sharedTopSuitRaw
    ? toTitleCase(sharedTopSuitRaw)
    : undefined;
  const sharedTopSuitCount = toNumberParam(resolvedSearchParams.topSuitCount);
  const sharedSuitInsight = toStringParam(resolvedSearchParams.suitInsight);
  const sharedElementRaw = toStringParam(resolvedSearchParams.element);
  const sharedElement = sharedElementRaw
    ? toTitleCase(sharedElementRaw)
    : undefined;
  const sharedInsights = parsePipeList(resolvedSearchParams.insights);
  const combinedInsights = Array.from(
    new Set(
      [sharedSuitInsight, ...sharedInsights].filter((entry): entry is string =>
        Boolean(entry),
      ),
    ),
  );
  const sharedMoonPhaseRaw = toStringParam(resolvedSearchParams.moonPhase);
  const sharedMoonPhase = sharedMoonPhaseRaw
    ? toTitleCase(sharedMoonPhaseRaw)
    : undefined;
  const sharedMoonTip = toStringParam(resolvedSearchParams.moonTip);
  const sharedTransitImpact = toStringParam(resolvedSearchParams.transit);
  const sharedActionPrompt = truncate(
    toStringParam(resolvedSearchParams.action),
  );
  const platformTag = toStringParam(resolvedSearchParams.platform);
  const highlightedHandle = platformTag
    ? SOCIAL_TAGS.find((tag) => tag.platform === platformTag)?.handle
    : SOCIAL_TAGS[0]?.handle;
  const highlightedPlatformLabel = platformTag
    ? SOCIAL_TAGS.find((tag) => tag.platform === platformTag)?.label
    : undefined;
  const patternStats = [
    typeof sharedMajor === 'number' && {
      label: 'Major Arcana',
      value: `${sharedMajor}`,
      helper:
        sharedCardCount && sharedMajor >= 0
          ? `${Math.round((sharedMajor / sharedCardCount) * 100)}% of pulls`
          : 'Depth lessons',
    },
    typeof sharedMinor === 'number' && {
      label: 'Minor Arcana',
      value: `${sharedMinor}`,
      helper:
        sharedCardCount && sharedMinor >= 0
          ? `${Math.round((sharedMinor / sharedCardCount) * 100)}% of pulls`
          : 'Life logistics',
    },
    sharedTopSuit && {
      label: sharedElement
        ? `${sharedTopSuit} · ${sharedElement}`
        : sharedTopSuit,
      value: sharedTopSuitCount
        ? `${sharedTopSuitCount}${
            sharedCardCount
              ? ` (${Math.round((sharedTopSuitCount / sharedCardCount) * 100)}%)`
              : ''
          }`
        : sharedTopSuit,
      helper: sharedSuitInsight
        ? undefined
        : sharedElement
          ? 'Elemental dominance'
          : 'Suit dominance',
    },
  ].filter(Boolean) as Array<{ label: string; value: string; helper?: string }>;

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-zinc-950 via-indigo-950 to-purple-900 py-12 text-white sm:py-16'>
      <div className='mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8'>
        <div className='w-full rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur'>
          <p className='text-xs uppercase tracking-[0.35em] text-purple-200/80'>
            Shared from Lunary
          </p>
          <h1 className='mt-6 text-2xl font-light text-white sm:text-3xl'>
            {shareTitle}
          </h1>
          <p className='mt-2 text-sm text-purple-200/80'>
            {variantLabel
              ? `${variantLabel} guidance`
              : 'Personal cosmic insight'}
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

          {isPattern && (
            <div className='mt-10 space-y-8 text-left'>
              {patternStats.length > 0 && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
                  <p className='text-xs uppercase tracking-[0.35em] text-purple-200/80'>
                    Pattern Metrics
                  </p>
                  <dl className='mt-5 grid gap-4 sm:grid-cols-2'>
                    {patternStats.map((stat) => (
                      <div
                        key={stat.label}
                        className='rounded-2xl border border-white/10 bg-black/30 p-4'
                      >
                        <dt className='text-xs uppercase tracking-[0.3em] text-zinc-400'>
                          {stat.label}
                        </dt>
                        <dd className='mt-2 text-2xl font-light text-white'>
                          {stat.value}
                        </dd>
                        {stat.helper && (
                          <p className='mt-1 text-xs text-zinc-400'>
                            {stat.helper}
                          </p>
                        )}
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {combinedInsights.length > 0 && (
                <div className='rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6'>
                  <p className='text-xs uppercase tracking-[0.35em] text-indigo-200/80'>
                    Signal Highlights
                  </p>
                  <div className='mt-4 space-y-3 text-base leading-relaxed text-zinc-100/90'>
                    {combinedInsights.map((insight, index) => (
                      <p key={`${insight}-${index}`}>{insight}</p>
                    ))}
                  </div>
                </div>
              )}

              {(sharedMoonPhase || sharedMoonTip || sharedTransitImpact) && (
                <div className='grid gap-4 md:grid-cols-2'>
                  {(sharedMoonPhase || sharedMoonTip) && (
                    <div className='rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6'>
                      <p className='text-xs uppercase tracking-[0.35em] text-purple-200/80'>
                        Moon Widget
                      </p>
                      <p className='mt-3 text-2xl font-light text-white'>
                        {sharedMoonPhase ?? 'Current lunar flow'}
                      </p>
                      {sharedMoonTip && (
                        <p className='mt-2 text-sm leading-relaxed text-purple-100/80'>
                          {sharedMoonTip}
                        </p>
                      )}
                    </div>
                  )}
                  {sharedTransitImpact && (
                    <div className='rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6'>
                      <p className='text-xs uppercase tracking-[0.35em] text-amber-200/80'>
                        Personal Transit Impact
                      </p>
                      <p className='mt-3 text-sm leading-relaxed text-amber-100/90'>
                        {sharedTransitImpact}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {sharedActionPrompt && (
                <div className='rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6'>
                  <p className='text-xs uppercase tracking-[0.35em] text-emerald-200/80'>
                    Action Prompt
                  </p>
                  <p className='mt-3 text-base leading-relaxed text-emerald-50/90'>
                    {sharedActionPrompt}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className='mt-12 space-y-4 text-sm text-zinc-200/80'>
            <p>
              Ready to explore your own tarot journey? Lunary creates
              personalized readings using real astronomical data and your unique
              cosmic signature.
            </p>
            <p>
              Discover daily guidance, pattern insights, moon widgets, and
              personal transit stories that update in real-time with each
              shuffle of the universe.
            </p>
          </div>

          <div className='mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-left'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between'>
              <p className='text-xs uppercase tracking-[0.35em] text-purple-200/80'>
                Tag us when you post
              </p>
              {highlightedHandle && (
                <p className='text-xs text-purple-100/80'>
                  {highlightedPlatformLabel
                    ? `Posting to ${highlightedPlatformLabel}? Use ${highlightedHandle} so we can reshare.`
                    : `Use ${highlightedHandle} so we can reshare your spread.`}
                </p>
              )}
            </div>
            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              {SOCIAL_TAGS.map((tag) => (
                <div
                  key={tag.platform}
                  className='rounded-2xl border border-white/10 bg-black/30 p-4 text-left'
                >
                  <p className='text-xs uppercase tracking-[0.3em] text-zinc-400'>
                    {tag.label}
                  </p>
                  <p className='mt-1 text-lg font-semibold text-white'>
                    {tag.handle}
                  </p>
                </div>
              ))}
            </div>
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
