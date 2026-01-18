const numberWords: Record<number, string> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty',
  30: 'thirty',
  40: 'forty',
  50: 'fifty',
  60: 'sixty',
  70: 'seventy',
  80: 'eighty',
  90: 'ninety',
};

const toWordsUnder100 = (num: number) => {
  if (num < 20) return numberWords[num] || String(num);
  const tens = Math.floor(num / 10) * 10;
  const ones = num % 10;
  if (ones === 0) return numberWords[tens] || String(num);
  return `${numberWords[tens] || tens} ${numberWords[ones] || ones}`;
};

const normalizeYear = (num: number) => {
  if (num >= 2000 && num <= 2099) {
    const tail = num % 100;
    return `twenty ${toWordsUnder100(tail)}`;
  }
  return String(num);
};

const splitLongSentence = (sentence: string) => {
  const words = sentence.trim().split(/\s+/);
  if (words.length <= 26) return [sentence.trim()];
  const midpoint = Math.min(words.length - 1, 13);
  const first = words.slice(0, midpoint).join(' ');
  const second = words.slice(midpoint).join(' ');
  return [`${first}.`, second];
};

export function normalizeScriptForTTS(text: string): string {
  let output = text;

  output = output.replace(/[!?]{2,}/g, '.');
  output = output.replace(/\.{3,}/g, '.');
  output = output.replace(/\s*\/\s*/g, ' and ');
  output = output.replace(/\s{2,}/g, ' ');

  output = output.replace(/(\d+)\s*-\s*(\d+)/g, (_match, a, b) => {
    const left = toWordsUnder100(Number(a));
    const right = toWordsUnder100(Number(b));
    return `${left} to ${right}`;
  });

  output = output.replace(/\b(20\d{2})\b/g, (_match, year) =>
    normalizeYear(Number(year)),
  );

  output = output.replace(/\b(\d{1,2})\b/g, (_match, num) =>
    toWordsUnder100(Number(num)),
  );

  const sentences =
    output.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) || [];
  const normalizedSentences = sentences.flatMap(splitLongSentence);
  return normalizedSentences
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
