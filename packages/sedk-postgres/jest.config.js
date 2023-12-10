/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleNameMapper: {
    'sedk-postgres': '<rootDir>/src/index.ts',
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
  testMatch: [
    '**/?(*.)+(test.ts)',
  ],
  coverageReporters: [
    'json-summary',
  ],
};
