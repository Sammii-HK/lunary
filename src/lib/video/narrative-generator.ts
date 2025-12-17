import OpenAI from 'openai';
import type {
  WeeklyCosmicData,
  PlanetaryHighlight,
  MajorAspect,
  MoonPhaseEvent,
} from '../../../utils/blog/weeklyContentGenerator';
import { getMoonPhase } from '../../../utils/moon/moonPhases';
import { GeoVector, Ecliptic, Body, AstroTime } from 'astronomy-engine';
import { getZodiacSign } from '../../../utils/astrology/cosmic-og';

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

/**
 * Select daily events from the week, prioritizing planetary highlights over aspects
 * Reuses the significance ordering system from weeklyContentGenerator
 */
function selectDailyEvents(
  highlights: PlanetaryHighlight[],
  aspects: MajorAspect[],
  weekStart: Date,
  weekEnd: Date,
  maxPerDay: number = 2,
): Array<{
  item: PlanetaryHighlight | MajorAspect;
  type: 'planetary' | 'aspect';
  date: Date;
}> {
  const significanceOrder = { extraordinary: 4, high: 3, medium: 2, low: 1 };
  const selectedEvents: Array<{
    item: PlanetaryHighlight | MajorAspect;
    type: 'planetary' | 'aspect';
    date: Date;
  }> = [];

  // Iterate through each day of the week
  const currentDate = new Date(weekStart);
  currentDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

  while (currentDate <= weekEnd) {
    const dateKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Find all planetary highlights for this day
    const dayHighlights = highlights.filter((h) => {
      // Normalize both dates to noon to avoid timezone issues
      const hDate = new Date(h.date);
      hDate.setHours(12, 0, 0, 0);
      const highlightDateKey = hDate.toISOString().split('T')[0];
      return highlightDateKey === dateKey;
    });

    if (dayHighlights.length > 0) {
      // Sort by significance (same as weeklyContentGenerator)
      dayHighlights.sort((a, b) => {
        const sigDiff =
          significanceOrder[b.significance] - significanceOrder[a.significance];
        if (sigDiff !== 0) return sigDiff;
        // If same significance, prioritize retrograde changes over sign ingresses
        if (a.event.includes('retrograde') && !b.event.includes('retrograde'))
          return -1;
        if (b.event.includes('retrograde') && !a.event.includes('retrograde'))
          return 1;
        return a.date.getTime() - b.date.getTime();
      });

      // Take top maxPerDay highlights
      dayHighlights.slice(0, maxPerDay).forEach((highlight) => {
        selectedEvents.push({
          item: highlight,
          type: 'planetary',
          date: highlight.date,
        });
      });
    } else {
      // No highlights for this day, find aspects
      const dayAspects = aspects.filter((a) => {
        // Normalize both dates to noon to avoid timezone issues
        const aDate = new Date(a.date);
        aDate.setHours(12, 0, 0, 0);
        const aspectDateKey = aDate.toISOString().split('T')[0];
        return aspectDateKey === dateKey;
      });

      if (dayAspects.length > 0) {
        // Sort by significance (same as weeklyContentGenerator)
        dayAspects.sort((a, b) => {
          const sigDiff =
            significanceOrder[b.significance] -
            significanceOrder[a.significance];
          if (sigDiff !== 0) return sigDiff;
          return a.date.getTime() - b.date.getTime();
        });

        // Take the most significant aspect
        selectedEvents.push({
          item: dayAspects[0],
          type: 'aspect',
          date: dayAspects[0].date,
        });
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return selectedEvents;
}

/**
 * Generate a narrative voiceover script from weekly blog content using OpenAI
 * This creates a natural, flowing narrative from the structured weekly data
 */
export async function generateNarrativeFromWeeklyData(
  weeklyData: WeeklyCosmicData,
): Promise<string> {
  const openai = getOpenAI();

  // Select daily events (1-2 planetary highlights per day, or most significant aspect if none)
  const dailyEvents = selectDailyEvents(
    weeklyData.planetaryHighlights,
    weeklyData.majorAspects,
    weeklyData.weekStart,
    weeklyData.weekEnd,
    2, // max 2 planetary highlights per day
  );

  console.log(
    `📅 Selected ${dailyEvents.length} daily events across the week:`,
    dailyEvents.map(
      (e) =>
        `${e.type} on ${e.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
    ),
  );

  // Separate planetary highlights and aspects for formatting
  const selectedPlanetaryHighlights = dailyEvents
    .filter((e) => e.type === 'planetary')
    .map((e) => e.item as PlanetaryHighlight);
  const selectedAspects = dailyEvents
    .filter((e) => e.type === 'aspect')
    .map((e) => e.item as MajorAspect);

  // Format the weekly data into a structured prompt
  const planetaryHighlights = selectedPlanetaryHighlights
    .map(
      (h) =>
        `- ${h.planet} ${h.event === 'enters-sign' && h.details.toSign ? `enters ${h.details.toSign}` : h.event.replace(/-/g, ' ')} on ${h.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} (${h.significance} significance): ${h.description}`,
    )
    .join('\n');

  const retrogradeInfo = weeklyData.retrogradeChanges
    .map(
      (r) =>
        `- ${r.planet} ${r.action === 'begins' ? 'stations retrograde' : 'goes direct'} in ${r.sign} on ${r.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    )
    .join('\n');

  const aspects = selectedAspects
    .map(
      (a) =>
        `- ${a.planetA} ${a.aspect} ${a.planetB} on ${a.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${a.energy}`,
    )
    .join('\n');

  // Ensure moon phases are always present - add fallback if empty
  let moonPhases = weeklyData.moonPhases
    .map(
      (m) =>
        `- ${m.phase} moon in ${m.sign} on ${m.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    )
    .join('\n');

  // If no moon phases, calculate current moon phase as fallback
  if (!moonPhases || weeklyData.moonPhases.length === 0) {
    const currentMoonPhase = getMoonPhase(weeklyData.weekStart);
    // Calculate moon sign using astronomy engine
    const astroTime = new AstroTime(weeklyData.weekStart);
    const moonVector = GeoVector(Body.Moon, astroTime, true);
    const moonEcliptic = Ecliptic(moonVector);
    const moonLongitudeDegrees = moonEcliptic.elon * (180 / Math.PI);
    const moonSign = getZodiacSign(moonLongitudeDegrees) || 'Unknown';
    moonPhases = `- ${currentMoonPhase} moon in ${moonSign} on ${weeklyData.weekStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
  }

  // Format seasonal events (solstices, equinoxes) - IMPORTANT for dedicated section
  const seasonalEvents =
    weeklyData.seasonalEvents && weeklyData.seasonalEvents.length > 0
      ? weeklyData.seasonalEvents
          .map(
            (e) =>
              `- ${e.name} on ${e.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${e.significance} (Energy: ${e.energy})`,
          )
          .join('\n')
      : null;

  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

  const prompt = `Create a natural, flowing voiceover script (5-8 minutes, 1200-2000 words) for a YouTube video about the weekly cosmic forecast for ${weekRange}.

CRITICAL: You MUST follow this EXACT structure in this EXACT order. Each section must be present:

[OPENING - 30-60 seconds]
Start with: "The interplay between [key planets from aspects] creates a unique energetic signature for this week, offering both challenges and opportunities for growth." Then introduce the week's theme and major events.
${seasonalEvents ? `\n[SEASONAL EVENT - 45-60 seconds]\nThis week includes a significant seasonal event. Cover concisely:\n- What this event means astronomically (longest/shortest day, equal day/night)\n- The energetic significance and how it shifts the cosmic energy\n- Intention setting: What intentions align with this energy?\nKeep it focused on astrology and cosmic alignment - no history, no rituals, no cultural traditions.` : ''}

[MAJOR PLANETARY MOVEMENTS - 2-3 minutes]
Cover all planetary highlights in order. For EACH planet entering a new sign, explain IN DEPTH:
- What the planet represents (e.g., "The Sun represents our core identity, vitality, and life force")
- What the sign represents (e.g., "Capricorn is the sign of ambition, structure, and long-term goals")
- What it MEANS when this planet is in this sign (e.g., "Sun in Capricorn shifts our focus toward achievement, discipline, and building lasting foundations")
- How this energy affects different areas of life
- How long this transit lasts and what to expect

[COSMIC ALIGNMENTS - 2-3 minutes]
Cover ALL major aspects in this section (do not mix with planetary movements). For EACH aspect:
- ALWAYS include the DATE: "On [day], [Planet] [aspect] [Planet]..."
- Use EXACT aspect words: "square" (not "squaring"), "trine" (not "trine with"), "opposition" (not "opposing")
- What each planet represents
- What the aspect type means (trine = harmony, square = tension, opposition = polarity)
- How these energies combine and what opportunities/challenges this creates
- Practical advice for working with this energy

IMPORTANT: Keep all cosmic alignments TOGETHER in this section. Do not alternate between planetary movements and aspects.

[BEST DAYS FOR - 1-2 minutes]
Cover the best days for different activities. Use the format: "The best days this week for [activity 1] are [dates], when [reason]. For [activity 2], [dates] are ideal because [reason]."

[MOON PHASES - 1-2 minutes - MANDATORY]
This section MUST be included. For EACH moon phase, explain IN DEPTH:
- The phase name and what it represents in the lunar cycle
- What sign the Moon is in and what that sign represents emotionally
- What "Moon in [Sign]" MEANS - how it colors our emotional landscape, intuition, and inner world
- Practical guidance: What activities are supported? What should we avoid?
- Intention-setting guidance for this lunar energy (what intentions align with this phase)
Even if no major moon phases occur, discuss the current moon phase and its influence.

[CONCLUSION - 30-60 seconds]
End with: "As we navigate this week's cosmic energy, remember that these planetary movements and alignments offer both challenges and opportunities. To dive deeper into your personal cosmic forecast and understand how these energies affect your birth chart, visit Lunary.app."

Weekly Data:

Title: ${weeklyData.title}
Subtitle: ${weeklyData.subtitle}
Summary: ${weeklyData.summary}

Planetary Highlights:
${planetaryHighlights || 'None this week'}

Retrograde Activity:
${retrogradeInfo || 'No retrograde changes this week'}

Major Aspects:
${aspects || 'No major aspects this week'}

Moon Phases (MANDATORY - always include this section, explain what Moon in each sign MEANS):
${moonPhases}
${seasonalEvents ? `\nSeasonal Events (IMPORTANT - give this its own dedicated section with in-depth explanation):\n${seasonalEvents}` : ''}

Best Days:
${
  Object.entries(weeklyData.bestDaysFor)
    .filter(([_, data]) => data.dates.length > 0)
    .slice(0, 3)
    .map(
      ([activity, data]) =>
        `- Best for ${activity} on ${data.dates.map((d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })).join(', ')}: ${data.reason}`,
    )
    .join('\n') || 'No specific best days highlighted'
}

Return ONLY the voiceover script text, no markdown, no formatting, no section headers, just natural spoken text following the structure above.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a cosmic storyteller creating engaging voiceover scripts for astrology videos. Write in a natural, conversational tone that flows smoothly when spoken aloud. Make it engaging and accessible. This is Lunary - a moon-focused astrology app. Moon phases are core to the brand and MUST always be included in every script.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2500,
      temperature: 0.3,
    });

    let script = completion.choices[0]?.message?.content || '';
    if (!script || script.trim().length === 0) {
      throw new Error('OpenAI returned an empty script');
    }

    script = script.trim();

    // Validate that moon phases are mentioned in the script
    const moonKeywords = [
      'moon',
      'lunar',
      'phase',
      'full moon',
      'new moon',
      'waxing',
      'waning',
      'crescent',
      'gibbous',
      'quarter',
    ];
    const lowerScript = script.toLowerCase();
    const hasMoonPhases = moonKeywords.some((keyword) =>
      lowerScript.includes(keyword),
    );

    if (!hasMoonPhases) {
      console.warn(
        '⚠️ Moon phases not detected in generated script. Injecting moon phase section...',
      );
      // Find conclusion section and inject moon phases before it
      const conclusionKeywords = [
        'visit lunary',
        'lunary.app',
        'dive deeper',
        'birth chart',
        'conclusion',
        'wrap up',
      ];
      const sentences = script
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      let conclusionIndex = -1;

      for (let i = sentences.length - 1; i >= 0; i--) {
        const lowerSentence = sentences[i].toLowerCase();
        if (conclusionKeywords.some((kw) => lowerSentence.includes(kw))) {
          conclusionIndex = i;
          break;
        }
      }

      // Get current moon phase for injection
      const currentMoonPhase = getMoonPhase(weeklyData.weekStart);
      const astroTime = new AstroTime(weeklyData.weekStart);
      const moonVector = GeoVector(Body.Moon, astroTime, true);
      const moonEcliptic = Ecliptic(moonVector);
      const moonLongitudeDegrees = moonEcliptic.elon * (180 / Math.PI);
      const moonSign = getZodiacSign(moonLongitudeDegrees) || 'Unknown';
      const moonPhaseDate = weeklyData.weekStart.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      const moonPhaseText = `The moon phases this week include the ${currentMoonPhase} moon in ${moonSign} on ${moonPhaseDate}, bringing powerful lunar energy. This lunar influence affects our emotional landscape and intuitive awareness, guiding us through the week's cosmic shifts.`;

      if (conclusionIndex >= 0) {
        // Insert before conclusion
        const beforeConclusion = sentences.slice(0, conclusionIndex).join('. ');
        const conclusion = sentences.slice(conclusionIndex).join('. ');
        script = `${beforeConclusion}. ${moonPhaseText} ${conclusion}`;
      } else {
        // Append before the end
        const lastPeriod = script.lastIndexOf('.');
        if (lastPeriod > 0) {
          script =
            script.substring(0, lastPeriod) +
            `. ${moonPhaseText}` +
            script.substring(lastPeriod);
        } else {
          script = `${script}. ${moonPhaseText}`;
        }
      }
    }

    return script;
  } catch (error) {
    console.error('Failed to generate narrative from OpenAI:', error);
    throw error;
  }
}

/**
 * Generate a short-form voiceover script (10-15 seconds)
 * Simple list of cosmic events - no AI needed
 */
export function generateShortFormNarrative(
  weeklyData: WeeklyCosmicData,
): string {
  // Select daily events (1 per day) and take top 3-4 overall
  const dailyEvents = selectDailyEvents(
    weeklyData.planetaryHighlights,
    weeklyData.majorAspects,
    weeklyData.weekStart,
    weeklyData.weekEnd,
    1, // max 1 event per day for short form
  );

  // Build list of cosmic events for quick overview
  const events: string[] = [];

  // Add seasonal events first (most important)
  if (weeklyData.seasonalEvents?.length) {
    events.push(weeklyData.seasonalEvents[0].name);
  }

  // Add selected daily events (planetary highlights and aspects)
  dailyEvents.slice(0, 3).forEach((e) => {
    if (e.type === 'planetary') {
      const h = e.item as PlanetaryHighlight;
      if (h.event === 'enters-sign' && h.details.toSign) {
        events.push(`${h.planet} enters ${h.details.toSign}`);
      }
    } else {
      const a = e.item as MajorAspect;
      events.push(`${a.planetA} ${a.aspect} ${a.planetB}`);
    }
  });

  // Add moon phase
  if (weeklyData.moonPhases?.length) {
    events.push(`${weeklyData.moonPhases[0].phase} Moon`);
  }

  const eventList = events.slice(0, 4).join(', ');

  // Generate a simple script that just lists the events
  const script = `This week in the cosmos: ${eventList}. Read the full forecast on Lunary.`;

  return script;
}

export async function generateMediumFormNarrative(
  weeklyData: WeeklyCosmicData,
): Promise<string> {
  const openai = getOpenAI();

  // Select daily events (1 planetary highlight per day, or most significant aspect if none)
  const dailyEvents = selectDailyEvents(
    weeklyData.planetaryHighlights,
    weeklyData.majorAspects,
    weeklyData.weekStart,
    weeklyData.weekEnd,
    1, // max 1 planetary highlight per day for medium form
  );

  // Separate planetary highlights and aspects for formatting
  const selectedPlanetaryHighlights = dailyEvents
    .filter((e) => e.type === 'planetary')
    .map((e) => e.item as PlanetaryHighlight);
  const selectedAspects = dailyEvents
    .filter((e) => e.type === 'aspect')
    .map((e) => e.item as MajorAspect);

  // Format data for medium-form
  const planetaryHighlights = selectedPlanetaryHighlights
    .map(
      (h) =>
        `- ${h.planet} ${h.event === 'enters-sign' && h.details.toSign ? `enters ${h.details.toSign}` : h.event.replace(/-/g, ' ')} on ${h.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${h.description}`,
    )
    .join('\n');

  const aspectsInfo =
    selectedAspects.length > 0
      ? selectedAspects
          .map(
            (a) =>
              `- ${a.planetA} ${a.aspect} ${a.planetB} on ${a.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${a.energy}`,
          )
          .join('\n')
      : 'None';

  const moonPhases =
    weeklyData.moonPhases.length > 0
      ? weeklyData.moonPhases
          .slice(0, 2)
          .map(
            (m) =>
              `- ${m.phase} moon in ${m.sign} on ${m.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${m.energy}`,
          )
          .join('\n')
      : 'No major moon phases this week';

  // Include seasonal events (solstices, equinoxes) - these are significant!
  const seasonalEvents =
    weeklyData.seasonalEvents && weeklyData.seasonalEvents.length > 0
      ? weeklyData.seasonalEvents
          .map(
            (e) =>
              `- ${e.name} on ${e.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${e.significance} - ${e.energy}`,
          )
          .join('\n')
      : null;

  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

  const prompt = `Create a MEDIUM voiceover script (30-60 seconds, ~75-150 words) for a social media video recap about the weekly cosmic forecast for ${weekRange}.

Structure:
1. Opening (3-5 seconds): Jump straight into the cosmic energy
2. Planetary highlights: For each transit, say "[Planet] enters [Sign]" then ONE sentence about its meaning
3. Aspects: For EACH aspect, you MUST say "[PlanetA] [aspect] [PlanetB]" - e.g., "Venus square Saturn brings tension to relationships"
4. Moon phases: Say the exact phase name and sign
5. Closing: "For more information, check out the full blog at Lunary"
${seasonalEvents ? `6. IMPORTANT: Mention the ${weeklyData.seasonalEvents?.[0]?.name} prominently!` : ''}

CRITICAL - EXACT WORDING FOR ASPECTS:
When mentioning aspects, you MUST use this EXACT format: "[Planet1] [aspect] [Planet2]"
- Say "Venus square Saturn" NOT "Venus faces challenges with Saturn"
- Say "Mars trine Jupiter" NOT "Mars and Jupiter align harmoniously"
- Say "Mercury opposition Uranus" NOT "Mercury and Uranus oppose each other"
The aspect word (square, trine, opposition, conjunction, sextile) MUST appear between the two planet names!

Data to use (use EXACT wording):
${planetaryHighlights || 'None this week'}
${aspectsInfo}
${moonPhases}

Return ONLY the voiceover script. Use EXACT planet and aspect names from above.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You create educational astrology voiceovers. CRITICAL: For aspects, ALWAYS say "[Planet1] [aspect] [Planet2]" - e.g., "Venus square Saturn" NOT "Venus faces challenges". The aspect word MUST appear between planet names. Be authoritative, not casual.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const generatedScript = completion.choices[0]?.message?.content?.trim();
    if (!generatedScript) {
      throw new Error('Failed to generate medium-form narrative');
    }

    return generatedScript;
  } catch (error) {
    console.error('Error generating medium-form narrative:', error);
    throw error;
  }
}

/**
 * Generate social media post content to accompany a video
 * Gently guides people to the site/blog if they want to learn more
 */
export async function generateVideoPostContent(
  weeklyData: WeeklyCosmicData,
  videoType: 'short' | 'medium' | 'long',
  blogSlug?: string,
): Promise<string> {
  const openai = getOpenAI();

  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

  // Different prompt based on video type
  const typeDescription =
    videoType === 'short'
      ? 'short-form'
      : videoType === 'medium'
        ? 'medium-form (30-60 second recap)'
        : 'long-form';

  const prompt = `Create a social media post caption to accompany a ${typeDescription} video about the weekly cosmic forecast for ${weekRange}.

The post should:
- Be engaging and natural, not salesy
- Mention that the full blog is available on Lunary (but DO NOT include a link or URL)
- Say something like "check out the full blog on Lunary" or "read more on the Lunary blog" - never write out the full URL
- Be appropriate for Instagram, TikTok, and other platforms
- Be 2-4 sentences, concise but inviting
- Match the mystical but accessible tone of Lunary
- For short-form: Be brief and hook-focused
- For medium-form: Be informative, highlight key cosmic events
- For long-form: Can be slightly longer, more informative

Weekly Data:
Title: ${weeklyData.title}
Subtitle: ${weeklyData.subtitle}

Return ONLY the post content text, no markdown, no formatting, just the caption text. Do NOT include any URLs or links. Do NOT use any emojis.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a social media content creator for Lunary, a cosmic astrology app. Create engaging, natural captions that guide people to learn more without being pushy or salesy. Write in a mystical but accessible tone. DO NOT use any emojis - keep the text clean and professional.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const postContent = completion.choices[0]?.message?.content || '';
    if (!postContent || postContent.trim().length === 0) {
      throw new Error('OpenAI returned empty post content');
    }

    return postContent.trim();
  } catch (error) {
    console.error('Failed to generate video post content:', error);
    // Fallback to a simple post content - no URLs
    return `Your cosmic forecast for the week of ${weekRange}. For more details, check out the full blog on Lunary.`;
  }
}

export interface ScriptTopic {
  topic:
    | 'intro'
    | 'planetary_highlights'
    | 'retrogrades'
    | 'aspects'
    | 'moon_phases'
    | 'seasonal_events'
    | 'best_days'
    | 'conclusion';
  text: string;
  startTime: number; // Estimated start time in seconds
  endTime: number; // Estimated end time in seconds
  item?: string; // Optional: specific item identifier (e.g., "Mars enters Aries", "Venus trine Jupiter")
}

export interface ScriptItem extends ScriptTopic {
  item: string; // Required: specific item identifier
  exactPlanet?: PlanetaryHighlight; // Exact planet movement reference
  exactAspect?: MajorAspect; // Exact aspect reference
  exactMoonPhase?: MoonPhaseEvent; // Exact moon phase reference
  exactSeasonalEvent?: { name: string; type: string; date: Date }; // Exact seasonal event reference
}

/**
 * Split a long-form script into topics based on content
 * Estimates timestamps based on word count (average 2.5 words per second)
 * Allows multiple topics of the same type (e.g., multiple aspects images)
 */
export function segmentScriptIntoTopics(
  script: string,
  weeklyData: WeeklyCosmicData,
): ScriptTopic[] {
  const topics: ScriptTopic[] = [];
  const wordsPerSecond = 2.5; // Average speaking rate
  let currentTime = 0;

  // Split script into sentences
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length === 0) {
    // Fallback: create a single intro topic
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: script.split(/\s+/).length / wordsPerSecond,
      },
    ];
  }

  // Identify topic sections based on keywords
  let currentTopic: ScriptTopic['topic'] = 'intro';
  let currentTopicText: string[] = [];
  let topicStartTime = 0;
  const minTopicDuration = 3; // Minimum 3 seconds per topic

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const words = sentence.trim().split(/\s+/).length;
    const duration = words / wordsPerSecond;

    // Detect topic changes
    let newTopic: ScriptTopic['topic'] | null = null;

    // Check for conclusion first (highest priority)
    if (
      lowerSentence.includes('conclusion') ||
      lowerSentence.includes('wrap up') ||
      lowerSentence.includes('visit lunary') ||
      lowerSentence.includes('lunary.app') ||
      lowerSentence.includes('dive deeper') ||
      lowerSentence.includes('birth chart')
    ) {
      newTopic = 'conclusion';
    } else if (
      lowerSentence.includes('planetary') ||
      lowerSentence.includes('planet') ||
      (lowerSentence.includes('enters') && lowerSentence.includes('sign'))
    ) {
      newTopic = 'planetary_highlights';
    } else if (
      lowerSentence.includes('retrograde') ||
      lowerSentence.includes('direct')
    ) {
      newTopic = 'retrogrades';
    } else if (
      lowerSentence.includes('aspect') ||
      lowerSentence.includes('trine') ||
      lowerSentence.includes('square') ||
      lowerSentence.includes('opposition') ||
      lowerSentence.includes('conjunction') ||
      lowerSentence.includes('alignment')
    ) {
      newTopic = 'aspects';
    } else if (
      lowerSentence.includes('moon') ||
      lowerSentence.includes('lunar') ||
      lowerSentence.includes('phase')
    ) {
      newTopic = 'moon_phases';
    } else if (
      lowerSentence.includes('best') ||
      lowerSentence.includes('ideal') ||
      lowerSentence.includes('favorable') ||
      lowerSentence.includes('optimal')
    ) {
      newTopic = 'best_days';
    }

    // If topic changed and we have enough content, save previous topic
    if (newTopic && newTopic !== currentTopic && currentTopicText.length > 0) {
      const topicDuration = currentTime - topicStartTime;
      if (topicDuration >= minTopicDuration) {
        topics.push({
          topic: currentTopic,
          text: currentTopicText.join('. '),
          startTime: topicStartTime,
          endTime: currentTime,
        });
        currentTopic = newTopic;
        currentTopicText = [];
        topicStartTime = currentTime;
      } else if (newTopic === 'conclusion') {
        // Always switch to conclusion even if previous topic was short
        topics.push({
          topic: currentTopic,
          text: currentTopicText.join('. '),
          startTime: topicStartTime,
          endTime: currentTime,
        });
        currentTopic = newTopic;
        currentTopicText = [];
        topicStartTime = currentTime;
      }
    }

    currentTopicText.push(sentence.trim());
    currentTime += duration;
  }

  // Add final topic
  if (currentTopicText.length > 0) {
    const topicDuration = currentTime - topicStartTime;
    if (topicDuration >= minTopicDuration || topics.length === 0) {
      topics.push({
        topic: currentTopic,
        text: currentTopicText.join('. '),
        startTime: topicStartTime,
        endTime: currentTime,
      });
    }
  }

  // Ensure conclusion is always at the end if script mentions lunary.app or visit
  const hasConclusion = topics.some((t) => t.topic === 'conclusion');
  if (!hasConclusion && topics.length > 0) {
    const lastTopic = topics[topics.length - 1];
    // Check if last topic mentions conclusion keywords
    const lastText = lastTopic.text.toLowerCase();
    if (
      lastText.includes('lunary') ||
      lastText.includes('visit') ||
      lastText.includes('dive deeper')
    ) {
      lastTopic.topic = 'conclusion';
    } else {
      // Add a conclusion from the last few sentences
      const conclusionSentences = lastTopic.text
        .split('.')
        .slice(-2)
        .join('.')
        .trim();
      if (conclusionSentences.length > 10) {
        const wordsBefore = lastTopic.text
          .split('.')
          .slice(0, -2)
          .join('.')
          .trim();
        if (wordsBefore.length > 10) {
          lastTopic.text = wordsBefore;
          lastTopic.endTime =
            lastTopic.startTime +
            wordsBefore.split(/\s+/).length / wordsPerSecond;
          const conclusionStart = lastTopic.endTime;
          const conclusionDuration =
            conclusionSentences.split(/\s+/).length / wordsPerSecond;
          topics.push({
            topic: 'conclusion',
            text: conclusionSentences,
            startTime: conclusionStart,
            endTime: conclusionStart + conclusionDuration,
          });
        } else {
          lastTopic.topic = 'conclusion';
        }
      } else {
        lastTopic.topic = 'conclusion';
      }
    }
  }

  // Ensure we have at least one topic
  if (topics.length === 0) {
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: currentTime || script.split(/\s+/).length / wordsPerSecond,
      },
    ];
  }

  return topics;
}

