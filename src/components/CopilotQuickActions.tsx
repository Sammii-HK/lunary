'use client';

import {
  Moon,
  Sparkles,
  BookOpen,
  Calendar,
  PenTool,
  Cloud,
  Layers,
  Clock,
  Lightbulb,
  Brain,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const quickActions: QuickAction[] = [
  {
    id: 'cosmic-weather',
    label: "Tonight's Cosmic Weather",
    prompt: "Ask tonight's cosmic weather",
    icon: <Cloud className='w-4 h-4' />,
  },
  {
    id: 'transit-feelings',
    label: 'How Am I Feeling?',
    prompt: 'How might I be feeling with these transits?',
    icon: <Sparkles className='w-4 h-4' />,
  },
  {
    id: 'tarot-patterns',
    label: 'Tarot Patterns',
    prompt: 'What patterns do you see in my recent daily tarot pulls?',
    icon: <Layers className='w-4 h-4' />,
  },
  {
    id: 'tarot-spread',
    label: 'Interpret Spread',
    prompt: 'Give me a detailed interpretation of my latest tarot spread',
    icon: <BookOpen className='w-4 h-4' />,
  },
  {
    id: 'ritual',
    label: 'Ritual for Tonight',
    prompt: "Give me a ritual based on tonight's moon",
    icon: <Moon className='w-4 h-4' />,
  },
  {
    id: 'weekly-overview',
    label: 'Weekly Overview',
    prompt: 'Weekly overview',
    icon: <Calendar className='w-4 h-4' />,
  },
  {
    id: 'journal',
    label: 'Journal Entry',
    prompt: 'Turn this into a journal entry',
    icon: <PenTool className='w-4 h-4' />,
  },
];

interface CopilotQuickActionsProps {
  onActionClick: (prompt: string) => void;
  disabled?: boolean;
  onDailyThreadAction?: (type: 'memory' | 'reflection' | 'pattern') => void;
}

export function CopilotQuickActions({
  onActionClick,
  disabled = false,
  onDailyThreadAction,
}: CopilotQuickActionsProps) {
  const handleDailyThreadAction = async (
    type: 'memory' | 'reflection' | 'pattern',
  ) => {
    if (onDailyThreadAction) {
      onDailyThreadAction(type);
      return;
    }

    // Fallback: fetch module and show it
    try {
      const response = await fetch(
        `/api/astral-chat/daily-thread?type=${type}&forceRefresh=true`,
      );
      const data = await response.json();
      if (data.modules && data.modules.length > 0) {
        const dailyModule = data.modules[0];
        // Create a message from the module
        const message = `${dailyModule.title}: ${dailyModule.body}`;
        onActionClick(message);
      }
    } catch (error) {
      console.error(
        '[CopilotQuickActions] Error fetching daily thread module:',
        error,
      );
    }
  };

  const dailyThreadActions = [
    {
      id: 'memory',
      label: 'Show me a memory',
      icon: <Clock className='w-4 h-4' />,
      onClick: () => handleDailyThreadAction('memory'),
    },
    {
      id: 'reflection',
      label: 'Give me a prompt',
      icon: <Lightbulb className='w-4 h-4' />,
      onClick: () => handleDailyThreadAction('reflection'),
    },
    {
      id: 'pattern',
      label: 'Show pattern insight',
      icon: <Brain className='w-4 h-4' />,
      onClick: () => handleDailyThreadAction('pattern'),
    },
  ];

  return (
    <div className='space-y-3 mb-4'>
      <div className='flex flex-wrap gap-2'>
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.prompt)}
            disabled={disabled}
            className='inline-flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800/60 hover:border-lunary-primary/40 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
      <div className='flex flex-wrap gap-2 pt-2 border-t border-zinc-800/50'>
        {dailyThreadActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={disabled}
            className='inline-flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800/60 hover:border-lunary-primary/40 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
