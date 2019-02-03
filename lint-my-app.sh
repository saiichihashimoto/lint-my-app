pkg-ok || exit 1

eslint --ignore-path .gitignore --ignore-pattern '!.*.js' --report-unused-disable-directives . || exit 1

stylelint --ignore-path .gitignore "**/*.css" "**/*.scss" || exit 1
stylelint --ignore-path .gitignore --report-needless-disables "**/*.css" "**/*.scss" || exit 1

git ls-files | grep "\(\.json$\)" | grep -v package | xargs -n 1 jsonlint --quiet
