/* istanbul ignore file */
/* eslint-disable import/no-commonjs */
/* eslint-disable import/no-unused-modules */
import path from 'path';

import { bin as eslintBins } from 'eslint/package';

import availableConfigs from './available-configs';

// Can't use "export default ..." with lint-staged
module.exports = {
	'*.js': [
		`${path.resolve(require.resolve('eslint'), '../..', eslintBins.eslint)} --fix --color --ignore-pattern '!.*.js' --report-unused-disable-directives ${availableConfigs.eslint ? '' : `--config ${__dirname}/empty.json`}`,
		'git add',
	],
	'*.css': [
		`stylelint --fix --color --allow-empty-input ${availableConfigs.stylelint ? '' : `--config ${__dirname}/empty.json`}`,
		`stylelint --fix --color --allow-empty-input ${availableConfigs.stylelint ? '' : `--config ${__dirname}/empty.json`} --report-needless-disables`,
		'git add',
	],
	'*.scss': [
		`stylelint --syntax=scss --fix --color --allow-empty-input ${availableConfigs.stylelint ? '' : `--config ${__dirname}/empty.json`}`,
		`stylelint --syntax=scss --fix --color --allow-empty-input ${availableConfigs.stylelint ? '' : `--config ${__dirname}/empty.json`} --report-needless-disables`,
		'git add',
	],
	'**/package.json': [
		'sort-package-json',
		'git add',
	],
	'**/!(package|package-lock).json': [
		'fixjson --write',
		'jsonlint --quiet',
		'git add',
	],
	'*.{png,jpeg,jpg,gif,svg}': [
		'imagemin-lint-staged',
		'git add',
	],
};
