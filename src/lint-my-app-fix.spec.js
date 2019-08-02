import path from 'path';

import execa from 'execa';
import globby from 'globby';
import { minifyFile as imageminLint } from 'imagemin-lint-staged/lib';

import availableConfigs from './available-configs';
import fix from './lint-my-app-fix';
import listrDefaults from './listr-defaults';

jest.mock('execa');
jest.mock('globby');
jest.mock('imagemin-lint-staged/lib');
jest.mock('listr');

const mockListr = jest.fn();
jest.mock('listr', () => {
	const Listr = jest.requireActual('listr');

	return class extends Listr {
		constructor(...args) {
			mockListr(...args);
			super(...args);
		}
	};
});

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

describe('eslint --fix', () => {
	const configBefore = availableConfigs.eslint;
	const eslintPath = '/a/path/to/node_modules/eslint/bin/eslint.js';
	let resolve = (modulePath) => (modulePath === 'eslint' ? '/a/path/to/node_modules/eslint/lib/api.js' : '');

	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.js' && gitignore && dot ? ['foo.js', 'folder/bar.js'] : []));
	});

	afterEach(() => {
		availableConfigs.eslint = configBefore;
	});

	it('executes', async () => {
		await fix({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--report-unused-disable-directives']));
		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--fix']));
		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['foo.js']));
		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['folder/bar.js']));
		expect(execa).toHaveBeenCalledTimes(1);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'eslint --fix' })]), listrDefaults);
	});

	it('defaults to empty.json config', async () => {
		availableConfigs.eslint = false;

		await fix({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--config', emptyJson]));
	});

	it('resolves plugins relative to a singular extends', async () => {
		const previousResolve = resolve;
		resolve = (modulePath) => previousResolve(modulePath) || (modulePath === 'eslint-config-foobar' ? '/a/path/to/node_modules/eslint-config-foobar/path/to/config.js' : '');
		availableConfigs.eslint = {
			config: { extends: 'foobar' },
		};

		await fix({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--resolve-plugins-relative-to', '/a/path/to/node_modules/eslint-config-foobar']));
	});

	it('doesn\'t resolve plugins relative to a plural extends', async () => {
		const previousResolve = resolve;
		resolve = (modulePath) => previousResolve(modulePath) || (modulePath === 'eslint-config-foobar' ? '/a/path/to/node_modules/eslint-config-foobar/path/to/config.js' : '');
		availableConfigs.eslint = {
			config: { extends: ['foobar'] },
		};

		await fix({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.not.arrayContaining(['--resolve-plugins-relative-to', '/a/path/to/node_modules/eslint-config-foobar']));
	});

	it('can be disabled', async () => {
		await fix({ resolve, eslint: false });

		expect(execa).not.toHaveBeenCalledWith(eslintPath, expect.anything());
	});

	it('skips without jses', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await fix({ resolve });

		expect(execa).not.toHaveBeenCalledWith(eslintPath, expect.anything());
	});

	it('adds negated ignore-pattern for dotfiles', async () => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.js' && gitignore && dot ? ['.foo.js'] : []));

		await fix({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--ignore-pattern', '!.*']));
		expect(execa).toHaveBeenCalledTimes(1);
	});

	it('adds negated ignore-pattern for dotfiles in a folder', async () => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.js' && gitignore && dot ? ['folder/.foo.js'] : []));

		await fix({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--ignore-pattern', '!.*']));
		expect(execa).toHaveBeenCalledTimes(1);
	});

	it('ignores dotfiles', async () => {
		globby.mockImplementation((pattern, { gitignore, dot }) => {
			if (pattern !== '**/*.js' || !gitignore) {
				return Promise.resolve([]);
			}

			return Promise.resolve(dot ? ['.foo.js', 'bar.js'] : ['bar.js']);
		});

		await fix({ resolve, dot: false });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.not.arrayContaining(['--ignore-pattern', '!.*']));
	});
});

describe('stylelint --fix', () => {
	const configBefore = availableConfigs.stylelint;

	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.css' && gitignore && dot ? ['foo.css', 'folder/bar.css'] : []));
	});

	afterEach(() => {
		availableConfigs.stylelint = configBefore;
	});

	it('executes', async () => {
		availableConfigs.stylelint = true;

		await fix();

		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--allow-empty-input']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--report-needless-disables']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--fix']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['foo.css']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['folder/bar.css']));
		expect(execa).toHaveBeenCalledTimes(1);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'stylelint --fix' })]), listrDefaults);
	});

	it('defaults to empty.json config', async () => {
		await fix();

		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--config', emptyJson]));
	});

	it('can be disabled', async () => {
		await fix({ stylelint: false });

		expect(execa).not.toHaveBeenCalledWith('stylelint', expect.arrayContaining([]));
	});

	it('skips without csses', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await fix();

		expect(execa).not.toHaveBeenCalledWith('stylelint', expect.arrayContaining([]));
	});
});

