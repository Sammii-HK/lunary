export function sectionToSlug(section: string): string {
  return section
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

export function slugToSection(slug: string): string {
  return slug
    .split('-')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
}

export function isValidGrimoireSection(slug: string): boolean {
  const section = slugToSection(slug);
  const validSections = [
    'moon',
    'wheelOfTheYear',
    'astronomy',
    'tarot',
    'runes',
    'chakras',
    'numerology',
    'crystals',
    'correspondences',
    'practices',
    'birthChart',
  ];
  return validSections.includes(section);
}
