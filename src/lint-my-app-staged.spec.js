import execa from 'execa';
import path from 'path';
import staged from './lint-my-app-staged';

jest.mock('execa');

describe('lint-my-app staged', () => {
	beforeEach(() => {
		execa.mockImplementation(() => Promise.resolve());
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('executes lint-staged', async () => {
		await expect(staged()).resolves;

		expect(execa).toHaveBeenCalledWith('lint-staged', ['--config', path.resolve(__dirname, 'lint-staged.config.js')], expect.anything());
	});
});
