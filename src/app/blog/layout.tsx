import { BlogTracker } from './BlogTracker';
import { MarketingFooter } from '@/components/MarketingFooter';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BlogTracker />
      {children}
      <MarketingFooter />
    </>
  );
}
