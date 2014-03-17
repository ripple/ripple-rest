var ErrorController = require('./error-controller');
var settingsLib = require('../lib/settings-lib');

module.exports = function(opts) {
  var remote = opts.remote;

  function getSettings(req, res) {
    settingsLib.getSettings(remote, req.params, function(err, settings) {
      if (err) {
        ErrorController.reportError(err, res);
      } else {
        res.json({ success: true, settings: settings });
      }
    });
  };

  function changeSettings(req, res) {
    var params = req.params;

    Object.keys(req.body).forEach(function(param) {
      params[param] = req.body[param];
    });

    settingsLib.changeSettings(remote, params, function(err, settings) {
      if (err) {
        ErrorController.reportError(err, res);
      } else {
        res.json({ success: true, settings: settings });
      }
    });
  };

  return {
    getSettings: getSettings,
    changeSettings: changeSettings
  }
};
