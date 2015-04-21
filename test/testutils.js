/* global crypto: true */
'use strict';
var _ = require('lodash');
var assert = require('assert-diff');
var supertest = require('supertest');
var WSS = require('ws').Server;
var ripple = require('ripple-lib');
var fixtures = require('./fixtures').startup;
var addresses = require('./fixtures').addresses;
var app = require('../server/express_app');
var crypto = require('crypto');
var UInt256 = ripple.UInt256;
var api = require('../server/api');
var apiFactory = require('../server/apifactory');
var version = require('../server/version');
var PRNGMock = require('./prngmock');

var LEDGER_OFFSET = 3;

function withDeterministicPRNG(callback, done) {
  var prng = ripple.sjcl.random;
  ripple.sjcl.random = new PRNGMock();
  callback(function(err, data) {
    ripple.sjcl.random = prng;
    done(err, data);
  });
}

function getURLBase() {
  return '/v' + version.getApiVersion();
}

function getSignURL() {
  return getURLBase() + '/transaction/sign';
}

function getSubmitURL() {
  return getURLBase() + '/transaction/submit';
}

function getPrepareURL(type) {
  return getURLBase() + '/transaction/prepare/' + type;
}

function resetAPI() {
  var newAPI = apiFactory();
  api.remote = newAPI.remote;
  api.db = newAPI.db;
}

function setup(done) {
  var self = this;

  self.app = supertest(app);

  resetAPI();
  self.remote = api.remote;
  self.db = api.db;

  self.wss = new WSS({port: 5995});

  self.wss.once('connection', function(conn) {
    conn.on('message', function(message) {
      message = JSON.parse(message);
      self.wss.emit('request_' + message.command, message, conn);
    });
  });

  self.wss.once('request_subscribe', function(message, conn) {
    assert.strictEqual(message.command, 'subscribe');
    assert.deepEqual(message.streams, ['ledger', 'server']);
    conn.send(fixtures.subscribeResponse(message));
  });

  self.remote.once('connect', function() {
    self.remote.getServer().once('ledger_closed', function() {
      self.db.clear().then(function() {
        self.db.init(done);
      });
    });
    self.remote.getServer().emit('message', fixtures.ledgerClose(0));
  });

  // self.remote.trace = true;
  self.remote._servers = [ ];
  self.remote.addServer('ws://localhost:5995');
  self.remote.connect();
}

function teardown(done) {
  var self = this;

  self.remote.once('disconnect', function() {
    var submitAccount = self.remote.getAccount(addresses.VALID);

    if (submitAccount) {
      var pendingQueue = submitAccount._transactionManager._pending;
      pendingQueue.forEach(pendingQueue.remove.bind(pendingQueue));
    }

    self.wss.close();
    setImmediate(done);
  });

  self.remote.disconnect();
}

function checkStatus(expected) {
  return function(res) {
    assert.strictEqual(res.statusCode, expected);
  };
}

function checkHeaders(res) {
  assert.strictEqual(res.headers['content-type'],
    'application/json; charset=utf-8');
  assert.strictEqual(res.headers['access-control-allow-origin'], '*');
  assert.strictEqual(res.headers['access-control-allow-headers'],
    'X-Requested-With, Content-Type');
}

function dumpBody(res) {
  console.log(JSON.stringify(res.body));
}

function checkBody(expected) {
  return function(res, err) {
    // console.log(require('util').inspect(res.body,false,null));
    assert.ifError(err);
    var expectedObject;
    try {
      expectedObject = JSON.parse(expected);
    } catch (e) {
      throw new Error('expected body is not JSON');
    }
    assert.deepEqual(res.body, expectedObject);
  };
}

function generateHash(bytes) {
  bytes = bytes || 32;
  var hash;
  while (!UInt256.is_valid(hash)) {
    hash = crypto.randomBytes(bytes).toString('hex');
  }
  return hash;
}

// defaults must contain all possible arguments so that we can
// check for misspelled arguments; for required arguments use
// separate asserts
function loadArguments(args, defaults) {
  var unrecognizedArgs = _.difference(_.keys(args), _.keys(defaults));
  assert(unrecognizedArgs.length === 0,
    'Error in test code: unrecognized keyword argument(s): '
    + unrecognizedArgs);
  _.defaults(args, defaults);
}

/**
 * Close enough ledgers to fail a transaction
 */

function closeLedgers(conn) {
  for (var i = 0; i < LEDGER_OFFSET + 2; i++) {
    conn.send(fixtures.ledgerClose(i + 1));
  }
}

module.exports = {
  setup: setup,
  teardown: teardown,
  checkStatus: checkStatus,
  checkHeaders: checkHeaders,
  checkBody: checkBody,
  generateHash: generateHash,
  loadArguments: loadArguments,
  getPrepareURL: getPrepareURL,
  getSignURL: getSignURL,
  getSubmitURL: getSubmitURL,
  withDeterministicPRNG: withDeterministicPRNG,
  dumpBody: dumpBody
};

module.exports.closeLedgers = closeLedgers;
module.exports.LEDGER_OFFSET = LEDGER_OFFSET;
