type YesNoAnswer = 'Yes' | 'No' | 'Maybe';

type YesNoResult = {
  upright: { answer: YesNoAnswer; reason: string };
  reversed: { answer: YesNoAnswer; reason: string };
};

const positiveSignals = new Set([
  'success',
  'joy',
  'love',
  'harmony',
  'abundance',
  'growth',
  'victory',
  'hope',
  'fortune',
  'strength',
  'healing',
  'balance',
  'peace',
  'clarity',
  'celebration',
  'achievement',
  'inspiration',
  'confidence',
  'expansion',
  'opportunity',
]);

const challengingSignals = new Set([
  'loss',
  'conflict',
  'fear',
  'anxiety',
  'pain',
  'grief',
  'betrayal',
  'deception',
  'restriction',
  'delay',
  'hardship',
  'failure',
  'separation',
  'regret',
  'collapse',
  'crisis',
  'ending',
  'endings',
  'stagnation',
  'isolation',
]);

const isCourtCard = (name: string) => /(page|knight|queen|king)/i.test(name);

const scoreKeywords = (keywords: string[]) => {
  let score = 0;
  keywords.forEach((keyword) => {
    const normalized = keyword.toLowerCase();
    if (positiveSignals.has(normalized)) score += 1;
    if (challengingSignals.has(normalized)) score -= 1;
  });
  return score;
};

const flipToReversed = (answer: YesNoAnswer): YesNoAnswer => {
  if (answer === 'Yes') return 'Maybe';
  if (answer === 'No') return 'Maybe';
  return 'Maybe';
};

export function getTarotYesNo({
  name,
  type,
  suit,
  keywords,
}: {
  name: string;
  type: 'major' | 'minor';
  suit?: string | null;
  keywords: string[];
}): YesNoResult {
  if (isCourtCard(name)) {
    return {
      upright: {
        answer: 'Maybe',
        reason:
          'Court cards depend on a person or approach, so the outcome can shift.',
      },
      reversed: {
        answer: 'Maybe',
        reason: 'Reversed court cards point to mixed signals or timing issues.',
      },
    };
  }

  if (type === 'major') {
    const score = scoreKeywords(keywords);
    const baseAnswer: YesNoAnswer =
      score >= 2 ? 'Yes' : score <= -2 ? 'No' : 'Maybe';
    return {
      upright: {
        answer: baseAnswer,
        reason:
          baseAnswer === 'Yes'
            ? 'Major Arcana points toward alignment and forward movement.'
            : baseAnswer === 'No'
              ? 'Major Arcana signals a hard lesson or a necessary pause.'
              : 'Major Arcana suggests a lesson unfolding before clarity.',
      },
      reversed: {
        answer: flipToReversed(baseAnswer),
        reason:
          'Reversed Major Arcana often delays the lesson or asks for inner work.',
      },
    };
  }

  const suitKey = (suit || '').toLowerCase();
  if (suitKey === 'cups') {
    return {
      upright: {
        answer: 'Yes',
        reason: 'Cups favor emotional alignment and heartfelt outcomes.',
      },
      reversed: {
        answer: 'Maybe',
        reason: 'Reversed Cups suggest emotional blocks or mixed feelings.',
      },
    };
  }

  if (suitKey === 'wands') {
    return {
      upright: {
        answer: 'Yes',
        reason: 'Wands bring momentum, initiative, and a green light to act.',
      },
      reversed: {
        answer: 'Maybe',
        reason: 'Reversed Wands can mean delays or scattered energy.',
      },
    };
  }

  if (suitKey === 'pentacles') {
    return {
      upright: {
        answer: 'Maybe',
        reason: 'Pentacles favor practical progress, but timing may be slow.',
      },
      reversed: {
        answer: 'No',
        reason: 'Reversed Pentacles warn of material setbacks or misalignment.',
      },
    };
  }

  if (suitKey === 'swords') {
    return {
      upright: {
        answer: 'Maybe',
        reason: 'Swords highlight mental conflict or a decision still forming.',
      },
      reversed: {
        answer: 'Maybe',
        reason: 'Reversed Swords point to confusion or unresolved tension.',
      },
    };
  }

  return {
    upright: {
      answer: 'Maybe',
      reason: 'The card suggests nuance rather than a firm yes or no.',
    },
    reversed: {
      answer: 'Maybe',
      reason: 'Reversed energy keeps the answer open-ended for now.',
    },
  };
}