describe('stylelint --fix --syntax=scss', () => {
	const configBefore = availableConfigs.stylelint;

	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.scss' && gitignore && dot ? ['foo.scss', 'folder/bar.scss'] : []));
	});

	afterEach(() => {
		availableConfigs.stylelint = configBefore;
	});

	it('executes', async () => {
		availableConfigs.stylelint = true;

		await fix();

		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--allow-empty-input']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--report-needless-disables']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--fix']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--syntax=scss']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['foo.scss']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['folder/bar.scss']));
		expect(execa).toHaveBeenCalledTimes(1);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'stylelint --fix --syntax=scss' })]), listrDefaults);
	});

	it('defaults to empty.json config', async () => {
		await fix();

		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--config', emptyJson, '--syntax=scss']));
	});

	it('can be disabled', async () => {
		await fix({ stylelint: false });

		expect(execa).not.toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--syntax=scss']));
	});

	it('skips without scsses', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await fix();

		expect(execa).not.toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--syntax=scss']));
	});
});

describe('sort-package-json', () => {
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/package.json' && gitignore && dot ? ['package.json', 'folder/package.json'] : []));
	});

	it('executes', async () => {
		await fix();

		expect(execa).toHaveBeenCalledWith('sort-package-json', ['package.json']);
		expect(execa).toHaveBeenCalledWith('sort-package-json', ['folder/package.json']);
		expect(execa).toHaveBeenCalledTimes(2);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'sort-package-json' })]), listrDefaults);
	});

	it('can be disabled', async () => {
		await fix({ sortPackageJson: false });

		expect(execa).not.toHaveBeenCalledWith('sort-package-json', expect.anything());
	});

	it('skips without package.jsons', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await fix();

		expect(execa).not.toHaveBeenCalledWith('sort-package-json', expect.anything());
	});
});

describe('fixjson', () => {
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/!(package|package-lock).json' && gitignore && dot ? ['foo.json', 'folder/bar.json'] : []));
	});

	it('executes', async () => {
		await fix();

		expect(execa).toHaveBeenCalledWith('fixjson', expect.arrayContaining(['--write', 'foo.json']));
		expect(execa).toHaveBeenCalledWith('fixjson', expect.arrayContaining(['--write', 'folder/bar.json']));
		expect(execa).toHaveBeenCalledTimes(2);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'fixjson' })]), listrDefaults);
	});

	it('can be disabled', async () => {
		await fix({ fixjson: false });

		expect(execa).not.toHaveBeenCalledWith('fixjson', expect.anything());
	});

	it('skips without jsons', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await fix();

		expect(execa).not.toHaveBeenCalledWith('fixjson', expect.anything());
	});
});

describe('imagemin-lint-staged', () => {
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.{png,jpeg,jpg,gif,svg}' && gitignore && dot ? ['foo.png', 'folder/bar.svg'] : []));
	});

	it('executes', async () => {
		await fix();

		expect(imageminLint).toHaveBeenCalledWith('foo.png');
		expect(imageminLint).toHaveBeenCalledWith('folder/bar.svg');
		expect(imageminLint).toHaveBeenCalledTimes(2);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'imagemin' })]), listrDefaults);
	});

	it('can be disabled', async () => {
		await fix({ imagemin: false });

		expect(imageminLint).not.toHaveBeenCalled();
	});

	it('skips without images', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await fix();

		expect(imageminLint).not.toHaveBeenCalled();
	});
});