/**
 * Extract exact planet movement from sentence
 * Matches patterns like "Sun enters Capricorn", "Mars stations retrograde", etc.
 * Uses strict word order matching to avoid false positives
 */
function extractPlanetMovement(
  sentence: string,
  weeklyData: WeeklyCosmicData,
): PlanetaryHighlight | null {
  const lowerSentence = sentence.toLowerCase();

  // List of planet names to match (with word boundaries)
  const planets = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ];

  // List of zodiac signs
  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];

  // Try to match "Planet enters Sign" pattern with strict word order
  for (const planet of planets) {
    const planetIndex = lowerSentence.indexOf(planet);
    if (planetIndex === -1) continue;

    // Check for "enters Sign" pattern - planet must come before "enters" which comes before sign
    for (const sign of signs) {
      const signIndex = lowerSentence.indexOf(sign);
      if (signIndex === -1) continue;

      // Check for enter keywords between planet and sign
      const enterKeywords = [
        'enters',
        'enter',
        'moves into',
        'moves to',
        'transits into',
      ];
      for (const keyword of enterKeywords) {
        const keywordIndex = lowerSentence.indexOf(keyword);
        if (
          keywordIndex > planetIndex &&
          keywordIndex < signIndex &&
          signIndex - keywordIndex < 50 // Reasonable proximity check
        ) {
          // Find exact match in weeklyData
          const match = weeklyData.planetaryHighlights.find(
            (h) =>
              h.planet.toLowerCase() === planet &&
              h.event === 'enters-sign' &&
              h.details?.toSign?.toLowerCase() === sign,
          );
          if (match) return match;
        }
      }
    }

    // Try to match "Planet stations retrograde" or "Planet goes retrograde" with word order
    const retrogradeIndex = lowerSentence.indexOf('retrograde');
    if (retrogradeIndex > planetIndex) {
      const retrogradeKeywords = ['stations', 'station', 'goes', 'turns'];
      for (const keyword of retrogradeKeywords) {
        const keywordIndex = lowerSentence.indexOf(keyword);
        if (
          keywordIndex > planetIndex &&
          keywordIndex < retrogradeIndex &&
          retrogradeIndex - keywordIndex < 20
        ) {
          const match = weeklyData.planetaryHighlights.find(
            (h) =>
              h.planet.toLowerCase() === planet &&
              h.event === 'goes-retrograde',
          );
          if (match) return match;
        }
      }
    }

    // Try to match "Planet goes direct" with word order
    const directIndex = lowerSentence.indexOf('direct');
    if (directIndex > planetIndex) {
      const directKeywords = ['goes', 'turns', 'stations'];
      for (const keyword of directKeywords) {
        const keywordIndex = lowerSentence.indexOf(keyword);
        if (
          keywordIndex > planetIndex &&
          keywordIndex < directIndex &&
          directIndex - keywordIndex < 20
        ) {
          const match = weeklyData.planetaryHighlights.find(
            (h) =>
              h.planet.toLowerCase() === planet && h.event === 'goes-direct',
          );
          if (match) return match;
        }
      }
    }
  }

  return null;
}

