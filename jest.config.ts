import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const { compilerOptions } = JSON.parse(
    readFileSync(join(__dirname, 'tsconfig.json'), 'utf-8'),
);

const paths: Record<string, string[]> = Object.fromEntries(
    Object.entries(compilerOptions.paths).map(([key, values]) => [
        key,
        (values as string[]).map((value) => value.replace(/\.js$/, '')),
    ]),
);

const config: Config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    moduleNameMapper: {
        ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@nestjs/passport|otplib|@otplib|@scure|@noble)/)',
    ],
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
};

export default config;
