const execa = require('execa');
const path = require('path');
const staged = require('./lint-my-app-staged');

jest.mock('execa');

describe('lint-my-app', () => {
	execa.mockImplementation(() => Promise.resolve());

	beforeEach(() => {
		execa.mockClear();
	});

	it('executes lint-staged', async() => {
		await expect(staged()).resolves;

		expect(execa).toHaveBeenCalledWith(
			'lint-staged',
			[
				'--config', path.resolve(__dirname, '../lint-staged.config.js'),
			],
			{
				stdio: [process.stdin, process.stdout, process.stderr],
			},
		);
	});
});
