import lintStaged from 'lint-staged/src';
import path from 'path';

export default function staged() {
	return lintStaged({ configPath: path.resolve(__dirname, 'lint-staged.config.js') });
}
