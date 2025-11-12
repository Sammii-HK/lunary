'use client';

import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAssistantChat } from '@/hooks/useAssistantChat';

const MessageBubble = ({
  role,
  content,
}: {
  role: 'user' | 'assistant';
  content: string;
}) => {
  const isUser = role === 'user';
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} text-sm md:text-base`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
          isUser
            ? 'bg-purple-600/90 text-white'
            : 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/40'
        }`}
      >
        {content.split('\n').map((line, index) => (
          <p key={index} className='whitespace-pre-wrap'>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default function AssistantPage() {
  const {
    messages,
    sendMessage,
    isStreaming,
    assistSnippet,
    reflectionPrompt,
    usage,
    planId,
    dailyHighlight,
  } = useAssistantChat();
  const [input, setInput] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
      <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 md:py-10'>
        <header className='mb-6 space-y-2'>
          <h1 className='text-3xl font-light tracking-tight text-zinc-50 md:text-4xl'>
            Lunary Companion
          </h1>
          <p className='text-sm text-zinc-400 md:text-base'>
            Your calm astro–tarot guide. Share how you&apos;re feeling, and
            we&apos;ll explore the sky together.
          </p>

          <div className='flex flex-wrap items-center gap-2 text-xs text-zinc-500 md:text-sm'>
            {planId ? (
              <span className='rounded-full border border-purple-500/40 px-3 py-1 text-purple-300/90'>
                Plan: {planId.replace(/_/g, ' ')}
              </span>
            ) : null}
            {usage ? (
              <span className='rounded-full border border-zinc-700/60 px-3 py-1'>
                Usage: {usage.used}/{usage.limit}
              </span>
            ) : null}
            {dailyHighlight?.primaryEvent ? (
              <span className='rounded-full border border-zinc-700/60 px-3 py-1'>
                Today: {dailyHighlight.primaryEvent}
              </span>
            ) : null}
          </div>
        </header>

        <main className='flex flex-1 flex-col gap-4'>
          <section className='flex flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur'>
            <div className='flex-1 overflow-y-auto px-4 py-6 md:px-6'>
              <div className='mx-auto flex max-w-2xl flex-col gap-4 md:gap-6'>
                {messages.length === 0 ? (
                  <div className='rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/40 px-4 py-6 text-center text-sm text-zinc-400 md:px-8 md:py-10 md:text-base'>
                    Begin by sharing what&apos;s stirring for you. Lunary will
                    answer with gentle, grounded guidance.
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))
                )}
              </div>
            </div>

            {(assistSnippet || reflectionPrompt) && (
              <div className='border-t border-zinc-800/70 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300 md:px-6 md:py-4'>
                {assistSnippet ? (
                  <p className='mb-2 text-zinc-200'>
                    <span className='font-semibold text-purple-300/90'>
                      Assist
                    </span>{' '}
                    {assistSnippet}
                  </p>
                ) : null}
                {reflectionPrompt ? (
                  <p className='italic text-zinc-400'>{reflectionPrompt}</p>
                ) : null}
              </div>
            )}
          </section>

          <form
            onSubmit={handleSubmit}
            className='sticky bottom-0 flex flex-col gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-4 shadow-lg shadow-purple-900/10 md:flex-row md:items-end'
          >
            <div className='flex-1'>
              <label
                htmlFor='assistant-message'
                className='sr-only'
              >
                Message Lunary
              </label>
              <textarea
                id='assistant-message'
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={3}
                placeholder="Share what's on your mind…"
                className='w-full resize-none rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 md:text-base'
              />
            </div>
            <Button
              type='submit'
              disabled={isStreaming || input.trim().length === 0}
              className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-zinc-700 md:self-end'
            >
              {isStreaming ? 'Listening…' : 'Share with Lunary'}
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
}
