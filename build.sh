#!/bin/sh

set -e
export PATH="`npm bin`:$PATH"

cd less
lessc --clean-css fate.less          > ../public/css/fate.min.css
lessc --clean-css footable.core.less > ../public/css/footable.core.min.css

cd ../public
cleancss css/prism.css           > css/prism.min.css
cleancss css/footable.custom.css > css/footable.custom.min.css

uglifyjs js/prism.js    -c -m -o js/prism.min.js
uglifyjs js/footable.js -c -m -o js/footable.min.js
uglifyjs js/report.js   -c -m                          \
    --source-map      js/report.min.map                \
    --source-map-root js/report.js                     \
    -o                js/report.min.js
