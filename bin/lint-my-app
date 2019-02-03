pkg-ok || exit 1

eslint --ignore-path .gitignore --ignore-pattern '!.*.js' --report-unused-disable-directives . || exit 1

stylelint --ignore-path .gitignore "**/*.css" || exit 1
stylelint --ignore-path .gitignore --report-needless-disables "**/*.css" || exit 1

stylelint --syntax=scss --ignore-path .gitignore "**/*.scss" || exit 1
stylelint --syntax=scss --ignore-path .gitignore --report-needless-disables "**/*.scss" || exit 1

git ls-files | grep "\.json$" | grep -v package | xargs -I{} jsonlint --quiet "$(pwd)/{}" || exit 1
