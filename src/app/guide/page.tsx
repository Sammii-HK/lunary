'use client';

import React, {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Suspense,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUp, ChevronDown, ChevronUp, Square } from 'lucide-react';

import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { CopilotQuickActions } from '@/components/CopilotQuickActions';
import { SaveToCollection } from '@/components/SaveToCollection';
import { parseMessageContent } from '@/utils/messageParser';
import { recordCheckIn } from '@/lib/streak/check-in';
import { captureEvent } from '@/lib/posthog-client';
import {
  dismissRitualBadge,
  useRitualBadge,
  trackRitualShown,
  trackRitualEngaged,
} from '@/hooks/useRitualBadge';
import { useSubscription } from '@/hooks/useSubscription';
import { WeeklyInsights } from '@/lib/rituals/engine';

interface CollectionFolder {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

interface SavedCollection {
  title: string;
  category: string;
}

const MessageBubble = ({
  role,
  content,
  messageId,
  onEntityClick,
  savedCollections,
  folders,
  onSaved,
}: {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  onEntityClick?: (entity: {
    type: 'tarot' | 'ritual' | 'spell';
    name: string;
    slug?: string;
  }) => void;
  savedCollections?: SavedCollection[];
  folders?: CollectionFolder[];
  onSaved?: () => void;
}) => {
  const isUser = role === 'user';
  // Only parse assistant messages for entities (user messages don't need parsing)
  // Use useMemo to re-parse when component re-renders (e.g., after cache initialization)
  const parsed = React.useMemo(
    () =>
      !isUser ? parseMessageContent(content) : { text: content, entities: [] },
    [content, isUser],
  );

  const renderContent = () => {
    if (parsed.entities.length === 0) {
      const lines = content.split('\n');
      return lines.map((line, index) => (
        <span key={index}>
          {line}
          {index < lines.length - 1 && '\n'}
        </span>
      ));
    }

    const parts: Array<{
      text: string;
      isEntity: boolean;
      entity?: { type: 'tarot' | 'ritual' | 'spell'; name: string };
    }> = [];
    let lastIndex = 0;

    parsed.entities.forEach((entity) => {
      if (entity.startIndex > lastIndex) {
        parts.push({
          text: content.slice(lastIndex, entity.startIndex),
          isEntity: false,
        });
      }
      parts.push({
        text: content.slice(entity.startIndex, entity.endIndex),
        isEntity: true,
        entity: { type: entity.type, name: entity.name },
      });
      lastIndex = entity.endIndex;
    });

    if (lastIndex < content.length) {
      parts.push({ text: content.slice(lastIndex), isEntity: false });
    }

    const result: React.ReactNode[] = [];
    parts.forEach((part, partIndex) => {
      const lines = part.text.split('\n');
      lines.forEach((line, lineIndex) => {
        if (lineIndex > 0) {
          result.push('\n');
        }
        if (part.isEntity && part.entity && onEntityClick) {
          result.push(
            <button
              key={`${partIndex}-${lineIndex}`}
              onClick={() => onEntityClick(part.entity!)}
              className='underline decoration-dotted decoration-purple-400/60 hover:decoration-purple-400 text-purple-300 hover:text-purple-200 transition-colors cursor-pointer'
            >
              {line}
            </button>,
          );
        } else {
          result.push(<span key={`${partIndex}-${lineIndex}`}>{line}</span>);
        }
      });
    });
    return result;
  };

  return (
    <div
      className={`flex items-end gap-1.5 ${isUser ? 'justify-end' : 'justify-start'} text-sm md:text-base group`}
    >
      <div
        className={`max-w-[85%] md:max-w-[80%] rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 leading-relaxed shadow-sm ${
          isUser
            ? 'bg-purple-600/90 text-white'
            : 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/40'
        }`}
      >
        {renderContent()}
      </div>
      {!isUser && (
        <div className='opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mb-1'>
          <SaveToCollection
            item={{
              title: `AI Response ${messageId ? `#${messageId.slice(0, 8)}` : ''}`,
              description: content.substring(0, 200),
              category: 'chat',
              content: { messageId, content, role },
              tags: ['ai-chat'],
            }}
            isSaved={savedCollections?.some(
              (c) =>
                c.title ===
                  `AI Response ${messageId ? `#${messageId.slice(0, 8)}` : ''}` &&
                c.category === 'chat',
            )}
            folders={folders}
            onSaved={onSaved}
          />
        </div>
      )}
    </div>
  );
};

function BookOfShadowsContent() {
  const authState = useAuthStatus();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const userBirthday = user?.birthday;
  const userName = user?.name?.split(' ')[0];
  const { isSubscribed } = useSubscription();
  const [weeklyInsights, setWeeklyInsights] = useState<
    WeeklyInsights | undefined
  >(undefined);

  useEffect(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isMorning = now.getHours() < 14;

    if (isSubscribed && isSunday && isMorning) {
      fetch('/api/rituals/weekly-insights')
        .then((res) => res.json())
        .then((data) => setWeeklyInsights(data))
        .catch(() => {});
    }
  }, [isSubscribed]);

