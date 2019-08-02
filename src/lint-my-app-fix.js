import path from 'path';

import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import { bin as eslintBins } from 'eslint/package';
import { minifyFile as imageminLint } from 'imagemin-lint-staged/lib';

import availableConfigs from './available-configs';
import listrDefaults from './listr-defaults';

export default async function fix({
	eslint = true,
	stylelint = true,
	sortPackageJson = true,
	fixjson = true,
	imagemin = true,
	dot = true,
	resolve = require.resolve,
} = {}) {
	const [
		jses,
		csses,
		scsses,
		packageJsons,
		jsons,
		images,
	] = await Promise.all([
		eslint ? globby('**/*.js', { dot, gitignore: true }) : [],
		stylelint ? globby('**/*.css', { dot, gitignore: true }) : [],
		stylelint ? globby('**/*.scss', { dot, gitignore: true }) : [],
		sortPackageJson ? globby('**/package.json', { dot, gitignore: true }) : [],
		fixjson ? globby('**/!(package|package-lock).json', { dot, gitignore: true }) : [],
		imagemin ? globby('**/*.{png,jpeg,jpg,gif,svg}', { dot, gitignore: true }) : [],
	]);

	const { eslint: { config: { extends: eslintExtends } = {} } } = availableConfigs;

	return new Listr([
		{
			title:   'eslint --fix',
			enabled: () => !eslint || jses.length,
			skip:    () => !eslint,
			task:    () => execa(path.resolve(resolve('eslint').replace(/(.*node_modules\/eslint)\/.*$/u, '$1'), eslintBins.eslint), [
				...availableConfigs.eslint ? [] : ['--config', path.resolve(__dirname, 'empty.json')],
				...eslintExtends && typeof eslintExtends === 'string'
					? ['--resolve-plugins-relative-to', resolve(`eslint-config-${eslintExtends}`).replace(new RegExp(`^(.*node_modules/eslint-config-${eslintExtends}).*$`, 'u'), '$1')]
					: [],
				...jses.some((js) => path.basename(js).startsWith('.')) ? ['--ignore-pattern', '!.*'] : [],
				'--color',
				'--report-unused-disable-directives',
				'--fix',
				...jses,
			]),
		},
		...[
			{ files: csses, args: [] },
			{ files: scsses, args: ['--syntax=scss'] },
		].map(({ files, args }) => ({
			title:   ['stylelint', '--fix', ...args].join(' '),
			enabled: () => !stylelint || files.length,
			skip:    () => !stylelint,
			task:    () => execa('stylelint', [
				...availableConfigs.stylelint ? [] : ['--config', path.resolve(__dirname, 'empty.json')],
				'--color',
				'--allow-empty-input',
				'--report-needless-disables',
				'--fix',
				...args,
				...files,
			]),
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
