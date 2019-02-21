#!/usr/bin/env node
import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import path from 'path';
import packageOk from 'pkg-ok';
import program from 'commander';
import availableConfigs from './available-configs';

function lint({ pkgOk = true, eslint = true, stylelint = true, jsonlint = true } = {}) {
	const packageJsons = globby('**/package.json', { gitignore: true, dot: true });
	const jsons = globby('**/!(package).json', { gitignore: true });

	return new Listr(
		[
			{
				title: 'eslint',
				skip:  () => !eslint,
				task:  () => execa(
					'eslint',
					[
						...(!availableConfigs.eslint ? ['--config', path.resolve(__dirname, 'empty.json')] : []),
						'--ignore-path', '.gitignore',
						'--ignore-pattern', '\'!.*.js\'',
						'--color',
						'--report-unused-disable-directives',
						'.',
					].filter(Boolean),
				),
			},
			...[
				['"**/*.css"'],
				['"**/*.scss"', '--syntax=scss'],
			].map((inputArgs) => ({
				title: `stylelint ${inputArgs[0]}`,
				skip:  () => !stylelint,
				task:  () => new Listr(
					[
						inputArgs,
						[...inputArgs, '--report-needless-disables'],
					].map((styleArgs) => ({
						title: styleArgs.join(' '),
						task:  () => execa(
							'stylelint',
							[
								...(!availableConfigs.stylelint ? ['--config', path.resolve(__dirname, 'empty.json')] : []),
								'--ignore-path', '.gitignore',
								'--color',
								...styleArgs,
							].filter(Boolean),
						),
					})),
					{
						renderer:    process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'default',
						exitOnError: false,
					},
				),
			})),
			{
				title: 'pkg-ok',
				skip:  async () => !pkgOk || !(await packageJsons).length,
				task:  async () => Promise.all(
					(await packageJsons)
						.map((packageJson) => packageOk(path.resolve(path.dirname(packageJson)))),
				),
			},
			{
				title: 'jsonlint',
				skip:  async () => !jsonlint || !(await jsons).length,
				task:  async () => Promise.all(
					(await jsons)
						.map((jsonFile) => execa('jsonlint', ['--quiet', jsonFile])),
				),
			},
		],
		{
			renderer:    process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'default',
			exitOnError: false,
			concurrent:  true,
		},
	)
		.run();
}

/* istanbul ignore next line */
if (require.main === module) {
	program
		.option('--no-pkg-ok')
		.option('--no-eslint')
		.option('--no-stylelint')
		.option('--no-jsonlint')
		.parse(process.argv);

	lint(program)
		.catch((err) => {
			const { errors = [] } = err;
			errors
				.filter(({ stdout }) => stdout)
				.forEach(({ stdout }) => console.log(stdout)); // eslint-disable-line no-console
			errors
				.filter(({ stderr }) => stderr)
				.forEach(({ stderr }) => console.error(stderr)); // eslint-disable-line no-console

			process.exit(1);
		});
}
export default lint;
