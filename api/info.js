
var _ =         require('lodash');

var serverlib = require('./../lib/server-lib');
var remote    = require('./../lib/remote.js');
var respond   = require('./../lib/response-handler.js');
var errors    = require('./../lib/errors.js');

module.exports = {
  serverStatus: getServerStatus
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