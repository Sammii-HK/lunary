/**
 * Utility for filtering API response fields based on query parameters
 * Allows clients to request only the fields they need, reducing payload size
 */

/**
 * Filter an object to only include specified fields
 * @param data - The full response object
 * @param fields - Comma-separated list of field names (e.g., "dau,wau,mau")
 * @returns Filtered object with only requested fields
 */
export function filterFields<T extends Record<string, any>>(
  data: T,
  fields?: string | null,
): Partial<T> {
  // If no fields specified, return everything
  if (!fields) return data;

  const requestedFields = fields.split(',').map((f) => f.trim());
  const filtered: Partial<T> = {};

  for (const field of requestedFields) {
    if (field in data) {
      filtered[field as keyof T] = data[field];
    }
  }

  return filtered;
}

/**
 * Parse fields from URL search params
 * @param searchParams - URL search params object
 * @returns Comma-separated field list or null
 */
export function getFieldsParam(searchParams: URLSearchParams): string | null {
  return searchParams.get('fields');
}
