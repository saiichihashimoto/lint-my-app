#!/usr/bin/env node
import execa from 'execa';
import path from 'path';
import program from 'commander';

function staged(args) {
	let action = null;
	program
		.action(() => {
			action = execa(
				'lint-staged',
				[
					'--config', path.resolve(__dirname, 'lint-staged.config.js'),
				],
				{
					stdio: [process.stdin, process.stdout, process.stderr],
				},
			);
		})
		.parse(args);
	return action;
}

/* istanbul ignore next line */
if (require.main === module) {
	staged(process.argv);
}
export default (...args) => staged([process.argv[0], __filename, ...args]);
