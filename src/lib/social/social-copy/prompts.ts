/**
 * Prompt builders for social copy generation
 */

import type { SourcePack } from './types';
import { POST_TYPE_SPECS } from './constants';
import { SOCIAL_POST_STYLE_INSTRUCTION } from './style-instructions';
import { buildNoveltyInstruction } from './novelty';

/**
 * Build educational post prompt
 */
export const buildEducationalPrompt = (pack: SourcePack): string => {
  const spec = POST_TYPE_SPECS[pack.postType];
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(
    pack.platform,
    pack.postType,
  );

  const domainContext = pack.needsContext
    ? `Make it clear this is about ${pack.categoryLabel.toLowerCase()} - ground it in that context.`
    : `This is within ${pack.categoryLabel.toLowerCase()}.`;

  const timingNote =
    pack.platform === 'threads' ||
    ['educational_deep_2', 'closing_statement', 'closing_ritual'].includes(
      pack.postType,
    )
      ? `If it fits naturally, you can mention timing (today, this week, tonight, next few days).`
      : '';

  const reflectionNote = pack.allowJournaling
    ? 'You can invite gentle reflection or journaling if it feels right.'
    : 'Keep it practical and observational rather than journaling-focused.';

  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);

  return `Write a social post about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

${pack.grimoireFacts
  .slice(0, 2)
  .map((fact) => `• ${fact}`)
  .join('\n')}

${domainContext}

Tone: ${spec.toneNote}
${styleGuidance}

${timingNote}
${reflectionNote}

Important:
• Use natural, conversational language
• Vary your sentence structure and openings
• Avoid formulaic phrases like "Many believe" or "can deepen your understanding"
• Stay factual but not deterministic - use "tends to", "often", "can" rather than "always" or "guarantees"
• Don't mention Lunary or the Grimoire
• ${spec.sentenceCount[0]}-${spec.sentenceCount[1]} sentences
${noveltyNote ? `\n${noveltyNote}` : ''}

Return JSON:
{
  "content": "your post text here",
  "hashtags": ["optional"],
  "safetyChecks": []
}`;
};

/**
 * Build video caption prompt
 */
export const buildVideoCaptionPrompt = (pack: SourcePack): string => {
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(
    pack.platform,
    pack.postType,
  );

  const domainContext = pack.needsContext
    ? `This is about ${pack.categoryLabel.toLowerCase()} - make that clear.`
    : `Context: ${pack.categoryLabel.toLowerCase()}.`;

  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);

  return `Write a video caption about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

${pack.grimoireFacts
  .slice(0, 2)
  .map((fact) => `• ${fact}`)
  .join('\n')}

${domainContext}

${styleGuidance}

Write 2-4 lines that:
• Complement the video naturally
• Provide context or insight
• Use conversational, clear language
• Include the topic name once
• Optionally mention timing if relevant (this week, tonight, etc.)

Avoid:
• Marketing speak or "deepen your practice" type phrases
• Rigid formulas
• Mentioning Lunary or the Grimoire
• Deterministic claims - use "tends to", "often", "can" not "always" or "controls"
${noveltyNote ? `\n${noveltyNote}` : ''}

Return JSON:
{
  "bodyLines": ["line 1", "line 2", "line 3"],
  "hashtags": [],
  "safetyChecks": []
}`;
};

/**
 * Build question post prompt
 */
export const buildQuestionPrompt = (pack: SourcePack): string => {
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(
    pack.platform,
    pack.postType,
  );

  const domainContext = pack.needsContext
    ? `This is about ${pack.categoryLabel.toLowerCase()}.`
    : `Context: ${pack.categoryLabel.toLowerCase()}.`;

  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);

  return `Write an engaging question about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

${domainContext}

${styleGuidance}

Ask a genuine question that:
• Relates to lived experience with this topic
• Encourages people to share their observations
• Feels conversational and curious
• Avoids "What is..." definitions

Optionally add a short follow-up line to encourage responses (keep it under 7 words).

Don't mention Lunary or the Grimoire.
${noveltyNote ? `\n${noveltyNote}` : ''}

Return JSON:
{"content":"Your question here?\\nOptional prompt","hashtags":[],"safetyChecks":[]}`;
};

/**
 * Build prompt based on post type
 */
export const buildPrompt = (pack: SourcePack): string =>
  pack.postType === 'video_caption'
    ? buildVideoCaptionPrompt(pack)
    : pack.postType === 'question'
      ? buildQuestionPrompt(pack)
      : buildEducationalPrompt(pack);
