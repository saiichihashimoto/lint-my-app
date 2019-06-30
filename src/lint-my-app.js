#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package';
import lintMyAppFix, { cliArgs as fixArgs } from './lint-my-app-fix';
import lintMyAppLint, { cliArgs as lintArgs } from './lint-my-app-lint';
import lintMyAppStaged, { cliArgs as stagedArgs } from './lint-my-app-staged';
import reportErrors from './report-errors';

function lintMyApp(argv) {
	const program = new Command()
		.version(version);

	let returnValue;

	lintArgs
		.reduce((acc, arg) => acc.option(arg), program.command('lint'))
		.action((args) => { returnValue = lintMyAppLint(args); });

	fixArgs
		.reduce((acc, arg) => acc.option(arg), program.command('fix'))
		.action((args) => { returnValue = lintMyAppFix(args); });

	stagedArgs
		.reduce((acc, arg) => acc.option(arg), program.command('staged'))
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
