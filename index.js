'use strict';
var router = require('./server/router.js');
var remote = require('./api/lib/remote.js');

function RippleRestPlugin() {
  this.router = router;
  this.remote = remote;
}

module.exports = RippleRestPlugin;
