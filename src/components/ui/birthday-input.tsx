'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface BirthdayInputProps {
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

type DateFormat = 'MDY' | 'DMY';

function detectLocaleFormat(): DateFormat {
  if (typeof navigator === 'undefined') return 'DMY';

  const locale = navigator.language || 'en-GB';
  const usFormats = ['en-US', 'en-CA', 'en-PH'];

  return usFormats.some((f) => locale.startsWith(f)) ? 'MDY' : 'DMY';
}

function parseFlexibleDate(
  input: string,
  preferredFormat: DateFormat,
): string | null {
  const cleaned = input.replace(/[^\d]/g, ' ').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length !== 3) return null;

  let day: number, month: number, year: number;

  if (preferredFormat === 'MDY') {
    [month, day, year] = parts.map(Number);
  } else {
    [day, month, year] = parts.map(Number);
  }

  if (year < 100) {
    year = year > 30 ? 1900 + year : 2000 + year;
  }

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  // allow earlier years for older birthdates (temporary override)
  // if (year < 1900 || year > new Date().getFullYear()) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return null;

  const date = new Date(year, month - 1, day);
  if (date > new Date()) return null;

  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return isoDate;
}

function formatDisplayDate(isoDate: string, format: DateFormat): string {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return '';

  if (format === 'MDY') {
    return `${month}/${day}/${year}`;
  }
  return `${day}/${month}/${year}`;
}

export function BirthdayInput({
  value,
  onChange,
  className,
  disabled = false,
  id,
  name,
}: BirthdayInputProps) {
  const format = useMemo(() => detectLocaleFormat(), []);
  const placeholder = format === 'MDY' ? 'MM/DD/YYYY' : 'DD/MM/YYYY';

  const [inputValue, setInputValue] = useState(() =>
    formatDisplayDate(value, format),
  );
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (value && !touched) {
      setInputValue(formatDisplayDate(value, format));
    }
  }, [value, format, touched]);

  const formatInputValue = useCallback((raw: string): string => {
    // Remove all non-digits to get just the numbers
    const digitsOnly = raw.replace(/\D/g, '');

    // If empty, return empty
    if (!digitsOnly) return '';

    // Limit to 8 digits (for date)
    const limitedDigits = digitsOnly.slice(0, 8);

    // Auto-format with slashes
    // This works for both MDY and DMY since the structure is the same (XX/XX/XXXX)
    if (limitedDigits.length <= 2) {
      return limitedDigits;
    } else if (limitedDigits.length <= 4) {
      return `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2)}`;
    } else {
      return `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2, 4)}/${limitedDigits.slice(4, 8)}`;
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatInputValue(raw);
      setInputValue(formatted);
      setTouched(true);
      setError(null);
      setWarning(null);

      const digitsOnly = raw.replace(/\D/g, '');
      if (digitsOnly.length >= 8) {
        const parsed = parseFlexibleDate(formatted, format);
        if (parsed) {
          onChange(parsed);
          setError(null);
          const birthDate = new Date(parsed);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const hasHadBirthdayThisYear =
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
              today.getDate() >= birthDate.getDate());
          if (!hasHadBirthdayThisYear) {
            age -= 1;
          }
          if (age < 13) {
            setWarning('Please double-check this birthday (under 13).');
          } else if (age > 120) {
            setWarning('Please double-check this birthday (over 120).');
          }
        }
      }
    },
    [format, onChange, formatInputValue],
  );

  const handleBlur = useCallback(() => {
    if (!inputValue.trim()) {
      setError(null);
      return;
    }

    const parsed = parseFlexibleDate(inputValue, format);
    if (parsed) {
      onChange(parsed);
      setInputValue(formatDisplayDate(parsed, format));
      setError(null);
      const birthDate = new Date(parsed);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const hasHadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() >= birthDate.getDate());
      if (!hasHadBirthdayThisYear) {
        age -= 1;
      }
      if (age < 13) {
        setWarning('Please double-check this birthday (under 13).');
      } else if (age > 120) {
        setWarning('Please double-check this birthday (over 120).');
      } else {
        setWarning(null);
      }
    } else if (inputValue.trim()) {
      setError(`Please enter a valid date (${placeholder})`);
      setWarning(null);
    }
  }, [inputValue, format, onChange, placeholder]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleBlur();
      }
    },
    [handleBlur],
  );

  return (
    <div className='w-full'>
      <input
        type='text'
        inputMode='text'
        id={id}
        name={name}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete='bday'
        maxLength={10}
        className={cn(
          'w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent transition-colors',
          error ? 'border-red-500' : 'border-zinc-700',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      />
      {error && <p className='mt-1 text-xs text-red-400'>{error}</p>}
      {!error && warning && (
        <p className='mt-1 text-xs text-amber-300'>{warning}</p>
      )}
      <p className='mt-1 text-xs text-zinc-400'>Format: {placeholder}</p>
    </div>
  );
}
