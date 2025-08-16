import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }]
  },
  moduleNameMapper: {
  '^@/services/(.*)$': '<rootDir>/src/services/$1',
  '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
  '^@/types/(.*)$': '<rootDir>/src/types/$1',
  '^@/components/(.*)$': '<rootDir>/components/$1',
  '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  '^@/(.*)$': '<rootDir>/app/$1',
  '^app/(.*)$': '<rootDir>/app/$1'
  }
};

export default config;
