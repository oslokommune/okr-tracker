module.exports = {
  verbose: true,
  roots: ['src', 'tests'],
  moduleFileExtensions: ['js', 'vue'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.(j|t)sx?$',
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(internmap|d3-array|d3-ease|d3-path|d3-time|d3-axis|d3-format|d3-scale|d3-time-format|d3-color|d3-hierarchy|d3-selection|d3-timer|d3-dispatch|d3-interpolate|d3-shape|d3-transition)/)',
  ],
};
