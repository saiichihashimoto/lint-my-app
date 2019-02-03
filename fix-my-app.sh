sort-package-json

eslint --fix --ignore-path .gitignore --ignore-pattern '!.*.js' --report-unused-disable-directives .

stylelint --fix --ignore-path .gitignore .
stylelint --fix --ignore-path .gitignore . --report-needless-disables
