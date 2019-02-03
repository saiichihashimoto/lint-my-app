[![current version](https://img.shields.io/npm/v/lint-my-app.svg)](https://www.npmjs.com/package/lint-my-app)
[![Build Status](https://travis-ci.org/saiichihashimoto/lint-my-app.svg?branch=master)](https://travis-ci.org/saiichihashimoto/lint-my-app)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Greenkeeper badge](https://badges.greenkeeper.io/saiichihashimoto/lint-my-app.svg)](https://greenkeeper.io/)

# Getting Started
```bash
npm install --save-dev lint-my-app

# husky is a great way to setup git hooks: https://www.npmjs.com/package/husky
npm install --save-dev husky
echo "module.exports = require('lint-my-app/husky');" >> .huskyrc.js
```

# Commands
All commands use your `.gitignore` and your lint configs (ie `.eslintconfigrc`, `.stylelintrc`, etc) for the lint commands.

## lint-my-app
This lints your entire app. If using `lint-my-app/husky`, this runs on `pre-push`.

## lint-staged-my-app
This fixes your git staged files. If using `lint-my-app/husky`, this runs on `pre-commit`.

## fix-my-app
This fixes your entire app.
