/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleNameMapper: {
    'src': '<rootDir>/src',
    'Non-Exported/(.*)': '<rootDir>/src/$1',
    'test/(.*)': '<rootDir>/test/$1',
  },
  testMatch: [
    '**/?(*.)+(test.ts)',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: false,
    }
  }
};
