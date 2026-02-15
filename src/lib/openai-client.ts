import OpenAI from 'openai';

/** Canonical model for all text generation (via DeepInfra) */
export const LLM_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';

export function getOpenAI(): OpenAI {
  const apiKey = process.env.DEEPINFRA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('DEEPINFRA_API_KEY is not configured');
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.deepinfra.com/v1/openai',
  });
}
