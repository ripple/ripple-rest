var _         = require('lodash');
var uuid      = require('node-uuid');
var serverlib = require('./../lib/server-lib');
var remote    = require('./../lib/remote.js');
var respond   = require('./../lib/response-handler.js');
var errors    = require('./../lib/errors.js');

module.exports = {
  serverStatus: getServerStatus,
  isConnected: getServerConnected,
  uuid: getUUID
};

function getServerStatus(request, response, next) {
  serverlib.getStatus(remote, function(error, status) {
    if (error) {
      next(new errors.RippledNetworkError(error.message));
    } else {
      respond.success(response, _.extend(
        {
          api_documentation_url: 'https://github.com/ripple/ripple-rest'
        },
        status));
    }
  });
}

/**
 *  Connected
 *  if we hit this method it means the server is connected
 *  otherwise the connected check in the router would have already returned an error
 */
function getServerConnected(request, response, next) {
  respond.success(response, { connected: true });
}

function getUUID(request, response, next) {
  respond.success(response, { uuid: uuid.v4() });
}