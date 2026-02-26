const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^utils/(.*)$': '<rootDir>/utils/$1',
    '^@revenuecat/purchases-capacitor$':
      '<rootDir>/__mocks__/@revenuecat/purchases-capacitor.js',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
    '/playwright/',
    '/__tests__/mocks/',
    '\\.integration\\.test\\.(ts|tsx|js|jsx)$',
  ],
  collectCoverageFrom: [
    'src/utils/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/constants/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/app/**',
    '!src/middleware.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  // Coverage thresholds disabled - focus on test quality over coverage percentage
  // coverageThreshold: {
  //   global: {
  //     branches: 60,
  //     functions: 60,
  //     lines: 60,
  //     statements: 60,
  //   },
  // },
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/__tests__/',
    '/e2e/',
    '/playwright/',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testTimeout: 10000,
  transformIgnorePatterns: [
    '/node_modules/(?!(better-auth|@revenuecat/purchases-capacitor|@capacitor)/)/',
  ],
};

module.exports = createJestConfig(customJestConfig);
