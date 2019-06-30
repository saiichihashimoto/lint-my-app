#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package';
import lintMyAppFix from './lint-my-app-fix';
import lintMyAppLint from './lint-my-app-lint';
import lintMyAppStaged from './lint-my-app-staged';
import reportErrors from './report-errors';

function lintMyApp(argv) {
	const program = new Command()
		.version(version);

	let returnValue;

	program.command('lint')
		.option('--no-pkg-ok')
		.option('--no-eslint')
		.option('--no-stylelint')
		.option('--no-jsonlint')
		.action((args) => { returnValue = lintMyAppLint(args); });

	program.command('fix')
		.option('--no-sort-package-json')
		.option('--no-eslint')
		.option('--no-stylelint')
		.option('--no-fixjson')
		.option('--no-imagemin')
		.action((args) => { returnValue = lintMyAppFix(args); });

	program.command('staged')
		.action((args) => { returnValue = lintMyAppStaged(args); });

	program.parse(argv);

	return returnValue;
}

/* istanbul ignore next line */
if (require.main === module) {
	lintMyApp(process.argv)
		.catch((err) => { /* eslint-disable-line promise/prefer-await-to-callbacks */
			reportErrors(err);

			process.exit(1);
		});
}

export default (...argv) => lintMyApp([process.argv[0], __filename, ...argv]);
