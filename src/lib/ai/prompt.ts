import { LunaryContext } from './types';

const toneGuidance = `
You are Lunary — a calm, intuitive astro–tarot companion.
Write in gentle, grounded British English, weaving poetic imagery only when it deepens understanding.
You interpret cosmic patterns; you never predict outcomes or offer medical, legal, or financial advice.
Always ground insights in astrology, tarot, or lunar context available to you.
Always offer a short reflective prompt using the exact wording: "You could journal on…".
Keep responses under 10 sentences unless the user explicitly asks for more detail.
`.trim();

const safetyGuidance = `
If the user requests disallowed guidance (fortune telling, health/finance/legal certainty), respond with boundaries, refocusing on reflective insight.
If the user mentions harm or crisis, encourage seeking professional help and provide grounding cosmic context without minimising their feelings.
`.trim();

const formattingGuidance = `
Use concise paragraphs separated by blank lines.
Surface highlights using natural prose; avoid bullet lists unless the user requests structured steps.
`.trim();

export const SYSTEM_PROMPT = `
${toneGuidance}

${safetyGuidance}

${formattingGuidance}

Context data is provided as JSON. Reference it explicitly when offering insights.
`.trim();

type PromptSections = {
  system: string;
  memory: string | null;
  context: string;
  userMessage: string;
};

const formatMemory = (entries: string[]): string =>
  entries.length > 0 ? entries.map((entry) => `- ${entry}`).join('\n') : '';

const describeContext = (context: LunaryContext): string => {
  const prune = (value: unknown): unknown => {
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) {
      const pruned = value
        .map(prune)
        .filter((entry): entry is unknown => entry !== undefined);
      return pruned.length > 0 ? pruned : undefined;
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
        .map(([key, val]) => {
          const prunedVal = prune(val);
          return prunedVal !== undefined ? [key, prunedVal] : null;
        })
        .filter(Boolean) as [string, unknown][];

      if (entries.length === 0) return undefined;

      return Object.fromEntries(entries);
    }
    return value;
  };

  const payload = prune({
    user: context.user,
    birthChart: context.birthChart,
    currentTransits: context.currentTransits,
    moon: context.moon,
    tarot: context.tarot,
    mood: context.mood,
  });

  const parts: string[] = [];
  parts.push(JSON.stringify(payload ?? {}, null, 2));

  if (context.history.lastMessages.length > 0) {
    parts.push(
      'Recent conversation turns:',
      context.history.lastMessages
        .slice(0, 5)
        .map(
          (message) =>
            `${message.role.toUpperCase()} @ ${message.ts} (${message.tokens} tokens)`,
        )
        .join('\n'),
    );
  }

  return parts.join('\n\n');
};

export const buildPromptSections = ({
  context,
  memorySnippets,
  userMessage,
}: {
  context: LunaryContext;
  memorySnippets: string[];
  userMessage: string;
}): PromptSections => {
  const memory =
    memorySnippets.length > 0
      ? `Long-term memory snippets:\n${formatMemory(memorySnippets)}`
      : null;

  return {
    system: SYSTEM_PROMPT,
    memory,
    context: `Context data:\n${describeContext(context)}`,
    userMessage,
  };
};
