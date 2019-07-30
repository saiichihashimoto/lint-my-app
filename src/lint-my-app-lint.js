import path from 'path';

import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import packageOk from 'pkg-ok';
import { bin as eslintBins } from 'eslint/package';

import availableConfigs from './available-configs';
import listrDefaults from './listr-defaults';

const parentDir = (file) => path.resolve(path.dirname(file));

export default async function lint({
	eslint = true,
	stylelint = true,
	pkgOk = true,
	jsonlint = true,
	dot = true,
	resolve = require.resolve,
} = {}) {
	const [
		jses,
		csses,
		scsses,
		packageJsons,
		jsons,
	] = await Promise.all([
		eslint ? globby('**/*.js', { dot, gitignore: true }) : [],
		stylelint ? globby('**/*.css', { dot, gitignore: true }) : [],
		stylelint ? globby('**/*.scss', { dot, gitignore: true }) : [],
		pkgOk ? globby('**/package.json', { dot, gitignore: true }) : [],
		jsonlint ? globby('**/!(package|package-lock).json', { dot, gitignore: true }) : [],
	]);

	const { eslint: { config: { extends: eslintExtends } = {} } = {} } = availableConfigs;

	return new Listr([
		{
			title:   'eslint',
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
				...jses,
			].filter(Boolean)),
		},
		...[
			{ files: csses, args: [] },
			{ files: scsses, args: ['--syntax=scss'] },
		].map(({ files, args }) => ({
			title:   ['stylelint', ...args].join(' '),
			enabled: () => !stylelint || files.length,
			skip:    () => !stylelint,
			task:    () => new Listr([
				args,
				[...args, '--report-needless-disables'],
			].map((styleArgs) => ({
				title: ['stylelint', ...styleArgs].join(' '),
				task:  () => execa('stylelint', [
					...availableConfigs.stylelint ? [] : ['--config', path.resolve(__dirname, 'empty.json')],
					'--color',
					'--allow-empty-input',
					...styleArgs,
					...files,
				].filter(Boolean)),
			})), listrDefaults),
		})),
		{
			title:   'pkg-ok',
			enabled: () => !pkgOk || packageJsons.length,
			skip:    () => !pkgOk,
			task:    () => Promise.all(packageJsons.map((file) => packageOk(parentDir(file)))),
		},
		{
			title:   'jsonlint',
			enabled: () => !jsonlint || jsons.length,
			skip:    () => !jsonlint,
			task:    () => Promise.all(jsons.map((jsonFile) => execa('jsonlint', ['--quiet', jsonFile]))),
		},
	], listrDefaults)
		.run();
}
