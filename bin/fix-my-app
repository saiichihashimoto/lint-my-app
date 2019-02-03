sort-package-json

eslint --fix --ignore-path .gitignore --ignore-pattern '!.*.js' --report-unused-disable-directives .

stylelint --fix --ignore-path .gitignore "**/*.css"
stylelint --fix --ignore-path .gitignore --report-needless-disables "**/*.css"

stylelint --fix --syntax=scss --ignore-path .gitignore "**/*.scss"
stylelint --fix --syntax=scss --ignore-path .gitignore --report-needless-disables "**/*.scss"

git ls-files | grep "\.json$" | grep -v package | xargs -I{} fixjson --write "$(pwd)/{}"

git ls-files | grep "\.\(png\|jpeg\|jpg\|gif\|svg\)$" | xargs -I{} imagemin-lint-staged "$(pwd)/{}"
