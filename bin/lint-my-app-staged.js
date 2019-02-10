#!/usr/bin/env node
const execa = require('execa');
const path = require('path');
const program = require('commander');

program
	.action(() => execa(
		'lint-staged',
		[
			'--config', path.resolve(__dirname, '../lint-staged.config.js'),
		],
		{
			stdio: [process.stdin, process.stdout, process.stderr],
		},
	))
	.parse(process.argv);
