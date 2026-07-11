module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    // tsconfig本体はdynamic import保持のためmodule:es2020だが、JestはCommonJSが必要
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  },
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
