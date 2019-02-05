const cosmiconfig = require('cosmiconfig');

function cosmiconfigExists(moduleName) {
	switch (moduleName) {
		case 'eslint':
			return (
				cosmiconfig('eslint', {
					searchPlaces: [
						'.eslintrc.js',
						'.eslintrc.yaml',
						'.eslintrc.yml',
						'.eslintrc.json',
						'.eslintrc',
					],
				}).searchSync() ||
				cosmiconfig('eslintConfig', {
					searchPlaces: ['package.json'],
				}).searchSync()
			);
		default:
			return cosmiconfig(process.argv[2]).searchSync();
	}
}

if (!cosmiconfigExists(process.argv[2])) {
	console.log(`--config ${__dirname}/empty.json`); // eslint-disable-line no-console
}
