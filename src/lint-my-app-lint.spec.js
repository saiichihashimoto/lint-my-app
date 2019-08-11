import path from 'path';

import execa from 'execa';
import globby from 'globby';
import pkgOk from 'pkg-ok';

import availableConfigs from './available-configs';
import lint from './lint-my-app-lint';
import listrDefaults from './listr-defaults';

jest.mock('execa');
jest.mock('globby');
jest.mock('listr');
jest.mock('pkg-ok');

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

describe('eslint', () => {
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
		await lint({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--report-unused-disable-directives']));
		expect(execa).toHaveBeenCalledWith(eslintPath, expect.not.arrayContaining(['--ignore-pattern', '!.*']));
		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['foo.js']));
		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['folder/bar.js']));
		expect(execa).toHaveBeenCalledTimes(1);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'eslint' })]), listrDefaults);
	});

	it('defaults to empty.json config', async () => {
		availableConfigs.eslint = false;

		await lint({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--config', emptyJson]));
	});

	it('resolves plugins relative to a singular extends', async () => {
		const previousResolve = resolve;
		resolve = (modulePath) => previousResolve(modulePath) || (modulePath === 'eslint-config-foobar' ? '/a/path/to/node_modules/eslint-config-foobar/path/to/config.js' : '');
		availableConfigs.eslint = {
			config: { extends: 'foobar' },
		};

		await lint({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--resolve-plugins-relative-to', '/a/path/to/node_modules/eslint-config-foobar']));
	});

	it('doesn\'t resolve plugins relative to a plural extends', async () => {
		const previousResolve = resolve;
		resolve = (modulePath) => previousResolve(modulePath) || (modulePath === 'eslint-config-foobar' ? '/a/path/to/node_modules/eslint-config-foobar/path/to/config.js' : '');
		availableConfigs.eslint = {
			config: { extends: ['foobar'] },
		};

		await lint({ resolve });

		expect(execa).not.toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--resolve-plugins-relative-to']));
	});

	it('can be disabled', async () => {
		await lint({ resolve, eslint: false });

		expect(execa).not.toHaveBeenCalledWith(eslintPath, expect.anything());
	});

	it('skips without jses', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await lint({ resolve });

		expect(execa).not.toHaveBeenCalledWith(eslintPath, expect.anything());
	});

	it('adds negated ignore-pattern for dotfiles', async () => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.js' && gitignore && dot ? ['.foo.js'] : []));

		await lint({ resolve });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.arrayContaining(['--ignore-pattern', '!.*']));
		expect(execa).toHaveBeenCalledTimes(1);
	});

	it('adds negated ignore-pattern for dotfiles in a folder', async () => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.js' && gitignore && dot ? ['folder/.foo.js'] : []));

		await lint({ resolve });

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

		await lint({ resolve, dot: false });

		expect(execa).toHaveBeenCalledWith(eslintPath, expect.not.arrayContaining(['--ignore-pattern', '!.*']));
	});
});

describe('stylelint', () => {
	const configBefore = availableConfigs.stylelint;

	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.css' && gitignore && dot ? ['foo.css', 'folder/bar.css'] : []));
	});

	afterEach(() => {
		availableConfigs.stylelint = configBefore;
	});

	it('executes', async () => {
		availableConfigs.stylelint = true;

		await lint();

		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--allow-empty-input']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.not.arrayContaining(['--report-needless-disables']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['foo.css']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['folder/bar.css']));
		expect(execa).toHaveBeenCalledTimes(1);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'stylelint' })]), listrDefaults);
	});

	it('defaults to empty.json config', async () => {
		await lint();

		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--config', emptyJson]));
	});

	it('can be disabled', async () => {
		await lint({ stylelint: false });

		expect(execa).not.toHaveBeenCalledWith('stylelint', expect.arrayContaining([]));
	});

	it('skips without csses', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await lint();

		expect(execa).not.toHaveBeenCalledWith('stylelint', expect.arrayContaining([]));
	});
});

describe('stylelint --syntax=scss', () => {
	const configBefore = availableConfigs.stylelint;

	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/*.scss' && gitignore && dot ? ['foo.scss', 'folder/bar.scss'] : []));
	});

	afterEach(() => {
		availableConfigs.stylelint = configBefore;
	});

	it('executes', async () => {
		availableConfigs.stylelint = true;

		await lint();

		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--allow-empty-input']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.not.arrayContaining(['--report-needless-disables']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--syntax=scss']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['foo.scss']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['folder/bar.scss']));
		expect(execa).toHaveBeenCalledTimes(1);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'stylelint --syntax=scss' })]), listrDefaults);
	});

	it('defaults to empty.json config', async () => {
		await lint();

		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--config', emptyJson, '--syntax=scss']));
	});

	it('can be disabled', async () => {
		await lint({ stylelint: false });

		expect(execa).not.toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--syntax=scss']));
	});

	it('skips without scsses', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await lint();

		expect(execa).not.toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--syntax=scss']));
	});
});

describe('pkg-ok', () => {
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/package.json' && gitignore && dot ? ['package.json', 'folder/package.json'] : []));
	});

	it('executes', async () => {
		await lint();

		expect(pkgOk).toHaveBeenCalledWith(process.cwd());
		expect(pkgOk).toHaveBeenCalledWith(`${process.cwd()}/folder`);
		expect(pkgOk).toHaveBeenCalledTimes(2);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'pkg-ok' })]), listrDefaults);
	});

	it('can be disabled', async () => {
		await lint({ pkgOk: false });

		expect(pkgOk).not.toHaveBeenCalled();
	});

	it('skips without package.jsons', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await lint();

		expect(pkgOk).not.toHaveBeenCalled();
	});
});

describe('jsonlint', () => {
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve(pattern === '**/!(package|package-lock).json' && gitignore && dot ? ['foo.json', 'folder/bar.json'] : []));
	});

	it('executes', async () => {
		await lint();

		expect(execa).toHaveBeenCalledWith('jsonlint', expect.arrayContaining(['--quiet']));
		expect(execa).toHaveBeenCalledWith('jsonlint', expect.arrayContaining(['foo.json']));
		expect(execa).toHaveBeenCalledWith('jsonlint', expect.arrayContaining(['folder/bar.json']));
		expect(execa).toHaveBeenCalledTimes(2);
		expect(mockListr).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: 'jsonlint' })]), listrDefaults);
	});

	it('can be disabled', async () => {
		await lint({ jsonlint: false });

		expect(execa).not.toHaveBeenCalledWith('jsonlint', expect.anything());
	});

	it('skips without jsons', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await lint();

		expect(execa).not.toHaveBeenCalledWith('jsonlint', expect.anything());
	});
});
