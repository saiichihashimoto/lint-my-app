const availableConfigs = require('./bin/available-configs');

module.exports = {
	'package.json': [
		'sort-package-json',
		'git add',
	],
	'*.js': [
		`eslint --fix --color --ignore-pattern '!.*.js' --report-unused-disable-directives ${!availableConfigs.eslint ? `--config ${__dirname}/bin/empty.json` : ''}`,
		'git add',
	],
	'*.css': [
		`stylelint --fix --color ${!availableConfigs.stylelint ? `--config ${__dirname}/bin/empty.json` : ''}`,
		`stylelint --fix --color ${!availableConfigs.stylelint ? `--config ${__dirname}/bin/empty.json` : ''} --report-needless-disables`,
		'git add',
	],
	'*.scss': [
		`stylelint --syntax=scss --fix --color ${!availableConfigs.stylelint ? `--config ${__dirname}/bin/empty.json` : ''}`,
		`stylelint --syntax=scss --fix --color ${!availableConfigs.stylelint ? `--config ${__dirname}/bin/empty.json` : ''} --report-needless-disables`,
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
