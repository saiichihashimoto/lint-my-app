import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import path from 'path';
import { minifyFile as imageminLint } from 'imagemin-lint-staged/lib';
import availableConfigs from './available-configs';
import listrDefaults from './listr-defaults';

export const cliArgs = ['--no-sort-package-json', '--no-eslint', '--no-stylelint', '--no-fixjson', '--no-imagemin'];

export default async function fix({
	eslint = true,
	stylelint = true,
	sortPackageJson = true,
	fixjson = true,
	imagemin = true,
} = {}) {
	const packageJsons = sortPackageJson ? globby('**/package.json', { gitignore: true, dot: true }) : [];
	const jsons = fixjson ? globby('**/!(package).json', { gitignore: true, dot: true }) : [];
	const images = imagemin ? globby('**/*.{png,jpeg,jpg,gif,svg}', { gitignore: true, dot: true }) : [];

	const hasPackageJsons = (await packageJsons).length;
	const hasJsons = (await jsons).length;
	const hasImages = (await images).length;

	return new Listr([
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
			task:  () => new Listr([
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
								'--fix',
								...styleArgs,
							].filter(Boolean),
						),
					})),
					{
						...listrDefaults,
						concurrent: false,
					},
				),
			})), listrDefaults),
		},
		{
			title:   'sort-package-json',
			enabled: () => !sortPackageJson || hasPackageJsons,
			skip:    () => !sortPackageJson || !hasPackageJsons,
			task:    async () => Promise.all(
				(await packageJsons)
					.map((packageJson) => execa('sort-package-json', [packageJson])),
			),
		},
		{
			title:   'fixjson',
			enabled: () => !fixjson || hasJsons,
			skip:    () => !fixjson || !hasJsons,
			task:    async () => Promise.all(
				(await jsons)
					.map((jsonFile) => execa('fixjson', ['--write', jsonFile])),
			),
		},
		{
			title:   'imagemin',
			enabled: () => !imagemin || hasImages,
			skip:    () => !imagemin || !hasImages,
			task:    async () => Promise.all(
				(await images)
					.map((image) => imageminLint(image)),
			),
		},
	], listrDefaults)
		.run();
}
