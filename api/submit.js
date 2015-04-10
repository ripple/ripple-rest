'use strict';
var Request = require('ripple-lib').Request;
var validate = require('./lib/validate');

function submit(tx_blob, callback) {
  validate.blob(tx_blob);
  var request = new Request(this.remote, 'submit');
  request.message.tx_blob = tx_blob;
  request.request(callback);
}

module.exports = submit;
