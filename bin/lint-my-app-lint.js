#!/usr/bin/env node
const Listr = require('listr');
const execa = require('execa');
const path = require('path');
const program = require('commander');
const availableConfigs = require('./available-configs');

program
	.option('--no-pkg-ok')
	.option('--no-eslint')
	.option('--no-stylelint')
	.option('--no-jsonlint')
	.action(
		({ pkgOk, eslint, stylelint, jsonlint }) => new Listr(
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
						].map((args) => ({
							title: args.join(' '),
							task:  () => execa(
								'stylelint',
								[
									...(!availableConfigs.stylelint ? ['--config', path.resolve(__dirname, 'empty.json')] : []),
									'--ignore-path', '.gitignore',
									'--color',
									...args,
								].filter(Boolean),
							),
						})),
						{
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
				exitOnError: false,
				concurrent:  true,
			},
		)
			.run()
			.catch(({ errors }) => {
				errors
					.filter(({ stdout }) => stdout)
					.forEach(({ stdout }) => console.log(stdout)); // eslint-disable-line no-console
				errors
					.filter(({ stderr }) => stderr)
					.forEach(({ stderr }) => console.error(stderr)); // eslint-disable-line no-console

				process.exit(errors.find((err) => err.code) || 1);
			}),
	)
	.parse(process.argv);
