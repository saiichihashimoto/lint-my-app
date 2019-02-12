#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package';

const lintMyApp = (args) => new Command()
	.version(version)
	.command('lint', 'lints your app', { isDefault: true })
	.command('fix', 'lint --fixes your app')
	.command('staged', 'lint --fixes your staged files')
	.parse(args);

/* istanbul ignore next line */
if (require.main === module) {
	lintMyApp(process.argv);
}
export default (...args) => lintMyApp([process.argv[0], __filename, ...args]);
