/** @type {import('jest').Config} */
module.exports = {
  projects: [
    // Unit tests (pure logic, DB layer) — no React Native environment needed
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/**/*.test.ts'],
      testPathIgnorePatterns: ['.*\\.tsx$', '/node_modules/'],
      transform: {
        '^.+\\.tsx?$': ['babel-jest', { configFile: './babel.config.js' }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(expo-crypto|expo-sqlite|zustand))',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^expo-sqlite$': '<rootDir>/__mocks__/expo-sqlite.ts',
        '^expo-crypto$': '<rootDir>/__mocks__/expo-crypto.ts',
        '^expo-constants$': '<rootDir>/__mocks__/expo-constants.ts',
      },
    },
  ],
}
