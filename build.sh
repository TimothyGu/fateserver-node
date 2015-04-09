#!/bin/sh

set -e
export PATH="`npm bin`:$PATH"

lessc --clean-css fate.less   > public/css/fate.min.css
cleancss public/css/prism.css > public/css/prism.min.css

cd public
uglifyjs js/prism.js    -c -m -o js/prism.min.js
uglifyjs js/footable.js -c -m -o js/footable.min.js
uglifyjs js/report.js   -c -m                          \
    --source-map      js/report.min.map                \
    --source-map-root js/report.js                     \
    -o                js/report.min.js
