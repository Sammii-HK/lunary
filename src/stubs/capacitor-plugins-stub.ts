// Stub for Capacitor plugins on web/Vercel builds.
// These are only used inside the iOS WebView, guarded by platform checks.
// On web they're never called — this stub just satisfies the import.
export const Haptics = {
  impact: async () => {},
  notification: async () => {},
  vibrate: async () => {},
};
export const ImpactStyle = { Heavy: 'HEAVY', Medium: 'MEDIUM', Light: 'LIGHT' };
export const NotificationType = {
  Success: 'SUCCESS',
  Warning: 'WARNING',
  Error: 'ERROR',
};
export const Share = { share: async () => ({ activityType: undefined }) };
export const Purchases = {
  configure: () => {},
  getOfferings: async () => ({ current: null }),
  purchasePackage: async () => ({}),
  restorePurchases: async () => ({}),
  getCustomerInfo: async () => ({ entitlements: { active: {} } }),
  addCustomerInfoUpdateListener: () => () => {},
};
export const LOG_LEVEL = { VERBOSE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4 };
export const PURCHASES_ERROR_CODE = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  USER_CANCELLED: 'USER_CANCELLED',
  PURCHASE_NOT_ALLOWED_ERROR: 'PURCHASE_NOT_ALLOWED_ERROR',
  PURCHASE_INVALID_ERROR: 'PURCHASE_INVALID_ERROR',
  PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
    'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR',
  PRODUCT_ALREADY_PURCHASED_ERROR: 'PRODUCT_ALREADY_PURCHASED_ERROR',
  RECEIPT_ALREADY_IN_USE_ERROR: 'RECEIPT_ALREADY_IN_USE_ERROR',
  INVALID_RECEIPT_ERROR: 'INVALID_RECEIPT_ERROR',
  MISSING_RECEIPT_FILE_ERROR: 'MISSING_RECEIPT_FILE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_CREDENTIALS_ERROR: 'INVALID_CREDENTIALS_ERROR',
  UNEXPECTED_BACKEND_RESPONSE_ERROR: 'UNEXPECTED_BACKEND_RESPONSE_ERROR',
  INVALID_APP_USER_ID_ERROR: 'INVALID_APP_USER_ID_ERROR',
  OPERATION_ALREADY_IN_PROGRESS_FOR_PRODUCT_ERROR:
    'OPERATION_ALREADY_IN_PROGRESS_FOR_PRODUCT_ERROR',
  STORE_PROBLEM_ERROR: 'STORE_PROBLEM_ERROR',
  PAYMENT_PENDING_ERROR: 'PAYMENT_PENDING_ERROR',
};
export default {};
