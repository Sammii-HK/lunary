import { FooterSectionPage } from '@/components/FooterSectionPage';
import { marketingSectionItems } from '@/constants/marketing/footerSections';

export default function ProductIndexPage() {
  return (
    <FooterSectionPage
      title='Product'
      description='Everything you can explore, read, and build with Lunary.'
      items={marketingSectionItems.product}
    />
  );
}
