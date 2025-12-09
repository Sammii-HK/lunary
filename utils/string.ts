export const stringToKebabCase = (string: string) =>
  string
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Insert hyphen between camelCase
    .replaceAll(' ', '-')
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
