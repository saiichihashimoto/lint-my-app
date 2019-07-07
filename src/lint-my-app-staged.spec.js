import lintStaged from 'lint-staged/src';
import path from 'path';
import staged from './lint-my-app-staged';

jest.mock('lint-staged/src');

describe('lint-my-app staged', () => {
	beforeEach(() => {
		lintStaged.mockImplementation(() => Promise.resolve(true));
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('executes lint-staged', async () => {
		await expect(staged()).resolves;

		expect(lintStaged).toHaveBeenCalledWith(expect.objectContaining({ configPath: path.resolve(__dirname, 'lint-staged.config.js') }));
	});

	it('resolves', () => expect(staged()).resolves.toBe(true));

	it('rejects if staged fails', () => {
		lintStaged.mockImplementation(() => Promise.resolve(false));

		return expect(staged()).rejects.toThrow('Staged Failed');
	});
});
