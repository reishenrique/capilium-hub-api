/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/__test__/**/*.spec.ts'],
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/src/$1',
		'^@app/shared$': '<rootDir>/libs/shared/src',
		'^@app/shared/(.*)$': '<rootDir>/libs/shared/src/$1',
	},
};