/**
 * Extract exact aspect from sentence
 * Matches patterns like "Venus trine Jupiter", "Mars square Saturn", etc.
 * Uses strict word order matching to avoid false positives
 */
function extractAspect(
  sentence: string,
  weeklyData: WeeklyCosmicData,
): MajorAspect | null {
  const lowerSentence = sentence.toLowerCase();

  const planets = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ];

  // Include variations of aspect words
  const aspectVariations: { [key: string]: string } = {
    conjunction: 'conjunction',
    conjunct: 'conjunction',
    conjoins: 'conjunction',
    trine: 'trine',
    trines: 'trine',
    trining: 'trine',
    'trine with': 'trine',
    'trine to': 'trine',
    square: 'square',
    squares: 'square',
    squaring: 'square',
    'square with': 'square',
    'square to': 'square',
    opposition: 'opposition',
    opposite: 'opposition',
    opposes: 'opposition',
    opposing: 'opposition',
    sextile: 'sextile',
    sextiles: 'sextile',
    sextiling: 'sextile',
    'sextile with': 'sextile',
    'sextile to': 'sextile',
  };

  const aspects = Object.keys(aspectVariations);

  // Try to match "PlanetA aspect PlanetB" pattern with strict word order
  for (const planetA of planets) {
    const planetAIndex = lowerSentence.indexOf(planetA);
    if (planetAIndex === -1) continue;

    for (const aspect of aspects) {
      const aspectIndex = lowerSentence.indexOf(aspect);
      if (aspectIndex === -1 || aspectIndex <= planetAIndex) continue;

      // Normalize aspect name using the mapping
      const normalizedAspect = aspectVariations[aspect];

      // Look for PlanetB after the aspect
      for (const planetB of planets) {
        if (planetB === planetA) continue;

        const planetBIndex = lowerSentence.indexOf(planetB, aspectIndex);
        if (
          planetBIndex > aspectIndex &&
          planetBIndex - aspectIndex < 30 // Reasonable proximity
        ) {
          // Find exact match in weeklyData (PlanetA aspect PlanetB)
          const match = weeklyData.majorAspects.find(
            (a) =>
              a.planetA.toLowerCase() === planetA &&
              a.planetB.toLowerCase() === planetB &&
              a.aspect.toLowerCase() === normalizedAspect,
          );
          if (match) return match;

          // Try reverse order (PlanetB aspect PlanetA)
          const reverseMatch = weeklyData.majorAspects.find(
            (a) =>
              a.planetA.toLowerCase() === planetB &&
              a.planetB.toLowerCase() === planetA &&
              a.aspect.toLowerCase() === normalizedAspect,
          );
          if (reverseMatch) return reverseMatch;
        }
      }
    }
  }

  // Also try "PlanetA and PlanetB form a aspect" pattern
  for (const planetA of planets) {
    const planetAIndex = lowerSentence.indexOf(planetA);
    if (planetAIndex === -1) continue;

    const andIndex = lowerSentence.indexOf(' and ', planetAIndex);
    if (andIndex === -1 || andIndex - planetAIndex > 20) continue;

    for (const planetB of planets) {
      if (planetB === planetA) continue;

      const planetBIndex = lowerSentence.indexOf(planetB, andIndex);
      if (planetBIndex === -1 || planetBIndex - andIndex > 20) continue;

      for (const aspect of aspects) {
        const aspectIndex = lowerSentence.indexOf(aspect, planetBIndex);
        if (aspectIndex === -1 || aspectIndex - planetBIndex > 30) continue;

        let normalizedAspect = aspect;
        if (aspect === 'conjunct') normalizedAspect = 'conjunction';
        if (aspect === 'opposite') normalizedAspect = 'opposition';

        const match = weeklyData.majorAspects.find(
          (a) =>
            a.planetA.toLowerCase() === planetA &&
            a.planetB.toLowerCase() === planetB &&
            a.aspect.toLowerCase() === normalizedAspect,
        );
        if (match) return match;

        const reverseMatch = weeklyData.majorAspects.find(
          (a) =>
            a.planetA.toLowerCase() === planetB &&
            a.planetB.toLowerCase() === planetA &&
            a.aspect.toLowerCase() === normalizedAspect,
        );
        if (reverseMatch) return reverseMatch;
      }
    }
  }

  return null;
}

