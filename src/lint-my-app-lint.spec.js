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

	describe('eslint', () => {
		it('executes', async () => {
			await lint();

			expect(execa).not.toHaveBeenCalledWith('eslint', expect.not.arrayContaining(['--ignore-path', '.gitignore']));
			expect(execa).not.toHaveBeenCalledWith('eslint', expect.not.arrayContaining(['--ignore-pattern', '\'!.*.js\'']));
			expect(execa).not.toHaveBeenCalledWith('eslint', expect.not.arrayContaining(['--color']));
			expect(execa).not.toHaveBeenCalledWith('eslint', expect.not.arrayContaining(['--report-unused-disable-directives']));
			expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['.']));
		});

		it('can be disabled', async () => {
			await lint({ eslint: false });

			expect(execa).not.toHaveBeenCalledWith('eslint', expect.anything());
		});

		it('defaults to empty.json config', async () => {
			const valueBefore = availableConfigs.eslint;
			availableConfigs.eslint = false;

			await lint();

			expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['--config', emptyJson]));

			availableConfigs.eslint = valueBefore;
		});
	});

	describe('stylelint', () => {
		it('executes', async () => {
			const valueBefore = availableConfigs.stylelint;
			availableConfigs.stylelint = true;

			await lint();

			// FIXME How do I check for all four combinations?
			expect(execa).not.toHaveBeenCalledWith('stylelint', expect.not.arrayContaining(['--ignore-path', '.gitignore']));
			expect(execa).not.toHaveBeenCalledWith('stylelint', expect.not.arrayContaining(['--color']));
			expect(execa).not.toHaveBeenCalledWith('stylelint', expect.not.arrayContaining(['--allow-empty-input']));
			expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['"**/*.css"']));
			expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['"**/*.scss"', '--syntax=scss']));

			availableConfigs.stylelint = valueBefore;
		});

		it('can be disabled', async () => {
			await lint({ stylelint: false });

			expect(execa).not.toHaveBeenCalledWith('stylelint', expect.anything());
		});

		it('defaults to empty.json config', async () => {
			await lint();

			// FIXME How do I check for all four combinations?
			expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--config', emptyJson, '"**/*.css"']));
			expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--config', emptyJson, '"**/*.scss"', '--syntax=scss']));
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

			expect(execa).not.toHaveBeenCalledWith('jsonlint', expect.not.arrayContaining(['--quiet']));
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
});
