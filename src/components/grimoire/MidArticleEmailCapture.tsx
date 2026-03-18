'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MidArticleEmailCaptureProps {
  topic?: string;
  hub?: string;
}

export function MidArticleEmailCapture({
  topic,
  hub,
}: MidArticleEmailCaptureProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't show if already signed up or dismissed this session
    if (sessionStorage.getItem('email_capture_dismissed')) {
      setDismissed(true);
      return;
    }
    if (localStorage.getItem('email_capture_submitted')) {
      setSubmitted(true);
      return;
    }

    const handleScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = window.scrollY / scrollable;
      if (percent > 0.5 && !visible) {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: hub ? `grimoire_${hub}` : 'grimoire_capture',
          preferences: {
            horoscopes: hub === 'horoscopes',
            birthday: birthday || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
      localStorage.setItem('email_capture_submitted', 'true');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('email_capture_dismissed', 'true');
  };

  if (dismissed || (!visible && !submitted)) return null;

  const isHoroscope = hub === 'horoscopes';
  const headline = isHoroscope
    ? 'Get your daily horoscope by email'
    : topic
      ? `See how ${topic} affects YOUR chart`
      : 'See how this affects YOUR chart';

  return (
    <div
      ref={formRef}
      className={`my-8 overflow-hidden rounded-xl border border-lunary-primary-500/20 bg-gradient-to-br from-lunary-primary-950/60 to-lunary-primary-900/30 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {submitted ? (
        <div className='px-6 py-8 text-center'>
          <Sparkles className='mx-auto mb-3 h-6 w-6 text-lunary-primary-400' />
          <p className='text-lg font-medium text-lunary-primary-200'>
            {isHoroscope ? 'You are in' : 'Check your inbox'}
          </p>
          <p className='mt-1 text-sm text-lunary-primary-400'>
            {isHoroscope
              ? 'Your personalised daily horoscope will land in your inbox tomorrow morning.'
              : 'We have sent you a link to see your personalised chart.'}
          </p>
        </div>
      ) : (
        <div className='px-6 py-6'>
          <div className='mb-1 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-lunary-primary-200'>
              {headline}
            </h3>
            <button
              onClick={handleDismiss}
              className='text-lunary-primary-500 hover:text-lunary-primary-300 transition-colors'
              aria-label='Dismiss'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M4 4l8 8M12 4l-8 8' />
              </svg>
            </button>
          </div>
          <p className='mb-4 text-sm text-lunary-primary-400'>
            {isHoroscope
              ? 'Personalised to your sign and birth chart. Free, every morning.'
              : 'Enter your birth date to get a free personalised reading. No account needed.'}
          </p>

          <form onSubmit={handleSubmit} className='space-y-3'>
            <input
              type='email'
              placeholder='Your email address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full rounded-lg border border-lunary-primary-500/30 bg-lunary-primary-950/50 px-4 py-2.5 text-sm text-white placeholder:text-lunary-primary-500 focus:border-lunary-primary-400 focus:outline-none focus:ring-1 focus:ring-lunary-primary-400'
            />
            <input
              type='date'
              placeholder='Birth date (optional)'
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className='w-full rounded-lg border border-lunary-primary-500/30 bg-lunary-primary-950/50 px-4 py-2.5 text-sm text-white placeholder:text-lunary-primary-500 focus:border-lunary-primary-400 focus:outline-none focus:ring-1 focus:ring-lunary-primary-400'
            />
            {error && <p className='text-xs text-red-400'>{error}</p>}
            <button
              type='submit'
              disabled={loading}
              className='flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-lunary-primary-600 to-lunary-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-lunary-primary-500 hover:to-lunary-primary-400 disabled:opacity-50'
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  {isHoroscope ? 'Send me my horoscope' : 'Show me my chart'}
                  <ArrowRight className='h-4 w-4' />
                </>
              )}
            </button>
          </form>

          <p className='mt-3 text-center text-xs text-lunary-primary-600'>
            Free forever. Unsubscribe any time.
          </p>
        </div>
      )}
    </div>
  );
}
