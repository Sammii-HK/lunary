'use client';

import { trackCtaClick } from '@/lib/analytics';
import { useSafeSearchParams } from '@/lib/safeSearchParams';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function NewsletterVerifyPage() {
  const searchParams = useSafeSearchParams();
  const success = searchParams.get('success') === 'true';
  const error = searchParams.get('error');
  const alreadyVerified = searchParams.get('already_verified') === 'true';
  const sign = searchParams.get('sign') || '';
  const proposition = searchParams.get('proposition') || '';
  const upsellVariant = searchParams.get('upsellVariant') || '';
  const pagePath = searchParams.get('pagePath') || '';
  const hub = searchParams.get('hub') || 'newsletter';

  const isHoroscopeFlow = proposition === 'daily_horoscope';
  const signupHeadline = sign
    ? `Unlock your ${sign} chart`
    : 'Unlock your personal chart';
  const signupSubline =
    upsellVariant === 'exact_degree'
      ? `Your sign gives the theme. Your exact degree shows whether today's transit is actually hitting you.`
      : upsellVariant === 'exact_timing'
        ? `Your sign gives the headline. Your chart gives the exact timing.`
        : `See how today's transits affect your full chart, not just your Sun sign.`;
  const signupLabel =
    upsellVariant === 'exact_degree'
      ? 'Find my exact degree'
      : upsellVariant === 'exact_timing'
        ? 'See my exact timing'
        : 'See my full chart';
  const signupHref = `/signup/chart?${new URLSearchParams({
    hub,
    headline: signupHeadline,
    subline: signupSubline,
    location: 'newsletter_verification_success',
    pagePath,
    ...(sign ? { sign } : {}),
  }).toString()}`;

  const handleUpsellClick = () => {
    trackCtaClick({
      hub,
      ctaId: 'newsletter_verify_signup_upsell',
      location: 'newsletter_verification_success',
      label: signupLabel,
      pagePath,
      abTest: 'horoscope_email_signup_upsell_v1',
      abVariant: upsellVariant || undefined,
    });
  };

  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-surface-card rounded-lg p-8 border border-stroke-default'>
        <div className='text-center mb-6'>
          <Mail className='h-12 w-12 mx-auto mb-4 text-lunary-primary-400' />
          <h1 className='text-2xl font-bold mb-2'>Email Verification</h1>
        </div>

        {success && !error && (
          <div className='text-center py-8'>
            <CheckCircle className='h-12 w-12 mx-auto mb-4 text-lunary-success' />
            <p className='text-content-primary mb-4 text-lg font-medium'>
              {alreadyVerified
                ? 'Email Already Verified'
                : 'Email Verified Successfully!'}
            </p>
            <p className='text-sm text-content-muted mb-6'>
              {alreadyVerified
                ? 'Your email was already confirmed. You will continue to receive our newsletter.'
                : isHoroscopeFlow
                  ? `Thank you for confirming your email. You will now receive your ${sign ? `${sign} ` : ''}horoscope by email.`
                  : 'Thank you for confirming your email! You will now receive our weekly newsletter with cosmic insights and updates.'}
            </p>
            {isHoroscopeFlow ? (
              <div className='space-y-4'>
                <div className='rounded-lg border border-lunary-primary-500/20 bg-surface-base p-4 text-left'>
                  <p className='text-sm font-medium text-content-primary'>
                    {upsellVariant === 'exact_degree'
                      ? `Want to know your exact ${sign ? `${sign} ` : ''}degree and whether today's transit is actually hitting it?`
                      : upsellVariant === 'exact_timing'
                        ? 'Your sign gives the headline. Your chart gives the exact timing.'
                        : 'Want to see how today’s transits affect your full chart, not just your Sun sign?'}
                  </p>
                </div>
                <Link
                  href={signupHref}
                  onClick={handleUpsellClick}
                  className='inline-block bg-lunary-primary-600 hover:bg-layer-high text-white py-2 px-6 rounded-md transition-colors'
                >
                  {signupLabel}
                </Link>
              </div>
            ) : (
              <Link
                href='/profile'
                className='inline-block bg-lunary-primary-600 hover:bg-layer-high text-white py-2 px-6 rounded-md transition-colors'
              >
                Go to Profile
              </Link>
            )}
          </div>
        )}

        {error && (
          <div className='text-center py-8'>
            <XCircle className='h-12 w-12 mx-auto mb-4 text-lunary-error' />
            <p className='text-content-primary mb-4 text-lg font-medium'>
              Verification Failed
            </p>
            <p className='text-sm text-content-muted mb-6'>
              {error === 'invalid_token' &&
                'The verification link is invalid or has expired. Please try subscribing again.'}
              {error === 'missing_params' &&
                'The verification link is incomplete. Please check your email and try again.'}
              {error === 'server_error' &&
                'An error occurred during verification. Please try again later.'}
            </p>
            <Link
              href='/profile'
              className='inline-block bg-lunary-primary-600 hover:bg-layer-high text-white py-2 px-6 rounded-md transition-colors'
            >
              Go to Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
