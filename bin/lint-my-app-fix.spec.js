const execa = require('execa');
const path = require('path');
const availableConfigs = require('./available-configs');
const fix = require('./lint-my-app-fix');

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

	it('executes all fixers', async() => {
		await fix();

		expect(execa).toHaveBeenCalledWith('sort-package-json');

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

		expect(execa).toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'--fix',
				'"**/*.css"',
			],
		);
		expect(execa).toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
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
				'--config', path.resolve(__dirname, 'empty.json'),
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
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'--fix',
				'"**/*.scss"',
				'--syntax=scss',
				'--report-needless-disables',
			],
		);

		// TODO How to check if it's been called with this twice?
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

	it('doesn\'t execute sort-package-json with --no-sort-package-json', async() => {
		await fix('--no-sort-package-json');

		expect(execa).not.toHaveBeenCalledWith('sort-package-json');
	});

	it('doesn\'t execute eslint with --no-eslint', async() => {
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

	it('doesn\'t execute stylelint with --no-stylelint', async() => {
		await fix('--no-stylelint');

		expect(execa).not.toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'--fix',
				'"**/*.css"',
			],
		);
		expect(execa).not.toHaveBeenCalledWith(
			'stylelint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
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
				'--config', path.resolve(__dirname, 'empty.json'),
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
				'--config', path.resolve(__dirname, 'empty.json'),
				'--ignore-path', '.gitignore',
				'--color',
				'--fix',
				'"**/*.scss"',
				'--syntax=scss',
				'--report-needless-disables',
			],
		);
	});

	it('doesn\'t execute fixjson with --no-fixjson', async() => {
		await fix('--no-fixjson');

		// TODO How to check if it's been called with this once?
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

	it('doesn\'t execute imagemin with --no-imagemin', async() => {
		await fix('--no-imagemin');

		// TODO How to check if it's been called with this once?
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

	it('executes eslint with empty config', async() => {
		const valueBefore = availableConfigs.eslint;
		availableConfigs.eslint = false;

		await fix();

		expect(execa).toHaveBeenCalledWith(
			'eslint',
			[
				'--config', path.resolve(__dirname, 'empty.json'),
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

	it('executes stylelint with provided config', async() => {
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
