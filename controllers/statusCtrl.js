var statusLib = require('../lib/status'), 
  errorHandler = require('./errorHandler');

module.exports = function(opts) {

  var remote = opts.remote;

  return {

    getStatus: function(req, res) {

      statusLib.getStatus(remote, function(err, status){
        if (err) {
          errorHandler(res, err);
          return;
        }

        status.api_documentation_url = 'https://github.com/emschwartz/ripple-simple';

        res.json(status);
        
      });
    }
  };
};