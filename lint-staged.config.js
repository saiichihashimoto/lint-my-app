const useConfig = (process.cwd() === __dirname) && '';

module.exports = {
	'package.json': [
		'sort-package-json',
		'git add',
	],
	'*.js': [
		`eslint --fix --ignore-pattern '!.*.js' --report-unused-disable-directives ${useConfig && '$(npm explore lint-my-app -- node ./addconfig.js eslint)'}`,
		'git add',
	],
	'*.css': [
		`stylelint --fix ${useConfig && '$(npm explore lint-my-app -- node ./addconfig.js stylelint)'}`,
		'git add',
	],
	'*.scss': [
		`stylelint --fix --syntax=scss ${useConfig && '$(npm explore lint-my-app -- node ./addconfig.js stylelint)'}`,
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
