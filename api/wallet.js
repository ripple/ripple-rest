'use strict';
var Wallet = require('ripple-lib').Wallet;
var errors = require('./lib/errors.js');

function generate(callback) {
  var wallet = Wallet.generate();
  if (wallet) {
    callback(null, {wallet: wallet});
  } else {
    callback(new errors.ApiError('Could not generate wallet'));
  }
}

module.exports = {
  generate: generate
};
