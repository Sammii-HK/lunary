export const stringToKebabCase = (string: string) =>
  string
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replaceAll(' ', '-')
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
