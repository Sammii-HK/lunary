'use client';

import {
  Moon,
  Sparkles,
  BookOpen,
  Calendar,
  PenTool,
  Cloud,
  Layers,
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
}

export function CopilotQuickActions({
  onActionClick,
  disabled = false,
}: CopilotQuickActionsProps) {
  return (
    <div className='flex flex-wrap gap-2 mb-4'>
      {quickActions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick(action.prompt)}
          disabled={disabled}
          className='inline-flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800/60 hover:border-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
