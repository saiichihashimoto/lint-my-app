#!/usr/bin/env node
import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import path from 'path';
import program from 'commander';
import { minifyFile as imageminLint } from 'imagemin-lint-staged/lib';
import availableConfigs from './available-configs';

async function fix({
	sortPackageJson = true,
	eslint = true,
	stylelint = true,
	fixjson = true,
	imagemin = true,
} = {}) {
	return new Listr(
		[
			{
				title: 'sort-package-json',
				skip:  () => !sortPackageJson,
				task:  async () => Promise.all(
					(await globby('**/package.json', { gitignore: true, dot: true }))
						.map((packageJson) => execa('sort-package-json', [packageJson])),
				),
			},
			{
				title: 'eslint --fix',
				skip:  () => !eslint,
				task:  () => execa(
					'eslint',
					[
						...(!availableConfigs.eslint ? ['--config', path.resolve(__dirname, 'empty.json')] : []),
						'--ignore-path', '.gitignore',
						'--ignore-pattern', '\'!.*.js\'',
						'--color',
						'--fix',
						'--report-unused-disable-directives',
						'.',
					].filter(Boolean),
				),
			},
			{
				title: 'stylelint --fix',
				skip:  () => !stylelint,
				task:  () => new Listr(
					[
						['"**/*.css"'],
						['"**/*.css"', '--report-needless-disables'],
						['"**/*.scss"', '--syntax=scss'],
						['"**/*.scss"', '--syntax=scss', '--report-needless-disables'],
					].map((styleArgs) => ({
						title: styleArgs.join(' '),
						task:  () => execa(
							'stylelint',
							[
								...(!availableConfigs.stylelint ? ['--config', path.resolve(__dirname, 'empty.json')] : []),
								'--ignore-path', '.gitignore',
								'--color',
								'--fix',
								...styleArgs,
							].filter(Boolean),
						),
					})),
					{
						renderer:    process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'default',
						exitOnError: false,
					},
				),
			},
			{
				title: 'fixjson',
				skip:  () => !fixjson,
				task:  async () => Promise.all(
					(await globby('**/!(package).json', { gitignore: true }))
						.map((jsonFile) => execa('fixjson', ['--write', jsonFile])),
				),
			},
			{
				title: 'imagemin',
				skip:  () => !imagemin,
				task:  async () => Promise.all(
					(await globby('**/*.{png,jpeg,jpg,gif,svg}', { gitignore: true }))
						.map((image) => imageminLint(image)),
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
		.option('--no-sort-package-json')
		.option('--no-eslint')
		.option('--no-stylelint')
		.option('--no-fixjson')
		.option('--no-imagemin')
		.parse(process.argv);

	fix(program)
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
export default fix;
