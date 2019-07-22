import path from 'path';

import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import packageOk from 'pkg-ok';

import availableConfigs from './available-configs';
import listrDefaults from './listr-defaults';

export default async function lint({
	eslint = true,
	stylelint = true,
	pkgOk = true,
	jsonlint = true,
	dot = true,
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

	return new Listr([
		{
			title:   'eslint',
			enabled: () => !eslint || jses.length,
			skip:    () => !eslint,
			task:    () => execa('eslint', [
				...availableConfigs.eslint ? [] : ['--config', path.resolve(__dirname, 'empty.json')],
				...jses.some((js) => path.basename(js).startsWith('.')) ? ['--ignore-pattern', '\'!.*\''] : [],
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
			task:    () => Promise.all(
				packageJsons.map(
					(packageJson) => packageOk(path.resolve(path.dirname(packageJson)))
				)
			),
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
