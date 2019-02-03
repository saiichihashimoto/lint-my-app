module.exports = {
	hooks: {
		'pre-commit': 'lint-staged-my-app',
		'pre-push':   'lint-my-app',
	},
};
