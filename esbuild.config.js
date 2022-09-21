import * as esbuild from 'esbuild';

import velvet from '@intrnl/esbuild-plugin-velvet';
import ccss from '@intrnl/esbuild-plugin-velvet/ccss';


/** @type {esbuild.BuildOptions} */
export let config = {
	entryPoints: ['src/main.js'],
	entryNames: 'app',
	outdir: 'dist/_assets',
	publicPath: '/_assets/',

	sourcemap: true,

	plugins: [
		velvet({ cache: false }),
		ccss(),
	],
};
