var serverlib        = require('../lib/server-lib');
var ErrorController   = require('./error-controller');

module.exports = function(opts) {

  var remote = opts.remote;

  return {

    getStatus: function(req, res) {

      serverlib.getStatus(remote, function(err, status){
        if (err) {
          ErrorController.reportError(err, res);
          return;
        }

        status.api_documentation_url = 'https://github.com/ripple/ripple-rest';

        res.json(status);
        
      });
    },

    isConnected: function(req, res) {

      serverlib.ensureConnected(remote, function(err, status){
        if (status === true) {
          res.send(true);
        } else {
          res.send(false);
        }
      });

    }
  };
};