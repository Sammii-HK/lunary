import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (posthogClient) return posthogClient;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;

  posthogClient = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}

export interface LLMGenerationEvent {
  distinctId: string;
  model: string;
  provider?: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  input?: string;
  output?: string;
  traceId?: string;
  success?: boolean;
  error?: string;
}

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['gpt-4o-mini'];
  return (
    (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output
  );
}

export function captureAIGeneration(event: LLMGenerationEvent): void {
  const posthog = getPostHogServer();
  if (!posthog) return;

  const cost = calculateCost(
    event.model,
    event.inputTokens,
    event.outputTokens,
  );

  posthog.capture({
    distinctId: event.distinctId,
    event: '$ai_generation',
    properties: {
      $ai_model: event.model,
      $ai_provider: event.provider || 'openai',
      $ai_input_tokens: event.inputTokens,
      $ai_output_tokens: event.outputTokens,
      $ai_latency: event.latencyMs / 1000,
      $ai_total_cost_usd: cost,
      $ai_trace_id: event.traceId,
      $ai_input: event.input,
      $ai_output_choices: event.output
        ? [{ content: event.output }]
        : undefined,
      $ai_is_error: event.success === false,
      $ai_error: event.error,
    },
  });
}

export function captureEvent(
  distinctId: string,
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  const posthog = getPostHogServer();
  if (!posthog) return;

  posthog.capture({
    distinctId,
    event: eventName,
    properties,
  });
}

export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}
