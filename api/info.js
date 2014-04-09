var uuid = require('node-uuid');
var serverlib = require('../lib/server-lib');

exports.uuid = getUUID;

function getUUID($, req, res, next) {
  res.send(200, { success: true, uuid: uuid.v4() });
};

exports.serverStatus = getServerStatus;

function getServerStatus($, req, res, next) {
  serverlib.getStatus($.remote, function(err, status) {
    if (err) {
      res.json(500, { success: false, message: err.message });
    } else {
      status.success = true;
      status.api_documentation_url = 'https://github.com/ripple/ripple-rest';
      res.json(200, status);
    }
  });
};

exports.isConnected = getServerConnected;

function getServerConnected($, req, res, next) {
  serverlib.ensureConnected($.remote, function(err, status) {
    if (err) {
      res.json(500, { success: false, message: err.message });
    } else {
      res.json(200, { success: true, connected: Boolean(status) });
    }
  });
};

