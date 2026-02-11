import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className = '' }: LogoProps) {
  return (
    <Image
      src='/logo.svg'
      alt='Lunary'
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
