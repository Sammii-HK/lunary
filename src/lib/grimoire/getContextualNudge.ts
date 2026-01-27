import contextualNudgesConfig from '@/constants/contextual-nudges.json';
import ctaExamplesData from '@/lib/cta-examples.json';

export type ContextualNudge = {
  hub: string;
  headline: string;
  subline: string;
  buttonLabel: string;
  href: string;
  action: 'authOrLink' | 'link';
  exampleType?: string;
  exampleText?: string;
  ctaVariant?: string;
  ctaHeadline?: string;
  ctaSubline?: string;
};

type CTAExample = {
  type: string;
  text: string;
  interpretation: string;
};

type CTAExamplesHubs = {
  horoscopes?: { examples: CTAExample[] };
  planets?: { examples: CTAExample[] };
  houses?: { examples: CTAExample[] };
  transits?: { examples: CTAExample[] };
  moon?: { examples: CTAExample[] };
  aspects?: { examples: CTAExample[] };
  [hub: string]: { examples: CTAExample[] } | undefined;
};

type CTAExamples = {
  generatedAt: string;
  generatedForDate: string;
  reference: {
    birthDate: string;
    birthTime: string;
    birthLocation: string;
  };
} & CTAExamplesHubs;

type ContextualRule = {
  match: string;
  hub: string;
};

type ContextualNudgesConfig = {
  version: number;
  rules: ContextualRule[];
  ctaNudges: Record<string, Array<Omit<ContextualNudge, 'hub'>>>;
};

const config = contextualNudgesConfig as ContextualNudgesConfig;
const ctaExamples = ctaExamplesData as CTAExamples;

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) + hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Get an example for a given hub and pathname
 * Uses deterministic selection based on pathname
 */
function getExampleForHub(hub: string, pathname: string): CTAExample | null {
  const hubExamples = ctaExamples[hub];
  if (
    !hubExamples ||
    !hubExamples.examples ||
    hubExamples.examples.length === 0
  ) {
    return null;
  }

  const examples = hubExamples.examples;
  const index = Math.abs(hashString(pathname)) % examples.length;
  return examples[index];
}

/**
 * Replace example placeholders in text with actual examples
 */
function injectExamples(text: string, hub: string, pathname: string): string {
  const example = getExampleForHub(hub, pathname);
  if (!example) {
    return text;
  }

  // Replace placeholders
  return text
    .replace(/{EXAMPLE_TEXT}/g, example.text)
    .replace(/{EXAMPLE_INTERPRETATION}/g, example.interpretation)
    .replace(/{EXAMPLE}/g, `${example.text} — ${example.interpretation}`);
}

export function getContextualNudge(pathname: string): ContextualNudge {
  const normalizedPath = pathname || '/';
  const matchingRule = config.rules?.find((rule) =>
    new RegExp(rule.match).test(normalizedPath),
  );
  const hub = matchingRule?.hub || 'universal';
  const pool =
    config.ctaNudges?.[hub] ??
    config.ctaNudges?.universal ??
    Object.values(config.ctaNudges ?? {})?.[0] ??
    [];

  const index =
    pool.length > 0 ? Math.abs(hashString(normalizedPath)) % pool.length : 0;
  const base = pool[index] ?? {
    headline: '',
    subline: '',
    buttonLabel: '',
    href: '',
    action: 'authOrLink',
  };

  // Get example for tracking
  const example = getExampleForHub(hub, normalizedPath);

  // Inject examples into headline and subline
  return {
    hub,
    ...base,
    headline: injectExamples(base.headline, hub, normalizedPath),
    subline: injectExamples(base.subline, hub, normalizedPath),
    exampleType: example?.type,
    exampleText: example?.text,
    ctaVariant: `${hub}_${index}`,
    ctaHeadline: base.headline,
    ctaSubline: base.subline,
  };
}

export function getContextualHub(
  pathname: string,
  fallbackHub = 'universal',
): string {
  const normalizedPath = pathname || '/';
  const matchingRule = config.rules?.find((rule) =>
    new RegExp(rule.match).test(normalizedPath),
  );
  return matchingRule?.hub || fallbackHub;
}
