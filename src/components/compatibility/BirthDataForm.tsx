'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface BirthDataFormProps {
  onSubmit: (data: {
    name: string;
    birthDate: string;
    birthTime?: string;
    birthLocation?: string;
  }) => void;
  submitting?: boolean;
}

export function BirthDataForm({
  onSubmit,
  submitting = false,
}: BirthDataFormProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;

    onSubmit({
      name: name.trim(),
      birthDate,
      birthTime: birthTime || undefined,
      birthLocation: birthLocation.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='block text-xs text-zinc-400 mb-1'>Your Name</label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Enter your name'
          required
          className='w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-lunary-primary-500'
        />
      </div>

      <div>
        <label className='block text-xs text-zinc-400 mb-1'>
          Date of Birth
        </label>
        <input
          type='date'
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          className='w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-lunary-primary-500'
        />
      </div>

      <div>
        <label className='block text-xs text-zinc-400 mb-1'>
          Time of Birth{' '}
          <span className='text-zinc-600'>(optional, for accuracy)</span>
        </label>
        <input
          type='time'
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          className='w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-lunary-primary-500'
        />
      </div>

      <div>
        <label className='block text-xs text-zinc-400 mb-1'>
          Birth Location <span className='text-zinc-600'>(optional)</span>
        </label>
        <input
          type='text'
          value={birthLocation}
          onChange={(e) => setBirthLocation(e.target.value)}
          placeholder='City, Country'
          className='w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-lunary-primary-500'
        />
      </div>

      <Button
        type='submit'
        className='w-full'
        disabled={submitting || !name.trim() || !birthDate}
      >
        {submitting ? 'Checking...' : 'See Our Compatibility'}
      </Button>
    </form>
  );
}