  const ritualState = useRitualBadge(isSubscribed, userName, weeklyInsights);

  const {
    messages,
    sendMessage,
    isStreaming,
    isLoadingHistory,
    stop,
    assistSnippet,
    reflectionPrompt,
    usage,
    planId,
    dailyHighlight,
    error,
    clearError,
    addMessage,
    threadId,
  } = useAssistantChat({ birthday: userBirthday });

  const [cacheInitialized, setCacheInitialized] = useState(false);
  const [savedCollections, setSavedCollections] = useState<SavedCollection[]>(
    [],
  );
  const [collectionFolders, setCollectionFolders] = useState<
    CollectionFolder[]
  >([]);

  useEffect(() => {
    if (!authState.isAuthenticated || authState.loading) return;

    const fetchCollections = async () => {
      try {
        const [collectionsRes, foldersRes] = await Promise.all([
          fetch('/api/collections?category=chat&limit=100'),
          fetch('/api/collections/folders'),
        ]);

        const [collectionsData, foldersData] = await Promise.all([
          collectionsRes.json(),
          foldersRes.json(),
        ]);

        if (collectionsData.success) {
          setSavedCollections(
            collectionsData.collections.map((c: any) => ({
              title: c.title,
              category: c.category,
            })),
          );
        }

        if (foldersData.success) {
          setCollectionFolders(foldersData.folders);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    fetchCollections();
  }, [authState.isAuthenticated, authState.loading]);

  const handleCollectionSaved = useCallback(() => {
    fetch('/api/collections?category=chat&limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSavedCollections(
            data.collections.map((c: any) => ({
              title: c.title,
              category: c.category,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  // Initialize tarot card parser on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Pre-load tarot cards to populate parser cache
      import('../../../utils/tarot/tarot-cards')
        .then((module) => {
          const tarotCards = module.tarotCards;
          // Initialize the cache in messageParser
          import('@/utils/messageParser').then((module) => {
            module.initializeTarotCardCache(tarotCards);
            setCacheInitialized(true);
          });
        })
        .catch(() => {
          // Ignore errors - parser will handle gracefully
        });
    }
  }, []);

  // Record check-in when user accesses Astral Guide
  useEffect(() => {
    if (authState.isAuthenticated && !authState.loading) {
      recordCheckIn();
    }
  }, [authState.isAuthenticated, authState.loading]);

  // Inject ritual message when user visits during ritual time
  const [ritualInjected, setRitualInjected] = useState(false);
  const [shownRitualId, setShownRitualId] = useState<string | null>(null);
  const [shownRitualContext, setShownRitualContext] = useState<string | null>(
    null,
  );
  const [ritualEngagementTracked, setRitualEngagementTracked] = useState(false);

  useEffect(() => {
    // Inject ritual message when there's an unread ritual (morning/evening)
    if (
      !isLoadingHistory &&
      !ritualInjected &&
      ritualState.hasUnreadMessage &&
      ritualState.message &&
      ritualState.messageId
    ) {
      const chatMessageId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `ritual-${Date.now()}`;

      addMessage(
        {
          id: chatMessageId,
          role: 'assistant',
          content: ritualState.message,
        },
        true,
      );

      if (ritualState.ritualType && ritualState.messageId) {
        trackRitualShown(
          ritualState.messageId,
          ritualState.ritualType,
          user?.id,
        );
        setShownRitualId(ritualState.messageId);
        setShownRitualContext(ritualState.ritualType);
      }

      setRitualInjected(true);
      dismissRitualBadge(isSubscribed);
    }
  }, [
    isLoadingHistory,
    ritualState,
    ritualInjected,
    addMessage,
    isSubscribed,
    user?.id,
  ]);

  useEffect(() => {
    if (
      shownRitualId &&
      shownRitualContext &&
      !ritualEngagementTracked &&
      messages.length >= 2 &&
      messages[messages.length - 1]?.role === 'user'
    ) {
      trackRitualEngaged(shownRitualId, shownRitualContext as any, user?.id);
      setRitualEngagementTracked(true);
    }
  }, [
    messages,
    shownRitualId,
    shownRitualContext,
    ritualEngagementTracked,
    user?.id,
  ]);
  const [input, setInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [promptHandled, setPromptHandled] = useState<string | null>(null);
  const [isAssistExpanded, setIsAssistExpanded] = useState(false);
  const lastSendTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const DEBOUNCE_MS = 500;
  const lastContentLengthRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const promptSentRef = useRef(false);
  const prevLoadingRef = useRef(true);

  // Calculate total content length to detect content changes during streaming
  const totalContentLength = messages.reduce(
    (sum, msg) => sum + msg.content.length,
    0,
  );

  // Auto-scroll to bottom when messages change or streaming
  // Use useLayoutEffect for immediate DOM updates
  useLayoutEffect(() => {
    // Skip if we're already scrolling to avoid scroll conflicts
    if (isScrollingRef.current) return;

    const shouldScroll =
      messages.length > 0 &&
      // New message added (array length changed)
      (messages.length !== lastContentLengthRef.current ||
        // Content updated during streaming (content length changed)
        totalContentLength !== lastContentLengthRef.current ||
        // Streaming started
        isStreaming);

    if (
      shouldScroll &&
      messagesEndRef.current &&
      messagesContainerRef.current
    ) {
      isScrollingRef.current = true;

      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (!messagesEndRef.current || !messagesContainerRef.current) {
          isScrollingRef.current = false;
          return;
        }

        const container = messagesContainerRef.current;
        const endElement = messagesEndRef.current;

        // During streaming, use instant scroll for responsiveness
        // When streaming completes, use smooth scroll
        if (isStreaming) {
          // Instant scroll during streaming
          container.scrollTop = container.scrollHeight;
        } else {
          // Smooth scroll when streaming completes
          endElement.scrollIntoView({ behavior: 'smooth' });
        }

        // Reset scrolling flag after a short delay
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 100);
      });
    }

    // Update content length reference
    lastContentLengthRef.current = totalContentLength;
  }, [messages, isStreaming, totalContentLength]);

  // Also scroll when streaming state changes (starts/stops)
  useEffect(() => {
    if (isStreaming && messagesEndRef.current && messagesContainerRef.current) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [isStreaming]);

  // DISABLED: Prompt auto-send was causing loading issues
  // Users can manually type or use quick actions instead
  // TODO: Re-enable after fixing race conditions
  useEffect(() => {
    // Just track the prompt for UI purposes, don't auto-send
    const currentPrompt = searchParams.get('prompt');
    if (currentPrompt) {
      setPromptHandled(decodeURIComponent(currentPrompt.trim()));
    }
  }, [searchParams]);

  const attemptSend = () => {
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTimeRef.current;

    if (timeSinceLastSend < DEBOUNCE_MS) {
      return;
    }

    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    lastSendTimeRef.current = now;
    clearError?.();

    captureEvent('chat_started', {
      message_length: trimmed.length,
      is_first_message: messages.length === 0,
      plan_id: planId,
    });

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
              Astral Guide
            </h1>
            {/* <p className='text-sm text-zinc-400 md:text-base'>
              Your calm astro–tarot companion. Share what's stirring and Lunary
              will gather the sky around you.
            </p> */}
          </header>

          <main className='flex flex-1 flex-col items-center justify-center gap-6'>
            <div className='rounded-3xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur p-8 md:p-12 text-center max-w-lg'>
              <h2 className='text-2xl font-light text-zinc-50 mb-4'>
                Sign in to access your Astral Guide
              </h2>
              <p className='text-sm text-zinc-400 mb-6 md:text-base'>
                Your Astral Guide is a personal space for your astro–tarot
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
    <div className='flex flex-col flex-1 min-h-0 w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
      <div className='mx-auto flex flex-1 min-h-0 w-full max-w-3xl flex-col p-4'>
        <header className='mb-2 shrink-0 md:mb-4'>
          <h1 className='text-xl font-light tracking-tight text-zinc-50 md:text-4xl'>
            Astral Guide
          </h1>
          <div className='hidden md:flex flex-wrap items-center gap-2 mt-2 text-xs text-zinc-500'>
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
            {(dailyHighlight as { primaryEvent?: string })?.primaryEvent ? (
              <span className='rounded-full border border-zinc-700/60 px-3 py-1'>
                Today:{' '}
                {(dailyHighlight as { primaryEvent?: string }).primaryEvent}
              </span>
            ) : null}
          </div>
        </header>

        <div className='flex min-h-0 flex-1 flex-col gap-2'>
          <section className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/60'>
            <div
              ref={messagesContainerRef}
              className='min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6'
            >
              <div className='mx-auto flex max-w-2xl flex-col gap-3 md:gap-6'>
                {isLoadingHistory ? (
                  <div className='rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/40 px-4 py-6 text-center text-sm text-zinc-400 md:px-8 md:py-10 md:text-base'>
                    Loading your conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <>
                    <div className='rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/40 px-4 py-6 text-center text-sm text-zinc-400 md:px-8 md:py-10 md:text-base'>
                      Begin by sharing how you're feeling, what you're
                      exploring, or what guidance you're seeking. I'll answer
                      with gentle, grounded insight.
                    </div>
                    {/* AI Prompts temporarily disabled */}
                    <CopilotQuickActions
                      onActionClick={(prompt) => sendMessage(prompt)}
                      disabled={isStreaming}
                    />
                  </>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <MessageBubble
                        key={`${message.id}-${index}-${cacheInitialized}`}
                        role={message.role}
                        content={message.content}
                        messageId={message.id}
                        savedCollections={savedCollections}
                        folders={collectionFolders}
                        onSaved={handleCollectionSaved}
                        onEntityClick={async (entity) => {
                          try {
                            // For spells/rituals, navigate to grimoire page
                            if (
                              entity.type === 'ritual' ||
                              entity.type === 'spell'
                            ) {
                              const slug = (entity as any).slug;
                              if (slug) {
                                window.open(
                                  `/grimoire/spells/${slug}`,
                                  '_blank',
                                );
                                return;
                              }
                              // Fallback: try to find the spell and get its ID
                              const { spellDatabase } = await import(
                                '@/constants/grimoire/spells'
                              );
                              const spell = spellDatabase.find(
                                (s) =>
                                  s.title.toLowerCase() ===
                                    entity.name.toLowerCase() ||
                                  s.alternativeNames?.some(
                                    (n) =>
                                      n.toLowerCase() ===
                                      entity.name.toLowerCase(),
                                  ),
                              );
                              if (spell) {
                                window.open(
                                  `/grimoire/spells/${spell.id}`,
                                  '_blank',
                                );
                                return;
                              }
                            }

                            let content = '';

                            if (entity.type === 'tarot') {
                              // Fetch tarot card data directly from grimoire
                              const { getTarotCardByName } = await import(
                                '@/utils/tarot/getCardByName'
                              );
                              const cardData = getTarotCardByName(entity.name);

                              if (cardData) {
                                // Just show the description, no heading or keywords
                                content = cardData.information;
                              } else {
                                content = `I couldn't find information about "${entity.name}" in the grimoire.`;
                              }
                            }

                            if (content) {
                              // Generate ID
                              const messageId =
                                typeof crypto !== 'undefined' &&
                                crypto.randomUUID
                                  ? crypto.randomUUID()
                                  : `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                              // Add message to UI
                              addMessage({
                                id: messageId,
                                role: 'assistant',
                                content,
                              });

                              // Save to thread history
                              if (threadId) {
                                try {
                                  await fetch('/api/ai/thread/append', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      threadId,
                                      assistantMessage: {
                                        role: 'assistant',
                                        content,
                                        entityName: entity.name,
                                        ts: new Date().toISOString(),
                                        tokens: 0,
                                      },
                                    }),
                                  });
                                } catch (err) {
                                  console.error(
                                    '[EntityClick] Failed to save to thread:',
                                    err,
                                  );
                                }
                              }

                              // Scroll to bottom
                              setTimeout(() => {
                                messagesEndRef.current?.scrollIntoView({
                                  behavior: 'smooth',
                                });
                              }, 100);
                            }
                          } catch (error) {
                            console.error(
                              '[MessageBubble] Failed to fetch entity data:',
                              error,
                            );
                          }
                        }}
                      />
                    ))}
                    {error && (
                      <div className='rounded-2xl border border-lunary-error/40 bg-red-950/40 px-4 py-3 text-sm text-lunary-error-200 md:px-6 md:py-4'>
                        <p className='font-semibold text-lunary-error-300/90 mb-1'>
                          Something went wrong
                        </p>
                        <p>{error}</p>
                        <button
                          onClick={clearError}
                          className='mt-2 text-xs text-lunary-error-300/70 hover:text-lunary-error-300 underline'
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

            <div className='shrink-0 border-t border-zinc-800/70 bg-zinc-900/40'>
              <button
                onClick={() => setIsAssistExpanded(!isAssistExpanded)}
                className='flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-purple-300/90 transition hover:bg-zinc-800/40 md:px-6 md:py-3'
              >
                <span>Assist</span>
                {isAssistExpanded ? (
                  <ChevronUp className='w-4 h-4' />
                ) : (
                  <ChevronDown className='w-4 h-4' />
                )}
              </button>
              {isAssistExpanded && (
                <div className='px-3 pb-2 text-sm text-zinc-300 md:px-6 md:pb-4'>
                  <CopilotQuickActions
                    onActionClick={(prompt) => sendMessage(prompt)}
                    disabled={isStreaming}
                  />
                </div>
              )}
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className='shrink-0 relative flex items-center'
          >
            <label htmlFor='book-of-shadows-message' className='sr-only'>
              Share with Lunary
            </label>
            <textarea
              id='book-of-shadows-message'
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Write your heart's question…"
              className='w-full resize-none rounded-xl border border-zinc-700/60 bg-zinc-900/60 pl-3 pr-12 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30'
            />
            {isStreaming ? (
              <button
                type='button'
                onClick={stop}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-lunary-error-600 text-white transition hover:bg-lunary-error'
              >
                <Square className='w-4 h-4' />
              </button>
            ) : (
              <button
                type='submit'
                disabled={input.trim().length === 0}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-purple-600 text-white transition hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed'
              >
                <ArrowUp className='w-4 h-4' />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BookOfShadowsPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
          <div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-6 md:py-10'>
            <div className='text-zinc-400'>Loading...</div>
          </div>
        </div>
      }
    >
      <BookOfShadowsContent />
    </Suspense>
  );
}
