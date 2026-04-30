import { getActiveAppPolicyOrThrow } from '@/data/app-policy-pages';
import {
  AppPrivacyPolicyPage,
  createAppPrivacyMetadata,
} from '../../_components/AppPrivacyPolicyPage';

const app = getActiveAppPolicyOrThrow('iprep');

export const metadata = createAppPrivacyMetadata(app);

export default function IPrepPrivacyPage() {
  return <AppPrivacyPolicyPage app={app} />;
}
