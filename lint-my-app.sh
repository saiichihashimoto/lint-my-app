pkg-ok

eslint --ignore-path .gitignore --ignore-pattern '!.*.js' --report-unused-disable-directives .

stylelint --ignore-path .gitignore .
stylelint --ignore-path .gitignore . --report-needless-disables
