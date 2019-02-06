const addConfig = require('./addConfig');

const stylelintConfig = addConfig('stylelint');

module.exports = {
	'package.json': [
		'sort-package-json',
		'git add',
	],
	'*.js': [
		`eslint --fix --color --ignore-pattern '!.*.js' --report-unused-disable-directives ${addConfig('eslint')}`,
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
