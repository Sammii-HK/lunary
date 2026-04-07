import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Clock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Access Your Template | Lunary',
  robots: {
    index: false,
    follow: false,
  },
};

type Purchase = {
  id: number;
  access_token: string;
  template_id: string;
  customer_email: string;
  notion_share_url: string | null;
  access_count: number;
  revoked: boolean;
};

function BrandHeader() {
  return (
    <div className='flex items-center justify-center gap-3 mb-10'>
      <Logo size={40} />
      <span className='text-2xl font-bold text-lunary-accent'>Lunary</span>
    </div>
  );
}

function ErrorCard({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className='min-h-screen bg-surface-base flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <BrandHeader />
        <Card className='bg-surface-elevated border-stroke-subtle'>
          <CardHeader className='text-center'>
            <div className='flex justify-center mb-4 text-content-muted'>
              {icon}
            </div>
            <CardTitle className='text-content-primary'>{title}</CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <CardDescription className='text-content-muted text-sm leading-relaxed'>
              {message}
            </CardDescription>
            <p className='text-sm text-content-muted'>
              Need help?{' '}
              <Link
                href='mailto:hello@lunary.app'
                className='text-content-brand hover:text-lunary-primary underline underline-offset-2 transition-colors'
              >
                Contact support
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function TemplateDownloadPage({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = await params;

  const result = await sql<Purchase>`
    SELECT id, access_token, template_id, customer_email, notion_share_url, access_count, revoked
    FROM template_purchases
    WHERE access_token = ${accessToken}
    LIMIT 1
  `;

  const purchase = result.rows[0] ?? null;

  if (!purchase) {
    return (
      <ErrorCard
        icon={<AlertCircle size={48} />}
        title='Invalid or expired link'
        message='This download link is not valid or has expired. If you believe this is a mistake, please get in touch and we will sort it out.'
      />
    );
  }

  if (purchase.revoked) {
    return (
      <ErrorCard
        icon={<AlertCircle size={48} />}
        title='This link has been revoked'
        message='This download link has been revoked. If you think this is an error, please contact support and we will look into it.'
      />
    );
  }

  if (!purchase.notion_share_url) {
    return (
      <div className='min-h-screen bg-surface-base flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <BrandHeader />
          <Card className='bg-surface-elevated border-stroke-subtle'>
            <CardHeader className='text-center'>
              <div className='flex justify-center mb-4 text-content-brand'>
                <Clock size={48} />
              </div>
              <CardTitle className='text-content-primary'>
                Your template is being prepared
              </CardTitle>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <CardDescription className='text-content-muted text-sm leading-relaxed'>
                Your template is on its way — we are generating your personal
                share link. Check back in a few minutes, or check your email for
                updates.
              </CardDescription>
              <p className='text-sm text-content-muted'>
                Having trouble?{' '}
                <Link
                  href='mailto:hello@lunary.app'
                  className='text-content-brand hover:text-lunary-primary underline underline-offset-2 transition-colors'
                >
                  Contact support
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const userAgent = headersList.get('user-agent') ?? null;

  await sql`
    INSERT INTO template_access_logs (purchase_id, ip, user_agent, accessed_at)
    VALUES (${purchase.id}, ${ip}, ${userAgent}, NOW())
  `;

  await sql`
    UPDATE template_purchases
    SET
      access_count = access_count + 1,
      last_accessed_at = NOW(),
      first_accessed_at = COALESCE(first_accessed_at, NOW())
    WHERE id = ${purchase.id}
  `;

  redirect(purchase.notion_share_url);
}
