'use client';

/**
 * Install QR code — used on the desktop /install layout.
 *
 * Renders a QR code via `https://api.qrserver.com/v1/create-qr-code/`. The
 * `qrcode` npm package is NOT in package.json and we don't have permission
 * to add deps from this worktree, so we use the lightweight image API.
 *
 * Stylised: rounded container, three lunary-primary accent dots in the
 * corners (purely decorative — they don't replace the QR's positional eyes,
 * they sit outside the QR area so scanning is unaffected). The QR itself
 * stays pure black on pure white so phones scan reliably under dim light.
 */

import { useId } from 'react';

export interface InstallQRCodeProps {
  url?: string;
  size?: number;
  className?: string;
}

export function InstallQRCode({
  url = 'https://lunary.app/install',
  size = 240,
  className = '',
}: InstallQRCodeProps): JSX.Element {
  const labelId = useId();
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    url,
  )}&size=${size}x${size}&margin=8&color=000000&bgcolor=ffffff&qzone=2`;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className='relative rounded-2xl bg-white p-4 shadow-lg'
        style={{ width: size + 32, height: size + 32 }}
      >
        {/* Decorative lunary accent dots in three corners */}
        <span
          aria-hidden='true'
          className='absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-lunary-primary'
        />
        <span
          aria-hidden='true'
          className='absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-lunary-primary'
        />
        <span
          aria-hidden='true'
          className='absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-lunary-primary'
        />

        {/* The QR image. We use a plain <img> rather than next/image because
            the QR API URL is dynamic per-call and we don't want to ship it
            through the Next image optimiser. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt={`QR code linking to ${url}`}
          aria-labelledby={labelId}
          width={size}
          height={size}
          className='block'
          loading='lazy'
        />
      </div>
      <p id={labelId} className='text-xs text-content-secondary text-center'>
        Scan to install on your phone
      </p>
    </div>
  );
}

export default InstallQRCode;
