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

	describe('eslint --fix', () => {
		it('executes', async () => {
			await fix();

			expect(execa).not.toHaveBeenCalledWith('eslint', expect.not.arrayContaining(['--ignore-path', '.gitignore']));
			expect(execa).not.toHaveBeenCalledWith('eslint', expect.not.arrayContaining(['--ignore-pattern', '\'!.*.js\'']));
			expect(execa).not.toHaveBeenCalledWith('eslint', expect.not.arrayContaining(['--color']));
			expect(execa).not.toHaveBeenCalledWith('eslint', expect.not.arrayContaining(['--report-unused-disable-directives']));
			expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['--fix', '.']));
		});

		it('can be disabled', async () => {
			await fix({ eslint: false });

			expect(execa).not.toHaveBeenCalledWith('eslint', expect.anything());
		});

		it('defaults to empty.json config', async () => {
			const valueBefore = availableConfigs.eslint;
			availableConfigs.eslint = false;

			await fix();

			expect(execa).toHaveBeenCalledWith('eslint', expect.arrayContaining(['--config', emptyJson]));

			availableConfigs.eslint = valueBefore;
		});
	});

	describe('stylelint --fix', () => {
		it('executes', async () => {
			const valueBefore = availableConfigs.stylelint;
			availableConfigs.stylelint = true;

			await fix();

			// FIXME How do I check for all four combinations?
			expect(execa).not.toHaveBeenCalledWith('stylelint', expect.not.arrayContaining(['--ignore-path', '.gitignore']));
			expect(execa).not.toHaveBeenCalledWith('stylelint', expect.not.arrayContaining(['--color']));
			expect(execa).not.toHaveBeenCalledWith('stylelint', expect.not.arrayContaining(['--allow-empty-input']));
			expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--fix', '"**/*.css"']));
			expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--fix', '"**/*.scss"', '--syntax=scss']));

			availableConfigs.stylelint = valueBefore;
		});

		it('can be disabled', async () => {
			await fix({ stylelint: false });

			expect(execa).not.toHaveBeenCalledWith('stylelint', expect.anything());
		});

		it('defaults to empty.json config', async () => {
			await fix();

			// FIXME How do I check for all four combinations?
			expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--fix', '--config', emptyJson, '"**/*.css"']));
			expect(execa).toHaveBeenCalledWith('stylelint', expect.arrayContaining(['--fix', '--config', emptyJson, '"**/*.scss"', '--syntax=scss']));
		});
	});

	describe('sort-package-json', () => {
		beforeEach(() => {
			globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve((pattern === '**/package.json' && gitignore && dot) ? ['package.json', 'folder/package.json'] : []));
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

		it('skips without package.jsons', async () => {
			globby.mockImplementation(() => Promise.resolve([]));

			await fix();

			expect(execa).not.toHaveBeenCalledWith('sort-package-json', expect.anything());
		});
	});

	describe('fixjson', () => {
		beforeEach(() => {
			globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve((pattern === '**/!(package).json' && gitignore && dot) ? ['foo.json', 'folder/bar.json'] : []));
		});

		it('executes', async () => {
			await fix();

			expect(execa).toHaveBeenCalledWith('fixjson', expect.arrayContaining(['--write', 'foo.json']));
			expect(execa).toHaveBeenCalledWith('fixjson', expect.arrayContaining(['--write', 'folder/bar.json']));
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
			globby.mockImplementation((pattern, { gitignore, dot }) => Promise.resolve((pattern === '**/*.{png,jpeg,jpg,gif,svg}' && gitignore && dot) ? ['foo.png', 'folder/bar.svg'] : []));
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

		it('skips without images', async () => {
			globby.mockImplementation(() => Promise.resolve([]));

			await fix();

			expect(imageminLint).not.toHaveBeenCalled();
		});
	});
});
