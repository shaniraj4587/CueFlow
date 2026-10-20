module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|react-navigation|@react-navigation/.*)',
  ],
};
