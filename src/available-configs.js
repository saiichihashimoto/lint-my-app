/* istanbul ignore file */
import { cosmiconfigSync } from 'cosmiconfig';

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

export default Object.fromEntries(
	Object.entries(cosmiconfigOptions)
		.map(([moduleName, options]) => [
			moduleName,
			cosmiconfigSync(moduleName, options).search(),
		])
);
