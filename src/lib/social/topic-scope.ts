const normalizeTopicKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

type RelatedConceptMap = Record<string, string[]>;

const ALLOWED_RELATED_CONCEPTS: RelatedConceptMap = {
  'lunar nodes': ['moon phases', 'lunar phases', 'new moon', 'full moon'],
  'north node': ['south node', 'lunar nodes'],
  'south node': ['north node', 'lunar nodes'],
  'new moon': ['moon phases', 'lunar phases'],
  'full moon': ['moon phases', 'lunar phases'],
  eclipses: ['lunar nodes', 'north node', 'south node'],
};

export const getAllowedRelatedConcepts = (topic: string): string[] => {
  const key = normalizeTopicKey(topic);
  return ALLOWED_RELATED_CONCEPTS[key] || [];
};

export const buildScopeGuard = (topic: string): string => {
  const allowed = getAllowedRelatedConcepts(topic);
  const allowedLine = allowed.length > 0 ? allowed.join(', ') : 'none';
  return `Scope guard: Only mention secondary concepts if they are the current topic "${topic}" or in this allowed list: ${allowedLine}.`;
};
