import execa from 'execa';
import globby from 'globby';
import path from 'path';
import pkgOk from 'pkg-ok';
import availableConfigs from './available-configs';
import lint from './lint-my-app-lint';

jest.mock('execa');
jest.mock('globby');
jest.mock('pkg-ok');

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
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve((pattern === '**/*.js' && gitignore && dot) ? ['foo.js', 'folder/bar.js'] : []));
	});

	it('executes', async () => {
		await lint();

		expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['--report-unused-disable-directives']));
		expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['foo.js']));
		expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['folder/bar.js']));
		expect(execa).toHaveBeenCalledTimes(1);
	});

	it('defaults to empty.json config', async () => {
		const valueBefore = availableConfigs.eslint;
		availableConfigs.eslint = false;

		await lint();

		expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['--config', emptyJson]));

		availableConfigs.eslint = valueBefore;
	});

	it('can be disabled', async () => {
		await lint({ eslint: false });

		expect(execa).not.toHaveBeenCalledWith('eslint', expect.anything());
	});

	it('skips without jses', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await lint();

		expect(execa).not.toHaveBeenCalledWith('eslint', expect.anything());
	});
});

describe('stylelint', () => {
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve((pattern === '**/*.css' && gitignore && dot) ? ['foo.css', 'folder/bar.css'] : []));
	});

	it('executes', async () => {
		const valueBefore = availableConfigs.stylelint;
		availableConfigs.stylelint = true;

		await lint();

		// FIXME How do I check for all four combinations?
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--allow-empty-input']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--report-needless-disables']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['foo.css']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['folder/bar.css']));
		expect(execa).toHaveBeenCalledTimes(2);

		availableConfigs.stylelint = valueBefore;
	});

	it('defaults to empty.json config', async () => {
		await lint();

		// FIXME How do I check for all four combinations?
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
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve((pattern === '**/*.scss' && gitignore && dot) ? ['foo.scss', 'folder/bar.scss'] : []));
	});

	it('executes', async () => {
		const valueBefore = availableConfigs.stylelint;
		availableConfigs.stylelint = true;

		await lint();

		// FIXME How do I check for all four combinations?
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--color']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--allow-empty-input']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--report-needless-disables']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--syntax=scss']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['foo.scss']));
		expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['folder/bar.scss']));
		expect(execa).toHaveBeenCalledTimes(2);

		availableConfigs.stylelint = valueBefore;
	});

	it('defaults to empty.json config', async () => {
		await lint();

		// FIXME How do I check for all four combinations?
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
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve((pattern === '**/package.json' && gitignore && dot) ? ['package.json', 'folder/package.json'] : []));
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

	it('skips without package.jsons', async () => {
		globby.mockImplementation(() => Promise.resolve([]));

		await lint();

		expect(pkgOk).not.toHaveBeenCalled();
	});
});

describe('jsonlint', () => {
	beforeEach(() => {
		globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve((pattern === '**/!(package).json' && gitignore && dot) ? ['foo.json', 'folder/bar.json'] : []));
	});

	it('executes', async () => {
		await lint();

		expect(execa).toHaveBeenCalledWith('jsonlint', expect.arrayContaining(['--quiet']));
		expect(execa).toHaveBeenCalledWith('jsonlint', expect.arrayContaining(['foo.json']));
		expect(execa).toHaveBeenCalledWith('jsonlint', expect.arrayContaining(['folder/bar.json']));
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
