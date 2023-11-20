module.exports = {
  // collectCoverage: true,
  // coverageProvider: 'v8',
  // collectCoverageFrom: [
  //   '**/*.{js,jsx,ts,tsx}',
  //   '!**/*.d.ts',
  //   '!**/node_modules/**',
  //   '!<rootDir>/out/**',
  //   '!<rootDir>/.next/**',
  //   '!<rootDir>/*.config.js',
  //   '!<rootDir>/coverage/**',
  // ],
  moduleNameMapper: {
    '\\.(scss|sass|css)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};
