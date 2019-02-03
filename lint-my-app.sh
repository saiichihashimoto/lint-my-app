pkg-ok || exit 1

eslint --ignore-path .gitignore --ignore-pattern '!.*.js' --report-unused-disable-directives . || exit 1

stylelint --ignore-path .gitignore . || exit 1
stylelint --ignore-path .gitignore . --report-needless-disables || exit 1
