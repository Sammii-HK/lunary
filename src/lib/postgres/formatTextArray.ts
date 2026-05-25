export function formatTextArray(values: readonly string[]): string {
  const escaped = values.map((value) => {
    let item = '';

    for (const character of value) {
      if (character === '\\' || character === '"') {
        item += '\\';
      }
      item += character;
    }

    return `"${item}"`;
  });

  return `{${escaped.join(',')}}`;
}
