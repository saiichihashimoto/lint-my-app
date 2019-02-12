#!/usr/bin/env node
import execa from 'execa';
import path from 'path';

function staged() {
	return execa(
		'lint-staged',
		[
			'--config', path.resolve(__dirname, 'lint-staged.config.js'),
		],
		{
			stdio: [process.stdin, process.stdout, process.stderr],
		},
	);
}

/* istanbul ignore next line */
if (require.main === module) {
	staged()
		.catch(({ code }) => process.exit(code || 1));
}
export default staged;
