import { MarketingFooter } from '@/components/MarketingFooter';

export default function ComparisonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-1'>{children}</main>
      <MarketingFooter />
    </div>
  );
}
