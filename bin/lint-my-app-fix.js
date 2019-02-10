#!/usr/bin/env node
const Listr = require('listr');
const execa = require('execa');
const path = require('path');
const program = require('commander');
const availableConfigs = require('./available-configs');

program
	.option('--no-sort-package-json')
	.option('--no-eslint')
	.option('--no-stylelint')
	.option('--no-fixjson')
	.option('--no-imagemin')
	.action(
		({ sortPackageJson, eslint, stylelint, fixjson, imagemin }) => new Listr(
			[
				{
					title: 'sort-package-json',
					skip:  () => !sortPackageJson,
					task:  () => execa('sort-package-json'),
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
						].map((args) => ({
							title: args.join(' '),
							task:  () => execa(
								'stylelint',
								[
									...(!availableConfigs.stylelint ? ['--config', path.resolve(__dirname, 'empty.json')] : []),
									'--ignore-path', '.gitignore',
									'--color',
									'--fix',
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
					title: 'fixjson',
					skip:  () => !fixjson,
					task:  () => {
						const gitLs = execa('git', ['ls-files']);
						const grepJson = execa('grep', ['\\.json$']);
						const noPackage = execa('grep', ['-v', 'package\\(-lock\\)\\?\\.json$']);

						const xargsFixJson = execa(
							'xargs',
							[
								'-I{}',
								'fixjson',
								'--write',
								'"{}"',
							],
						);

						gitLs.stdout.pipe(grepJson.stdin);
						grepJson.stdout.pipe(noPackage.stdin);
						noPackage.stdout.pipe(xargsFixJson.stdin);

						return xargsFixJson;
					},
				},
				{
					title: 'imagemin',
					skip:  () => !imagemin,
					task:  () => {
						const gitLs = execa('git', ['ls-files']);
						const images = execa('grep', ['\\.\\(png\\|jpeg\\|jpg\\|gif\\|svg\\)$']);

						const xargsImagemin = execa(
							'xargs',
							[
								'-I{}',
								'imagemin-lint-staged',
								'{}',
							],
						);

						gitLs.stdout.pipe(images.stdin);
						images.stdout.pipe(xargsImagemin.stdin);

						return xargsImagemin;
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
