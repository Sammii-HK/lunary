/**
 * Comparison Script Generator
 *
 * Generates before/after comparison scripts using AI
 */

import { generateContent } from '@/lib/ai/content-generator';
import { getComparisonTheme } from '../comparison-themes';
import { getContentTypeConfig } from '../content-types';
import type { VideoScript, ScriptSection } from '../types';

/**
 * Generate a comparison script for a specific theme
 */
export async function generateComparisonScript(
  themeId: string,
  scheduledDate: Date,
  baseUrl: string = 'https://lunary.app',
): Promise<VideoScript> {
  const theme = getComparisonTheme(themeId);
  const config = getContentTypeConfig('comparison');

  // Generate script using AI
  const prompt = `Create a 30-second "Before/After" comparison TikTok for Lunary.

Theme: ${theme.title}
Hook: ${theme.hook}

Before (${theme.beforeTitle}):
${theme.beforePoints.map((p) => `- ${p}`).join('\n')}

After (${theme.afterTitle}):
${theme.afterPoints.map((p) => `- ${p}`).join('\n')}

Call to action: ${theme.cta}

Requirements:
- Hook (0-3s): ${theme.hook} (make it relatable and emotional)
- Split screen comparison (3-27s): Left side shows pain points (faded/frustrated), right side shows Lunary solutions (vibrant/empowering)
- Emphasize the contrast between old frustrations and new ease
- Strong CTA (27-30s): ${theme.cta}
- Tone: Empathetic about frustrations, then empowering with solution
- Visual direction: Split screen - left faded/grayscale, right vibrant with app
- Target: 20:00 UTC (conversion time - UK leisure, US afternoon)
- Style: Sentence case, no em dashes, authentic voice

Format as sections:

[HOOK] (0-3s)
{relatable frustration statement}

[BEFORE] (3-15s)
{narrate pain points - what it's like the old way}

[AFTER] (15-27s)
{narrate Lunary solutions - show how much better it is}

[CTA] (27-30s)
{strong conversion call}

Write naturally and focus on the emotional journey from frustration to relief.`;

  const scriptText = await generateContent({
    systemPrompt: `You are a social media copywriter specializing in authentic, grounded content for spiritual/astrology apps. Write in sentence case, use line breaks for rhythm, avoid em dashes. Focus on emotional truth and real benefits, not hype. When writing comparisons, be empathetic about pain points and genuinely excited about solutions.`,
    prompt,
    model: 'quality',
    temperature: 0.8,
    maxTokens: 500,
  });

  // Parse sections from the generated script
  const sections = parseScriptSections(scriptText);

  // Calculate word count
  const wordCount = scriptText.split(/\s+/).length;
  const estimatedDuration = '30s';

  return {
    themeId: 'comparison',
    themeName: 'Comparison',
    facetTitle: theme.title,
    topic: theme.title,
    angle: 'comparison',
    aspect: 'moat',
    platform: 'tiktok',
    sections,
    fullScript: scriptText,
    wordCount,
    estimatedDuration,
    scheduledDate,
    status: 'draft',
    coverImageUrl: `${baseUrl}${theme.appScreenshot}`,
    metadata: {
      theme: 'COMPARISON',
      title: theme.title,
      series: 'Comparison',
      summary: theme.hook,
      angle: 'comparison',
      topic: theme.title,
      aspect: 'moat',
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

  // Extract BEFORE section
  const beforeMatch = script.match(/\[BEFORE\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (beforeMatch) {
    sections.push({
      name: 'BEFORE',
      duration: '3-15s',
      content: beforeMatch[1].trim(),
    });
  }

  // Extract AFTER section
  const afterMatch = script.match(/\[AFTER\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (afterMatch) {
    sections.push({
      name: 'AFTER',
      duration: '15-27s',
      content: afterMatch[1].trim(),
    });
  }

  // Extract CTA section
  const ctaMatch = script.match(/\[CTA\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (ctaMatch) {
    sections.push({
      name: 'CTA',
      duration: '27-30s',
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
