import { ComposedReply } from './responder';

type StreamChunk =
  | { event: 'meta'; data: Record<string, unknown> }
  | { event: 'prompt'; data: ComposedReply['promptSections'] }
  | { event: 'assist'; data: string | null }
  | { event: 'reflection'; data: string }
  | { event: 'message'; data: string }
  | { event: 'done'; data: null };

const encoder = new TextEncoder();

const formatChunk = (chunk: StreamChunk): string => {
  const data =
    chunk.data === null ? 'null' : JSON.stringify(chunk.data, null, 0);
  return `event: ${chunk.event}\ndata: ${data}\n\n`;
};

export const createAssistantStream = ({
  composed,
  meta,
}: {
  composed: ComposedReply;
  meta?: Record<string, unknown>;
}): ReadableStream<Uint8Array> => {
  const chunks: StreamChunk[] = [
    ...(meta ? [{ event: 'meta', data: meta } as StreamChunk] : []),
    { event: 'prompt', data: composed.promptSections },
    { event: 'assist', data: composed.assistSnippet ?? null },
    { event: 'reflection', data: composed.reflection },
  ];

  const paragraphs = composed.message.split('\n\n');
  paragraphs.forEach((paragraph) => {
    chunks.push({ event: 'message', data: paragraph });
  });

  chunks.push({ event: 'done', data: null });

  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => {
        controller.enqueue(encoder.encode(formatChunk(chunk)));
      });
      controller.close();
    },
  });
};
