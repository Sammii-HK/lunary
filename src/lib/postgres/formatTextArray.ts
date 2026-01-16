export function formatTextArray(values: string[]): string {
  return `{${values
    .map((value) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
    .join(',')}}`;
}
