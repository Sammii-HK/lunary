export const estimateTokenCount = (text: string): number => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words * 1.3));
};
