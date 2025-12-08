import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import Link from 'next/link';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { CosmicReportSection } from '@/lib/cosmic-report/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

async function getReport(token: string) {
  const result = await sql`
    SELECT id, report_type, report_data, created_at
    FROM cosmic_reports
    WHERE share_token = ${token} AND is_public = true
    LIMIT 1
  `;

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getReport(resolvedParams.token);

  if (!data) {
    return {
      title: 'Cosmic Report Not Found',
    };
  }

  return {
    title: `${data.report_data.title} · Lunary`,
    description: data.report_data.subtitle,
    openGraph: {
      title: data.report_data.title,
      description: data.report_data.subtitle,
      url: `${BASE_URL}/cosmic-report/${resolvedParams.token}`,
    },
  };
}

export default async function SharedReportPage({ params }: PageProps) {
  const resolvedParams = await params;
  const report = await getReport(resolvedParams.token);
  if (!report) {
    notFound();
  }

  const shareUrl = `${BASE_URL}/cosmic-report/${resolvedParams.token}`;

  return (
    <div className='w-full max-w-4xl space-y-8 px-4 py-10 text-white'>
      <section className='rounded-3xl border border-white/10 bg-black/50 p-6'>
        <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
          Shared report
        </p>
        <h1 className='text-4xl font-semibold'>{report.report_data.title}</h1>
        <p className='text-sm text-zinc-300'>{report.report_data.subtitle}</p>
        <p className='text-xs text-zinc-500'>
          Generated on {new Date(report.created_at).toLocaleDateString()}
        </p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link
            href={`/api/cosmic-report/${report.id}/pdf`}
            className='rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-lunary-primary-400'
          >
            Download PDF
          </Link>
          <Link
            href='/cosmic-report-generator'
            className='rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-lunary-primary-400'
          >
            Get your own report
          </Link>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <h2 className='text-2xl font-semibold'>Sections</h2>
        <div className='space-y-4'>
          {report.report_data.sections.map((section: CosmicReportSection) => (
            <div
              key={section.key}
              className='rounded-2xl border border-white/10 bg-white/5 p-4'
            >
              <p className='text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                {section.key}
              </p>
              <h3 className='text-xl font-semibold text-white'>
                {section.title}
              </h3>
              <p className='text-sm text-zinc-300'>{section.summary}</p>
              <ul className='mt-3 list-disc space-y-1 pl-6 text-sm text-lunary-primary-100'>
                {section.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className='rounded-3xl border border-white/10 bg-black/40 p-6'>
        <h2 className='text-2xl font-semibold'>Share</h2>
        <p className='text-sm text-zinc-300'>
          Send this report to your team or archive it for future rituals.
        </p>
        <div className='mt-4'>
          <SocialShareButtons
            url={shareUrl}
            title={`My Lunary ${report.report_type} report`}
          />
        </div>
      </section>
    </div>
  );
}
