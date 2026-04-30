import { notFound } from 'next/navigation';
import {
  activeAppPolicySlugs,
  getActiveAppPolicyBySlug,
} from '@/data/app-policy-pages';
import {
  AppSupportPage,
  createAppSupportMetadata,
} from '../../_components/AppSupportPage';

export const dynamicParams = false;

export function generateStaticParams() {
  return activeAppPolicySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getActiveAppPolicyBySlug(slug);

  if (!app) {
    return {
      title: 'Support | Lunary Apps',
    };
  }

  return createAppSupportMetadata(app);
}

export default async function DynamicAppSupportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getActiveAppPolicyBySlug(slug);

  if (!app) {
    notFound();
  }

  return <AppSupportPage app={app} />;
}
