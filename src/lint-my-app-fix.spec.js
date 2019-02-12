import execa from 'execa';
import path from 'path';
import availableConfigs from './available-configs';
import fix from './lint-my-app-fix';

jest.mock('execa');

describe('lint-my-app fix', () => {
	const emptyJson = path.resolve(__dirname, 'empty.json');

	execa.mockImplementation(() => {
		const promise = Promise.resolve();
		promise.stdin = jest.fn();
		promise.stdout = { pipe: jest.fn() };
		return promise;
	});

	afterEach(() => {
		execa.mockClear();
	});

	describe('sort-package-json', () => {
		it('executes', async () => {
			await fix();

			expect(execa).toHaveBeenCalledWith('git', ['ls-files']);
			expect(execa).toHaveBeenCalledWith('grep', ['package\\.json$']);
			expect(execa).toHaveBeenCalledWith(
				'xargs',
				[
					'-I{}',
					'sort-package-json',
					'{}',
				],
			);
		});

		it('--no-sort-package-json', async () => {
			await fix('--no-sort-package-json');

			expect(execa).not.toHaveBeenCalledWith('grep', ['package\\.json$']);
			expect(execa).not.toHaveBeenCalledWith(
				'xargs',
				[
					'-I{}',
					'sort-package-json',
					'{}',
				],
			);
		});
	});

	describe('eslint --fix', () => {
		it('executes', async () => {
			await fix();

			expect(execa).toHaveBeenCalledWith(
				'eslint',
				[
					'--ignore-path', '.gitignore',
					'--ignore-pattern', '\'!.*.js\'',
					'--color',
					'--fix',
					'--report-unused-disable-directives',
					'.',
				],
			);
		});

		it('--no-eslint', async () => {
			await fix('--no-eslint');

			expect(execa).not.toHaveBeenCalledWith(
				'eslint',
				[
					'--ignore-path', '.gitignore',
					'--ignore-pattern', '\'!.*.js\'',
					'--color',
					'--fix',
					'--report-unused-disable-directives',
					'.',
				],
			);
		});

		it('defaults to empty.json config', async () => {
			const valueBefore = availableConfigs.eslint;
			availableConfigs.eslint = false;

			await fix();

			expect(execa).toHaveBeenCalledWith(
				'eslint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--ignore-pattern', '\'!.*.js\'',
					'--color',
					'--fix',
					'--report-unused-disable-directives',
					'.',
				],
			);

			availableConfigs.eslint = valueBefore;
		});
	});

	describe('stylelint --fix', () => {
		it('executes', async () => {
			await fix();

			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'--fix',
					'"**/*.css"',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'--fix',
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
					'--fix',
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
					'--fix',
					'"**/*.scss"',
					'--syntax=scss',
					'--report-needless-disables',
				],
			);
		});

		it('--no-stylelint', async () => {
			await fix('--no-stylelint');

			expect(execa).not.toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'--fix',
					'"**/*.css"',
				],
			);
			expect(execa).not.toHaveBeenCalledWith(
				'stylelint',
				[
					'--config', emptyJson,
					'--ignore-path', '.gitignore',
					'--color',
					'--fix',
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
					'--fix',
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
					'--fix',
					'"**/*.scss"',
					'--syntax=scss',
					'--report-needless-disables',
				],
			);
		});

		it('uses provided config', async () => {
			const valueBefore = availableConfigs.stylelint;
			availableConfigs.stylelint = true;

			await fix();

			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--ignore-path', '.gitignore',
					'--color',
					'--fix',
					'"**/*.css"',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--ignore-path', '.gitignore',
					'--color',
					'--fix',
					'"**/*.css"',
					'--report-needless-disables',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--ignore-path', '.gitignore',
					'--color',
					'--fix',
					'"**/*.scss"',
					'--syntax=scss',
				],
			);
			expect(execa).toHaveBeenCalledWith(
				'stylelint',
				[
					'--ignore-path', '.gitignore',
					'--color',
					'--fix',
					'"**/*.scss"',
					'--syntax=scss',
					'--report-needless-disables',
				],
			);

			availableConfigs.stylelint = valueBefore;
		});
	});

	describe('fixjson', () => {
		it('executes', async () => {
			await fix();

			expect(execa).toHaveBeenCalledWith('git', ['ls-files']);
			expect(execa).toHaveBeenCalledWith('grep', ['\\.json$']);
			expect(execa).toHaveBeenCalledWith('grep', ['-v', 'package\\(-lock\\)\\?\\.json$']);
			expect(execa).toHaveBeenCalledWith(
				'xargs',
				[
					'-I{}',
					'fixjson',
					'--write',
					'"{}"',
				],
			);
		});

		it('--no-fixjson', async () => {
			await fix('--no-fixjson');

			// expect(execa).not.toHaveBeenCalledWith('git', ['ls-files']);
			expect(execa).not.toHaveBeenCalledWith('grep', ['\\.json$']);
			expect(execa).not.toHaveBeenCalledWith('grep', ['-v', 'package\\(-lock\\)\\?\\.json$']);
			expect(execa).not.toHaveBeenCalledWith(
				'xargs',
				[
					'-I{}',
					'fixjson',
					'--write',
					'"{}"',
				],
			);
		});
	});

	describe('imagemin-lint-staged', () => {
		it('executes', async () => {
			await fix();

			expect(execa).toHaveBeenCalledWith('git', ['ls-files']);
			expect(execa).toHaveBeenCalledWith('grep', ['\\.\\(png\\|jpeg\\|jpg\\|gif\\|svg\\)$']);
			expect(execa).toHaveBeenCalledWith(
				'xargs',
				[
					'-I{}',
					'imagemin-lint-staged',
					'{}',
				],
			);
		});

		it('--no-imagemin', async () => {
			await fix('--no-imagemin');

			// expect(execa).not.toHaveBeenCalledWith('git', ['ls-files']);
			expect(execa).not.toHaveBeenCalledWith('grep', ['\\.\\(png\\|jpeg\\|jpg\\|gif\\|svg\\)$']);
			expect(execa).not.toHaveBeenCalledWith(
				'xargs',
				[
					'-I{}',
					'imagemin-lint-staged',
					'{}',
				],
			);
		});
	});
});
