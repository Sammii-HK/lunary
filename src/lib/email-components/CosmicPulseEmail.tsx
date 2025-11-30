import { Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import { EmailLayout } from './EmailLayout';
import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { CTAButton } from './CTAButton';
import { ContentSection } from './ContentSection';

export interface CosmicPulseContent {
  moonSign: string;
  moonEnergy: string;
  mainTransit: string;
  reflectionPrompt: string;
  aiPrompt: string;
}

interface CosmicPulseEmailProps {
  content: CosmicPulseContent;
  deepLinkUrl: string;
  userName?: string;
  userEmail?: string;
  baseUrl?: string;
}

export function CosmicPulseEmail({
  content,
  deepLinkUrl,
  userName,
  userEmail,
  baseUrl = 'https://lunary.app',
}: CosmicPulseEmailProps) {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  return (
    <EmailLayout
      title='Your Daily Cosmic Pulse - Lunary'
      preview={`${content.moonEnergy} - ${content.mainTransit}`}
      variant='dark'
    >
      <EmailHeader
        title='Your Daily Cosmic Pulse'
        subtitle='Personalized cosmic guidance for today'
        emoji='🌙'
        baseUrl={baseUrl}
        showLogo={false}
        variant='dark'
      />

      <Section style={{ margin: '30px 0' }}>
        <Text
          style={{ color: '#d1c4ff', fontSize: '16px', margin: '0 0 20px 0' }}
        >
          {greeting}
        </Text>

        <ContentSection title="Today's Moon" icon='🌙' variant='dark'>
          {content.moonEnergy}
        </ContentSection>

        <ContentSection title='Main Transit' icon='✨' variant='dark'>
          {content.mainTransit}
        </ContentSection>

        <ContentSection title='Reflection Prompt' icon='💭' variant='dark'>
          {content.reflectionPrompt}
        </ContentSection>

        <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <CTAButton href={deepLinkUrl}>Ask Lunary AI for Guidance →</CTAButton>
        </Section>
      </Section>

      <EmailFooter userEmail={userEmail} baseUrl={baseUrl} variant='dark' />
    </EmailLayout>
  );
}

export async function generateCosmicPulseEmailHTML(
  content: CosmicPulseContent,
  deepLinkUrl: string,
  userName?: string,
  userEmail?: string,
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  return await render(
    <CosmicPulseEmail
      content={content}
      deepLinkUrl={deepLinkUrl}
      userName={userName}
      userEmail={userEmail}
      baseUrl={baseUrl}
    />,
  );
}

export function generateCosmicPulseEmailText(
  content: CosmicPulseContent,
  deepLinkUrl: string,
  userName?: string,
  userEmail?: string,
): string {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

  return `
Your Daily Cosmic Pulse - Lunary

${greeting}

🌙 Today's Moon
${content.moonEnergy}

✨ Main Transit
${content.mainTransit}

💭 Reflection Prompt
${content.reflectionPrompt}

Ask Lunary AI for guidance: ${deepLinkUrl}

---
Unsubscribe: ${baseUrl}/unsubscribe?email=${userEmail ? encodeURIComponent(userEmail) : ''}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Guided by the stars, powered by magic.
  `.trim();
}
