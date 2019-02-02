module.exports = {
	"*.js": [
		"echo",
		"eslint --report-unused-disable-directives --fix",
		"git add"
	],
	"package.json": [
		"echo",
		"sort-package-json",
		"git add"
	],
	"{*.css,*.scss}": [
		"echo",
		"stylelint --fix",
		"git add"
	]
};
