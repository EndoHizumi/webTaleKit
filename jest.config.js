module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts'],
};