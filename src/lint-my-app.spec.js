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

	describe('lint', () => {
		it('runs lint', () => {
			lintMyApp('lint');

			expect(lintMyAppLint).toHaveBeenCalledWith(expect.any(Object));
		});

		it('--no-pkg-ok', () => {
			lintMyApp('lint', '--no-pkg-ok');

			expect(lintMyAppLint).toHaveBeenCalledWith(expect.objectContaining({ pkgOk: false }));
		});

		it('--no-eslint', () => {
			lintMyApp('lint', '--no-eslint');

			expect(lintMyAppLint).toHaveBeenCalledWith(expect.objectContaining({ eslint: false }));
		});

		it('--no-stylelint', () => {
			lintMyApp('lint', '--no-stylelint');

			expect(lintMyAppLint).toHaveBeenCalledWith(expect.objectContaining({ stylelint: false }));
		});

		it('--no-jsonlint', () => {
			lintMyApp('lint', '--no-jsonlint');

			expect(lintMyAppLint).toHaveBeenCalledWith(expect.objectContaining({ jsonlint: false }));
		});
	});

	describe('fix', () => {
		it('runs fix', () => {
			lintMyApp('fix');

			expect(lintMyAppFix).toHaveBeenCalledWith(expect.any(Object));
		});

		it('--no-sort-package-json', () => {
			lintMyApp('fix', '--no-sort-package-json');

			expect(lintMyAppFix).toHaveBeenCalledWith(
				expect.objectContaining({ sortPackageJson: false }),
			);
		});

		it('--no-eslint', () => {
			lintMyApp('fix', '--no-eslint');

			expect(lintMyAppFix).toHaveBeenCalledWith(expect.objectContaining({ eslint: false }));
		});

		it('--no-stylelint', () => {
			lintMyApp('fix', '--no-stylelint');

			expect(lintMyAppFix).toHaveBeenCalledWith(expect.objectContaining({ stylelint: false }));
		});

		it('--no-fixjson', () => {
			lintMyApp('fix', '--no-fixjson');

			expect(lintMyAppFix).toHaveBeenCalledWith(expect.objectContaining({ fixjson: false }));
		});

		it('--no-imagemin', () => {
			lintMyApp('fix', '--no-imagemin');

			expect(lintMyAppFix).toHaveBeenCalledWith(expect.objectContaining({ imagemin: false }));
		});
	});

	describe('staged', () => {
		it('runs staged', () => {
			lintMyApp('staged');

			expect(lintMyAppStaged).toHaveBeenCalledWith(expect.any(Object));
		});
	});
});
