#!/usr/bin/env node
const program = require('commander');
const { version } = require('../package');

const lintMyApp = program
	.version(version)
	.command('lint', 'lints your app', { isDefault: true })
	.command('fix', 'lint --fixes your app')
	.command('staged', 'lint --fixes your staged files');

/* istanbul ignore next line */
if (require.main === module) {
	lintMyApp.parse(process.argv);
} else {
	module.exports = (...args) => lintMyApp.parse([process.argv[0], __filename, ...args]);
}
