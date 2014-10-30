const router = require(__dirname+'/lib/router.js');
const remote = require(__dirname+'/lib/remote.js');

function RippleRestPlugin() {
  this.router = router;
  this.remote = remote;
}

module.exports = RippleRestPlugin;

