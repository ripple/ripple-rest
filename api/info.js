var _         = require('lodash');
var uuid      = require('node-uuid');
var serverlib = require('./lib/server-lib');
var remote    = require('./lib/remote.js');
var errors    = require('./lib/errors.js');
var utils     = require('./lib/utils.js');

function getServerStatus(request, callback) {
  serverlib.getStatus(remote, function(error, status) {
    if (error) {
      callback(new errors.RippledNetworkError(error.message));
    } else {
      callback(null, _.extend({
        api_documentation_url: 'https://github.com/ripple/ripple-rest'
      }, status));
    }
  });
};

/**
 *  Check server connectivity.  If we hit this method it means the server is
 *  connected, as per middleware
 */

function getServerConnected(request, callback) {
  callback(null, { connected: true });
};

/**
 * Get UUID, for use by the client as transaction identifier
 */

function getUUID(request, callback) {
  callback(null, { uuid: uuid.v4() });
};

/**
 * Get the current transaction fee
 */

function getFee(request, callback) {
  var fee = remote.createTransaction()._computeFee();
  callback(null, { fee: utils.dropsToXrp(fee) });
};

module.exports.serverStatus = getServerStatus;
module.exports.isConnected = getServerConnected;
module.exports.uuid = getUUID;
module.exports.fee = getFee;
