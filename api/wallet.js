const Wallet  = require('ripple-lib').Wallet;
const errors  = require('./lib/errors.js');

module.exports = {
  generate: generate
};

function generate(callback) {
  var wallet = Wallet.generate();
  if (wallet) {
    callback(null, {wallet: wallet});
  } else {
    callback(new errors.ApiError('Could not generate wallet'));
  }
}
