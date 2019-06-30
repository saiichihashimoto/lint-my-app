import EventEmitter from 'events';
import childProcess from 'child_process';
import lintMyApp from './lint-my-app';
import lintMyAppFix from './lint-my-app-fix';
import lintMyAppLint from './lint-my-app-lint';
import lintMyAppStaged from './lint-my-app-staged';

jest.mock('child_process');
jest.mock('./lint-my-app-fix');
jest.mock('./lint-my-app-lint');
jest.mock('./lint-my-app-staged');

describe('lint-my-app', () => {
	beforeEach(() => {
		childProcess.spawn.mockImplementation(() => new EventEmitter());
		lintMyAppFix.mockImplementation(() => Promise.resolve());
		lintMyAppLint.mockImplementation(() => Promise.resolve());
		lintMyAppStaged.mockImplementation(() => Promise.resolve());
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('runs lint', () => {
		lintMyApp('lint');

		expect(lintMyAppLint).toHaveBeenCalledWith(expect.any(Object));
	});

	it('runs fix', () => {
		lintMyApp('fix');

		expect(lintMyAppFix).toHaveBeenCalledWith(expect.any(Object));
	});

	it('runs staged', () => {
		lintMyApp('staged');

		expect(lintMyAppStaged).toHaveBeenCalledWith(expect.any(Object));
	});
});
