'use client';

import { useSafeSearchParams } from '@/lib/safeSearchParams';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function NewsletterVerifyPage() {
  const searchParams = useSafeSearchParams();
  const success = searchParams.get('success') === 'true';
  const error = searchParams.get('error');
  const alreadyVerified = searchParams.get('already_verified') === 'true';

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
                : 'Thank you for confirming your email! You will now receive our weekly newsletter with cosmic insights and updates.'}
            </p>
            <Link
              href='/profile'
              className='inline-block bg-lunary-primary-600 hover:bg-layer-high text-white py-2 px-6 rounded-md transition-colors'
            >
              Go to Profile
            </Link>
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
