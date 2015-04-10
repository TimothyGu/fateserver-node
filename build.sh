#!/bin/sh

set -e -v
export PATH="`npm bin`:$PATH"

cd less
lessc --clean-css fate.less          > ../public/css/fate.min.css
lessc --clean-css footable.core.less > ../public/css/footable.core.min.css

cd ../public
cleancss css/prism.css           > css/prism.min.css
cleancss css/footable.custom.css > css/footable.custom.min.css

cd js
ug() {
  uglifyjs ${1}.js -c -m                          \
    --source-map      ${1}.min.map                \
    --source-map-root ${1}.js                     \
    -o                ${1}.min.js
}

ug prism
ug footable
ug footable.sort
ug report
