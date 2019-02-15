import EventEmitter from 'events';
import childProcess from 'child_process';
import path from 'path';
import lintMyApp from './lint-my-app';

jest.mock('child_process');

describe('lint-my-app', () => {
	const nodePath = process.argv[0];

	beforeEach(() => {
		childProcess.spawn.mockImplementation(() => new EventEmitter());
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('spawns lint-my-app-lint', () => {
		lintMyApp();

		expect(childProcess.spawn).toHaveBeenCalledWith(nodePath, [path.resolve(__dirname, 'lint-my-app-lint.js')], expect.anything());
	});

	it('`lint` spawns lint-my-app-lint', () => {
		lintMyApp('lint');

		expect(childProcess.spawn).toHaveBeenCalledWith(nodePath, [path.resolve(__dirname, 'lint-my-app-lint.js')], expect.anything());
	});

	it('`fix` spawns lint-my-app-fix', () => {
		lintMyApp('fix');

		expect(childProcess.spawn).toHaveBeenCalledWith(nodePath, [path.resolve(__dirname, 'lint-my-app-fix.js')], expect.anything());
	});

	it('`lint` spawns lint-my-app-staged', () => {
		lintMyApp('staged');

		expect(childProcess.spawn).toHaveBeenCalledWith(nodePath, [path.resolve(__dirname, 'lint-my-app-staged.js')], expect.anything());
	});
});
