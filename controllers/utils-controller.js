var ErrorController = require('./error-controller');
var uuid            = require('node-uuid');

module.exports = function(opts){

  var remote = opts.remote,
    dbinterface = opts.dbinterface,
    config = opts.config;

  return {

    getUuid: function(req, res) {

      res.send({
        success: true,
        uuid: uuid.v4()
      });

    }

  };

};