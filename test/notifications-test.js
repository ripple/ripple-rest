var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').notifications;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

const VALID_TRANSACTION_HASH = 'F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';
const INVALID_TRANSACTION_HASH = 'XF4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF';

suite('get notifications', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/notifications/:identifier', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH);
      conn.send(fixtures.transactionResponse(message));
    });

    self.wss.once('request_server_info', function(message, conn) {
      assert.strictEqual(message.command, 'server_info');
      conn.send(fixtures.serverInfoResponse(message));
    });

    function handleLedgerQuery(message, conn) {
      assert.strictEqual(message.command, 'account_tx');
      assert.strictEqual(message.account, addresses.VALID);

      assert.strictEqual(message.ledger_index_min, fixtures.LEDGER);
      assert.strictEqual(message.ledger_index_max, fixtures.LEDGER);
      assert.strictEqual(message.limit, 200);

      self.wss.on('request_account_tx', handleDirectionalTxQuery);

      conn.send(fixtures.accountTxLedgerResponse(message));
    };

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
    };

    self.wss.once('request_account_tx', handleLedgerQuery);

    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(fixtures.RESTNotificationResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- no next notification', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH);
      conn.send(fixtures.transactionResponse(message));
    });

    self.wss.once('request_server_info', function(message, conn) {
      assert.strictEqual(message.command, 'server_info');
      conn.send(fixtures.serverInfoResponse(message));
    });

    function handleLedgerQuery(message, conn) {
      assert.strictEqual(message.command, 'account_tx');
      assert.strictEqual(message.account, addresses.VALID);

      assert.strictEqual(message.ledger_index_min, fixtures.LEDGER);
      assert.strictEqual(message.ledger_index_max, fixtures.LEDGER);
      assert.strictEqual(message.limit, 200);

      self.wss.on('request_account_tx', handleDirectionalTxQuery);

      conn.send(fixtures.accountTxLedgerResponse(message));
    };

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
    };

    self.wss.once('request_account_tx', handleLedgerQuery);

    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(fixtures.RESTNotificationNoNextResponse))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- remote missing ledger', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH);
      conn.send(fixtures.transactionResponse(message));
    });

    self.wss.once('request_server_info', function(message, conn) {
      assert.strictEqual(message.command, 'server_info');
      conn.send(fixtures.serverInfoMissingLedgerResponse(message));
    });

    function handleLedgerQuery(message, conn) {
      assert(false, 'Should not request account transactions');
    };

    self.wss.once('request_account_tx', handleLedgerQuery);

    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(fixtures.RESTMissingLedgerResponse))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- invalid account', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert(false, 'Should not request transaction');
    });

    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'Should not request server info');
    });

    function handleLedgerQuery(message, conn) {
      assert(false, 'Should not request account transactions');
    };

    self.wss.once('request_account_tx', handleLedgerQuery);

    self.app
    .get(fixtures.requestPath(addresses.INVALID, '/' + VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- invalid transaction hash', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert(false, 'Should not request transaction');
    });

    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'Should not request server info');
    });

    function handleLedgerQuery(message, conn) {
      assert(false, 'Should not request account transactions');
    };

    self.wss.once('request_account_tx', handleLedgerQuery);

    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + INVALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(errors.RESTInvalidTransactionHash))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/notifications/:identifier -- non-existent transaction hash', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH);
      conn.send(fixtures.transactionNotFoundResponse(message));
    });

    self.wss.once('request_server_info', function(message, conn) {
      assert(false, 'Should not request server info');
    });

    function handleLedgerQuery(message, conn) {
      assert(false, 'Should not request account transactions');
    };

    self.wss.once('request_account_tx', handleLedgerQuery);

    self.app
    .get(fixtures.requestPath(addresses.VALID, '/' + VALID_TRANSACTION_HASH))
    .expect(testutils.checkBody(errors.RESTTransactionNotFound))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .end(done);
  });
});
