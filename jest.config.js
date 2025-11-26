module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/cli.ts', // CLI is tested separately
  ],
  coverageThreshold: {
    global: {
      branches: 78,
      functions: 87,
      lines: 88,
      statements: 93,
    },
  },
  testMatch: ['**/tests/**/*.test.ts'],
};
