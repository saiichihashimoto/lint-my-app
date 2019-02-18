import execa from 'execa';
import globby from 'globby';
import path from 'path';
import pkgOk from 'pkg-ok';
import availableConfigs from './available-configs';
import lint from './lint-my-app-lint';

jest.mock('execa');
jest.mock('globby');
jest.mock('pkg-ok');

describe('lint-my-app lint', () => {
	const emptyJson = path.resolve(__dirname, 'empty.json');

	beforeEach(() => {
		globby.mockImplementation(() => Promise.resolve([]));
		execa.mockImplementation(() => {
			const promise = Promise.resolve();
			promise.stdin = jest.fn();
			promise.stdout = { pipe: jest.fn() };
			return promise;
		});
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('pkg-ok', () => {
		beforeEach(() => {
			globby.mockImplementation((pattern) => Promise.resolve(pattern === '**/package.json' ? ['package.json', 'folder/package.json'] : []));
		});

		it('executes', async () => {
			await lint();

			expect(pkgOk).toHaveBeenCalledWith(process.cwd());
			expect(pkgOk).toHaveBeenCalledWith(`${process.cwd()}/folder`);
		});

		it('can be disabled', async () => {
			await lint({ pkgOk: false });

			expect(pkgOk).not.toHaveBeenCalled();
		});
	});

	describe('eslint', () => {
		it('executes', async () => {
			await lint();

			expect(execa).toHaveBeenCalledWith(
				'eslint',
				[
					'--ignore-path', '.gitignore',
					'--ignore-pattern', '\'!.*.js\'',
					'--color',
					'--report-unused-disable-directives',
					'.',
				],
			);
		});

		it('can be disabled', async () => {
			await lint({ eslint: false });

			expect(execa).not.toHaveBeenCalledWith(
				'eslint',
				[
					'--ignore-path', '.gitignore',
					'--ignore-pattern', '\'!.*.js\'',
					'--color',
					'--report-unused-disable-directives',
					'.',
				],
			);
		});

		it('defaults to empty.json config', async () => {
			const valueBefore = availableConfigs.eslint;
			availableConfigs.eslint = false;

			await lint();

			expect(execa).toHaveBeenCalledWith(
				'eslint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--ignore-pattern', '\'!.*.js\'',
					'--color',
					'--report-unused-disable-directives',
					'.',
				],
			);

			availableConfigs.eslint = valueBefore;
		});
	});

	describe('stylelint', () => {
		it('executes', async () => {
			await lint();

			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.css"',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.css"',
					'--report-needless-disables',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.scss"',
					'--syntax=scss',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.scss"',
					'--syntax=scss',
					'--report-needless-disables',
				],
			);
		});

		it('can be disabled', async () => {
			await lint({ stylelint: false });

			expect(execa).not.toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.css"',
				],
			);
			expect(execa).not.toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.css"',
					'--report-needless-disables',
				],
			);
			expect(execa).not.toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.scss"',
					'--syntax=scss',
				],
			);
			expect(execa).not.toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.scss"',
					'--syntax=scss',
					'--report-needless-disables',
				],
			);
		});

		it('uses provided config', async () => {
			const valueBefore = availableConfigs.stylelint;
			availableConfigs.stylelint = true;

			await lint();

			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.css"',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.css"',
					'--report-needless-disables',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.scss"',
					'--syntax=scss',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--ignore-path', '.gitignore',
					'--color',
					'"**/*.scss"',
					'--syntax=scss',
					'--report-needless-disables',
				],
			);

			availableConfigs.stylelint = valueBefore;
		});
	});

	describe('jsonlint', () => {
		beforeEach(() => {
			globby.mockImplementation((pattern) => Promise.resolve(pattern === '**/!(package).json' ? ['foo.json', 'folder/bar.json'] : []));
		});

		it('executes', async () => {
			await lint();

			expect(execa).toHaveBeenCalledWith('jsonlint', ['--quiet', 'foo.json']);
			expect(execa).toHaveBeenCalledWith('jsonlint', ['--quiet', 'folder/bar.json']);
		});

		it('can be disabled', async () => {
			await lint({ jsonlint: false });

			expect(execa).not.toHaveBeenCalledWith('jsonlint', expect.anything());
		});
	});
});
