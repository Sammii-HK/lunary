export const stringToKebabCase = (string: string) =>
  string.replaceAll(' ', '-').toLowerCase();
