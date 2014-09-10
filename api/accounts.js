var Wallet = require('ripple-lib').Wallet;

var controller = {
	generate: function(request, response) {
		var wallet = Wallet.generate();
		response
		  .status(200)
		  .send({
			succes: true,
			account: wallet
		  });
	}
}

module.exports = controller;
