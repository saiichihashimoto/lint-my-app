#!/usr/bin/env node
const execa = require('execa');
const path = require('path');
const program = require('commander');

const staged = (args) => {
	let action = null;
	program
		.action(() => {
			action = execa(
				'lint-staged',
				[
					'--config', path.resolve(__dirname, '../lint-staged.config.js'),
				],
				{
					stdio: [process.stdin, process.stdout, process.stderr],
				},
			);
		})
		.parse(args);
	return action;
};

/* istanbul ignore next line */
if (require.main === module) {
	staged(process.argv);
} else {
	module.exports = (...args) => staged([process.argv[0], __filename, ...args]);
}
