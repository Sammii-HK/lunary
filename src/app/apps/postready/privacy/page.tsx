import { getActiveAppPolicyOrThrow } from '@/data/app-policy-pages';
import {
  AppPrivacyPolicyPage,
  createAppPrivacyMetadata,
} from '../../_components/AppPrivacyPolicyPage';

const app = getActiveAppPolicyOrThrow('postready');

export const metadata = createAppPrivacyMetadata(app);

export default function PostReadyPrivacyPage() {
  return <AppPrivacyPolicyPage app={app} />;
}
