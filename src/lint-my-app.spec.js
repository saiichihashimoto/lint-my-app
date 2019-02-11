import EventEmitter from 'events';
import childProcess from 'child_process';
import path from 'path';
import lintMyApp from './lint-my-app';

jest.mock('child_process');

const nodePath = process.argv[0];

describe('lint-my-app', () => {
	childProcess.spawn.mockImplementation(() => new EventEmitter());

	beforeEach(() => {
		childProcess.spawn.mockClear();
	});

	it('spawns lint-my-app-lint by default', () => {
		lintMyApp();

		expect(childProcess.spawn).toHaveBeenCalledWith(nodePath, [path.resolve(__dirname, 'lint-my-app-lint.js')], { customFds: [0, 1, 2], stdio: 'inherit' });
	});

	it('spawns lint-my-app-lint with "lint"', () => {
		lintMyApp('lint');

		expect(childProcess.spawn).toHaveBeenCalledWith(nodePath, [path.resolve(__dirname, 'lint-my-app-lint.js')], { customFds: [0, 1, 2], stdio: 'inherit' });
	});

	it('spawns lint-my-app-fix with "fix"', () => {
		lintMyApp('fix');

		expect(childProcess.spawn).toHaveBeenCalledWith(nodePath, [path.resolve(__dirname, 'lint-my-app-fix.js')], { customFds: [0, 1, 2], stdio: 'inherit' });
	});

	it('spawns lint-my-app-staged with "staged"', () => {
		lintMyApp('staged');

		expect(childProcess.spawn).toHaveBeenCalledWith(nodePath, [path.resolve(__dirname, 'lint-my-app-staged.js')], { customFds: [0, 1, 2], stdio: 'inherit' });
	});
});
