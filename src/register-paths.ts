import { register } from 'tsconfig-paths';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const { compilerOptions } = JSON.parse(
    readFileSync(join(__dirname, '../../tsconfig.json'), 'utf-8'),
);

register({
    baseUrl: __dirname,
    paths: compilerOptions.paths,
});
