import lintStaged from 'lint-staged/src';
import path from 'path';
import staged from './lint-my-app-staged';

jest.mock('lint-staged/src');

describe('lint-my-app staged', () => {
	beforeEach(() => {
		lintStaged.mockImplementation(() => Promise.resolve());
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('executes lint-staged', async () => {
		await expect(staged()).resolves;

		expect(lintStaged).toHaveBeenCalledWith(console, path.resolve(__dirname, 'lint-staged.config.js'));
	});
});
