import contextualCopyConfig from '@/constants/contextual-copy.json';

export type ContextualCopy = {
  hub: string;
  sentence: string;
};

type ContextualRule = {
  match: string;
  hub: string;
};

type ContextualCopyConfig = {
  version: number;
  rules: ContextualRule[];
  copy: Record<string, string[]>;
};

const config = contextualCopyConfig as ContextualCopyConfig;

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) + hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function getContextualCopy(pathname: string): ContextualCopy {
  const normalizedPath = pathname || '/';
  const matchingRule = config.rules?.find((rule) =>
    new RegExp(rule.match).test(normalizedPath),
  );
  const hub = matchingRule?.hub || 'universal';
  const pool =
    config.copy?.[hub] ??
    config.copy?.universal ??
    Object.values(config.copy ?? {})?.[0] ??
    [];

  const sentenceIndex =
    pool.length > 0 ? Math.abs(hashString(normalizedPath)) % pool.length : 0;
  const sentence = pool[sentenceIndex] ?? '';

  return { hub, sentence };
}
