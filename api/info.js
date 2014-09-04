var uuid = require('node-uuid');
var serverlib = require('../lib/server-lib');
var remote = require('../lib/remote.js');
var _ = require('lodash');

exports.uuid = getUUID;
exports.serverStatus = getServerStatus;
exports.isConnected = getServerConnected;

function getUUID(request, response, next) {
  response.send(200, {
    success: true,
    uuid: uuid.v4()
  });
};

function getServerStatus(request, response) {
  serverlib.getStatus(remote, function(error, status) {
    if (error) {
      response.json(500, {
        success: false,
        message: error.message
      });
    } else {
      response.json(200, _.extend({
        success: true,
        api_documentation_url: 'https://github.com/ripple/ripple-rest'
      }, status));
    }
  });
};

function getServerConnected(request, response) {
  serverlib.ensureConnected(remote, function(error, status) {
    if (error) {
      response.json(500, {
        success: false,
        message: error.message
      });
    } else {
      response.json(200, {
        success: true,
        connected: Boolean(status)
      });
    }
  });
};

