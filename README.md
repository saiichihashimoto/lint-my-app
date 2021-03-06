[![current version](https://img.shields.io/npm/v/lint-my-app.svg)](https://www.npmjs.com/package/lint-my-app)
[![Build Status](https://travis-ci.org/saiichihashimoto/lint-my-app.svg?branch=master)](https://travis-ci.org/saiichihashimoto/lint-my-app)
[![Coverage Status](https://coveralls.io/repos/github/saiichihashimoto/lint-my-app/badge.svg?branch=master)](https://coveralls.io/github/saiichihashimoto/lint-my-app?branch=master)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/saiichihashimoto/lint-my-app/master)](https://stryker-mutator.github.io)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


So you can write your app instead of lint it!

[lint-staged](https://github.com/okonet/lint-staged) keeps the :poop: out of your app. I got tired of configuring [husky](https://github.com/typicode/husky) and lint-staged to get started. lint-my-app sets sane linting defaults so you can write your app instead of lint it!

# Install
```sh
npm install --save-dev lint-my-app husky
```

```js
// .huskyrc.js
module.exports = require('lint-my-app/husky');
```

```sh
git commit -m 'Keep calm and lint'
```

# Features
- Fixes files using lint-staged on commit.
- Lints your entire codebase on push.
- All batteries included ([except husky configuration](https://github.com/typicode/husky/issues/245)).
- Uses your personal eslint and stylelint configs
- Respects `.gitignore`

# Commands
For the most part, `lint-my-app/husky` can be given to husky and you're done! But the internal commands are open to you!

## lint-my-app lint
This lints your entire app.

## lint-my-app fix
This fixes your entire app.

## lint-my-app staged
This fixes your git staged files.
