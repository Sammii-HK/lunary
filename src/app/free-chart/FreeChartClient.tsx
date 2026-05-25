'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, Dispatch, FormEvent, SetStateAction } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  Moon,
  Orbit,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { captureEvent } from '@/lib/posthog-client';
import { setOnboardingPrefill } from '@/lib/onboarding/prefill';

type Placement = {
  body: string;
  sign: string;
  degree: string | null;
  house?: number;
  headline: string;
  meaning: string;
};

type FreeChartReport = {
  reportId: string;
  greeting: string;
  accuracy: {
    level: string;
    hasBirthTime: boolean;
    hasBirthLocation: boolean;
    note: string;
  };
  placements: Placement[];
  pattern: {
    title: string;
    body: string;
    signals: string[];
  };
  focus?: {
    title: string;
    sign: string;
    planet: string | null;
    date: string | null;
    house: number | null;
    houseTheme: string | null;
    note: string;
  } | null;
  personalTransitCard?: {
    label: string;
    title: string;
    sign: string;
    planet: string | null;
    date: string | null;
    house: number | null;
    houseTheme: string | null;
    watchFor: string;
    tryThis: string;
    journalPrompt: string;
  } | null;
  risingUnlock?: {
    label: string;
    title: string;
    sign: string | null;
    house: number | null;
    chartRuler: string | null;
    chartRulerSign: string | null;
    chartRulerHouse: number | null;
    note: string;
  } | null;
  chartRuler: {
    planet: string;
    sign: string | null;
    house: number | null;
    note: string;
  } | null;
  nextSteps: string[];
  leadCapture: {
    emailTag: string;
    source: string;
    commentKeywords: Array<{ keyword: string; promise: string }>;
  };
  signupUrl: string;
  disclaimer: string;
};

type Phase = 'idle' | 'loading' | 'result' | 'error';

type FormState = {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  skipTime: boolean;
};

const initialForm: FormState = {
  name: '',
  birthDate: '',
  birthTime: '',
  birthLocation: '',
  skipTime: false,
};

