/**
 * AI Content Generator Utility
 *
 * Reusable AI SDK wrapper for generating high-quality written content.
 * Uses Vercel AI SDK with support for multiple providers.
 */

import { generateText, generateObject, LanguageModel } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z, ZodSchema } from 'zod';

// Model configurations for different quality/speed tradeoffs
const createModels = () => ({
  // High quality content generation (gpt-4o for better writing)
  quality: openai('gpt-4o'),
  // Fast, cost-effective generation
  fast: openai('gpt-4o-mini'),
  // Premium quality (using gpt-4o for now, can swap to Claude later)
  premium: openai('gpt-4o'),
});

export type AIModelKey = 'quality' | 'fast' | 'premium';

const getModel = (key: AIModelKey): LanguageModel => {
  const models = createModels();
  return models[key] as LanguageModel;
};

export type ContentGeneratorConfig = {
  /** Model quality tier - defaults to 'quality' */
  model?: AIModelKey;
  /** Temperature for generation (0-1) - defaults based on content type */
  temperature?: number;
  /** Maximum tokens for response */
  maxTokens?: number;
  /** System prompt for the AI */
  systemPrompt: string;
};

export type GenerateContentParams = {
  /** The user prompt/instruction */
  prompt: string;
  /** Optional retry instruction if validation fails */
  retryNote?: string;
} & ContentGeneratorConfig;

export type GenerateStructuredParams<T extends ZodSchema> = {
  /** The user prompt/instruction */
  prompt: string;
  /** Zod schema for structured output */
  schema: T;
  /** Schema name for the AI */
  schemaName?: string;
  /** Optional retry instruction if validation fails */
  retryNote?: string;
} & ContentGeneratorConfig;

/**
 * Generate unstructured text content using AI SDK
 */
export async function generateContent({
  prompt,
  systemPrompt,
  model = 'quality',
  temperature = 0.7,
  maxTokens = 1200,
  retryNote,
}: GenerateContentParams): Promise<string> {
  const fullPrompt = retryNote
    ? `${prompt}\n\nFix these issues:\n${retryNote}`
    : prompt;

  const result = await generateText({
    model: getModel(model),
    system: systemPrompt,
    prompt: fullPrompt,
    temperature,
    maxOutputTokens: maxTokens,
  });

  return result.text.trim();
}

/**
 * Generate structured content with schema validation using AI SDK
 */
export async function generateStructuredContent<T extends ZodSchema>({
  prompt,
  schema,
  schemaName = 'response',
  systemPrompt,
  model = 'quality',
  temperature = 0.5,
  maxTokens = 800,
  retryNote,
}: GenerateStructuredParams<T>): Promise<z.infer<T>> {
  const fullPrompt = retryNote
    ? `${prompt}\n\nFix these issues:\n${retryNote}`
    : prompt;

  const result = await generateObject({
    model: getModel(model),
    system: systemPrompt,
    prompt: fullPrompt,
    schema,
    schemaName,
    temperature,
    maxOutputTokens: maxTokens,
  });

  return result.object as z.infer<T>;
}

/**
 * Generate content with automatic retry on validation failure
 */
export async function generateContentWithRetry({
  prompt,
  systemPrompt,
  model = 'quality',
  temperature = 0.7,
  maxTokens = 1200,
  validate,
  maxRetries = 2,
}: GenerateContentParams & {
  validate: (content: string) => string[];
  maxRetries?: number;
}): Promise<{ content: string; issues: string[] }> {
  let content = await generateContent({
    prompt,
    systemPrompt,
    model,
    temperature,
    maxTokens,
  });

  let issues = validate(content);
  let retries = 0;

  while (issues.length > 0 && retries < maxRetries) {
    content = await generateContent({
      prompt,
      systemPrompt,
      model,
      temperature,
      maxTokens,
      retryNote: issues.join('; '),
    });
    issues = validate(content);
    retries++;
  }

  return { content, issues };
}

/**
 * Generate structured content with automatic retry on validation failure
 */
export async function generateStructuredContentWithRetry<T extends ZodSchema>({
  prompt,
  schema,
  schemaName = 'response',
  systemPrompt,
  model = 'quality',
  temperature = 0.5,
  maxTokens = 800,
  validate,
  maxRetries = 2,
}: GenerateStructuredParams<T> & {
  validate: (obj: z.infer<T>) => string[];
  maxRetries?: number;
}): Promise<{ object: z.infer<T>; issues: string[] }> {
  let object = await generateStructuredContent({
    prompt,
    schema,
    schemaName,
    systemPrompt,
    model,
    temperature,
    maxTokens,
  });

  let issues = validate(object);
  let retries = 0;

  while (issues.length > 0 && retries < maxRetries) {
    object = await generateStructuredContent({
      prompt,
      schema,
      schemaName,
      systemPrompt,
      model,
      temperature,
      maxTokens,
      retryNote: issues.join('; '),
    });
    issues = validate(object);
    retries++;
  }

  return { object, issues };
}

// Pre-configured generators for common content types

/**
 * Generate social media copy with optimal settings
 */
export async function generateSocialContent({
  prompt,
  systemPrompt,
  model = 'quality',
}: {
  prompt: string;
  systemPrompt: string;
  model?: AIModelKey;
}): Promise<string> {
  return generateContent({
    prompt,
    systemPrompt,
    model,
    temperature: 0.7,
    maxTokens: 600,
  });
}

/**
 * Generate video script content with optimal settings
 */
export async function generateVideoScriptContent({
  prompt,
  systemPrompt,
  model = 'quality',
  isShortForm = true,
}: {
  prompt: string;
  systemPrompt: string;
  model?: AIModelKey;
  isShortForm?: boolean;
}): Promise<string> {
  return generateContent({
    prompt,
    systemPrompt,
    model,
    temperature: isShortForm ? 0.5 : 0.7,
    maxTokens: isShortForm ? 600 : 1400,
  });
}

// Zod schemas for common structured outputs

export const VideoScriptSchema = z.object({
  video: z.object({
    hook: z.string().describe('Spoken hook line (8-14 words)'),
    scriptBody: z.array(z.string()).describe('Script body lines (4-7 lines)'),
  }),
});

export const SocialPostSchema = z.object({
  content: z.string().describe('The post content'),
  hashtags: z.array(z.string()).nullable().describe('Optional hashtags'),
  safetyChecks: z.array(z.string()).nullable().describe('Safety check flags'),
});

export const VideoCaptionSchema = z.object({
  bodyLines: z.array(z.string()).describe('Caption body lines (2-4 lines)'),
  hashtags: z.array(z.string()).nullable().describe('Optional hashtags'),
  safetyChecks: z.array(z.string()).nullable().describe('Safety check flags'),
});

export const OpeningLineSchema = z.object({
  line: z.string().describe('The opening sentence'),
  intent: z.string().describe('The intent type of the opening'),
});

export type VideoScriptResponse = z.infer<typeof VideoScriptSchema>;
export type SocialPostResponse = z.infer<typeof SocialPostSchema>;
export type VideoCaptionResponse = z.infer<typeof VideoCaptionSchema>;
export type OpeningLineResponse = z.infer<typeof OpeningLineSchema>;
