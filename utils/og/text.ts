export function capitalizeThematicTitle(value: string): string {
  if (!value) return value;
  return value
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(' ')
    .trim();
}
