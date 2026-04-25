'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { Heading } from '@/components/ui/Heading';
import { PERSONA_LIST } from '@/lib/personas/library';
import type { PersonaConfig, PersonaId } from '@/lib/personas/types';
import { cn } from '@/lib/utils';

interface PersonaPickerProps {
  open: boolean;
  onClose: () => void;
  onChange?: (persona: PersonaConfig) => void;
}

type PersonaResponse =
  | { success: true; persona: PersonaConfig }
  | { success?: false; error?: string };

export function PersonaPicker({ open, onClose, onChange }: PersonaPickerProps) {
  const [active, setActive] = useState<PersonaId>('warm');
  const [saving, setSaving] = useState<PersonaId | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch('/api/personas', { credentials: 'include' })
      .then((res) => res.json())
      .then((data: PersonaResponse) => {
        if (data.success) setActive(data.persona.id);
      })
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  const choose = async (personaId: PersonaId) => {
    setSaving(personaId);
    try {
      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ personaId }),
      });
      const data = (await res.json()) as PersonaResponse;
      if (data.success) {
        setActive(data.persona.id);
        onChange?.(data.persona);
        onClose();
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center bg-layer-base/70 p-3 backdrop-blur-sm sm:items-center'
      role='dialog'
      aria-modal='true'
      aria-labelledby='persona-picker-title'
    >
      <div className='w-full max-w-2xl rounded-2xl border border-stroke-subtle bg-surface-base p-4 shadow-2xl sm:p-5'>
        <div className='mb-4 flex items-start justify-between gap-3'>
          <div>
            <Heading id='persona-picker-title' as='h2' variant='h2'>
              Choose your astrologer
            </Heading>
            <p className='mt-1 text-sm text-content-muted'>
              Same chart math. Different voice.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full p-2 text-content-muted hover:bg-surface-elevated hover:text-content-primary'
            aria-label='Close persona picker'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          {PERSONA_LIST.map((persona) => {
            const selected = active === persona.id;
            return (
              <button
                key={persona.id}
                type='button'
                onClick={() => choose(persona.id)}
                disabled={saving !== null}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary',
                  selected
                    ? `${persona.accent.border} ${persona.accent.bg}`
                    : 'border-stroke-subtle bg-surface-elevated/35 hover:border-lunary-primary/40',
                )}
              >
                <span
                  className={cn(
                    'mb-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wider',
                    persona.accent.text,
                    selected ? persona.accent.border : 'border-stroke-subtle',
                  )}
                >
                  {selected ? 'Active' : 'Try'}
                </span>
                <span className='block text-base font-semibold text-content-primary'>
                  {persona.label}
                </span>
                <span className='mt-1 block text-sm text-content-secondary'>
                  {persona.blurb}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
