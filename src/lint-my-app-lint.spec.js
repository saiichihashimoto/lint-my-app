import execa from 'execa';
import path from 'path';
import availableConfigs from './available-configs';
import lint from './lint-my-app-lint';

jest.mock('execa');

describe('lint-my-app lint', () => {
	const emptyJson = path.resolve(__dirname, 'empty.json');

	beforeEach(() => {
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
		it('executes', async () => {
			await lint();

			expect(execa).toHaveBeenCalledWith('pkg-ok');
		});

		it('can be disabled', async () => {
			await lint({ pkgOk: false });

			expect(execa).not.toHaveBeenCalledWith('pkg-ok');
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
		it('executes', async () => {
			await lint();

			expect(execa).toHaveBeenCalledWith('git', ['ls-files']);
			expect(execa).toHaveBeenCalledWith('grep', ['\\.json$']);
			expect(execa).toHaveBeenCalledWith('grep', ['-v', 'package\\(-lock\\)\\?\\.json$']);
			expect(execa).toHaveBeenCalledWith('xargs', ['-I{}', 'jsonlint', '--quiet', '"{}"']);
		});

		it('can be disabled', async () => {
			await lint({ jsonlint: false });

			expect(execa).not.toHaveBeenCalledWith('git', ['ls-files']);
			expect(execa).not.toHaveBeenCalledWith('grep', ['\\.json$']);
			expect(execa).not.toHaveBeenCalledWith('grep', ['-v', 'package\\(-lock\\)\\?\\.json$']);
			expect(execa).not.toHaveBeenCalledWith('xargs', ['-I{}', 'jsonlint', '--quiet', '"{}"']);
		});
	});
});
