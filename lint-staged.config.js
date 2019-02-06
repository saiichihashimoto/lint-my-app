const addConfig = require('./addConfig');

const eslintConfig = (process.cwd() !== __dirname) ? addConfig('eslint') : '';

const stylelintConfig = (process.cwd() !== __dirname) ? addConfig('stylelint') : '';

module.exports = {
	'package.json': [
		'sort-package-json',
		'git add',
	],
	'*.js': [
		`eslint --fix --color --ignore-pattern '!.*.js' --report-unused-disable-directives ${eslintConfig}`,
		'git add',
	],
	'*.css': [
		`stylelint --fix --color ${stylelintConfig}`,
		`stylelint --fix --color ${stylelintConfig} --report-needless-disables`,
		'git add',
	],
	'*.scss': [
		`stylelint --syntax=scss --fix --color ${stylelintConfig}`,
		`stylelint --syntax=scss --fix --color ${stylelintConfig} --report-needless-disables`,
		'git add',
	],
	'!(package|package-lock).json': [
		'fixjson --write',
		'git add',
	],
	'*.{png,jpeg,jpg,gif,svg}': [
		'imagemin-lint-staged',
		'git add',
	],
};
