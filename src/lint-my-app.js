#!/usr/bin/env node
/* istanbul ignore file */
import updateNotifier from 'update-notifier';
import { Command } from 'commander';

import pkg from '../package';

import lintMyAppFix from './lint-my-app-fix';
import lintMyAppLint from './lint-my-app-lint';
import lintMyAppStaged from './lint-my-app-staged';

updateNotifier({ pkg }).notify();

let action;

const program = new Command()
	.version(pkg.version);

program
	.command('lint')
	.option('--no-pkg-ok')
	.option('--no-eslint')
	.option('--no-stylelint')
	.option('--no-jsonlint')
	.option('--no-dot')
	.action(() => { action = lintMyAppLint; });

program
	.command('fix')
	.option('--no-sort-package-json')
	.option('--no-eslint')
	.option('--no-stylelint')
	.option('--no-fixjson')
	.option('--no-imagemin')
	.option('--no-dot')
	.action(() => { action = lintMyAppFix; });

program
	.command('staged')
	.action(() => { action = lintMyAppStaged; });

program.parse(process.argv);

action(program)
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
			} else if (currentErr.message !== 'Staged Failed') {
				console.error(currentErr); /* eslint-disable-line no-console */
			}
		}

		process.exit(1);
	});
