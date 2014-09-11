var Wallet = require('ripple-lib').Wallet;

var controller = {
  generate: function(request, response) {
    var wallet = Wallet.generate();
    response
      .status(200)
      .send({
        success: true,
        account: wallet
      });
  }
}

module.exports = controller;
