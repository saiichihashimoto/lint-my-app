#!/usr/bin/env node
const program = require('commander');
const { version } = require('../package');

program
	.version(version)
	.command('lint', 'lints your app', { isDefault: true })
	.command('fix', 'lint --fixes your app')
	.command('staged', 'lint --fixes your staged files')
	.parse(process.argv);
