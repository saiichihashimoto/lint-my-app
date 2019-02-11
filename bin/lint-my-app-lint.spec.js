const execa = require('execa');
const path = require('path');
const availableConfigs = require('./available-configs');
const lint = require('./lint-my-app-lint');

jest.mock('execa');

describe('lint-my-app lint', () => {
	execa.mockImplementation(() => {
		const promise = Promise.resolve();
		promise.stdin = jest.fn();
		promise.stdout = { pipe: jest.fn() };
		return promise;
	});

	beforeEach(() => {
		execa.mockClear();
	});

	it('executes all linters', async () => {
		await lint();

		expect(execa).toHaveBeenCalledWith('pkg-ok');

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

		expect(execa).toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'"**/*.css"',
			],
		);
		expect(execa).toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'"**/*.css"',
				'--report-needless-disables',
			],
		);
		expect(execa).toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'"**/*.scss"',
				'--syntax=scss',
			],
		);
		expect(execa).toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'"**/*.scss"',
				'--syntax=scss',
				'--report-needless-disables',
			],
		);

		expect(execa).toHaveBeenCalledWith('git', ['ls-files']);
		expect(execa).toHaveBeenCalledWith('grep', ['\\.json$']);
		expect(execa).toHaveBeenCalledWith('grep', ['-v', 'package\\(-lock\\)\\?\\.json$']);
		expect(execa).toHaveBeenCalledWith(
			'xargs',
			[
				'-I{}',
				'jsonlint',
				'--quiet',
				'"{}"',
			],
		);
	});

	it('doesn\'t execute pkg-ok with --no-pkg-ok', async () => {
		await lint('--no-pkg-ok');

		expect(execa).not.toHaveBeenCalledWith('pkg-ok');
	});

	it('doesn\'t execute eslint with --no-eslint', async () => {
		await lint('--no-eslint');

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

	it('doesn\'t execute stylelint with --no-stylelint', async () => {
		await lint('--no-stylelint');

		expect(execa).not.toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'"**/*.css"',
			],
		);
		expect(execa).not.toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'"**/*.css"',
				'--report-needless-disables',
			],
		);
		expect(execa).not.toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'"**/*.scss"',
				'--syntax=scss',
			],
		);
		expect(execa).not.toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'"**/*.scss"',
				'--syntax=scss',
				'--report-needless-disables',
			],
		);
	});

	it('doesn\'t execute jsonlint with --no-jsonlint', async () => {
		await lint('--no-jsonlint');

		expect(execa).not.toHaveBeenCalledWith('git', ['ls-files']);
		expect(execa).not.toHaveBeenCalledWith('grep', ['\\.json$']);
		expect(execa).not.toHaveBeenCalledWith('grep', ['-v', 'package\\(-lock\\)\\?\\.json$']);
		expect(execa).not.toHaveBeenCalledWith(
			'xargs',
			[
				'-I{}',
				'jsonlint',
				'--quiet',
				'"{}"',
			],
		);
	});

	it('executes eslint with empty config', async () => {
		const valueBefore = availableConfigs.eslint;
		availableConfigs.eslint = false;

		await lint();

		expect(execa).toHaveBeenCalledWith(
			'eslint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--ignore-pattern', '\'!.*.js\'',
				'--color',
				'--report-unused-disable-directives',
				'.',
			],
		);

		availableConfigs.eslint = valueBefore;
	});

	it('executes stylelint with provided config', async () => {
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
