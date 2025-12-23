import { FooterSectionPage } from '@/components/FooterSectionPage';
import { marketingSectionItems } from '@/constants/marketing/footerSections';

export default function AboutIndexPage() {
  return (
    <FooterSectionPage
      title='About Lunary'
      description='Learn who we are, how we create content, and the technical standards behind our astrology.'
      items={marketingSectionItems.about}
    />
  );
}
