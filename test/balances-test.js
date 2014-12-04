var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').balances;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var requestPath = fixtures.requestPath;

const MARKER = '29F992CC252056BF690107D1E8F2D9FBAFF29FF107B62B1D1F4E4E11ADF2CC73';
const NEXT_MARKER = '0C812C919D343EAE789B29E8027C62C5792C22172D37EA2B2C0121D2381F80E1';
const LIMIT = 5;

suite('get balances', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/balances', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountLinesResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse()))
    .end(done);
  });

  test('/accounts/:account/balances -- with invalid ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger, void(0));
      conn.send(fixtures.accountLinesResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID, '?ledger=foo'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse()))
    .end(done);
  });

  test('/accounts/:account/balances -- with ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 9592219);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?ledger=9592219'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- with invalid marker', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=abcd'))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker and invalid limit', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=foo'))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker and valid limit', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker and valid ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 9592219);
      assert.strictEqual(message.marker, MARKER);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&ledger=9592219'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- valid ledger and valid limit', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 9592219);
      assert.strictEqual(message.limit, 5);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?ledger=9592219&limit=' + LIMIT))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER,
      limit: LIMIT
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker, valid limit, and invalid ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=foo'))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker, valid limit, and valid ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);

      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 9592219);
      assert.strictEqual(message.limit, LIMIT);
      assert.strictEqual(message.marker, MARKER);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=9592219'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER,
      limit: LIMIT
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- invalid account', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get(requestPath(addresses.INVALID))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });

  test('/accounts/:account/balances -- non-existent account', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountNotFoundResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountNotFoundResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTAccountNotFound))
    .end(done);
  });

  test('/accounts/:account/balances?currency', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountLinesResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID, '?currency=USD'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesUSDResponse))
    .end(done);
  });

  test('/accounts/:account/balances?currency -- native currency', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get(requestPath(addresses.VALID, '?currency=XRP'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesXRPResponse))
    .end(done);
  });

  test('/accounts/:account/balances?currency -- invalid currency', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get(requestPath(addresses.VALID, '?currency=AAAA'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidCurrency))
    .end(done);
  });

  test('/accounts/:account/balances?counterparty', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.peer, addresses.COUNTERPARTY);
      conn.send(fixtures.accountLinesCounterpartyResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID, '?counterparty=' + addresses.COUNTERPARTY))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesCounterpartyResponse))
    .end(done);
  });

  test('/accounts/:account/balances?counterparty -- invalid counterparty', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get(requestPath(addresses.VALID, '?counterparty=asdf'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidCounterparty))
    .end(done);
  });

  test('/accounts/:account/balances?counterparty -- non-existent counterparty', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.peer, addresses.COUNTERPARTY);
      conn.send(fixtures.accountLinesNoCounterpartyResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID, '?counterparty=' + addresses.COUNTERPARTY))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesNoCounterpartyResponse))
    .end(done);
  });

  test('/accounts/:account/balances?counterparty&currency', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.peer, addresses.COUNTERPARTY);
      conn.send(fixtures.accountLinesCounterpartyResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID, '?counterparty=' + addresses.COUNTERPARTY + '&currency=EUR'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesCounterpartyCurrencyResponse))
    .end(done);
  });
});
