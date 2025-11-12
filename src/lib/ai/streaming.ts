import { ReadableStream } from 'stream/web';

import { composeAssistantReply } from './responder';
import { buildPromptSections } from './prompt';
import { LunaryContext } from './types';

type StreamChunk =
  | { type: 'prompt'; payload: ReturnType<typeof buildPromptSections> }
  | { type: 'assist'; payload: string | null }
  | { type: 'reflection'; payload: string }
  | { type: 'message'; payload: string }
  | { type: 'done' };

const encoder = new TextEncoder();

const formatChunk = (chunk: StreamChunk): string =>
  JSON.stringify(chunk) + '\n';

export const createAssistantStream = ({
  context,
  userMessage,
  memorySnippets = [],
}: {
  context: LunaryContext;
  userMessage: string;
  memorySnippets?: string[];
}): ReadableStream<Uint8Array> => {
  const composed = composeAssistantReply({
    context,
    userMessage,
    memorySnippets,
  });

  const chunks: StreamChunk[] = [
    { type: 'prompt', payload: composed.promptSections },
    { type: 'assist', payload: composed.assistSnippet ?? null },
    { type: 'reflection', payload: composed.reflection },
  ];

  const paragraphs = composed.message.split('\n\n');
  paragraphs.forEach((paragraph) => {
    chunks.push({ type: 'message', payload: paragraph });
  });

  chunks.push({ type: 'done' });

  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => {
        controller.enqueue(encoder.encode(formatChunk(chunk)));
      });
      controller.close();
    },
  });
};
