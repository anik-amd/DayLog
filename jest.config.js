module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/database/**/*.ts',
    '!src/**/*.d.ts',
  ],
  moduleNameMapper: {
    '^expo-sqlite$': '<rootDir>/src/__tests__/__mocks__/expo-sqlite.ts',
  },
};

