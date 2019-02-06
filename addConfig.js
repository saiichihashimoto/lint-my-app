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
};

function cosmiconfigExists(moduleName) {
	return Boolean(cosmiconfig(moduleName, cosmiconfigOptions[moduleName]).searchSync());
}

if (require.main === module) {
	if (!cosmiconfigExists(process.argv[2])) {
		console.log(`--config ${__dirname}/empty.json`); // eslint-disable-line no-console
	}
} else {
	module.exports = function addConfig(moduleName) {
		return !cosmiconfigExists(moduleName) ?
			`--config ${__dirname}/empty.json` :
			'';
	};
}
