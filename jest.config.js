module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/lib/**/*.spec.ts' ],
	collectCoverageFrom: [ '<rootDir>/lib/**' ],
	coveragePathIgnorePatterns: [ '/node_modules/', '/test/' ],
	coverageReporters: [ 'lcov', 'text', 'html' ],
};
