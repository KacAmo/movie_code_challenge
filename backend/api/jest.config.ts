import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    rootDir: 'src',  // Run tests from the src directory
    testMatch: ['<rootDir>/**/*.spec.ts'], // Find test files
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
     '^.+\\.tsx?$': ['ts-jest', {
        tsconfig: '<rootDir>/../tsconfig.json' // Use root tsconfig
      }]
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'], // Ignore these directories
};

export default config;