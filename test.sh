NODE_ENV=test ./node_modules/.bin/istanbul test ./node_modules/.bin/mocha -- --reporter spec --timeout 10000 --slow 500 test/*-test.js &&
(cd ./test2 && ../node_modules/mocha/bin/mocha test-get_payment.js) &&
(cd ./test2 && ../node_modules/mocha/bin/mocha test-server_info.js)