/**
 * Extract exact moon phase from sentence
 * Matches patterns like "Full Moon in Leo", "New Moon", etc.
 */
function extractMoonPhase(
  sentence: string,
  weeklyData: WeeklyCosmicData,
): MoonPhaseEvent | null {
  const lowerSentence = sentence.toLowerCase();

  const moonPhases = [
    'new moon',
    'waxing crescent',
    'first quarter',
    'waxing gibbous',
    'full moon',
    'waning gibbous',
    'last quarter',
    'waning crescent',
  ];

  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];

  // Try to match moon phase patterns with strict word order
  for (const phase of moonPhases) {
    const phaseIndex = lowerSentence.indexOf(phase);
    if (phaseIndex === -1) continue;

    // Try to match with sign: "Full Moon in Leo" - phase must come before "in" before sign
    const inIndex = lowerSentence.indexOf(' in ', phaseIndex);
    if (inIndex > phaseIndex && inIndex - phaseIndex < 30) {
      for (const sign of signs) {
        const signIndex = lowerSentence.indexOf(sign, inIndex);
        if (signIndex > inIndex && signIndex - inIndex < 20) {
          const match = weeklyData.moonPhases.find(
            (m) =>
              m.phase.toLowerCase() === phase && m.sign.toLowerCase() === sign,
          );
          if (match) return match;
        }
      }
    }

    // Try to match without sign (just phase) - but only if no sign mentioned nearby
    const hasSignNearby = signs.some(
      (sign) =>
        lowerSentence.includes(sign) &&
        Math.abs(lowerSentence.indexOf(sign) - phaseIndex) < 50,
    );
    if (!hasSignNearby) {
      const match = weeklyData.moonPhases.find(
        (m) => m.phase.toLowerCase() === phase,
      );
      if (match) return match;
    }
  }

  return null;
}

