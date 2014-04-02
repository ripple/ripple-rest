var ErrorController = require('./error-controller');
var submissionlib = require('../lib/submission-lib');


module.exports = function(opts){

  var remote = opts.remote,
    dbinterface = opts.dbinterface,
    config = opts.config;

  return {

    submitPayment: function(req, res) {

      if (!req.body || !req.body.payment) {
        var err = new Error('Invalid JSON. Could not parse request body as JSON. Please ensure that the header type is set to application/json and try again');
        ErrorController.reportError(err, res);
        return;
      }

      var payment = req.body.payment,
        secret = req.body.secret,
        client_resource_id = req.body.client_resource_id,
        url_base = req.protocol + '://' + req.host + ([80, 443].indexOf(config.get('PORT')) === -1 ? ':' + config.get('PORT') : '');

      submissionlib.submitPayment(remote, dbinterface, {
        payment: payment,
        secret: secret,
        client_resource_id: client_resource_id
      }, function(err, client_resource_id){
        if (err) {
          ErrorController.reportError(err, res);
          return;
        }

        res.json({
          success: true,
          client_resource_id: client_resource_id,
          status_url: url_base + '/v1/accounts/' + payment.source_account + '/payments/' + client_resource_id
        });
      });

    }

  };

};