import { execSync } from 'child_process';
import { existsSync } from 'fs';

/**
 * Get the last modified date of a file from git history
 * Falls back to current date if git is unavailable or file is not tracked
 */
export function getFileLastModified(filePath: string): string {
  try {
    // Check if file exists
    if (!existsSync(filePath)) {
      return new Date().toISOString().split('T')[0];
    }

    // Get last commit date for this specific file
    const gitCommand = `git log -1 --format="%ai" -- "${filePath}"`;
    const output = execSync(gitCommand, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
    }).trim();

    if (output) {
      // Extract date part (YYYY-MM-DD)
      const date = output.split(' ')[0];
      return date;
    }

    // Fallback to current date if no git history
    return new Date().toISOString().split('T')[0];
  } catch (error) {
    // Fallback to current date if git command fails
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Get last modified date for the calling file at build time
 * Use this in generateMetadata or page components
 */
export function getPageLastModified(importMetaUrl: string): string {
  // Convert file:// URL to file path
  const filePath = importMetaUrl.replace('file://', '');
  return getFileLastModified(filePath);
}

/**
 * Simplified: Get last modified date for common page patterns
 * Just pass a short identifier and it will construct the full path
 *
 * @example
 * getLastModified('horoscopes/[sign]/[year]/[month]')
 * getLastModified('houses/overview/[house]')
 */
export function getLastModified(pagePattern: string): string {
  const fullPath = `./src/app/grimoire/${pagePattern}/page.tsx`;
  return getFileLastModified(fullPath);
}
