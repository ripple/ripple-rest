/* eslint-disable new-cap */
/* eslint-disable max-len */
'use strict';
var assert = require('assert');
var testutils = require('./testutils');
var fixtures = require('./fixtures').balances;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var requestPath = fixtures.requestPath;

var MARKER = '29F992CC252056BF690107D1E8F2D9FBAFF29FF107B62B1D1F4E4E11ADF2CC73';
var NEXT_MARKER =
  '0C812C919D343EAE789B29E8027C62C5792C22172D37EA2B2C0121D2381F80E1';
var LEDGER = 9592219;
var LEDGER_HASH =
  'FD22E2A8D665A01711C0147173ECC0A32466BA976DE697E95197933311267BE8';
var LIMIT = 5;
var DEFAULT_LIMIT = 200;

suite('get balances', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

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
      assert.strictEqual(message.ledger_index, 'validated');
      assert.strictEqual(message.limit, DEFAULT_LIMIT);
      conn.send(fixtures.accountLinesResponse(message, {
        ledger: LEDGER,
        marker: NEXT_MARKER,
        limit: DEFAULT_LIMIT
      }));
    });

    self.app
    .get(requestPath(addresses.VALID))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      ledger: LEDGER,
      marker: NEXT_MARKER,
      limit: DEFAULT_LIMIT
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- with limit=all', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.on('request_account_lines', function(message, conn) {
      if (message.ledger_index === 'validated') {
        assert.strictEqual(message.command, 'account_lines');
        assert.strictEqual(message.account, addresses.VALID);
        assert.strictEqual(message.ledger_index, 'validated');
        assert.strictEqual(message.marker, undefined);
        assert.strictEqual(message.limit, DEFAULT_LIMIT);
        conn.send(fixtures.accountLinesResponse(message, {
          ledger: LEDGER,
          marker: NEXT_MARKER
        }));
      } else {
        assert.strictEqual(message.command, 'account_lines');
        assert.strictEqual(message.account, addresses.VALID);
        assert.strictEqual(message.ledger_index, LEDGER);
        assert.strictEqual(message.marker, NEXT_MARKER);
        assert.notEqual(message.limit, 'all');
        conn.send(fixtures.accountLinesResponse(message, {
          ledger: LEDGER,
          marker: undefined
        }));
      }
    });

    self.app
    .get(requestPath(addresses.VALID, '?limit=all'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }

      assert.strictEqual(res.body.balances.length, 49);
      assert.strictEqual(res.body.marker, undefined);
      assert.strictEqual(res.body.ledger, LEDGER);
      assert.strictEqual(res.body.validated, true);

      done();
    });
  });

  test('/accounts/:account/balances -- with invalid ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?ledger=foo'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.restInvalidParameter('ledger')))
    .end(done);
  });

  test('/accounts/:account/balances -- with ledger (sequence)', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?ledger=' + LEDGER))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- with ledger (hash)', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_hash, LEDGER_HASH);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?ledger=' + LEDGER_HASH))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- with non-validated ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER,
        validated: false
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?ledger=' + LEDGER))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER,
      validated: false
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- with invalid limit', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?limit=foo'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.restInvalidParameter('limit')))
    .end(done);
  });

  test('/accounts/:account/balances -- with marker and missing ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.restInvalidParameter('ledger')))
    .end(done);
  });

  test('/accounts/:account/balances -- with marker and valid ledger', function(done) {
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
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&ledger=' + LEDGER))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker, ledger and limit', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      assert.strictEqual(message.limit, LIMIT);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?ledger=' + LEDGER + '&limit=' + LIMIT))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER,
      limit: LIMIT,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker, valid limit, and invalid ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=foo'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.restInvalidParameter('ledger')))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker, valid limit, and ledger=validated', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=validated'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.restInvalidParameter('ledger')))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker, valid limit, and ledger=closed', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=closed'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.restInvalidParameter('ledger')))
    .end(done);
  });

  test('/accounts/:account/balances -- with valid marker, valid limit, and ledger=current', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=current'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.restInvalidParameter('ledger')))
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
      assert.strictEqual(message.limit, LIMIT);
      assert.strictEqual(message.ledger_index, LEDGER);
      assert.strictEqual(message.marker, MARKER);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=' + LEDGER))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse({
      marker: NEXT_MARKER,
      limit: LIMIT,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances -- invalid account', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function() {
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
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.accountLinesResponse(message, {
        ledger: LEDGER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?currency=USD'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesUSDResponse({
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances?currency -- native currency', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.accountInfoResponse(message, {
        ledger: LEDGER
      }));
    });

    self.wss.once('request_account_lines', function() {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get(requestPath(addresses.VALID, '?currency=XRP'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesXRPResponse({
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances?currency -- invalid currency', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function() {
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
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.peer, addresses.COUNTERPARTY);
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.accountLinesCounterpartyResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?counterparty=' + addresses.COUNTERPARTY))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesCounterpartyResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances?counterparty -- invalid counterparty', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function() {
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
    self.wss.once('request_account_info', function() {
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

  test('/accounts/:account/balances?counterparty&currency=EUR', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.peer, addresses.COUNTERPARTY);
      conn.send(fixtures.accountLinesCounterpartyResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get(requestPath(addresses.VALID, '?counterparty=' + addresses.COUNTERPARTY + '&currency=EUR'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesCounterpartyCurrencyResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/balances?frozen', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account_info');
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.accountLinesResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID, '?frozen=true'))
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesFrozenResponse()))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });
});
