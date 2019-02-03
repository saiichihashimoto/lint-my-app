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
};
