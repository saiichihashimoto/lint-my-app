#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package';
import lintMyAppFix from './lint-my-app-fix';
import lintMyAppLint from './lint-my-app-lint';
import lintMyAppStaged from './lint-my-app-staged';

function lintMyApp(args) {
	const program = new Command()
		.version(version);

	program
		.command('lint')
		.option('--no-pkg-ok')
		.option('--no-eslint')
		.option('--no-stylelint')
		.option('--no-jsonlint')
		.action(lintMyAppLint);

	program
		.command('fix')
		.option('--no-sort-package-json')
		.option('--no-eslint')
		.option('--no-stylelint')
		.option('--no-fixjson')
		.option('--no-imagemin')
		.action(lintMyAppFix);

	program
		.command('staged')
		.action(lintMyAppStaged);

	program.parse(args);
}

/* istanbul ignore next line */
if (require.main === module) {
	lintMyApp(process.argv);
}

export default (...args) => lintMyApp([process.argv[0], __filename, ...args]);
