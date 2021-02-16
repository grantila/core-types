module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/lib/**/*.spec.ts' ],
	collectCoverage: true,
	collectCoverageFrom: [ '<rootDir>/lib/**' ],
	coveragePathIgnorePatterns: [ '/node_modules/', '/__snapshots__/' ],
	coverageReporters: [ 'lcov', 'text', 'html' ],
};
