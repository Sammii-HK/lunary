import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Lunary',
  description:
    "Lunary's commitment to digital accessibility and making our astrology platform usable for everyone.",
  robots: 'index, follow',
};

export default function AccessibilityPage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            Accessibility Statement
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              Lunar Computing, Inc. (&quot;Lunary&quot;) is committed to
              ensuring digital accessibility for people with disabilities. We
              are continually improving the user experience for everyone and
              applying the relevant accessibility standards to ensure we provide
              equal access to all users.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Our Commitment
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We strive to conform to the Web Content Accessibility Guidelines
              (WCAG) 2.1 Level AA standards. These guidelines explain how to
              make web content more accessible for people with disabilities and
              more user-friendly for everyone. We view accessibility as an
              ongoing effort and are continuously working to improve the
              accessibility of our platform.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Accessibility Features
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We have implemented the following accessibility features on our
              platform:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Keyboard Navigation:</strong> Our website can be
                navigated using a keyboard for users who cannot use a mouse
              </li>
              <li>
                <strong>Screen Reader Compatibility:</strong> We use semantic
                HTML and ARIA labels to ensure compatibility with screen readers
              </li>
              <li>
                <strong>Color Contrast:</strong> We maintain sufficient color
                contrast ratios to ensure text is readable
              </li>
              <li>
                <strong>Responsive Design:</strong> Our platform is designed to
                work across different screen sizes and devices
              </li>
              <li>
                <strong>Alt Text:</strong> Images include alternative text
                descriptions where appropriate
              </li>
              <li>
                <strong>Focus Indicators:</strong> Visible focus indicators help
                keyboard users navigate the interface
              </li>
              <li>
                <strong>Consistent Navigation:</strong> Navigation is consistent
                across pages to help users orient themselves
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Known Limitations
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              While we strive for comprehensive accessibility, some areas of our
              platform may have limitations:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Dynamic Content:</strong> Some dynamically generated
                content (such as AI-generated horoscopes and chat responses) may
                not be fully optimized for screen readers
              </li>
              <li>
                <strong>Third-Party Content:</strong> Some third-party tools and
                embeds may not meet our accessibility standards
              </li>
              <li>
                <strong>Visual Charts:</strong> Birth chart visualizations may
                have limited accessibility; we provide text-based alternatives
                where possible
              </li>
              <li>
                <strong>Tarot Card Images:</strong> While we provide alt text
                for tarot cards, the visual artistic elements may not be fully
                conveyed
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              We are actively working to address these limitations and improve
              accessibility across our platform.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Assistive Technologies
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Our platform is designed to be compatible with the following
              assistive technologies:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
              <li>Browser zoom functionality (up to 200%)</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Browser Support
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              For the best accessibility experience, we recommend using the
              latest versions of modern browsers including Chrome, Firefox,
              Safari, or Edge. Our platform is designed to work with browsers
              that support current web standards.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Feedback and Contact
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We welcome your feedback on the accessibility of Lunary. If you
              encounter any accessibility barriers or have suggestions for
              improvement, please let us know:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Accessibility Feedback:</strong>{' '}
                <a
                  href='mailto:accessibility@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  accessibility@lunary.app
                </a>
                <br />
                <strong>General Support:</strong>{' '}
                <a
                  href='mailto:support@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  support@lunary.app
                </a>
              </p>
            </div>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              When contacting us about accessibility issues, please include:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>A description of the accessibility issue</li>
              <li>The page URL where you encountered the issue</li>
              <li>The assistive technology you were using (if applicable)</li>
              <li>Your browser and operating system</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              We aim to respond to accessibility feedback within 5 business
              days.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Continuous Improvement
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We are committed to continuously improving the accessibility of
              our platform. We regularly review our content and features for
              accessibility issues and work to address them. We also train our
              team on accessibility best practices to ensure new features are
              developed with accessibility in mind.
            </p>
          </section>

          <section className='pt-8 border-t border-zinc-800'>
            <h2 className='text-lg font-medium text-white mb-4'>
              Related Policies
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Privacy Policy
              </Link>
              <Link
                href='/help'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Help & Support
              </Link>
            </div>
          </section>
        </div>
      </main>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
