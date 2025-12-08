import { MarketingFooter } from '@/components/MarketingFooter';

export default function ComparisonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <MarketingFooter />
    </>
  );
}
