import { grimoire } from '@/constants/grimoire';

export function sectionToSlug(section: string): string {
  if (!section) {
    return '';
  }

  // Convert camelCase to kebab-case
  // This regex inserts a dash before capital letters that follow lowercase letters or other capitals
  return section
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Insert dash between lowercase and uppercase
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // Insert dash between multiple capitals and a capital followed by lowercase
    .toLowerCase();
}

export function slugToSection(slug: string): string {
  if (!slug) {
    return '';
  }

  const normalizedSlug = slug.trim().toLowerCase();

  return normalizedSlug
    .split('-')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
}

const grimoireSectionKeys = Object.keys(grimoire);
const grimoireSectionSet = new Set(grimoireSectionKeys);
const grimoireSlugSet = new Set(
  grimoireSectionKeys.map((sectionKey) => sectionToSlug(sectionKey)),
);

export function isValidGrimoireSection(slug: string): boolean {
  if (!slug) {
    return false;
  }

  const normalizedSlug = slug.trim().toLowerCase();
  if (grimoireSlugSet.has(normalizedSlug)) {
    return true;
  }

  const section = slugToSection(normalizedSlug);
  return grimoireSectionSet.has(section);
}

export function getAllGrimoireSectionSlugs(): string[] {
  return Array.from(grimoireSlugSet);
}
