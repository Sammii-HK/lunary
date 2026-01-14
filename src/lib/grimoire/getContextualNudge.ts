import contextualNudgesConfig from '@/constants/contextual-nudges.json';

export type ContextualNudge = {
  hub: string;
  headline: string;
  subline: string;
  buttonLabel: string;
  href: string;
  action: 'authOrLink' | 'link';
};

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

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) + hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
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

  return { hub, ...base };
}
