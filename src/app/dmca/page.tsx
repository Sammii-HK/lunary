import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'DMCA Policy | Lunary',
  description:
    "Lunary's Digital Millennium Copyright Act (DMCA) policy. Learn how to report copyright infringement.",
  robots: 'index, follow',
};

export default function DMCAPage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            DMCA Policy
          </h1>
          <p className='text-sm text-zinc-500'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              Lunar Computing, Inc. (&quot;Lunary,&quot; &quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) respects the intellectual
              property rights of others and expects our users to do the same. In
              accordance with the Digital Millennium Copyright Act of 1998
              (&quot;DMCA&quot;), we will respond expeditiously to claims of
              copyright infringement committed using our Service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. DMCA Compliance
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              If you believe that content available on or through our Service
              infringes your copyright, you may submit a notification pursuant
              to the DMCA by providing our designated Copyright Agent with the
              information described below. Please be aware that under 17 U.S.C.
              § 512(f), you may be liable for any damages, including costs and
              attorneys&apos; fees, if you knowingly materially misrepresent
              that material or activity is infringing.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. Filing a DMCA Notice
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              To file a valid DMCA notice, you must provide a written
              communication that includes the following:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Identification of the copyrighted work:</strong> A
                description of the copyrighted work you claim has been
                infringed, or if multiple works are covered by a single
                notification, a representative list of such works.
              </li>
              <li>
                <strong>Identification of the infringing material:</strong> A
                description of where the material you claim is infringing is
                located on our Service, with enough detail so we can find it
                (e.g., a URL or specific page).
              </li>
              <li>
                <strong>Your contact information:</strong> Your address,
                telephone number, and email address.
              </li>
              <li>
                <strong>Good faith statement:</strong> A statement that you have
                a good faith belief that the use of the material in the manner
                complained of is not authorized by the copyright owner, its
                agent, or the law.
              </li>
              <li>
                <strong>Accuracy statement:</strong> A statement that the
                information in the notification is accurate, and under penalty
                of perjury, that you are authorized to act on behalf of the
                owner of an exclusive right that is allegedly infringed.
              </li>
              <li>
                <strong>Signature:</strong> A physical or electronic signature
                of the copyright owner or a person authorized to act on their
                behalf.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Designated Copyright Agent
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Send your DMCA notice to our designated Copyright Agent:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Lunar Computing, Inc.</strong>
                <br />
                Attn: DMCA Agent
                <br />
                Email:{' '}
                <a
                  href='mailto:dmca@lunary.app'
                  className='text-purple-400 hover:text-purple-300'
                >
                  dmca@lunary.app
                </a>
              </p>
            </div>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Please note that the DMCA requires that you swear to the facts in
              your notice under penalty of perjury. It is a federal crime to
              intentionally lie in a sworn declaration. We may forward your
              notice to the user who posted the allegedly infringing content.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Counter-Notification
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you believe that content you posted was removed or disabled by
              mistake or misidentification, you may file a counter-notification
              with us. A valid counter-notification must include:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Your physical or electronic signature</li>
              <li>
                Identification of the material that was removed or disabled and
                the location where it appeared before removal
              </li>
              <li>
                A statement under penalty of perjury that you have a good faith
                belief that the material was removed or disabled as a result of
                mistake or misidentification
              </li>
              <li>Your name, address, and telephone number</li>
              <li>
                A statement that you consent to the jurisdiction of the federal
                district court for the judicial district in which your address
                is located, or if outside the United States, for any judicial
                district in which Lunary may be found
              </li>
              <li>
                A statement that you will accept service of process from the
                person who provided the original notification or an agent of
                such person
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Send counter-notifications to the same Copyright Agent address
              listed above with &quot;DMCA Counter-Notification&quot; in the
              subject line.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Process After Counter-Notification
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Upon receipt of a valid counter-notification, we will forward it
              to the original complainant. If the original complainant does not
              notify us within 10 business days that they have filed a court
              action seeking to restrain the allegedly infringing activity, we
              may restore the removed content. Our decision to restore content
              is at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Repeat Infringers
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              In accordance with the DMCA and other applicable law, we have
              adopted a policy of terminating, in appropriate circumstances, the
              accounts of users who are deemed to be repeat infringers. We may
              also, at our sole discretion, limit access to our Service and/or
              terminate the accounts of any users who infringe any intellectual
              property rights of others, whether or not there is any repeat
              infringement.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Modifications to Policy
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We reserve the right to modify this DMCA Policy at any time.
              Changes will be effective immediately upon posting to this page.
              Your continued use of the Service after any changes indicates your
              acceptance of the modified policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Contact
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              For questions about this DMCA Policy:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>DMCA Inquiries:</strong>{' '}
                <a
                  href='mailto:dmca@lunary.app'
                  className='text-purple-400 hover:text-purple-300'
                >
                  dmca@lunary.app
                </a>
                <br />
                <strong>Legal Inquiries:</strong>{' '}
                <a
                  href='mailto:legal@lunary.app'
                  className='text-purple-400 hover:text-purple-300'
                >
                  legal@lunary.app
                </a>
              </p>
            </div>
          </section>

          <section className='pt-8 border-t border-zinc-800'>
            <h2 className='text-lg font-medium text-white mb-4'>
              Related Policies
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/terms'
                className='text-purple-400 hover:text-purple-300 text-sm'
              >
                Terms of Service
              </Link>
              <Link
                href='/acceptable-use'
                className='text-purple-400 hover:text-purple-300 text-sm'
              >
                Acceptable Use Policy
              </Link>
              <Link
                href='/trademark'
                className='text-purple-400 hover:text-purple-300 text-sm'
              >
                Trademark Guidelines
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
