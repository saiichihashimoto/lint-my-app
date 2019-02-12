import execa from 'execa';
import path from 'path';
import staged from './lint-my-app-staged';

jest.mock('execa');

describe('lint-my-app staged', () => {
	execa.mockImplementation(() => Promise.resolve());

	afterEach(() => {
		execa.mockClear();
	});

	it('executes lint-staged', async () => {
		await expect(staged()).resolves;

		expect(execa).toHaveBeenCalledWith(
			'lint-staged',
			[
				'--config', path.resolve(__dirname, 'lint-staged.config.js'),
			],
			{
				stdio: [process.stdin, process.stdout, process.stderr],
			},
		);
	});
});
