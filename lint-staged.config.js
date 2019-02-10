const cosmiconfig = require('cosmiconfig');

const cosmiconfigOptions = {
	eslint: {
		searchPlaces: [
			'.eslintrc.js',
			'.eslintrc.yaml',
			'.eslintrc.yml',
			'.eslintrc.json',
			'.eslintrc',
			'package.json',
		],
		packageProp: 'eslintConfig',
	},
	stylelint: {},
};

const configExists = Object.entries(cosmiconfigOptions)
	.filter(([moduleName, options]) => Boolean(cosmiconfig(moduleName, options).searchSync()))
	.reduce((acc, [key]) => ({ ...acc, [key]: true }), {});

module.exports = {
	'package.json': [
		'sort-package-json',
		'git add',
	],
	'*.js': [
		`eslint --fix --color --ignore-pattern '!.*.js' --report-unused-disable-directives ${!configExists.eslint ? `--config ${__dirname}/bin/empty.json` : ''}`,
		'git add',
	],
	'*.css': [
		`stylelint --fix --color ${!configExists.stylelint ? `--config ${__dirname}/bin/empty.json` : ''}`,
		`stylelint --fix --color ${!configExists.stylelint ? `--config ${__dirname}/bin/empty.json` : ''} --report-needless-disables`,
		'git add',
	],
	'*.scss': [
		`stylelint --syntax=scss --fix --color ${!configExists.stylelint ? `--config ${__dirname}/bin/empty.json` : ''}`,
		`stylelint --syntax=scss --fix --color ${!configExists.stylelint ? `--config ${__dirname}/bin/empty.json` : ''} --report-needless-disables`,
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
