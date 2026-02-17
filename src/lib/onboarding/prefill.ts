export type OnboardingPrefill = {
  birthday: string;
  birthTime?: string;
  birthLocation?: string;
  autoAdvance?: boolean;
  source?: string;
};

const STORAGE_KEY = 'lunary.onboarding.prefill';

export const setOnboardingPrefill = (prefill: OnboardingPrefill) => {
  if (typeof window === 'undefined') return;
  try {
    // lgtm[js/clear-text-storage-of-sensitive-data] — birthDate is the core input for this astrology app, not a secret
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prefill));
  } catch (error) {
    console.warn('Failed to store onboarding prefill:', error);
  }
};

export const getOnboardingPrefill = (): OnboardingPrefill | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingPrefill;
  } catch (error) {
    console.warn('Failed to read onboarding prefill:', error);
    return null;
  }
};

export const clearOnboardingPrefill = () => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear onboarding prefill:', error);
  }
};
