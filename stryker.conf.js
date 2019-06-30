module.exports = (config) => {
	config.set({
		mutate: [
			'{src,lib}/**/*.js?(x)',
			'!{src,lib}/**/__tests__/**/*.js?(x)',
			'!{src,lib}/**/?(*.)+(spec|test).js?(x)',
			'!{src,lib}/**/*+(Spec|Test).js?(x)',
			// Would prefer these as a comment in the files, but that's not possible
			'!src/available-configs.js',
			'!src/lint-staged.config.js',
			'!src/listr-defaults.js',
			'!src/report-errors.js',
		],
		mutator:          'javascript',
		packageManager:   'npm',
		reporters:        ['clear-text', 'progress', 'dashboard'],
		testRunner:       'jest',
		transpilers:      ['babel'],
		coverageAnalysis: 'off',
		thresholds:       {
			high:  80,
			low:   60,
			break: 100,
		},
	});
};
