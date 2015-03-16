'use strict';
var config = require('../api/lib/config');
var RippleAPI = require('../api');
var logger = require('./logger');

var options = {
  servers: config.get('rippled_servers'),
  max_fee: parseFloat(config.get('max_transaction_fee')),
  logger: logger,
  mock: config.get('NODE_ENV') === 'test',
  trace: config.get('debug')
};

module.exports = new RippleAPI(options);
