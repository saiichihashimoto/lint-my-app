/* istanbul ignore file */
/* eslint-disable import/no-commonjs */
import path from 'path';

import { bin as eslintBins } from 'eslint/package';

import availableConfigs from './available-configs';

const { eslint: { config: { extends: eslintExtends } = {} } } = availableConfigs;

/*
 * TODO Reuse all of these commonalities with fix
 * BODY Probably test them too
 */

// Can't use "export default ..." with lint-staged
module.exports = {
	'*.js': [
		[
			path.resolve(require.resolve('eslint'), '../..', eslintBins.eslint),
			...availableConfigs.eslint ? [] : ['--config', path.resolve(__dirname, 'empty.json')],
			...eslintExtends && typeof eslintExtends === 'string'
				? ['--resolve-plugins-relative-to', require.resolve(`eslint-config-${eslintExtends}`).replace(new RegExp(`^(.*node_modules/eslint-config-${eslintExtends}).*$`, 'u'), '$1')]
				: [],
			'--ignore-pattern',
			'\'!.*\'',
			'--color',
			'--report-unused-disable-directives',
			'--fix',
		].filter(Boolean).join(' '),
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
