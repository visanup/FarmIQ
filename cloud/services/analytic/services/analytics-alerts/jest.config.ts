// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: ['./__tests__/__init__.ts'],
  modulePaths: ['./src'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  verbose: true
};