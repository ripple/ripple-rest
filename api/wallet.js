const Wallet  = require('ripple-lib').Wallet;
const errors  = require('./../lib/errors.js');
const respond = require('./../lib/response-handler.js');

module.exports = {
  generate: generate
};

function generate(request, response, next) {
  var wallet = Wallet.generate();
  if (wallet) {
    respond.success(response, { wallet: wallet });
  } else {
    next(new errors.ApiError('Could not generate wallet'));
  }
}