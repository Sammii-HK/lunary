import type { SourcePack } from './types';

const PRACTICAL_STAKE_RE =
  /\b(money|wallet|text|texts|work|job|family|body|plan|plans|relationship|deadline|decision|commitment|value|yes|control|power|cost)\b/i;

const GENERIC_TRANSIT_CTA_RE =
  /\b(comment below|comment your sign|comment your take|drop a comment|follow for more|comment if this resonates)\b/i;

const ABSTRACT_FILLER_RE =
  /\b(tap into your inner|true potential|essence of being|power and vitality|high vibration|sacred energy|rare transit can be a game-changer|symboli[sz]es power|flip your life|totally flip your life|vitality and attention|focus to the house|house it's passing through|can totally)\b/i;

const VAGUE_TRANSIT_LINE_RE = /\bis about to transit\b/i;

const CONCRETE_SCENE_RE =
  /\b(text|deadline|money|wallet|work|job|family|friend|relationship|room|meeting|call|choice|decision|post|video|body|sleep|spending|reply|message|plan)\b/i;

function hasAnyRelatedKeyword(content: string, keywords: string[]): boolean {
  const lower = content.toLowerCase();
  return keywords.some((keyword) => {
    const cleaned = keyword.trim().toLowerCase();
    return cleaned.length > 2 && lower.includes(cleaned);
  });
}

function hasAnySceneHint(content: string, hints: string[]): boolean {
  const lower = content.toLowerCase();
  return hints.some((hint) => {
    const cleaned = hint.trim().toLowerCase();
    return cleaned.length > 3 && lower.includes(cleaned);
  });
}

function buildConcreteOpening(pack: SourcePack): string {
  const topic = pack.topicTitle;
  const hint = pack.sceneHints?.[0]?.toLowerCase() ?? '';
  if (!hint) return topic;

  if (hint.includes('how you show up at work')) {
    return `${topic} can change how you show up at work.`;
  }
  if (hint.includes('message')) {
    return `${topic} can change the way you answer a message.`;
  }
  if (hint.includes('bank app') || hint.includes('cart before checkout')) {
    return `${topic} can change how you look at your bank app.`;
  }
  if (
    hint.includes('conversation at home') ||
    hint.includes('relationship decision')
  ) {
    return `${topic} can change a conversation at home.`;
  }
  if (hint.includes('room when you walk in')) {
    return `${topic} can change the room when you walk in.`;
  }
  return `${topic} can show up in ${pack.sceneHints?.[0]}.`;
}

function buildConcreteSupportLine(pack: SourcePack): string {
  const hint = pack.sceneHints?.[0]?.toLowerCase() ?? '';
  if (hint.includes('message')) {
    return 'It tends to show up in a reply or a message thread.';
  }
  if (hint.includes('work')) {
    return 'It tends to show up in a meeting or work email.';
  }
  if (hint.includes('bank app') || hint.includes('cart before checkout')) {
    return 'It tends to show up in what you buy or hold back from buying.';
  }
  if (
    hint.includes('conversation at home') ||
    hint.includes('relationship decision')
  ) {
    return 'It tends to show up in a conversation at home.';
  }
  return 'It tends to show up in one real-life decision you can picture.';
}

function buildConcreteCloser(pack: SourcePack): string {
  const lower = pack.relatedKeywords.join(' ').toLowerCase();
  if (/\b(identity|purpose|ego|self|authentic|individuality)\b/i.test(lower)) {
    return 'That is where identity and purpose get louder.';
  }
  if (/\b(power|vitality|energy|focus)\b/i.test(lower)) {
    return 'That is where your energy gets easier to notice.';
  }
  if (/\b(text|message|communication|talk|speak|voice)\b/i.test(lower)) {
    return 'That changes how you answer and what you say next.';
  }
  return 'That is where the shift becomes obvious.';
}

function getTransitDateLabel(pack: SourcePack): string | null {
  return pack.transitBrief?.date
    ? new Date(`${pack.transitBrief.date}T12:00:00Z`).toLocaleDateString(
        'en-GB',
        {
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        },
      )
    : null;
}

export function getPersonalizedReadingCta(pack: SourcePack): string {
  if (pack.platform === 'tiktok') {
    return "Comment 'reading' and your sign for the personal angle";
  }
  if (pack.platform === 'instagram') {
    return "Comment 'reading' and your sign if you want the personal angle";
  }
  return 'Reply with your sign if you want the personal angle';
}

export function getVideoCaptionQualityIssues(
  lines: string[],
  pack: SourcePack,
): string[] {
  const issues: string[] = [];
  const combined = lines.join(' ').toLowerCase();
  const firstLine = lines[0]?.toLowerCase() ?? '';
  const dateLabel = getTransitDateLabel(pack)?.toLowerCase() ?? null;

  if (pack.transitBrief) {
    if (dateLabel && !combined.includes(dateLabel)) {
      issues.push(
        `Name the event date or timing window explicitly: ${dateLabel}.`,
      );
    }
    if (!PRACTICAL_STAKE_RE.test(combined)) {
      issues.push('Make the transit consequence more practical and concrete.');
    }
    if (!PRACTICAL_STAKE_RE.test(firstLine)) {
      issues.push(
        'Make the first line carry the consequence, not just the event name.',
      );
    }
    if (
      pack.platform === 'tiktok' &&
      (!lines[lines.length - 1] ||
        !/(reading|personal|big 3|big three|chart|angle)/i.test(
          lines[lines.length - 1],
        ))
    ) {
      issues.push(
        'End with a personalized reading CTA, not generic engagement filler.',
      );
    }
  }

  if (!CONCRETE_SCENE_RE.test(combined)) {
    issues.push(
      'Add one concrete scene, object, or action so the copy reads like lived experience instead of an abstract interpretation.',
    );
  }

  if (
    pack.relatedKeywords.length > 0 &&
    !hasAnyRelatedKeyword(combined, pack.relatedKeywords.slice(0, 5))
  ) {
    issues.push(
      'Use one of the provided related keywords so the copy stays grounded in the source material.',
    );
  }

  if (
    pack.relatedKeywords.length > 0 &&
    !hasAnyRelatedKeyword(firstLine, pack.relatedKeywords.slice(0, 5))
  ) {
    issues.push(
      'Put one of the provided related keywords in the first line so the hook is grounded immediately.',
    );
  }

  if (pack.sceneHints?.length && !hasAnySceneHint(combined, pack.sceneHints)) {
    issues.push(
      'Use one of the provided concrete scene hints so the copy lands in a real-world moment.',
    );
  }

  if (
    ABSTRACT_FILLER_RE.test(combined) ||
    VAGUE_TRANSIT_LINE_RE.test(combined)
  ) {
    issues.push(
      'Replace abstract mystical filler with a concrete life effect, specific timing, or practical consequence.',
    );
  }

  return issues;
}

export function normalizeVideoCaptionLines(
  lines: string[],
  pack: SourcePack,
): string[] {
  const normalized = [...lines];
  const cta = getPersonalizedReadingCta(pack);

  if (normalized.length === 0) {
    return [cta];
  }

  const firstLine = normalized[0];
  const needsConcreteOpening =
    !hasAnyRelatedKeyword(firstLine, pack.relatedKeywords.slice(0, 5)) ||
    (pack.sceneHints?.length
      ? !hasAnySceneHint(firstLine, pack.sceneHints)
      : false);
  if (needsConcreteOpening && pack.sceneHints?.length) {
    normalized[0] = buildConcreteOpening(pack);
  }

  if (normalized.length > 1) {
    const secondLine = normalized[1];
    const needsConcreteSecond =
      !hasAnyRelatedKeyword(secondLine, pack.relatedKeywords.slice(0, 5)) ||
      (pack.sceneHints?.length
        ? !hasAnySceneHint(secondLine, pack.sceneHints)
        : false);
    if (needsConcreteSecond && pack.sceneHints?.length) {
      normalized[1] = buildConcreteSupportLine(pack);
    }
  }

  if (normalized.length > 2) {
    const thirdLine = normalized[2];
    const needsConcreteThird =
      !hasAnyRelatedKeyword(thirdLine, pack.relatedKeywords.slice(0, 5)) ||
      (pack.sceneHints?.length
        ? !hasAnySceneHint(thirdLine, pack.sceneHints)
        : false);
    if (needsConcreteThird) {
      normalized[2] = buildConcreteCloser(pack);
    }
  }

  if (!pack.transitBrief) {
    return normalized;
  }

  const lastIndex = normalized.length - 1;
  if (
    GENERIC_TRANSIT_CTA_RE.test(normalized[lastIndex]) ||
    !/(reading|personal|big 3|big three|chart|angle)/i.test(
      normalized[lastIndex],
    )
  ) {
    normalized[lastIndex] = cta;
  }

  return normalized;
}

export function getSocialCopyQualityIssues(
  content: string,
  pack: SourcePack,
): string[] {
  const issues: string[] = [];
  const lower = content.toLowerCase();
  const dateLabel = getTransitDateLabel(pack)?.toLowerCase() ?? null;

  if (pack.transitBrief) {
    if (dateLabel && !lower.includes(dateLabel)) {
      issues.push(
        `Name the event date or timing window explicitly: ${dateLabel}.`,
      );
    }
    if (!PRACTICAL_STAKE_RE.test(lower)) {
      issues.push('Make the transit consequence more practical and concrete.');
    }
    if (
      pack.platform === 'tiktok' &&
      GENERIC_TRANSIT_CTA_RE.test(lower) &&
      !/(reading|personal|big 3|big three|chart|angle)/i.test(lower)
    ) {
      issues.push(
        'Use a personalized reading CTA, not generic engagement filler.',
      );
    }
  }

  if (ABSTRACT_FILLER_RE.test(lower) || VAGUE_TRANSIT_LINE_RE.test(lower)) {
    issues.push(
      'Cut abstract mystical filler. Use a specific consequence, real life area, or concrete behavior shift instead.',
    );
  }

  if (!CONCRETE_SCENE_RE.test(lower)) {
    issues.push(
      'Add one concrete scene, object, or action so the copy reads like lived experience instead of an abstract interpretation.',
    );
  }

  if (
    pack.relatedKeywords.length > 0 &&
    !hasAnyRelatedKeyword(lower, pack.relatedKeywords.slice(0, 5))
  ) {
    issues.push(
      'Use one of the provided related keywords so the copy stays grounded in the source material.',
    );
  }

  const firstLine = content.split(/\n/)[0] || '';
  if (
    pack.relatedKeywords.length > 0 &&
    !hasAnyRelatedKeyword(firstLine, pack.relatedKeywords.slice(0, 5))
  ) {
    issues.push(
      'Put one of the provided related keywords in the first line so the hook is grounded immediately.',
    );
  }

  if (pack.sceneHints?.length && !hasAnySceneHint(lower, pack.sceneHints)) {
    issues.push(
      'Use one of the provided concrete scene hints so the copy lands in a real-world moment.',
    );
  }

  return issues;
}
