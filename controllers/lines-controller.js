var ErrorController = require('./error-controller');
var linesLib = require('../lib/trustlines-lib');

module.exports = function(opts) {
  var remote = opts.remote;

  function getLines(req, res) {
    var params = req.params;

    Object.keys(req.query).forEach(function(param) {
      params[param] = req.query[param];
    });

    params.limit = params.limit || req.body.limit;

    linesLib.getAccountLines(remote, params, function(err, lines) {
      if (err) {
        ErrorController.reportError(err, res);
      } else {
        res.json({ success: true, lines: lines });
      }
    });
  };

  function addLine(req, res) {
    var params = req.params;

    Object.keys(req.body).forEach(function(param) {
      params[param] = req.body[param];
    });

    linesLib.addTrustLine(remote, params, function(err, m) {
      if (err) {
        ErrorController.reportError(err, res);
      } else {
        res.json({ success: true, line: m });
      }
    });
  };

  return {
    getLines: getLines,
    addLine: addLine
  }
};

