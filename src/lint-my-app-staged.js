import lintStaged from 'lint-staged/src';
import path from 'path';

export default async function staged() {
	const value = await lintStaged({ configPath: path.resolve(__dirname, 'lint-staged.config.js') });

	if (!value) {
		throw new Error('lint-staged failed');
	}

	return value;
}
