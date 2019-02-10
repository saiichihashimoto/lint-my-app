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

module.exports = Object.entries(cosmiconfigOptions)
	.filter(([moduleName, options]) => Boolean(cosmiconfig(moduleName, options).searchSync()))
	.reduce((acc, [key]) => ({ ...acc, [key]: true }), {});
