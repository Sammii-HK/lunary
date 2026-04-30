import { notFound } from 'next/navigation';
import {
  activeAppPolicySlugs,
  getActiveAppPolicyBySlug,
} from '@/data/app-policy-pages';
import {
  AppPrivacyPolicyPage,
  createAppPrivacyMetadata,
} from '../../_components/AppPrivacyPolicyPage';

export const dynamicParams = false;

const staticPrivacySlugs = new Set(['iprep', 'postready', 'spellbook']);

export function generateStaticParams() {
  return activeAppPolicySlugs
    .filter((slug) => !staticPrivacySlugs.has(slug))
    .map((slug) => ({ slug }));
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
      title: 'Privacy Policy | Lunary Apps',
    };
  }

  return createAppPrivacyMetadata(app);
}

export default async function DynamicAppPrivacyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getActiveAppPolicyBySlug(slug);

  if (!app) {
    notFound();
  }

  return <AppPrivacyPolicyPage app={app} />;
}
