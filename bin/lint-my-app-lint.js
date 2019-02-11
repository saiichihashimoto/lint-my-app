#!/usr/bin/env node
const Listr = require('listr');
const execa = require('execa');
const path = require('path');
const program = require('commander');
const availableConfigs = require('./available-configs');

const lint = (args) => {
	let action = null;
	program
		.option('--no-pkg-ok')
		.option('--no-eslint')
		.option('--no-stylelint')
		.option('--no-jsonlint')
		.action(({ pkgOk, eslint, stylelint, jsonlint }) => {
			action = new Listr(
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
		})
		.parse(args);
	return action;
};

/* istanbul ignore next line */
if (require.main === module) {
	lint(process.argv)
		.catch((err) => {
			const { errors = [] } = err;
			errors
				.filter(({ stdout }) => stdout)
				.forEach(({ stdout }) => console.log(stdout)); // eslint-disable-line no-console
			errors
				.filter(({ stderr }) => stderr)
				.forEach(({ stderr }) => console.error(stderr)); // eslint-disable-line no-console

			process.exit(errors.find(({ code }) => code).code || 1);
		});
} else {
	module.exports = (...args) => lint([process.argv[0], __filename, ...args]);
}