const premiumSansStyle: CSSProperties = {
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const premiumSerifStyle: CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const REPORT_STORAGE_KEY = 'lunary.freeChartReport';
const REPORT_EVENT_NAME = 'lunary.freeChartReport.ready';
const REPORT_RESTORE_WINDOW_MS = 60 * 60 * 1000;
const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

function pageSource(searchParams: Pick<URLSearchParams, 'get'>) {
  return (
    searchParams.get('utm_source') ||
    searchParams.get('source') ||
    'free_chart_page'
  );
}

function cleanParam(value: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normaliseSignParam(value: string | null) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return undefined;
  return ZODIAC_SIGNS.find((sign) => sign.toLowerCase() === trimmed);
}

function buildSignupUrl(report: FreeChartReport, form: FormState) {
  const params = new URLSearchParams(report.signupUrl.split('?')[1] || '');
  if (form.birthDate) params.set('birthDate', form.birthDate);
  if (!form.skipTime && form.birthTime) params.set('birthTime', form.birthTime);
  if (form.birthLocation) params.set('birthLocation', form.birthLocation);
  return `/signup/chart?${params.toString()}`;
}

export function FreeChartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(initialForm);
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [report, setReport] = useState<FreeChartReport | null>(null);
  const [error, setError] = useState('');
  const [emailState, setEmailState] = useState<
    'idle' | 'loading' | 'sent' | 'error'
  >('idle');
  const [emailError, setEmailError] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const source = useMemo(() => pageSource(searchParams), [searchParams]);
  const keyword = searchParams.get('keyword') || searchParams.get('kw') || '';
  const normalisedKeyword = keyword.toUpperCase();
  const campaignKey =
    searchParams.get('campaignKey') ||
    searchParams.get('utm_campaign') ||
    'lunary-free-chart-report';
  const focusContext = useMemo(
    () => ({
      focusTitle: cleanParam(
        searchParams.get('focusTitle') || searchParams.get('event'),
      ),
      focusSign: normaliseSignParam(
        searchParams.get('focusSign') || searchParams.get('sign'),
      ),
      focusPlanet: cleanParam(
        searchParams.get('focusPlanet') || searchParams.get('planet'),
      ),
      focusDate: cleanParam(
        searchParams.get('focusDate') || searchParams.get('date'),
      ),
    }),
    [searchParams],
  );
  const isSaveFunnel = normalisedKeyword === 'SAVE';
  const isWhereFunnel =
    normalisedKeyword === 'WHERE' ||
    (Boolean(focusContext.focusSign) && !isSaveFunnel);
  const isRisingFunnel = normalisedKeyword === 'RISING';
  const heroTitle = isWhereFunnel
    ? 'See where this sky event lands in your chart.'
    : isSaveFunnel
      ? 'Get your personal transit card.'
      : isRisingFunnel
        ? 'Unlock your rising sign and chart ruler.'
        : 'Get the chart pattern to start with.';
  const heroBody = isWhereFunnel
    ? 'Enter your birth details for a capped chart preview, including the house this transit activates when your birth time is known.'
    : isSaveFunnel
      ? 'Turn the sky event into a personal card with where it lands, what to watch, one useful action, and a journal prompt.'
      : isRisingFunnel
        ? 'Enter your birth details to see your rising sign, the doorway of the chart, and the planet that leads it.'
        : 'A free, capped birth chart report that shows your core placements, the first pattern to read, and what unlocks when you save your full chart in Lunary.';

  function scrollToReport() {
    window.setTimeout(() => {
      const element = resultRef.current;
      if (!element) return;

      const scrollContainer = element.closest(
        '.overflow-y-auto',
      ) as HTMLElement | null;
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: element.offsetTop,
          behavior: 'smooth',
        });
        return;
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  }

  useEffect(() => {
    setHydrated(true);

    const restoreReport = (stored: {
      storedAt?: number;
      report?: FreeChartReport;
      form?: FormState;
    }) => {
      if (
        !stored.report ||
        !stored.form ||
        !stored.storedAt ||
        Date.now() - stored.storedAt > REPORT_RESTORE_WINDOW_MS
      ) {
        return;
      }

      setReport(stored.report);
      setForm(stored.form);
      setPhase('result');
      scrollToReport();
    };

    const handleReportReady = (event: Event) => {
      const customEvent = event as CustomEvent<{
        report?: FreeChartReport;
        form?: FormState;
      }>;
      if (!customEvent.detail?.report || !customEvent.detail?.form) return;
      restoreReport({
        storedAt: Date.now(),
        report: customEvent.detail.report,
        form: customEvent.detail.form,
      });
    };

    window.addEventListener(REPORT_EVENT_NAME, handleReportReady);

    try {
      const raw = sessionStorage.getItem(REPORT_STORAGE_KEY);
      if (!raw)
        return () => {
          window.removeEventListener(REPORT_EVENT_NAME, handleReportReady);
        };

      const stored = JSON.parse(raw) as {
        storedAt?: number;
        report?: FreeChartReport;
        form?: FormState;
      };
      restoreReport(stored);
    } catch {}

    return () => {
      window.removeEventListener(REPORT_EVENT_NAME, handleReportReady);
    };
  }, []);

  useEffect(() => {
    if (phase === 'result' && report) {
      scrollToReport();
    }
  }, [phase, report]);

  async function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === 'loading') return;

    const formData = new FormData(event.currentTarget);
    const submittedForm: FormState = {
      name: String(formData.get('name') || '').trim(),
      birthDate: String(formData.get('birthDate') || ''),
      birthTime: String(formData.get('birthTime') || ''),
      birthLocation: String(formData.get('birthLocation') || '').trim(),
      skipTime: formData.get('skipTime') === 'on',
    };
    if (!submittedForm.birthDate || !submittedForm.birthLocation) return;

    const submittedBirthTime =
      submittedForm.skipTime || !submittedForm.birthTime
        ? undefined
        : submittedForm.birthTime;

    setPhase('loading');
    setError('');
    setForm(submittedForm);
    captureEvent('free_chart_report_submitted', {
      source,
      campaignKey,
      keyword: keyword || undefined,
      hasBirthTime: Boolean(submittedBirthTime),
      focusSign: focusContext.focusSign,
      funnel: normalisedKeyword || undefined,
    });

    try {
      const response = await fetch('/api/free-chart-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: submittedForm.name || undefined,
          birthDate: submittedForm.birthDate,
          birthTime: submittedBirthTime,
          birthLocation: submittedForm.birthLocation,
          source,
          campaignKey,
          keyword: keyword || undefined,
          ...focusContext,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || 'Could not generate your report yet.');
        setPhase('error');
        captureEvent('free_chart_report_error', {
          source,
          status: response.status,
        });
        return;
      }

      const generatedReport = data as FreeChartReport;
      try {
        sessionStorage.setItem(
          REPORT_STORAGE_KEY,
          JSON.stringify({
            storedAt: Date.now(),
            report: generatedReport,
            form: submittedForm,
            source,
            campaignKey,
            keyword: keyword || undefined,
            focus: generatedReport.focus
              ? {
                  sign: generatedReport.focus.sign,
                  house: generatedReport.focus.house,
                  title: generatedReport.focus.title,
                }
              : undefined,
            risingUnlock: generatedReport.risingUnlock
              ? {
                  sign: generatedReport.risingUnlock.sign,
                  chartRuler: generatedReport.risingUnlock.chartRuler,
                }
              : undefined,
            personalTransitCard: generatedReport.personalTransitCard
              ? {
                  sign: generatedReport.personalTransitCard.sign,
                  house: generatedReport.personalTransitCard.house,
                  title: generatedReport.personalTransitCard.title,
                }
              : undefined,
          }),
        );
      } catch {}
      window.dispatchEvent(
        new CustomEvent(REPORT_EVENT_NAME, {
          detail: {
            report: generatedReport,
            form: submittedForm,
          },
        }),
      );

      setReport(generatedReport);
      setPhase('result');
      setOnboardingPrefill({
        birthday: submittedForm.birthDate,
        birthTime: submittedBirthTime,
        birthLocation: submittedForm.birthLocation,
        autoAdvance: true,
        source: 'free-chart',
      });
      captureEvent('free_chart_report_viewed', {
        source,
        reportId: generatedReport.reportId,
        hasBirthTime: generatedReport.accuracy?.hasBirthTime,
        focusSign: generatedReport.focus?.sign,
        focusHouse: generatedReport.focus?.house,
        risingSign: generatedReport.risingUnlock?.sign,
        cardHouse: generatedReport.personalTransitCard?.house,
      });
    } catch {
      setError('Network error. Please try again.');
      setPhase('error');
      captureEvent('free_chart_report_error', { source, status: 'network' });
    }
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email || !report || emailState === 'loading') return;

    setEmailState('loading');
    setEmailError('');
    try {
      const response = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: report.leadCapture.source || 'free_chart_report',
          preferences: {
            weeklyNewsletter: true,
            blogUpdates: true,
            productUpdates: false,
            cosmicAlerts: true,
            freeChartReport: true,
            captureContext: {
              funnel: 'free_chart_report',
              reportId: report.reportId,
              campaignKey,
              keyword: keyword || undefined,
              source,
              focus: report.focus
                ? {
                    sign: report.focus.sign,
                    house: report.focus.house,
                    title: report.focus.title,
                  }
                : undefined,
              risingUnlock: report.risingUnlock
                ? {
                    sign: report.risingUnlock.sign,
                    chartRuler: report.risingUnlock.chartRuler,
                  }
                : undefined,
              personalTransitCard: report.personalTransitCard
                ? {
                    sign: report.personalTransitCard.sign,
                    house: report.personalTransitCard.house,
                    title: report.personalTransitCard.title,
                  }
                : undefined,
              birthDate: form.birthDate,
              hasBirthTime: !form.skipTime && !!form.birthTime,
              birthLocation: form.birthLocation,
              emailTag: report.leadCapture.emailTag,
            },
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setEmailError(data?.error || 'Could not save your email.');
        setEmailState('error');
        return;
      }

      setEmailState('sent');
      captureEvent('free_chart_email_captured', {
        source,
        campaignKey,
        reportId: report.reportId,
        keyword: keyword || undefined,
        emailTag: report.leadCapture.emailTag,
      });
    } catch {
      setEmailError('Network error. Please try again.');
      setEmailState('error');
    }
  }

  function goToSignup() {
    if (!report) return;
    setOnboardingPrefill({
      birthday: form.birthDate,
      birthTime: form.skipTime || !form.birthTime ? undefined : form.birthTime,
      birthLocation: form.birthLocation,
      autoAdvance: true,
      source: 'free-chart',
    });
    captureEvent('free_chart_signup_clicked', {
      source,
      campaignKey,
      reportId: report.reportId,
      keyword: keyword || undefined,
    });
    router.push(buildSignupUrl(report, form));
  }

  return (
    <main
      className='min-h-screen bg-[#080b12] text-white'
      style={premiumSansStyle}
      data-free-chart-phase={phase}
      data-free-chart-has-report={report ? 'true' : 'false'}
    >
      <section className='relative overflow-hidden border-b border-white/10'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(212,175,55,0.18),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(168,169,199,0.18),transparent_32%),linear-gradient(180deg,#080b12_0%,#111827_52%,#080b12_100%)]' />
        <div className='relative mx-auto grid min-h-[88vh] max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_440px] lg:py-16'>
          <div className='space-y-6'>
            <Link
              href='/'
              className='inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[#d4af37]'
            >
              <Moon className='h-4 w-4' />
              Lunary
            </Link>
            <div className='max-w-2xl space-y-4'>
              <Heading
                as='h1'
                variant='h1'
                className='text-balance text-4xl leading-tight text-white sm:text-5xl lg:text-6xl'
                style={premiumSerifStyle}
              >
                {heroTitle}
              </Heading>
              <p className='max-w-xl text-base leading-7 text-white/72 sm:text-lg'>
                {heroBody}
              </p>
            </div>

            <div className='grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3'>
              {[
                ['1', 'Enter birth details'],
                ['2', 'Get the useful pattern'],
                ['3', 'Save the full chart'],
              ].map(([step, label]) => (
                <div
                  key={step}
                  className='border border-white/10 bg-white/[0.04] p-4'
                >
                  <div className='mb-2 text-xs text-[#d4af37]'>{step}</div>
                  <div className='text-sm text-white/78'>{label}</div>
                </div>
              ))}
            </div>

            <div className='aspect-[16/10] max-w-2xl overflow-hidden border border-white/10 bg-black/30 shadow-2xl'>
              <video
                className='h-full w-full object-cover opacity-90'
                src='/app-demos/snippet-birth-chart.mp4'
                autoPlay
                muted
                loop
                playsInline
                aria-label='Lunary birth chart app preview'
              />
            </div>
          </div>

          <FreeChartForm
            form={form}
            setForm={setForm}
            phase={phase}
            error={error}
            hydrated={hydrated}
            onSubmit={handleReportSubmit}
          />
        </div>
      </section>

      {report && (
        <section
          ref={resultRef}
          className='border-b border-white/10 bg-[#0b0f1a]'
        >
          <div className='mx-auto max-w-6xl px-4 py-12'>
            <ReportView
              report={report}
              email={email}
              setEmail={setEmail}
              emailState={emailState}
              emailError={emailError}
              onEmailSubmit={handleEmailSubmit}
              onSignup={goToSignup}
            />
          </div>
        </section>
      )}

      <section className='bg-[#f5e6c8] text-[#080b12]'>
        <div className='mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 lg:grid-cols-[0.85fr_1.15fr]'>
          <div>
            <p className='mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#805f20]'>
              comment-led funnels
            </p>
            <Heading
              as='h2'
              variant='h2'
              className='text-[#080b12]'
              style={premiumSerifStyle}
            >
              Make comments the doorway, not an afterthought.
            </Heading>
            <p className='mt-4 text-sm leading-6 text-[#3b3328]'>
              These keywords are built for posts, Reels, carousels, Shorts, and
              Pins. The content gives value first, then turns curiosity into a
              reply, a DM, an email, and a saved chart.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5'>
            {[
              ['CHART', 'Free chart quickstart'],
              ['WHERE', 'Transit house check'],
              ['RISING', 'Rising sign unlock'],
              ['SAVE', 'Personal transit card'],
              ['RULER', 'Chart ruler starter'],
            ].map(([keywordLabel, promise]) => (
              <div
                key={keywordLabel}
                className='border border-[#d4af37]/50 bg-white/60 p-5'
              >
                <div className='mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#805f20]'>
                  <MessageCircle className='h-4 w-4' />
                  {keywordLabel}
                </div>
                <p className='text-lg font-semibold text-[#080b12]'>
                  {promise}
                </p>
                <p className='mt-2 text-sm text-[#514636]'>
                  Designed for public replies, private follow-up, email capture,
                  and a matched Lunary destination.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function FreeChartForm({
  form,
  setForm,
  phase,
  error,
  hydrated,
  onSubmit,
}: {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  phase: Phase;
  error: string;
  hydrated: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const loading = phase === 'loading';
  return (
    <form
      method='post'
      onSubmit={onSubmit}
      className='border border-white/12 bg-[#0b0f1a]/92 p-5 shadow-2xl backdrop-blur sm:p-6'
      aria-busy={loading}
    >
      <div className='mb-6 flex items-start justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]'>
            free report
          </p>
          <Heading as='h2' variant='h3' className='mt-2 text-white'>
            Start with your chart
          </Heading>
        </div>
        <Sparkles className='mt-1 h-5 w-5 text-[#d4af37]' />
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name' className='text-white/84'>
            Name{' '}
            <span className='text-xs font-normal text-white/46'>optional</span>
          </Label>
          <Input
            id='name'
            name='name'
            value={form.name}
            disabled={loading}
            placeholder='Sammii'
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='birthDate' className='text-white/84'>
            Birth date
          </Label>
          <Input
            id='birthDate'
            name='birthDate'
            type='date'
            value={form.birthDate}
            disabled={loading}
            required
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                birthDate: event.target.value,
              }))
            }
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='birthTime' className='text-white/84'>
            Birth time{' '}
            <span className='text-xs font-normal text-white/46'>
              improves rising sign and houses
            </span>
          </Label>
          <Input
            id='birthTime'
            name='birthTime'
            type='time'
            value={form.birthTime}
            disabled={loading || form.skipTime}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                birthTime: event.target.value,
              }))
            }
          />
          <label className='flex items-center gap-2 text-xs text-white/60'>
            <input
              type='checkbox'
              name='skipTime'
              className='accent-[#d4af37]'
              checked={form.skipTime}
              disabled={loading}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  skipTime: event.target.checked,
                }))
              }
            />
            I do not know my birth time
          </label>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='birthLocation' className='text-white/84'>
            Birth place
          </Label>
          <Input
            id='birthLocation'
            name='birthLocation'
            value={form.birthLocation}
            disabled={loading}
            required
            placeholder='London, UK'
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                birthLocation: event.target.value,
              }))
            }
          />
        </div>

        {error && (
          <p className='border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-100'>
            {error}
          </p>
        )}

        <Button
          type='submit'
          variant='lunary-solid'
          size='lg'
          className='w-full rounded-none bg-[#d4af37] text-[#080b12] hover:bg-[#f5e6c8] hover:shadow-[0_0_24px_rgba(212,175,55,0.38)]'
          disabled={loading || !hydrated}
        >
          {loading ? (
            'Reading your chart...'
          ) : (
            <>
              Get my free report <ArrowRight />
            </>
          )}
        </Button>

        <p className='text-center text-xs leading-5 text-white/50'>
          No account needed for the preview. Save the chart when you want the
          full map, houses, and live transit context.
        </p>
      </div>
    </form>
  );
}

