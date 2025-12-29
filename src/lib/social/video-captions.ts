import { categoryThemes } from './weekly-themes';

type VideoCaptionInput = {
  themeName?: string | null;
  facetTitle: string;
  partNumber?: number | null;
  totalParts?: number | null;
  scriptText?: string | null;
};

function extractFirstSentence(text: string): string {
  const cleaned = text
    .replace(/^\\s*Welcome to Part\\s+\\d+\\s+of\\s+\\d+[:.]?\\s*/i, '')
    .replace(/^\\s*Part\\s+\\d+\\s+of\\s+\\d+[:.]?\\s*/i, '')
    .trim();
  const match = cleaned.match(/[^.!?]+[.!?]/);
  if (match && match[0]) {
    return match[0].trim();
  }
  return cleaned.split('\\n')[0]?.trim() || cleaned.slice(0, 160).trim();
}

export function buildVideoCaption({
  themeName,
  facetTitle,
  partNumber,
  totalParts,
  scriptText,
}: VideoCaptionInput): string {
  const theme = themeName
    ? categoryThemes.find((candidate) => candidate.name === themeName)
    : undefined;
  const facet = theme?.facets.find(
    (candidate) => candidate.title === facetTitle,
  );
  const hook = facet?.shortFormHook?.trim();
  const fallback = scriptText ? extractFirstSentence(scriptText) : '';
  const description = hook || fallback;

  const partLabel =
    Number.isFinite(partNumber) && Number.isFinite(totalParts)
      ? `Part ${partNumber} of ${totalParts}: ${facetTitle}.`
      : `${facetTitle}.`;

  const caption = description ? `${partLabel} ${description}` : partLabel;
  return `${caption}\\n\\nFrom Lunary's Grimoire`;
}
