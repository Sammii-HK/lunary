import Link from 'next/link';
import { Users } from 'lucide-react';

export function SignupCTA() {
  return (
    <div className='rounded-lg border border-lunary-primary-700/50 bg-gradient-to-r from-layer-deep/60 to-surface-elevated p-4'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-lg bg-layer-base/30 text-lunary-primary-400'>
          <Users className='w-5 h-5' />
        </div>
        <div className='flex-1'>
          <p className='text-sm font-medium text-content-primary'>
            Join the Circle to ask questions
          </p>
          <p className='text-xs text-content-muted'>
            Create an account to participate in the cosmic community
          </p>
        </div>
        <Link
          href='/signup'
          className='px-4 py-2 text-sm font-medium rounded-lg bg-lunary-primary-600 hover:bg-lunary-primary-500 text-white transition-colors'
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