function ReportView({
  report,
  email,
  setEmail,
  emailState,
  emailError,
  onEmailSubmit,
  onSignup,
}: {
  report: FreeChartReport;
  email: string;
  setEmail: (value: string) => void;
  emailState: 'idle' | 'loading' | 'sent' | 'error';
  emailError: string;
  onEmailSubmit: (event: FormEvent) => void;
  onSignup: () => void;
}) {
  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]'>
      <div className='space-y-8'>
        <div className='space-y-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[#d4af37]'>
            your report
          </p>
          <Heading
            as='h2'
            variant='h2'
            className='text-white'
            style={premiumSerifStyle}
          >
            {report.pattern.title}
          </Heading>
          <p className='max-w-2xl text-sm leading-6 text-white/68'>
            {report.pattern.body}
          </p>
          <p className='max-w-2xl border-l border-[#d4af37]/70 pl-4 text-xs leading-5 text-white/56'>
            {report.accuracy.note}
          </p>
        </div>

        {report.risingUnlock && (
          <div
            className='border border-[#a8a9c7]/45 bg-[#a8a9c7]/10 p-5'
            data-free-chart-rising-panel='true'
          >
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#a8a9c7]'>
              rising sign unlock
            </p>
            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.8fr]'>
              <div>
                <h3 className='text-2xl font-semibold text-white'>
                  {report.risingUnlock.title}
                </h3>
                <p className='mt-2 text-sm leading-6 text-white/68'>
                  Rising sign is the first doorway of the chart. It needs birth
                  time because the sky rotates through the houses during the
                  day.
                </p>
              </div>
              <div className='border border-white/10 bg-[#080b12]/55 p-4'>
                <p className='text-xs uppercase tracking-[0.18em] text-white/48'>
                  chart ruler
                </p>
                <p className='mt-2 text-xl font-semibold text-[#f5e6c8]'>
                  {report.risingUnlock.chartRuler || 'Birth time needed'}
                </p>
                <p className='mt-1 text-sm leading-5 text-white/62'>
                  {report.risingUnlock.chartRulerSign
                    ? `${report.risingUnlock.chartRulerSign}${
                        report.risingUnlock.chartRulerHouse
                          ? `, H${report.risingUnlock.chartRulerHouse}`
                          : ''
                      }`
                    : 'Add birth time to unlock the ruling planet.'}
                </p>
              </div>
            </div>
            <p className='mt-4 text-sm leading-6 text-white/72'>
              {report.risingUnlock.note}
            </p>
          </div>
        )}

        {report.focus && (
          <div
            className='border border-[#d4af37]/45 bg-[#d4af37]/10 p-5'
            data-free-chart-focus-panel='true'
          >
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]'>
              where it lands
            </p>
            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.8fr]'>
              <div>
                <h3 className='text-2xl font-semibold text-white'>
                  {report.focus.title}
                </h3>
                <p className='mt-2 text-sm leading-6 text-white/68'>
                  {report.focus.date ? `Sky date: ${report.focus.date}. ` : ''}
                  This connects the public transit to your private chart.
                </p>
              </div>
              <div className='border border-white/10 bg-[#080b12]/55 p-4'>
                <p className='text-xs uppercase tracking-[0.18em] text-white/48'>
                  personal doorway
                </p>
                <p className='mt-2 text-xl font-semibold text-[#f5e6c8]'>
                  {report.focus.house !== null
                    ? `H${report.focus.house}`
                    : report.focus.sign}
                </p>
                <p className='mt-1 text-sm leading-5 text-white/62'>
                  {report.focus.houseTheme ||
                    'Add birth time for exact house context.'}
                </p>
              </div>
            </div>
            <p className='mt-4 text-sm leading-6 text-white/72'>
              {report.focus.note}
            </p>
          </div>
        )}

        {report.personalTransitCard && (
          <div
            className='border border-white/10 bg-white/[0.035] p-5'
            data-free-chart-card-panel='true'
          >
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]'>
                  personal transit card
                </p>
                <h3 className='mt-2 text-2xl font-semibold text-white'>
                  {report.personalTransitCard.title}
                </h3>
                <p className='mt-2 text-sm leading-6 text-white/64'>
                  {report.personalTransitCard.house !== null
                    ? `H${report.personalTransitCard.house}: ${report.personalTransitCard.houseTheme}`
                    : 'Add birth time to make this card specific to the house it activates.'}
                </p>
              </div>
              {report.personalTransitCard.date && (
                <div className='border border-white/10 bg-[#080b12]/55 px-4 py-3 text-sm text-white/62'>
                  {report.personalTransitCard.date}
                </div>
              )}
            </div>
            <div className='mt-5 grid grid-cols-1 gap-3 md:grid-cols-3'>
              {[
                ['Watch for', report.personalTransitCard.watchFor],
                ['Try this', report.personalTransitCard.tryThis],
                ['Journal prompt', report.personalTransitCard.journalPrompt],
              ].map(([label, copy]) => (
                <div key={label} className='border border-white/10 p-4'>
                  <p className='text-xs uppercase tracking-[0.16em] text-[#a8a9c7]'>
                    {label}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-white/68'>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {report.placements.slice(0, 6).map((placement) => (
            <article
              key={`${placement.body}-${placement.sign}`}
              className='border border-white/10 bg-white/[0.035] p-5'
            >
              <div className='mb-3 flex items-center justify-between gap-3'>
                <h3 className='text-base font-semibold text-white'>
                  {placement.headline}
                </h3>
                <span className='text-xs text-[#d4af37]'>
                  {placement.degree}
                  {placement.house ? `, H${placement.house}` : ''}
                </span>
              </div>
              <p className='text-sm leading-6 text-white/64'>
                {placement.meaning}
              </p>
            </article>
          ))}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='border border-[#d4af37]/35 bg-[#d4af37]/10 p-5'>
            <div className='mb-3 flex items-center gap-2 text-[#f5e6c8]'>
              <Orbit className='h-4 w-4' />
              <h3 className='font-semibold'>First pattern</h3>
            </div>
            <ul className='space-y-3 text-sm leading-6 text-white/68'>
              {report.pattern.signals.map((signal) => (
                <li key={signal} className='flex gap-2'>
                  <Check className='mt-1 h-4 w-4 flex-none text-[#d4af37]' />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className='border border-white/10 bg-white/[0.035] p-5'>
            <div className='mb-3 flex items-center gap-2 text-white'>
              <Moon className='h-4 w-4 text-[#a8a9c7]' />
              <h3 className='font-semibold'>Next unlock</h3>
            </div>
            <ul className='space-y-3 text-sm leading-6 text-white/68'>
              {report.nextSteps.map((step) => (
                <li key={step} className='flex gap-2'>
                  <Check className='mt-1 h-4 w-4 flex-none text-[#a8a9c7]' />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {report.chartRuler && (
          <div className='border border-white/10 bg-white/[0.035] p-5'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]'>
              chart ruler
            </p>
            <h3 className='mt-2 text-xl font-semibold text-white'>
              {report.chartRuler.planet}
              {report.chartRuler.sign ? ` in ${report.chartRuler.sign}` : ''}
            </h3>
            <p className='mt-2 text-sm leading-6 text-white/68'>
              {report.chartRuler.note}
            </p>
          </div>
        )}
      </div>

      <aside className='space-y-4'>
        <div className='border border-[#d4af37]/40 bg-[#f5e6c8] p-5 text-[#080b12]'>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#805f20]'>
            keep it
          </p>
          <h3 className='mt-2 text-xl font-semibold'>Send this to yourself</h3>
          <p className='mt-2 text-sm leading-6 text-[#3b3328]'>
            Get the report link, weekly sky notes, and the next chart prompt in
            your inbox.
          </p>
          <form onSubmit={onEmailSubmit} className='mt-4 space-y-3'>
            <Input
              type='email'
              value={email}
              placeholder='you@example.com'
              onChange={(event) => setEmail(event.target.value)}
              disabled={emailState === 'loading' || emailState === 'sent'}
              className='border-[#d4af37]/70 bg-white text-[#080b12]'
            />
            <Button
              type='submit'
              className='w-full rounded-none bg-[#080b12] text-white hover:bg-[#1c2333]'
              disabled={
                !email || emailState === 'loading' || emailState === 'sent'
              }
            >
              {emailState === 'sent' ? (
                <>
                  Saved <Check />
                </>
              ) : emailState === 'loading' ? (
                'Saving...'
              ) : (
                <>
                  Email me the chart <Mail />
                </>
              )}
            </Button>
            {emailError && (
              <p className='text-xs text-red-700' role='alert'>
                {emailError}
              </p>
            )}
          </form>
        </div>

        <div className='border border-white/10 bg-white/[0.035] p-5'>
          <h3 className='text-xl font-semibold text-white'>
            Save the full chart
          </h3>
          <p className='mt-2 text-sm leading-6 text-white/64'>
            Create your account to keep the chart, unlock house context, and see
            live transits against your placements.
          </p>
          <Button
            type='button'
            variant='lunary-solid'
            className='mt-4 w-full rounded-none bg-[#d4af37] text-[#080b12] hover:bg-[#f5e6c8] hover:shadow-[0_0_24px_rgba(212,175,55,0.38)]'
            onClick={onSignup}
          >
            Save my chart <ArrowRight />
          </Button>
        </div>

        <div className='border border-white/10 bg-white/[0.035] p-5'>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#a8a9c7]'>
            comment prompts
          </p>
          <div className='mt-4 space-y-3'>
            {report.leadCapture.commentKeywords.map((item) => (
              <div
                key={item.keyword}
                className='flex items-start justify-between gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0'
              >
                <span className='font-semibold text-[#d4af37]'>
                  {item.keyword}
                </span>
                <span className='text-right text-sm text-white/62'>
                  {item.promise}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className='text-xs leading-5 text-white/38'>{report.disclaimer}</p>
      </aside>
    </div>
  );
}
