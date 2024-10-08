module.exports = {
  collectCoverage: true,
  // Ensures that we collect coverage from all source files, not just tested
  // ones.
  collectCoverageFrom: ["./src/**.ts"],
  coverageReporters: ["text", "html"],
  coverageThreshold: {
    global: {
      branches: 74,
      functions: 98,
      lines: 93.4,
      statements: 93.4,
    },
  },
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  preset: "ts-jest",
  // "resetMocks" resets all mocks, including mocked modules, to jest.fn(),
  // between each test case.
  resetMocks: true,
  // "restoreMocks" restores all mocks created using jest.spyOn to their
  // original implementations, between each test. It does not affect mocked
  // modules.
  restoreMocks: true,
  testEnvironment: "node",
  // testRegex: ['\\.test\\.(ts|js)$'],
  testRegex: ["\\.test\\.(ts)$"],
  testTimeout: 2500,
};
