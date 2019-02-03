module.exports = {
	hooks: {
		'pre-commit': 'lint-my-app staged',
		'pre-push':   'lint-my-app lint',
	},
};
