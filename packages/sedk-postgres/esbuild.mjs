'use strict';
import esbuild from 'esbuild';
import { transformExtPlugin } from '@gjsify/esbuild-plugin-transform-ext';

async function main() {
	await esbuild.build({
		plugins: [transformExtPlugin({ outExtension: {'.ts': '.js'}})],
		entryPoints: ['./src/**/*.ts'],
		outdir: './dist/src/',
		bundle: false,
		format: 'cjs',
	});
}

main()
 	.then(() => console.log('Build complete'))
	.catch(() => process.exit(1));
