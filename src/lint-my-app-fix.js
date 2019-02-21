#!/usr/bin/env node
import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import path from 'path';
import program from 'commander';
import { minifyFile as imageminLint } from 'imagemin-lint-staged/lib';
import availableConfigs from './available-configs';

function fix({
	sortPackageJson = true,
	eslint = true,
	stylelint = true,
	fixjson = true,
	imagemin = true,
} = {}) {
	const packageJsons = globby('**/package.json', { gitignore: true, dot: true });
	const jsons = globby('**/!(package).json', { gitignore: true });
	const images = globby('**/*.{png,jpeg,jpg,gif,svg}', { gitignore: true });

	return new Listr(
		[
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
			...[
				['"**/*.css"'],
				['"**/*.scss"', '--syntax=scss'],
			].map((inputArgs) => ({
				title: `stylelint --fix ${inputArgs[0]}`,
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
			})),
			{
				title: 'sort-package-json',
				skip:  async () => !sortPackageJson || !(await packageJsons).length,
				task:  async () => Promise.all(
					(await packageJsons)
						.map((packageJson) => execa('sort-package-json', [packageJson])),
				),
			},
			{
				title: 'fixjson',
				skip:  async () => !fixjson || !(await jsons).length,
				task:  async () => Promise.all(
					(await jsons)
						.map((jsonFile) => execa('fixjson', ['--write', jsonFile])),
				),
			},
			{
				title: 'imagemin',
				skip:  async () => !imagemin || !(await images).length,
				task:  async () => Promise.all(
					(await images)
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
export default fix;
