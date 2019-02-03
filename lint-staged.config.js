module.exports = {
	'package.json': [
		'sort-package-json',
		'git add',
	],
	'*.js': [
		'eslint --fix --ignore-pattern \'!.*.js\' --report-unused-disable-directives',
		'git add',
	],
	'*.css': [
		'stylelint --fix',
		'git add',
	],
	'*.scss': [
		'stylelint --fix --syntax=scss',
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