/**
 * Split a long-form script into item-based segments
 * Creates granular segments for each specific item mentioned (planet, aspect, moon phase)
 * This provides better image-to-text correspondence
 */
export function segmentScriptIntoItems(
  script: string,
  weeklyData: WeeklyCosmicData,
  wordsPerSecond: number = 2.5, // Can be overridden with actual audio rate
): ScriptItem[] {
  const items: ScriptItem[] = [];
  let currentTime = 0;

  // Split script into sentences
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length === 0) {
    // Fallback: create a single intro item
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: script.split(/\s+/).length / wordsPerSecond,
        item: 'intro',
      },
    ];
  }

  const minItemDuration = 2; // Minimum 2 seconds per item
  const usedExactItems = new Set<string>(); // Track used exact items to avoid duplicates
  // For long-form, we allow multiple segments of same type (e.g., multiple planet transits)

  // Planet and aspect names for checking best_days assignment
  const planets = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ];
  const aspects = [
    'conjunction',
    'conjunct',
    'conjoins',
    'trine',
    'trines',
    'trining',
    'square',
    'squares',
    'squaring',
    'opposition',
    'opposite',
    'opposes',
    'opposing',
    'sextile',
    'sextiles',
    'sextiling',
  ];

  // Start with intro - it stays intro unless exact item found
  let currentTopic: ScriptTopic['topic'] = 'intro';
  let currentItemText: string[] = [];
  let itemStartTime = 0;
  let currentItem: string | null = 'intro';
  let currentExactPlanet: PlanetaryHighlight | null = null;
  let currentExactAspect: MajorAspect | null = null;
  let currentExactMoonPhase: MoonPhaseEvent | null = null;
  let currentExactSeasonalEvent: {
    name: string;
    type: string;
    date: Date;
  } | null = null;
  let isFirstSegment = true; // Track if we're still in intro

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const words = sentence.trim().split(/\s+/).length;
    const duration = words / wordsPerSecond;

    // Check for conclusion first (highest priority)
    if (
      lowerSentence.includes('conclusion') ||
      lowerSentence.includes('wrap up') ||
      lowerSentence.includes('visit lunary') ||
      lowerSentence.includes('lunary.app') ||
      lowerSentence.includes('dive deeper') ||
      lowerSentence.includes('birth chart')
    ) {
      // Save previous item if exists
      if (currentItem && currentItemText.length > 0) {
        const itemDuration = currentTime - itemStartTime;
        if (itemDuration >= minItemDuration || items.length === 0) {
          items.push({
            topic: currentTopic,
            text: currentItemText.join('. '),
            startTime: itemStartTime,
            endTime: currentTime,
            item: currentItem,
            exactPlanet: currentExactPlanet || undefined,
            exactAspect: currentExactAspect || undefined,
            exactMoonPhase: currentExactMoonPhase || undefined,
          });
        }
      }
      // Start conclusion
      currentTopic = 'conclusion';
      currentItem = 'conclusion';
      currentItemText = [sentence.trim()];
      itemStartTime = currentTime;
      currentExactPlanet = null;
      currentExactAspect = null;
      currentExactMoonPhase = null;
      isFirstSegment = false;
      currentTime += duration;
      continue;
    }

    // Try to extract exact items - ONLY create segment if exact match found
    let exactPlanet: PlanetaryHighlight | null = null;
    let exactAspect: MajorAspect | null = null;
    let exactMoonPhase: MoonPhaseEvent | null = null;
    let detectedTopic: ScriptTopic['topic'] | null = null;
    let detectedItem: string | null = null;

    // Priority 1: Try to extract exact moon phase (critical for Lunary)
    // Allow multiple moon segments if different phases are mentioned
    exactMoonPhase = extractMoonPhase(sentence, weeklyData);
    if (exactMoonPhase) {
      const itemKey = `moon-${exactMoonPhase.phase}-${exactMoonPhase.sign}`;
      if (!usedExactItems.has(itemKey)) {
        detectedTopic = 'moon_phases';
        detectedItem = itemKey;
        usedExactItems.add(itemKey);
      }
    }
    // If no exact match but text mentions moon phases, still create moon phase segment
    else if (
      lowerSentence.includes('moon') ||
      lowerSentence.includes('lunar') ||
      lowerSentence.includes('phase') ||
      lowerSentence.includes('no major moon phases')
    ) {
      // Check that we're not in a context that should be another topic
      const hasPlanetMention = planets.some((p) => lowerSentence.includes(p));
      const hasAspectMention = aspects.some((a) => lowerSentence.includes(a));
      // Create moon phase segment if:
      // 1. Explicitly mentions "moon phase" or "no major moon phases", OR
      // 2. Mentions moon/lunar/phase without strong planet/aspect context
      if (
        lowerSentence.includes('moon phase') ||
        lowerSentence.includes('no major moon phases') ||
        (!hasPlanetMention && !hasAspectMention)
      ) {
        // Use the first moon phase from weeklyData if available (only if not already used)
        const fallbackMoon =
          weeklyData.moonPhases.length > 0 ? weeklyData.moonPhases[0] : null;
        const moonKey = fallbackMoon
          ? `moon-${fallbackMoon.phase}-${fallbackMoon.sign}`
          : 'moon-phase-no-match';
        if (!usedExactItems.has(moonKey)) {
          if (fallbackMoon) {
            detectedTopic = 'moon_phases';
            detectedItem = moonKey;
            exactMoonPhase = fallbackMoon;
          } else {
            detectedTopic = 'moon_phases';
            detectedItem = moonKey;
            // exactMoonPhase remains undefined - image generator will show "No Major Changes"
          }
          usedExactItems.add(moonKey);
        }
      }
    }

    // Priority 1.5: Seasonal Events (solstice, equinox) - give them dedicated segments
    if (!detectedTopic) {
      if (
        lowerSentence.includes('solstice') ||
        lowerSentence.includes('equinox') ||
        lowerSentence.includes('winter solstice') ||
        lowerSentence.includes('summer solstice') ||
        lowerSentence.includes('spring equinox') ||
        lowerSentence.includes('fall equinox') ||
        lowerSentence.includes('autumn equinox') ||
        lowerSentence.includes('shortest day') ||
        lowerSentence.includes('longest day') ||
        lowerSentence.includes('imbolc') ||
        lowerSentence.includes('beltane') ||
        lowerSentence.includes('lughnasadh') ||
        lowerSentence.includes('samhain')
      ) {
        const seasonalEvent =
          weeklyData.seasonalEvents && weeklyData.seasonalEvents.length > 0
            ? weeklyData.seasonalEvents[0]
            : null;
        if (seasonalEvent) {
          const itemKey = `seasonal-${seasonalEvent.name}`;
          if (!usedExactItems.has(itemKey)) {
            detectedTopic = 'seasonal_events';
            detectedItem = itemKey;
            usedExactItems.add(itemKey);
            currentExactSeasonalEvent = {
              name: seasonalEvent.name,
              type: seasonalEvent.type,
              date: seasonalEvent.date,
            };
          }
        }
      }
    }

    // Priority 2: Try to extract exact aspect
    if (!detectedTopic) {
      exactAspect = extractAspect(sentence, weeklyData);
      if (exactAspect) {
        // Include date to prevent duplicates of same aspect on different days
        const dateKey = exactAspect.date.toISOString().split('T')[0]; // YYYY-MM-DD
        const itemKey = `aspect-${exactAspect.planetA}-${exactAspect.aspect}-${exactAspect.planetB}-${dateKey}`;
        if (!usedExactItems.has(itemKey)) {
          detectedTopic = 'aspects';
          detectedItem = itemKey;
          usedExactItems.add(itemKey);
        }
      }
      // Fallback: keyword-based aspect detection for long-form
      else {
        const hasAspectWord = aspects.some((a) => lowerSentence.includes(a));
        const mentionedPlanets = planets.filter((p) =>
          lowerSentence.includes(p),
        );
        // If sentence has an aspect word and 2+ planets, create an aspect segment
        if (hasAspectWord && mentionedPlanets.length >= 2) {
          const aspectWord =
            aspects.find((a) => lowerSentence.includes(a)) || 'aspect';
          const itemKey = `aspect-${mentionedPlanets[0]}-${aspectWord}-${mentionedPlanets[1]}`;
          if (!usedExactItems.has(itemKey)) {
            detectedTopic = 'aspects';
            detectedItem = itemKey;
            usedExactItems.add(itemKey);
            // Try to find matching aspect in weeklyData
            exactAspect =
              weeklyData.majorAspects.find(
                (a) =>
                  a.planetA.toLowerCase() === mentionedPlanets[0] ||
                  a.planetB.toLowerCase() === mentionedPlanets[0],
              ) || null;
          }
        }
      }
    }

    // Priority 3: Try to extract exact planet movement
    if (!detectedTopic) {
      exactPlanet = extractPlanetMovement(sentence, weeklyData);
      if (exactPlanet) {
        // Include date to prevent duplicates of same planet/event on different days
        const dateKey = exactPlanet.date.toISOString().split('T')[0]; // YYYY-MM-DD
        const itemKey = `planet-${exactPlanet.planet}-${exactPlanet.event}-${dateKey}`;
        if (!usedExactItems.has(itemKey)) {
          detectedTopic = 'planetary_highlights';
          detectedItem = itemKey;
          usedExactItems.add(itemKey);
        }
      }
      // Fallback: keyword-based planet detection for long-form
      else {
        const mentionedPlanet = planets.find(
          (p) => p !== 'moon' && lowerSentence.includes(p),
        );
        const hasMovementWord =
          lowerSentence.includes('enters') ||
          lowerSentence.includes('moves into') ||
          lowerSentence.includes('shifts') ||
          lowerSentence.includes('transit');
        if (mentionedPlanet && hasMovementWord) {
          const itemKey = `planet-${mentionedPlanet}-movement`;
          if (!usedExactItems.has(itemKey)) {
            detectedTopic = 'planetary_highlights';
            detectedItem = itemKey;
            usedExactItems.add(itemKey);
            // Try to find matching planet in weeklyData
            exactPlanet =
              weeklyData.planetaryHighlights.find(
                (h) => h.planet.toLowerCase() === mentionedPlanet,
              ) || null;
          }
        }
      }
    }

    // Priority 4: Check for best days - only if no exact item found AND keywords are clear
    if (
      !detectedTopic &&
      !isFirstSegment && // Don't assign best_days to intro
      (lowerSentence.includes('best days') ||
        lowerSentence.includes('best for') ||
        (lowerSentence.includes('ideal') &&
          (lowerSentence.includes('timing') ||
            lowerSentence.includes('day') ||
            lowerSentence.includes('date'))))
    ) {
      // Only assign best_days if we're sure - check that no planets/aspects mentioned
      const hasPlanetMention = planets.some((p) => lowerSentence.includes(p));
      const hasAspectMention = aspects.some((a) => lowerSentence.includes(a));
      if (!hasPlanetMention && !hasAspectMention) {
        detectedTopic = 'best_days';
        detectedItem = 'best-days';
      }
    }

    // Only create new segment if exact item found (or best_days with clear keywords)
    if (detectedItem && detectedTopic) {
      // Save previous item if exists
      if (currentItem && currentItemText.length > 0) {
        const itemDuration = currentTime - itemStartTime;
        if (itemDuration >= minItemDuration || items.length === 0) {
          items.push({
            topic: currentTopic,
            text: currentItemText.join('. '),
            startTime: itemStartTime,
            endTime: currentTime,
            item: currentItem,
            exactPlanet: currentExactPlanet || undefined,
            exactAspect: currentExactAspect || undefined,
            exactMoonPhase: currentExactMoonPhase || undefined,
            exactSeasonalEvent: currentExactSeasonalEvent || undefined,
          });
        }
      }
      // Start new segment with exact item
      currentTopic = detectedTopic;
      currentItem = detectedItem;
      currentExactPlanet = exactPlanet;
      currentExactAspect = exactAspect;
      currentExactMoonPhase = exactMoonPhase;
      // Reset seasonal event unless we're starting a seasonal segment
      if (detectedTopic !== 'seasonal_events') {
        currentExactSeasonalEvent = null;
      }
      currentItemText = [sentence.trim()];
      itemStartTime = currentTime;
      isFirstSegment = false;
    } else {
      // Continue current item - don't change topic/item if no exact match
      currentItemText.push(sentence.trim());
    }

    currentTime += duration;
  }

  // Add final item
  if (currentItemText.length > 0) {
    const itemDuration = currentTime - itemStartTime;
    if (itemDuration >= minItemDuration || items.length === 0) {
      items.push({
        topic: currentTopic,
        text: currentItemText.join('. '),
        startTime: itemStartTime,
        endTime: currentTime,
        item: currentItem || 'intro',
        exactPlanet: currentExactPlanet || undefined,
        exactAspect: currentExactAspect || undefined,
        exactMoonPhase: currentExactMoonPhase || undefined,
        exactSeasonalEvent: currentExactSeasonalEvent || undefined,
      });
    }
  }

  // Ensure we have at least one item
  if (items.length === 0) {
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: currentTime || script.split(/\s+/).length / wordsPerSecond,
        item: 'intro',
      },
    ];
  }

  // Ensure moon phases are present - if none found, add one
  const hasMoonPhases = items.some((i) => i.topic === 'moon_phases');
  if (!hasMoonPhases) {
    console.warn(
      '⚠️ No moon phase segments found in script. Adding moon phase segment...',
    );
    // Find a good place to insert (before conclusion, or at 80% of script)
    const conclusionIndex = items.findIndex((i) => i.topic === 'conclusion');
    const insertIndex =
      conclusionIndex >= 0 ? conclusionIndex : Math.floor(items.length * 0.8);
    const insertTime =
      insertIndex > 0 ? items[insertIndex - 1].endTime : items[0].startTime;

    // Use first moon phase from weeklyData if available
    const fallbackMoonPhase =
      weeklyData.moonPhases.length > 0 ? weeklyData.moonPhases[0] : null;

    const moonPhaseText = fallbackMoonPhase
      ? `The moon phases this week include ${fallbackMoonPhase.phase} moon in ${fallbackMoonPhase.sign}.`
      : 'The lunar energy this week guides our emotional landscape.';
    const moonPhaseDuration =
      moonPhaseText.split(/\s+/).length / wordsPerSecond;

    items.splice(insertIndex, 0, {
      topic: 'moon_phases',
      text: moonPhaseText,
      startTime: insertTime,
      endTime: insertTime + moonPhaseDuration,
      item: fallbackMoonPhase
        ? `moon-${fallbackMoonPhase.phase}-${fallbackMoonPhase.sign}`
        : 'moon-phase-fallback',
      exactMoonPhase: fallbackMoonPhase || undefined,
    });
  }

  return items;
}

