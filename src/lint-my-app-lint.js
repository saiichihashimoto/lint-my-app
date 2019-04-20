#!/usr/bin/env node
import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import path from 'path';
import packageOk from 'pkg-ok';
import program from 'commander';
import availableConfigs from './available-configs';

async function lint({ eslint = true, stylelint = true, pkgOk = true, jsonlint = true } = {}) {
	const packageJsons = pkgOk ? globby('**/package.json', { gitignore: true, dot: true }) : [];
	const jsons = jsonlint ? globby('**/!(package).json', { gitignore: true, dot: true }) : [];

	const hasPackageJsons = (await packageJsons).length;
	const hasJsons = (await jsons).length;

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
			{
				title: 'stylelint',
				skip:  () => !stylelint,
				task:  () => new Listr(
					[
						['"**/*.css"'],
						['"**/*.scss"', '--syntax=scss'],
					].map((inputArgs) => ({
						title: inputArgs[0],
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
										'--allow-empty-input',
										...styleArgs,
									].filter(Boolean),
								),
							})),
							{
								renderer:    process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'default',
								exitOnError: false,
								concurrent:  true,
							},
						),
					})),
					{
						renderer:    process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'default',
						exitOnError: false,
						concurrent:  true,
					},
				),
			},
			{
				title:   'pkg-ok',
				enabled: () => !pkgOk || hasPackageJsons,
				skip:    () => !pkgOk || !hasPackageJsons,
				task:    async () => Promise.all(
					(await packageJsons)
						.map((packageJson) => packageOk(path.resolve(path.dirname(packageJson)))),
				),
			},
			{
				title:   'jsonlint',
				enabled: () => !jsonlint || hasJsons,
				skip:    () => !jsonlint || !hasJsons,
				task:    async () => Promise.all(
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
		.catch((err) => { // eslint-disable-line promise/prefer-await-to-callbacks
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
