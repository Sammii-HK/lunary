// Mock for @revenuecat/purchases-capacitor (ESM package — not parseable by Jest)
const Purchases = {
  getOfferings: jest
    .fn()
    .mockResolvedValue({ current: { availablePackages: [] } }),
  purchasePackage: jest.fn().mockResolvedValue({
    customerInfo: { entitlements: { active: {} } },
  }),
  restorePurchases: jest.fn().mockResolvedValue({
    customerInfo: { entitlements: { active: {} } },
  }),
  getCustomerInfo: jest.fn().mockResolvedValue({
    customerInfo: { entitlements: { active: {} } },
  }),
  logIn: jest.fn().mockResolvedValue({}),
  logOut: jest.fn().mockResolvedValue({}),
};

const PURCHASES_ERROR_CODE = {
  PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
};

module.exports = { Purchases, PURCHASES_ERROR_CODE };
