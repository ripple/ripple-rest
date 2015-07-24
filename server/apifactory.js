'use strict';
var _ = require('lodash');
var config = require('./config');
var RippleAPI = require('../api');
var logger = require('./logger').logger;

var OPTIONS = {
  servers: config.get('rippled_servers'),
  proxy: config.get('proxy'),
  max_fee: parseFloat(config.get('max_transaction_fee')),
  database_path: config.get('NODE_ENV') === 'test'
    ? ':memory:' : config.get('db_path'),
  logger: logger,
  mock: config.get('NODE_ENV') === 'test',
  trace: config.get('debug') || false
};

function init(options) {
  return new RippleAPI(_.assign({}, OPTIONS, options || {}));
}

module.exports = init;
