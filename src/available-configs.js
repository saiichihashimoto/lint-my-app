/* istanbul ignore file */
import cosmiconfig from 'cosmiconfig';

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

export default Object.entries(cosmiconfigOptions)
	.filter(([moduleName, options]) => Boolean(cosmiconfig(moduleName, options).searchSync()))
	.reduce((acc, [key]) => ({ ...acc, [key]: true }), {});
