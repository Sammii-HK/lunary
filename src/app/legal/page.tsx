import { FooterSectionPage } from '@/components/FooterSectionPage';
import { marketingSectionItems } from '@/constants/marketing/footerSections';

export default function LegalIndexPage() {
  return (
    <FooterSectionPage
      title='Legal'
      description='Policies and legal information for using Lunary.'
      items={marketingSectionItems.legal}
    />
  );
}
