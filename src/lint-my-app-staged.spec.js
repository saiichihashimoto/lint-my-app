import path from 'path';

import lintStaged from 'lint-staged/src';

import staged from './lint-my-app-staged';

jest.mock('lint-staged/src');

beforeEach(() => {
	lintStaged.mockImplementation(() => Promise.resolve(true));
});

afterEach(() => {
	jest.resetAllMocks();
});

it('executes lint-staged', async () => {
	await staged();

	expect(lintStaged).toHaveBeenCalledWith(expect.objectContaining({ configPath: path.resolve(__dirname, 'lint-staged.config.js') }));
});

it('resolves', () => expect(staged()).resolves.toBe(true));

it('rejects if staged fails', async () => {
	lintStaged.mockImplementation(() => Promise.resolve(false));

	await expect(staged()).rejects.toThrow('lint-staged failed');
});
