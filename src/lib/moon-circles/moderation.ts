const BLOCKED_PHRASES = [
  'kill myself',
  'kill yourself',
  'suicide',
  'murder',
  'kill you',
  'kill them',
  'kill him',
  'kill her',
  'want to die',
  'end my life',
  'take my life',
  'harm myself',
  'hurt myself',
  'self harm',
  'self-harm',
  'commit suicide',
  'kill myself',
  'killing myself',
  'killing yourself',
  'end it all',
  'end it',
  'off myself',
  'off yourself',
  'unalive',
  'unalive myself',
  'unalive yourself',
  'kms',
  'rope',
  'hang myself',
  'hang yourself',
  'cut myself',
  'cut yourself',
  'bleed out',
  'overdose',
  'od myself',
  'od yourself',
  'jump off',
  'jump from',
  'jump in front',
  'run myself over',
  'run yourself over',
  'rape',
  'raped',
  'raping',
  'rapist',
  'pedo',
  'paedo',
  'pedophile',
  'paedophile',
  'child molester',
  'molest',
  'molested',
  'molesting',
  'molester',
  'sexual assault',
  'sexually assault',
  'sexually assaulted',
  'incest',
  'incestuous',
];

export function containsBlockedContent(text: string): boolean {
  const normalizedText = text.toLowerCase().trim();

  for (const phrase of BLOCKED_PHRASES) {
    if (normalizedText.includes(phrase.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export function getBlockedReason(text: string): string | null {
  const normalizedText = text.toLowerCase().trim();

  for (const phrase of BLOCKED_PHRASES) {
    if (normalizedText.includes(phrase.toLowerCase())) {
      return `Content contains inappropriate language. Please share positive reflections about your Moon Circle experience.`;
    }
  }

  return null;
}

export function validateInsightText(text: string): {
  isValid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      error: 'Please share your insight',
    };
  }

  if (containsBlockedContent(text)) {
    return {
      isValid: false,
      error:
        getBlockedReason(text) || 'Content contains inappropriate language',
    };
  }

  return { isValid: true };
}