/**
 * Split a medium-form script into item-based segments (optimized for 30-60s)
 * Creates segments for: intro, each planetary movement mentioned, each aspect mentioned, moon phases, conclusion
 * Each unique transit gets its own segment and image
 */
export function segmentScriptIntoMediumItems(
  script: string,
  weeklyData: WeeklyCosmicData,
  wordsPerSecond: number = 2.5, // Can be overridden with actual audio rate
): ScriptItem[] {
  let currentTime = 0;

  // Split script into sentences
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length === 0) {
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: script.split(/\s+/).length / wordsPerSecond,
        item: 'intro',
      },
    ];
  }

  const minItemDuration = 4; // Minimum 4 seconds per item for medium form
  const usedExactItems = new Set<string>();
  const items: ScriptItem[] = [];

  // Track moon phases (always included, but only once)
  let hasMoonPhase = false;
  let hasSeasonalEvent = false;

  // Get top moon phase for fallback
  const topMoonPhase =
    weeklyData.moonPhases.length > 0 ? weeklyData.moonPhases[0] : null;

  // Get seasonal events
  const seasonalEvent =
    weeklyData.seasonalEvents && weeklyData.seasonalEvents.length > 0
      ? weeklyData.seasonalEvents[0]
      : null;

  let currentTopic: ScriptTopic['topic'] = 'intro';
  let currentItemText: string[] = [];
  let itemStartTime = 0;
  let currentItem: string | null = 'intro';
  let currentExactPlanet: PlanetaryHighlight | null = null;
  let currentExactAspect: MajorAspect | null = null;
  let currentExactMoonPhase: MoonPhaseEvent | null = null;
  let currentExactSeasonalEvent: {
    name: string;
    type: string;
    date: Date;
  } | null = null;
  let isFirstSegment = true;

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const words = sentence.trim().split(/\s+/).length;
    const duration = words / wordsPerSecond;

    // Check for conclusion
    if (
      lowerSentence.includes('conclusion') ||
      lowerSentence.includes('wrap up') ||
      lowerSentence.includes('visit lunary') ||
      lowerSentence.includes('lunary.app') ||
      lowerSentence.includes('full blog') ||
      lowerSentence.includes('check out') ||
      lowerSentence.includes('for more information') ||
      lowerSentence.includes('dive deeper') ||
      lowerSentence.includes('birth chart')
    ) {
      // Save current item
      if (currentItem && currentItemText.length > 0) {
        const itemDuration = currentTime - itemStartTime;
        if (itemDuration >= minItemDuration || items.length === 0) {
          items.push({
            topic: currentTopic,
            text: currentItemText.join('. '),
            startTime: itemStartTime,
            endTime: currentTime,
            item: currentItem,
            exactPlanet: currentExactPlanet || undefined,
            exactAspect: currentExactAspect || undefined,
            exactMoonPhase: currentExactMoonPhase || undefined,
          });
        }
      }
      // Start conclusion
      currentTopic = 'conclusion';
      currentItem = 'conclusion';
      currentItemText = [sentence.trim()];
      itemStartTime = currentTime;
      currentExactPlanet = null;
      currentExactAspect = null;
      currentExactMoonPhase = null;
      isFirstSegment = false;
      currentTime += duration;
      continue;
    }

    // Try to extract exact items - prioritize moon phases, then top planet, then top aspect
    let exactPlanet: PlanetaryHighlight | null = null;
    let exactAspect: MajorAspect | null = null;
    let exactMoonPhase: MoonPhaseEvent | null = null;
    let detectedTopic: ScriptTopic['topic'] | null = null;
    let detectedItem: string | null = null;

    // Priority 1: Moon Phase (always include if not already included)
    if (!hasMoonPhase) {
      exactMoonPhase = extractMoonPhase(sentence, weeklyData);
      if (exactMoonPhase) {
        const itemKey = `moon-${exactMoonPhase.phase}-${exactMoonPhase.sign}`;
        if (!usedExactItems.has(itemKey)) {
          detectedTopic = 'moon_phases';
          detectedItem = itemKey;
          usedExactItems.add(itemKey);
          hasMoonPhase = true;
        }
      } else if (
        lowerSentence.includes('moon') ||
        lowerSentence.includes('lunar') ||
        lowerSentence.includes('phase') ||
        lowerSentence.includes('no major moon phases')
      ) {
        // Create moon phase segment even if no exact match - image will show "No Major Changes" if needed
        if (topMoonPhase) {
          detectedTopic = 'moon_phases';
          detectedItem = `moon-${topMoonPhase.phase}-${topMoonPhase.sign}`;
          exactMoonPhase = topMoonPhase;
        } else {
          // No moon phases in data - create segment with undefined exactMoonPhase
          // Image generator will show "No Major Changes"
          detectedTopic = 'moon_phases';
          detectedItem = 'moon-phase-no-match';
          exactMoonPhase = null;
        }
        hasMoonPhase = true;
      }
    }

    // Priority 1.5: Seasonal Events (solstice, equinox - very important!)
    if (!detectedTopic && !hasSeasonalEvent && seasonalEvent) {
      if (
        lowerSentence.includes('solstice') ||
        lowerSentence.includes('equinox') ||
        lowerSentence.includes('winter solstice') ||
        lowerSentence.includes('summer solstice') ||
        lowerSentence.includes('spring equinox') ||
        lowerSentence.includes('fall equinox') ||
        lowerSentence.includes('autumn equinox') ||
        lowerSentence.includes('imbolc') ||
        lowerSentence.includes('beltane') ||
        lowerSentence.includes('lughnasadh') ||
        lowerSentence.includes('samhain')
      ) {
        detectedTopic = 'seasonal_events';
        detectedItem = `seasonal-${seasonalEvent.name}`;
        currentExactSeasonalEvent = {
          name: seasonalEvent.name,
          type: seasonalEvent.type,
          date: seasonalEvent.date,
        };
        hasSeasonalEvent = true;
      }
    }

    // Priority 2: Extract ANY planetary movement mentioned (create segment for each unique one)
    if (!detectedTopic) {
      exactPlanet = extractPlanetMovement(sentence, weeklyData);
      if (exactPlanet) {
        // Include date to prevent duplicates of same planet/event on different days
        const dateKey = exactPlanet.date.toISOString().split('T')[0]; // YYYY-MM-DD
        const itemKey = `planet-${exactPlanet.planet}-${exactPlanet.event}-${dateKey}`;
        // Only create segment if this specific planet/event hasn't been used yet
        if (!usedExactItems.has(itemKey)) {
          detectedTopic = 'planetary_highlights';
          detectedItem = itemKey;
          usedExactItems.add(itemKey);
        }
      }
    }

    // Priority 3: Extract ANY aspect mentioned (create segment for each unique one)
    if (!detectedTopic) {
      exactAspect = extractAspect(sentence, weeklyData);
      if (exactAspect) {
        // Include date to prevent duplicates of same aspect on different days
        const dateKey = exactAspect.date.toISOString().split('T')[0]; // YYYY-MM-DD
        const itemKey = `aspect-${exactAspect.planetA}-${exactAspect.aspect}-${exactAspect.planetB}-${dateKey}`;
        // Only create segment if this specific aspect hasn't been used yet
        if (!usedExactItems.has(itemKey)) {
          detectedTopic = 'aspects';
          detectedItem = itemKey;
          usedExactItems.add(itemKey);
        }
      }
    }

    // Only create new segment if exact item found
    if (detectedItem && detectedTopic) {
      // Save previous item if exists
      if (currentItem && currentItemText.length > 0) {
        const itemDuration = currentTime - itemStartTime;
        if (itemDuration >= minItemDuration || items.length === 0) {
          items.push({
            topic: currentTopic,
            text: currentItemText.join('. '),
            startTime: itemStartTime,
            endTime: currentTime,
            item: currentItem,
            exactPlanet: currentExactPlanet || undefined,
            exactAspect: currentExactAspect || undefined,
            exactMoonPhase: currentExactMoonPhase || undefined,
            exactSeasonalEvent: currentExactSeasonalEvent || undefined,
          });
        }
      }
      // Start new segment with exact item
      currentTopic = detectedTopic;
      currentItem = detectedItem;
      currentExactPlanet = exactPlanet;
      currentExactAspect = exactAspect;
      currentExactMoonPhase = exactMoonPhase;
      // Keep seasonal event if it was just detected, otherwise reset
      if (detectedTopic !== 'seasonal_events') {
        currentExactSeasonalEvent = null;
      }
      currentItemText = [sentence.trim()];
      itemStartTime = currentTime;
      isFirstSegment = false;
    } else {
      // Continue current item (no exact match found)
      currentItemText.push(sentence.trim());
    }

    currentTime += duration;
  }

  // Add final item
  if (currentItemText.length > 0) {
    const itemDuration = currentTime - itemStartTime;
    if (itemDuration >= minItemDuration || items.length === 0) {
      items.push({
        topic: currentTopic,
        text: currentItemText.join('. '),
        startTime: itemStartTime,
        endTime: currentTime,
        item: currentItem || 'intro',
        exactPlanet: currentExactPlanet || undefined,
        exactAspect: currentExactAspect || undefined,
        exactMoonPhase: currentExactMoonPhase || undefined,
        exactSeasonalEvent: currentExactSeasonalEvent || undefined,
      });
    }
  }

  // Ensure we have at least one item
  if (items.length === 0) {
    return [
      {
        topic: 'intro',
        text: script,
        startTime: 0,
        endTime: currentTime || script.split(/\s+/).length / wordsPerSecond,
        item: 'intro',
      },
    ];
  }

  // Ensure moon phases are present (critical for Lunary)
  const hasMoonPhases = items.some((i) => i.topic === 'moon_phases');
  if (!hasMoonPhases) {
    // Insert moon phase segment before conclusion or at end
    const conclusionIndex = items.findIndex((i) => i.topic === 'conclusion');
    const insertIndex = conclusionIndex >= 0 ? conclusionIndex : items.length;
    const insertTime =
      insertIndex > 0
        ? items[insertIndex - 1].endTime
        : items[0]?.startTime || 0;

    if (topMoonPhase) {
      const moonPhaseText = `The moon phases this week include ${topMoonPhase.phase} moon in ${topMoonPhase.sign}.`;
      const moonPhaseDuration =
        moonPhaseText.split(/\s+/).length / wordsPerSecond;

      items.splice(insertIndex, 0, {
        topic: 'moon_phases',
        text: moonPhaseText,
        startTime: insertTime,
        endTime: insertTime + moonPhaseDuration,
        item: `moon-${topMoonPhase.phase}-${topMoonPhase.sign}`,
        exactMoonPhase: topMoonPhase,
      });
    } else {
      // No moon phases in data - create segment that will show "No Major Changes"
      const moonPhaseText = 'This week there are no major moon phase changes.';
      const moonPhaseDuration =
        moonPhaseText.split(/\s+/).length / wordsPerSecond;

      items.splice(insertIndex, 0, {
        topic: 'moon_phases',
        text: moonPhaseText,
        startTime: insertTime,
        endTime: insertTime + moonPhaseDuration,
        item: 'moon-phase-no-match',
        exactMoonPhase: undefined,
      });
    }
  }

  // Ensure conclusion is present - check if last item mentions lunary/blog
  const hasConclusion = items.some((i) => i.topic === 'conclusion');
  if (!hasConclusion && items.length > 0) {
    const lastItem = items[items.length - 1];
    const lastText = lastItem.text.toLowerCase();
    // If last item mentions lunary or blog, mark it as conclusion
    if (
      lastText.includes('lunary') ||
      lastText.includes('blog') ||
      lastText.includes('for more information') ||
      lastText.includes('check out')
    ) {
      lastItem.topic = 'conclusion';
      lastItem.item = 'conclusion';
    } else {
      // Otherwise, check if we should add a conclusion segment
      // This shouldn't happen with the new prompt, but just in case
      const conclusionText =
        'For more information, check out the full blog at Lunary.';
      const conclusionDuration =
        conclusionText.split(/\s+/).length / wordsPerSecond;
      const conclusionStart = lastItem.endTime;

      items.push({
        topic: 'conclusion',
        text: conclusionText,
        startTime: conclusionStart,
        endTime: conclusionStart + conclusionDuration,
        item: 'conclusion',
      });
    }
  }

  return items;
}
