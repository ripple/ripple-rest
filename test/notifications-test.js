/* eslint-disable new-cap */
/* eslint-disable max-len */
'use strict';
var assert = require('assert');
var testutils = require('./testutils');
var fixtures = require('./fixtures').notifications;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var hashes = require('./fixtures/hashes');

suite('get notification', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/notifications/:identifier', function(done) {
    function handleDirectionalTxQuery(message, conn) {
      assert.strictEqual(message.command, 'account_tx');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.limit, 2);

      switch (message.ledger_index_min) {
        case fixtures.LEDGER:
          assert.strictEqual(message.ledger_index_max, -1);
          assert.strictEqual(message.forward, true);
          conn.send(fixtures.accountTxNextResponse(message));
          break;
        case -1:
          assert.strictEqual(message.ledger_index_max, fixtures.LEDGER);
          assert.strictEqual(message.forward, false);
          conn.send(fixtures.accountTxPreviousResponse(message));
          break;
        default:
          assert(false, 'Invalid ledger_index: ' + message.ledger_index_min);
      }
    }

    function handleLedgerQuery(message, conn) {
      assert.strictEqual(message.command, 'account_tx');
      assert.strictEqual(message.account, addresses.VALID);

      assert.strictEqual(message.ledger_index_min, fixtures.LEDGER);
      assert.strictEqual(message.ledger_index_max, fixtures.LEDGER);
      assert.strictEqual(message.limit, 200);

      self.wss.on('request_account_tx', handleDirectionalTxQuery);

      conn.send(fixtures.accountTxLedgerResponse(message));
    }

    self.wss.once('request_account_tx', handleLedgerQuery);

    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + hashes.VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(fixtures.RESTNotificationResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- no next notification', function(done) {
    function handleDirectionalTxQuery(message, conn) {
      assert.strictEqual(message.command, 'account_tx');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.limit, 2);

      switch (message.ledger_index_min) {
        case fixtures.LEDGER:
          assert.strictEqual(message.ledger_index_max, -1);
          assert.strictEqual(message.forward, true);
          conn.send(fixtures.accountTxEmptyResponse(message));
          break;
        case -1:
          assert.strictEqual(message.ledger_index_max, fixtures.LEDGER);
          assert.strictEqual(message.forward, false);
          conn.send(fixtures.accountTxPreviousResponse(message));
          break;
        default:
          assert(false, 'Invalid ledger_index: ' + message.ledger_index_min);
      }
    }

    function handleLedgerQuery(message, conn) {
      assert.strictEqual(message.command, 'account_tx');
      assert.strictEqual(message.account, addresses.VALID);

      assert.strictEqual(message.ledger_index_min, fixtures.LEDGER);
      assert.strictEqual(message.ledger_index_max, fixtures.LEDGER);
      assert.strictEqual(message.limit, 200);

      self.wss.on('request_account_tx', handleDirectionalTxQuery);

      conn.send(fixtures.accountTxLedgerResponse(message));
    }

    self.wss.once('request_account_tx', handleLedgerQuery);

    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + hashes.VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(fixtures.RESTNotificationNoNextResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- remote missing ledger', function(done) {
    self.wss.removeAllListeners('request_server_info');
    self.wss.once('request_server_info', function(message, conn) {
      assert.strictEqual(message.command, 'server_info');
      conn.send(fixtures.serverInfoMissingLedgerResponse(message));
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + hashes.VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(fixtures.RESTMissingLedgerResponse))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- invalid account', function(done) {
    self.app
    .get(fixtures.requestPath(addresses.INVALID, '/' + hashes.VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- invalid transaction hash', function(done) {
    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + hashes.INVALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(errors.RESTInvalidTransactionHashOrClientResourceID))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- non-existent transaction hash', function(done) {
    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + hashes.NOTFOUND_TRANSACTION_HASH))
    .expect(testutils.checkBody(errors.RESTTransactionNotFound))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .end(done);
  });
});


suite('get notifications', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/notifications/', function(done) {
    // Getting next and previous transaction hashes
    function handleDirectionalTxQuery(message, conn) {
      assert.strictEqual(message.command, 'account_tx');
      assert.strictEqual(message.account, addresses.VALID);

      if (message.ledger_index_min === fixtures.LEDGER &&
          message.ledger_index_max === fixtures.LEDGER) {
        conn.send(fixtures.accountTxLedgerResponse(message));
        return;
      }

      switch (message.ledger_index_min) {
        case fixtures.LEDGER:
          assert.strictEqual(message.limit, 2);
          assert.strictEqual(message.ledger_index_max, -1);
          assert.strictEqual(message.forward, true);
          conn.send(fixtures.accountTxNextResponse(message));
          break;
        case -1:
          assert.strictEqual(message.limit, 2);
          assert.strictEqual(message.ledger_index_max, fixtures.LEDGER);
          assert.strictEqual(message.forward, false);
          conn.send(fixtures.accountTxPreviousResponse(message));
          break;
        default:
          assert(false, 'Invalid ledger_index: ' + message.ledger_index_min);
      }
    }

    function handleAccountTxQuery(message, conn) {
      assert.strictEqual(message.command, 'account_tx');
      assert.strictEqual(message.account, addresses.VALID);

      assert.strictEqual(message.ledger_index_min, -1);
      assert.strictEqual(message.ledger_index_max, -1);


      conn.send(fixtures.accountTxLedgerResponse(message));
      self.wss.on('request_account_tx', handleDirectionalTxQuery);
    }

    self.wss.once('request_account_tx', handleAccountTxQuery);

    self.app
    .get(fixtures.requestPath(addresses.VALID))
    .expect(testutils.checkBody(fixtures.RESTAccountNotificationsResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });
});
