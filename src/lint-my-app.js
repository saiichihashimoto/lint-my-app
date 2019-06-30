#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package';
import lintMyAppFix, { cliArgs as fixArgs } from './lint-my-app-fix';
import lintMyAppLint, { cliArgs as lintArgs } from './lint-my-app-lint';
import lintMyAppStaged, { cliArgs as stagedArgs } from './lint-my-app-staged';

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
			const queue = [err];

			while (queue.length) {
				const currentErr = queue.shift();

				if (currentErr.errors) {
					queue.push(...currentErr.errors);
				} else if (currentErr.all) {
					console.log(currentErr.all); /* eslint-disable-line no-console */
				} else if (currentErr.stderr) {
					console.error(currentErr.stderr); /* eslint-disable-line no-console */
				} else if (currentErr.stdout) {
					console.log(currentErr.stdout); /* eslint-disable-line no-console */
				} else {
					console.error(currentErr); /* eslint-disable-line no-console */
				}
			}

			process.exit(1);
		});
}

export default (...argv) => lintMyApp([process.argv[0], __filename, ...argv]);
