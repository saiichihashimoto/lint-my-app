import Listr from 'listr';
import execa from 'execa';
import globby from 'globby';
import path from 'path';
import packageOk from 'pkg-ok';
import availableConfigs from './available-configs';
import listrDefaults from './listr-defaults';

export default async function lint({
	eslint = true,
	stylelint = true,
	pkgOk = true,
	jsonlint = true,
} = {}) {
	const packageJsons = pkgOk ? globby('**/package.json', { gitignore: true, dot: true }) : [];
	const jsons = jsonlint ? globby('**/!(package).json', { gitignore: true, dot: true }) : [];

	const hasPackageJsons = (await packageJsons).length;
	const hasJsons = (await jsons).length;

	return new Listr([
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
			task:  () => new Listr([
				['"**/*.css"'],
				['"**/*.scss"', '--syntax=scss'],
			].map((inputArgs) => ({
				title: inputArgs[0],
				task:  () => new Listr([
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
				})), listrDefaults),
			})), listrDefaults),
		},
		{
			title:   'pkg-ok',
			enabled: () => !pkgOk || hasPackageJsons,
			skip:    () => !pkgOk,
			task:    async () => Promise.all(
				(await packageJsons)
					.map((packageJson) => packageOk(path.resolve(path.dirname(packageJson)))),
			),
		},
		{
			title:   'jsonlint',
			enabled: () => !jsonlint || hasJsons,
			skip:    () => !jsonlint,
			task:    async () => Promise.all(
				(await jsons)
					.map((jsonFile) => execa('jsonlint', ['--quiet', jsonFile])),
			),
		},
	], listrDefaults)
		.run();
}
