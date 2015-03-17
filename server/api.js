'use strict';
var config = require('./config');
var RippleAPI = require('../api');
var logger = require('./logger').logger;

var options = {
  servers: config.get('rippled_servers'),
  max_fee: parseFloat(config.get('max_transaction_fee')),
  database_path: config.get('NODE_ENV') === 'test'
    ? ':memory:' : config.get('db_path'),
  logger: logger,
  mock: config.get('NODE_ENV') === 'test',
  trace: config.get('debug')
};

module.exports = new RippleAPI(options);
