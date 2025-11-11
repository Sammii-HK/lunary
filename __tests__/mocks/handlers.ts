export const mockHandlers = {
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  },
  stripe: {
    createCheckoutSession: jest.fn(),
    webhook: jest.fn(),
  },
  api: {
    fetch: jest.fn(),
  },
};

export function resetMocks() {
  Object.values(mockHandlers).forEach((handler) => {
    if (typeof handler === 'object') {
      Object.values(handler).forEach((fn) => {
        if (jest.isMockFunction(fn)) {
          fn.mockReset();
        }
      });
    }
  });
}
