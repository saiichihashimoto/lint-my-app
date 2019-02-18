import execa from 'execa';
import globby from 'globby';
import path from 'path';
import { minifyFile as imageminLint } from 'imagemin-lint-staged/lib';
import availableConfigs from './available-configs';
import fix from './lint-my-app-fix';

jest.mock('execa');
jest.mock('globby');
jest.mock('imagemin-lint-staged/lib');

describe('lint-my-app fix', () => {
	const emptyJson = path.resolve(__dirname, 'empty.json');

	beforeEach(() => {
		globby.mockImplementation(() => Promise.resolve([]));
		imageminLint.mockImplementation(() => Promise.resolve([]));
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

	describe('sort-package-json', () => {
		beforeEach(() => {
			globby.mockImplementation((pattern) => Promise.resolve(pattern === '**/package.json' ? ['package.json', 'folder/package.json'] : []));
		});

		it('executes', async () => {
			await fix();

			expect(execa).toHaveBeenCalledWith('sort-package-json', ['package.json']);
			expect(execa).toHaveBeenCalledWith('sort-package-json', ['folder/package.json']);
		});

		it('can be disabled', async () => {
			await fix({ sortPackageJson: false });

			expect(execa).not.toHaveBeenCalledWith('sort-package-json', expect.anything());
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

		it('can be disabled', async () => {
			await fix({ eslint: false });

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

		it('can be disabled', async () => {
			await fix({ stylelint: false });

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
		beforeEach(() => {
			globby.mockImplementation((pattern) => Promise.resolve(pattern === '**/!(package).json' ? ['foo.json', 'folder/bar.json'] : []));
		});

		it('executes', async () => {
			await fix();

			expect(execa).toHaveBeenCalledWith('fixjson', ['--write', 'foo.json']);
			expect(execa).toHaveBeenCalledWith('fixjson', ['--write', 'folder/bar.json']);
		});

		it('can be disabled', async () => {
			await fix({ fixjson: false });

			expect(execa).not.toHaveBeenCalledWith('fixjson', expect.anything());
		});
	});

	describe('imagemin-lint-staged', () => {
		beforeEach(() => {
			globby.mockImplementation((pattern) => Promise.resolve(pattern === '**/*.{png,jpeg,jpg,gif,svg}' ? ['foo.png', 'folder/bar.svg'] : []));
		});

		it('executes', async () => {
			await fix();

			expect(imageminLint).toHaveBeenCalledWith('foo.png');
			expect(imageminLint).toHaveBeenCalledWith('folder/bar.svg');
		});

		it('can be disabled', async () => {
			await fix({ imagemin: false });

			expect(imageminLint).not.toHaveBeenCalled();
		});
	});
});
