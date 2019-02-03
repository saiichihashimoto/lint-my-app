sort-package-json

eslint --ignore-path .gitignore --ignore-pattern '!.*.js' --report-unused-disable-directives --fix .

stylelint --ignore-path .gitignore --fix "**/*.css" "**/*.scss"
stylelint --ignore-path .gitignore --report-needless-disables --fix "**/*.css" "**/*.scss"

git ls-files | grep "\(\.json$\)" | grep -v package | xargs -n 1 fixjson --write
