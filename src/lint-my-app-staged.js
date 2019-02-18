#!/usr/bin/env node
import lintStaged from 'lint-staged/src';
import path from 'path';

function staged() {
	return lintStaged(console, path.resolve(__dirname, 'lint-staged.config.js'));
}

/* istanbul ignore next line */
if (require.main === module) {
	staged()
		.catch(({ code }) => process.exit(code || 1));
}
export default staged;
