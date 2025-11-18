'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { CopilotQuickActions } from '@/components/CopilotQuickActions';
import { SaveToCollection } from '@/components/SaveToCollection';
import { useAIPrompts } from '@/hooks/useAIPrompts';
import { AIPromptCard } from '@/components/AIPromptCard';

const MessageBubble = ({
  role,
  content,
  messageId,
}: {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
}) => {
  const isUser = role === 'user';
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} text-sm md:text-base group`}
    >
      <div className={`max-w-[80%] ${isUser ? '' : 'flex flex-col gap-2'}`}>
        <div
          className={`rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
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
        {!isUser && (
          <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
            <SaveToCollection
              item={{
                title: `AI Response ${messageId ? `#${messageId.slice(0, 8)}` : ''}`,
                description: content.substring(0, 200),
                category: 'chat',
                content: { messageId, content, role },
                tags: ['ai-chat'],
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default function BookOfShadowsPage() {
  const authState = useAuthStatus();
  const searchParams = useSearchParams();
  const {
    messages,
    sendMessage,
    isStreaming,
    assistSnippet,
    reflectionPrompt,
    usage,
    planId,
    dailyHighlight,
    error,
    clearError,
  } = useAssistantChat();
  const {
    prompts,
    hasNewPrompts,
    isLoading: promptsLoading,
    markPromptAsRead,
  } = useAIPrompts();
  const [input, setInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [promptHandled, setPromptHandled] = useState(false);
  const lastSendTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const DEBOUNCE_MS = 500;

  // Auto-scroll to bottom when messages change or streaming
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Handle deep link prompt parameter
  useEffect(() => {
    if (
      authState.isAuthenticated &&
      !authState.loading &&
      !promptHandled &&
      messages.length === 0
    ) {
      const prompt = searchParams.get('prompt');
      if (prompt && prompt.trim()) {
        setPromptHandled(true);
        const decodedPrompt = decodeURIComponent(prompt);
        setTimeout(() => {
          sendMessage(decodedPrompt);
        }, 500);
      }
    }
  }, [
    authState.isAuthenticated,
    authState.loading,
    promptHandled,
    messages.length,
    searchParams,
    sendMessage,
  ]);

  const attemptSend = () => {
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTimeRef.current;

    if (timeSinceLastSend < DEBOUNCE_MS) {
      return;
    }

    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    lastSendTimeRef.current = now;
    clearError?.(); // Clear any previous errors
    sendMessage(trimmed);
    setInput('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    attemptSend();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      attemptSend();
    }
  };

  useEffect(() => {
    if (!showAuthModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAuthModal]);

  if (authState.loading) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
        <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-6 md:py-10'>
          <div className='text-zinc-400'>Loading...</div>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
        <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 md:py-10'>
          <header className='mb-6 space-y-2'>
            <h1 className='text-3xl font-light tracking-tight text-zinc-50 md:text-4xl'>
              Book of Shadows
            </h1>
            <p className='text-sm text-zinc-400 md:text-base'>
              Your calm astro–tarot companion. Share what's stirring and Lunary
              will gather the sky around you.
            </p>
          </header>

          <main className='flex flex-1 flex-col items-center justify-center gap-6'>
            <div className='rounded-3xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur p-8 md:p-12 text-center max-w-lg'>
              <h2 className='text-2xl font-light text-zinc-50 mb-4'>
                Sign in to access your Book of Shadows
              </h2>
              <p className='text-sm text-zinc-400 mb-6 md:text-base'>
                Your Book of Shadows is a personal space for your astro–tarot
                journey. Sign in to begin your conversation with Lunary.
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-500'
              >
                Sign In
              </Button>
            </div>
          </main>

          {showAuthModal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
              <div className='relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl'>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className='absolute right-4 top-4 text-zinc-400 hover:text-zinc-200'
                  aria-label='Close'
                >
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
                <AuthComponent
                  onSuccess={() => {
                    setShowAuthModal(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
      <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 md:py-10'>
        <header className='mb-6 space-y-2'>
          <h1 className='text-3xl font-light tracking-tight text-zinc-50 md:text-4xl'>
            Book of Shadows
          </h1>
          <p className='text-sm text-zinc-400 md:text-base'>
            Your calm astro–tarot companion. Share what's stirring and Lunary
            will gather the sky around you.
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
            {hasNewPrompts && (
              <span className='rounded-full border border-purple-500/60 bg-purple-500/20 px-3 py-1 text-purple-300 font-semibold animate-pulse'>
                ✨ New Prompt
              </span>
            )}
          </div>
        </header>

        <main className='flex flex-1 flex-col gap-4'>
          <section className='flex flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur'>
            <div
              ref={messagesContainerRef}
              className='flex-1 overflow-y-auto px-4 py-6 md:px-6'
            >
              <div className='mx-auto flex max-w-2xl flex-col gap-4 md:gap-6'>
                {messages.length === 0 ? (
                  <>
                    <div className='rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/40 px-4 py-6 text-center text-sm text-zinc-400 md:px-8 md:py-10 md:text-base'>
                      Begin by sharing how you're feeling, what you're
                      exploring, or what guidance you're seeking. I'll answer
                      with gentle, grounded insight.
                    </div>
                    {!promptsLoading && prompts.length > 0 && (
                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium text-zinc-300 px-1'>
                          Suggested Prompts
                        </h3>
                        {prompts.slice(0, 3).map((prompt) => (
                          <AIPromptCard
                            key={prompt.id}
                            prompt={prompt}
                            onUsePrompt={sendMessage}
                            onMarkAsRead={markPromptAsRead}
                          />
                        ))}
                      </div>
                    )}
                    <CopilotQuickActions
                      onActionClick={(prompt) => sendMessage(prompt)}
                      disabled={isStreaming}
                    />
                  </>
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        messageId={message.id}
                      />
                    ))}
                    {error && (
                      <div className='rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200 md:px-6 md:py-4'>
                        <p className='font-semibold text-red-300/90 mb-1'>
                          Something went wrong
                        </p>
                        <p>{error}</p>
                        <button
                          onClick={clearError}
                          className='mt-2 text-xs text-red-300/70 hover:text-red-300 underline'
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
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
              <label htmlFor='book-of-shadows-message' className='sr-only'>
                Share with Lunary
              </label>
              <textarea
                id='book-of-shadows-message'
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Write your heart's question…"
                className='w-full resize-none rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 md:text-base'
              />
            </div>
            <Button
              type='submit'
              disabled={isStreaming || input.trim().length === 0}
              className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-zinc-700 md:self-end'
            >
              {isStreaming ? 'Listening…' : 'Ask Lunary'}
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
}
