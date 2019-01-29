#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

mkdir -p junit

STATUS=0

./node_modules/.bin/tslint --format junit "src/**/*.{ts,tsx}" > junit/tslint.xml || STATUS=1
./node_modules/.bin/karma start --single-run --reporters junit || STATUS=1

exit $STATUS
