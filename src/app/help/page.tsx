import { HelpCircle, Mail, MessageCircle, Search } from 'lucide-react';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export default function HelpPage() {
  const faqs = [
    {
      question: 'How do I access my birth chart?',
      answer:
        'Sign up for Lunary+ to access your complete birth chart analysis. You can enter your birth details in your profile settings.',
    },
    {
      question: 'What is included in the free plan?',
      answer:
        'The free plan includes daily moon phases, general tarot card of the day, 2 tarot spreads per month, basic lunar calendar, general daily horoscope, access to grimoire knowledge, and 1 free AI ritual/reading per week.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer:
        'You can manage your subscription in your Account settings. Go to your profile, then Subscription settings to cancel or modify your plan.',
    },
    {
      question: 'Can I change my subscription plan?',
      answer:
        'Yes, you can upgrade or downgrade your subscription at any time from your Account settings. Changes will take effect at your next billing cycle.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer:
        'Your data remains accessible during your active subscription period. After cancellation, you can still access your saved readings and collections, but premium features will be locked.',
    },
    {
      question: 'How do I export my cosmic data?',
      answer:
        'Annual plan subscribers can export their cosmic data including birth chart, tarot readings, collections, and chat history. This feature is available in your Account settings.',
    },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='text-center mb-12'>
          <h1 className='text-2xl md:text-4xl font-semibold text-white mb-4'>
            Help & Support
          </h1>
          <p className='text-base md:text-lg text-zinc-400'>
            Find answers to common questions or get in touch with our support
            team
          </p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 mb-12'>
          <div className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <Search className='w-6 h-6 text-lunary-primary-400' />
              <h2 className='text-xl font-semibold text-white'>FAQ</h2>
            </div>
            <p className='text-sm text-zinc-400 mb-4'>
              Browse frequently asked questions about Lunary features,
              subscriptions, and account management.
            </p>
            <a
              href='#faq'
              className='text-sm text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
            >
              View FAQs →
            </a>
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <Mail className='w-6 h-6 text-lunary-primary-400' />
              <h2 className='text-xl font-semibold text-white'>Contact Us</h2>
            </div>
            <p className='text-sm text-zinc-400 mb-4'>
              Need personalized assistance? Send us an email and we'll get back
              to you as soon as possible.
            </p>
            <a
              href='mailto:support@lunary.app'
              className='text-sm text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
            >
              support@lunary.app →
            </a>
          </div>
        </div>

        <section id='faq' className='space-y-6 mb-12'>
          <h2 className='text-2xl font-semibold text-white flex items-center gap-2'>
            <HelpCircle className='w-6 h-6 text-lunary-primary-400' />
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'
              >
                <h3 className='text-lg font-medium text-white mb-2'>
                  {faq.question}
                </h3>
                <p className='text-sm text-zinc-400'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='rounded-2xl border border-lunary-primary-700 bg-lunary-primary-950/20 p-8 text-center'>
          <MessageCircle className='w-12 h-12 text-lunary-primary-400 mx-auto mb-4' />
          <h2 className='text-2xl font-semibold text-white mb-3'>
            Still need help?
          </h2>
          <p className='text-sm text-zinc-400 mb-6 max-w-md mx-auto'>
            Our support team is here to help. Reach out via email and we'll
            respond within 24-48 hours.
          </p>
          <a
            href='mailto:support@lunary.app'
            className='inline-flex items-center justify-center rounded-xl bg-white/90 px-6 py-3 text-sm font-semibold text-lunary-primary-900 shadow-inner hover:bg-white transition-colors'
          >
            <Mail className='w-4 h-4 mr-2' />
            Contact Support
          </a>
        </section>
      </div>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
