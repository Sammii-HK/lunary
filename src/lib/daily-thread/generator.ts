import { sql } from '@vercel/postgres';
import dayjs from 'dayjs';
import { DailyThreadModule, DailyThreadModuleType } from './types';
import { calculateUserLevel } from './levels';
import { generateMemoryModule } from './memory';
import { generateReflectionModule } from './reflection';
import { generateMilestoneModule } from './milestone';
import { generatePatternModule } from './pattern';
import { generateAmbientModule } from './ambient';

const MAX_MODULES = 3;

/**
 * Build daily thread modules for a user on a specific date
 * Idempotent: returns cached modules unless forceRefresh is true
 */
export async function buildDailyThreadModules(
  userId: string,
  date: Date = new Date(),
  forceRefresh: boolean = false,
  userName?: string,
  userBirthday?: string,
  moduleTypeOverride?: DailyThreadModuleType,
): Promise<DailyThreadModule[]> {
  try {
    const dateStr = dayjs(date).format('YYYY-MM-DD');

    // Check if modules already exist (unless forcing refresh)
    if (!forceRefresh) {
      const existingResult = await sql`
        SELECT modules_json
        FROM daily_thread_modules
        WHERE user_id = ${userId}
        AND date = ${dateStr}::DATE
      `;

      if (existingResult.rows.length > 0) {
        const modules = existingResult.rows[0]
          .modules_json as DailyThreadModule[];
        // Filter by override if specified
        if (moduleTypeOverride) {
          return modules.filter((m) => m.type === moduleTypeOverride);
        }
        return modules;
      }
    }

    // Calculate user level
    const userLevel = await calculateUserLevel(userId);

    // Generate modules in priority order
    const modules: DailyThreadModule[] = [];

    // 0. Ambient (priority 50) - level 0 only, moon phase
    if (userLevel === 0) {
      const ambient = await generateAmbientModule(
        userId,
        userName,
        userBirthday,
        date,
      );
      if (ambient) {
        modules.push(ambient);
      }
    }

    // 1. Milestone (priority 100) - only on milestone days, level 2-3
    if (userLevel >= 2) {
      const milestone = await generateMilestoneModule(userId, date);
      if (milestone) {
        modules.push(milestone);
      }
    }

    // 2. Pattern Insight (priority 80) - once per week (Sunday), level 2-3
    if (userLevel >= 2) {
      const dayOfWeek = dayjs(date).day();
      if (dayOfWeek === 0) {
        // Sunday
        const pattern = await generatePatternModule(userId, date);
        if (pattern) {
          modules.push(pattern);
        }
      }
    }

    // 3. Reflection Prompt (priority 60) - daily, all levels
    const reflection = await generateReflectionModule(
      userId,
      userName,
      userBirthday,
      date,
      userLevel,
    );
    if (reflection) {
      modules.push(reflection);
    }

    // 4. Memory (priority 40) - 2-3 times/week, level 2-3, only if meaningful
    if (userLevel >= 2) {
      // Show memory 2-3 times per week (e.g., Monday, Wednesday, Friday)
      const dayOfWeek = dayjs(date).day();
      const showMemoryDays = [1, 3, 5]; // Monday, Wednesday, Friday
      if (showMemoryDays.includes(dayOfWeek)) {
        const memory = await generateMemoryModule(userId, date);
        if (memory) {
          // Don't show memory if reflection already references it
          const reflectionBody = reflection?.body.toLowerCase() || '';
          const memorySnippet =
            memory.meta?.journalSnippet?.toLowerCase() || '';
          if (!reflectionBody.includes(memorySnippet)) {
            modules.push(memory);
          }
        }
      }
    }

    // Filter modules by user level
    const filteredModules = modules.filter((m) => m.level <= userLevel);

    // Sort by priority (higher first)
    filteredModules.sort((a, b) => b.priority - a.priority);

    // Trim to max 3 modules
    const finalModules = filteredModules.slice(0, MAX_MODULES);

    // Store in database
    if (finalModules.length > 0) {
      await sql`
        INSERT INTO daily_thread_modules (user_id, date, modules_json, created_at, updated_at)
        VALUES (${userId}, ${dateStr}::DATE, ${JSON.stringify(finalModules)}::jsonb, NOW(), NOW())
        ON CONFLICT (user_id, date)
        DO UPDATE SET
          modules_json = ${JSON.stringify(finalModules)}::jsonb,
          updated_at = NOW()
      `;
    }

    // Filter by override if specified
    if (moduleTypeOverride) {
      return finalModules.filter((m) => m.type === moduleTypeOverride);
    }

    return finalModules;
  } catch (error) {
    console.error('[Daily Thread] Error building modules:', error);
    return [];
  }
}

/**
 * Get modules for a specific date (cached or generated)
 */
export async function getDailyThreadModules(
  userId: string,
  date: Date = new Date(),
): Promise<DailyThreadModule[]> {
  const dateStr = dayjs(date).format('YYYY-MM-DD');

  try {
    const result = await sql`
      SELECT modules_json
      FROM daily_thread_modules
      WHERE user_id = ${userId}
      AND date = ${dateStr}::DATE
    `;

    if (result.rows.length > 0) {
      return result.rows[0].modules_json as DailyThreadModule[];
    }

    // If no cached modules, generate them
    return await buildDailyThreadModules(userId, date, false);
  } catch (error) {
    console.error('[Daily Thread] Error getting modules:', error);
    return [];
  }
}
