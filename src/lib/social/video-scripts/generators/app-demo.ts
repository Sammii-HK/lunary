/**
 * App Demo Script Generator
 *
 * Generates 30-second app demo scripts using AI
 */

import { generateContent } from '@/lib/ai/content-generator';
import { getAppFeature } from '../app-features';
import { getContentTypeConfig } from '../content-types';
import type { VideoScript, ScriptSection } from '../types';

/**
 * Generate an app demo script for a specific feature
 */
export async function generateAppDemoScript(
  featureId: string,
  scheduledDate: Date,
  baseUrl: string = 'https://lunary.app',
): Promise<VideoScript> {
  const feature = getAppFeature(featureId);
  const config = getContentTypeConfig('app-demo');

  // Generate script using AI
  const prompt = `Create a 30-second app demo TikTok script for Lunary's ${feature.name} feature.

Feature details:
- Problem: ${feature.problem}
- Solution: ${feature.solution}
- Demo steps: ${feature.steps.join(' → ')}
- Call to action: ${feature.cta}

Requirements:
- Hook (0-3s): State the problem/desire directly and emotionally
- Demo walkthrough (3-24s): Narrate the feature in action with clear steps
- Strong CTA (24-30s): ${feature.cta}
- Tone: Excited but grounded, showing real value not hype
- Target audience: US afternoon scrollers (prime download time)
- Focus: Make the app look easy and valuable
- Style: Sentence case, no em dashes, authentic voice

Format as sections:

[HOOK] (0-3s)
{attention-grabbing problem statement}

[DEMO] (3-24s)
{step-by-step narration matching on-screen actions}

[CTA] (24-30s)
{conversion call to action}

Write naturally and conversationally. Avoid corporate speak.`;

  const scriptText = await generateContent({
    systemPrompt: `You are a social media copywriter specializing in authentic, grounded content for spiritual/astrology apps. Write in sentence case, use line breaks for rhythm, avoid em dashes. Focus on emotional truth and real benefits, not hype.`,
    prompt,
    model: 'quality',
    temperature: 0.8,
    maxTokens: 500,
  });

  // Parse sections from the generated script
  const sections = parseScriptSections(scriptText);

  // Calculate word count and estimated duration
  const wordCount = scriptText.split(/\s+/).length;
  const estimatedDuration = '30s';

  return {
    themeId: 'app-demo',
    themeName: 'App Demo',
    facetTitle: feature.name,
    topic: feature.name,
    angle: 'demo',
    aspect: 'conversion',
    platform: 'tiktok',
    sections,
    fullScript: scriptText,
    wordCount,
    estimatedDuration,
    scheduledDate,
    status: 'draft',
    coverImageUrl: `${baseUrl}${feature.screenshotPath}`,
    metadata: {
      theme: 'APP DEMO',
      title: feature.name,
      series: 'App Demo',
      summary: feature.solution,
      angle: 'demo',
      topic: feature.name,
      aspect: 'conversion',
    },
  };
}

/**
 * Parse script sections from formatted text
 */
function parseScriptSections(script: string): ScriptSection[] {
  const sections: ScriptSection[] = [];

  // Extract HOOK section
  const hookMatch = script.match(/\[HOOK\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (hookMatch) {
    sections.push({
      name: 'HOOK',
      duration: '0-3s',
      content: hookMatch[1].trim(),
    });
  }

  // Extract DEMO section
  const demoMatch = script.match(/\[DEMO\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (demoMatch) {
    sections.push({
      name: 'DEMO',
      duration: '3-24s',
      content: demoMatch[1].trim(),
    });
  }

  // Extract CTA section
  const ctaMatch = script.match(/\[CTA\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (ctaMatch) {
    sections.push({
      name: 'CTA',
      duration: '24-30s',
      content: ctaMatch[1].trim(),
    });
  }

  // Fallback if parsing fails
  if (sections.length === 0) {
    sections.push({
      name: 'FULL_SCRIPT',
      duration: '0-30s',
      content: script.trim(),
    });
  }

  return sections;
}

/**
 * Generate multiple app demo scripts for a week
 */
export async function generateWeeklyAppDemoScripts(
  weekStartDate: Date,
  featureIds: string[],
  baseUrl: string = 'https://lunary.app',
): Promise<VideoScript[]> {
  const scripts: VideoScript[] = [];

  for (let i = 0; i < featureIds.length; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);

    const script = await generateAppDemoScript(featureIds[i], date, baseUrl);
    scripts.push(script);
  }

  return scripts;
}
