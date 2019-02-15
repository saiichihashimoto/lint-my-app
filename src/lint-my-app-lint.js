#!/usr/bin/env node
import Listr from 'listr';
import execa from 'execa';
import path from 'path';
import program from 'commander';
import availableConfigs from './available-configs';

function lint({ pkgOk = true, eslint = true, stylelint = true, jsonlint = true } = {}) {
	return new Listr(
		[
			{
				title: 'pkg-ok',
				skip:  () => !pkgOk,
				task:  () => execa('pkg-ok'),
			},
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
				title: 'jsonlint',
				skip:  () => !jsonlint,
				task:  () => {
					const gitLs = execa('git', ['ls-files']);
					const grepJson = execa('grep', ['\\.json$']);
					const noPackage = execa('grep', ['-v', 'package\\(-lock\\)\\?\\.json$']);
					const xargsJsonlint = execa(
						'xargs',
						[
							'-I{}',
							'jsonlint',
							'--quiet',
							'"{}"',
						],
					);

					gitLs.stdout.pipe(grepJson.stdin);
					grepJson.stdout.pipe(noPackage.stdin);
					noPackage.stdout.pipe(xargsJsonlint.stdin);

					return xargsJsonlint;
				},
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

			process.exit((errors.find(({ code }) => code) || {}).code || 1);
		});
}
export default lint;
