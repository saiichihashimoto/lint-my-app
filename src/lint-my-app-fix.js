import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import path from 'path';
import { minifyFile as imageminLint } from 'imagemin-lint-staged/lib';
import availableConfigs from './available-configs';
import listrDefaults from './listr-defaults';

export default async function fix({
	eslint = true,
	stylelint = true,
	sortPackageJson = true,
	fixjson = true,
	imagemin = true,
} = {}) {
	const [
		jses,
		csses,
		scsses,
		packageJsons,
		jsons,
		images,
	] = await Promise.all([
		eslint ? globby('**/*.js', { gitignore: true, dot: true }) : [],
		stylelint ? globby('**/*.css', { gitignore: true, dot: true }) : [],
		stylelint ? globby('**/*.scss', { gitignore: true, dot: true }) : [],
		sortPackageJson ? globby('**/package.json', { gitignore: true, dot: true }) : [],
		fixjson ? globby('**/!(package|package-lock).json', { gitignore: true, dot: true }) : [],
		imagemin ? globby('**/*.{png,jpeg,jpg,gif,svg}', { gitignore: true, dot: true }) : [],
	]);

	return new Listr([
		{
			title:   'eslint --fix',
			enabled: () => !eslint || jses.length,
			skip:    () => !eslint,
			task:    () => execa('eslint', [
				...(!availableConfigs.eslint ? ['--config', path.resolve(__dirname, 'empty.json')] : []),
				'--color',
				'--report-unused-disable-directives',
				'--fix',
				...jses,
			].filter(Boolean)),
		},
		...[
			{ files: csses, args: [] },
			{ files: scsses, args: ['--syntax=scss'] },
		].map(({ files, args }) => ({
			title:   ['stylelint', '--fix', ...args].join(' '),
			enabled: () => !stylelint || files.length,
			skip:    () => !stylelint,
			task:    () => new Listr([
				args,
				[...args, '--report-needless-disables'],
			].map((styleArgs) => ({
				title: ['stylelint', '--fix', ...styleArgs].join(' '),
				task:  () => execa('stylelint', [
					...(!availableConfigs.stylelint ? ['--config', path.resolve(__dirname, 'empty.json')] : []),
					'--color',
					'--allow-empty-input',
					'--fix',
					...styleArgs,
					...files,
				].filter(Boolean)),
			})), {
				...listrDefaults,
				concurrent: false,
			}),
		})),
		{
			title:   'sort-package-json',
			enabled: () => !sortPackageJson || packageJsons.length,
			skip:    () => !sortPackageJson,
			task:    () => Promise.all(packageJsons.map((packageJson) => execa('sort-package-json', [packageJson]))),
		},
		{
			title:   'fixjson',
			enabled: () => !fixjson || jsons.length,
			skip:    () => !fixjson,
			task:    () => Promise.all(jsons.map((jsonFile) => execa('fixjson', ['--write', jsonFile]))),
		},
		{
			title:   'imagemin',
			enabled: () => !imagemin || images.length,
			skip:    () => !imagemin,
			task:    () => Promise.all(images.map((image) => imageminLint(image))),
		},
	], listrDefaults)
		.run();
}
