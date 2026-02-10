/**
 * Shared birth chart version constant.
 * Bump this number to trigger automatic regeneration of all user and relationship charts.
 *
 * Version history:
 *   7 – Added Part of Fortune and Vertex
 *   8 – Fixed retrograde detection, timezone handling, DST edge cases, input validation
 *   9 – Astronomical accuracy improvements, verified against multiple astrology sources
 *  10 – Full cache invalidation on regeneration (8 DB tables, client caches, HTTP cache)
 *  11 – Server-side generation: reliable geocoding + timezone resolution
 */
export const CURRENT_BIRTH_CHART_VERSION = 11;
