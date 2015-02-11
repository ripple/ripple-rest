const router = require('./server/router.js');
const remote = require('./api/lib/remote.js');

function RippleRestPlugin() {
  this.router = router;
  this.remote = remote;
}

module.exports = RippleRestPlugin;

