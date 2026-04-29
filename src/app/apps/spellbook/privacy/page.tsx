import { getActiveAppPolicyOrThrow } from '@/data/app-policy-pages';
import {
  AppPrivacyPolicyPage,
  createAppPrivacyMetadata,
} from '../../_components/AppPrivacyPolicyPage';

const app = getActiveAppPolicyOrThrow('spellbook');

export const metadata = createAppPrivacyMetadata(app);

export default function SpellBookPrivacyPage() {
  return <AppPrivacyPolicyPage app={app} />;
}
