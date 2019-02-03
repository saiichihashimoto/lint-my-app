module.exports = {
	'package.json': [
		'sort-package-json',
		'git add',
	],
	'*.js': [
		'eslint --report-unused-disable-directives --fix',
		'git add',
	],
	'{*.css,*.scss}': [
		'stylelint --fix',
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
