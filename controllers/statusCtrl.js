var statusLib     = require('../lib/status');
var errorHandler  = require('./errorHandler');

module.exports = function(opts) {

  var remote = opts.remote;

  return {

    getStatus: function(req, res) {

      statusLib.getStatus(remote, function(err, status){
        if (err) {
          errorHandler(res, err);
          return;
        }

        status.api_documentation_url = 'https://github.com/ripple/ripple-rest';

        res.json(status);
        
      });
    },

    isConnected: function(req, res) {

      statusLib.isConnected(remote, function(err, status){
        if (status === true) {
          res.send(true);
        } else {
          res.send(false);
        }
      });

    }
  };
};