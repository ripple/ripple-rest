var Wallet  = require('ripple-lib').Wallet;
var respond = require('./../lib/response-handler.js');

var controller = {
  generate: function(request, response) {
    var wallet = Wallet.generate();
    if (wallet) {
      respond.success(response, { account: wallet });
    } else {
      respond.apiError(response, 'Could not generate wallet');
    }
  }
}

module.exports = controller;
