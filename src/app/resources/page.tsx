import { FooterSectionPage } from '@/components/FooterSectionPage';
import { marketingSectionItems } from '@/constants/marketing/footerSections';

export default function ResourcesIndexPage() {
  return (
    <FooterSectionPage
      title='Resources'
      description='Guides, support, and documentation to help you get the most from Lunary.'
      items={marketingSectionItems.resources}
    />
  );
}
