var _         = require('lodash');
var assert    = require('assert');
var ripple    = require('ripple-lib');
var testutils = require('./testutils');
var fixtures  = require('./fixtures').orders;
var errors    = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var utils     = require('../api/lib/utils');
var Currency  = require('ripple-lib').Currency;

const HEX_CURRENCY = '0158415500000000C1F76FF6ECB0BAC600000000';
const ISSUER = 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B';
const VALUE = '0.00000001';

const DEFAULT_LIMIT = 200;
const LIMIT = 100;

const MARKER = '29F992CC252056BF690107D1E8F2D9FBAFF29FF107B62B1D1F4E4E11ADF2CC73';
const NEXT_MARKER = '0C812C919D343EAE789B29E8027C62C5792C22172D37EA2B2C0121D2381F80E1';
const LEDGER = 9592219;
const LEDGER_HASH = 'FD22E2A8D665A01711C0147173ECC0A32466BA976DE697E95197933311267BE8';

suite('get orders', function() {
  var self = this;

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/orders', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert.strictEqual(message.command, 'account_offers');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 'validated');
      assert.strictEqual(message.limit, DEFAULT_LIMIT);
      conn.send(fixtures.accountOrdersResponse(message,{
        ledger: LEDGER,
        marker: NEXT_MARKER,
        limit: DEFAULT_LIMIT
      }));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountOrdersResponse({
        ledger: LEDGER,
        marker: NEXT_MARKER,
        limit: DEFAULT_LIMIT
    })))
    .end(done);
  });

  test('/accounts/:account/orders -- with limit=all', function(done) {
    self.wss.on('request_account_offers', function(message, conn) {
      if (message.ledger_index === 'validated') {
        assert.strictEqual(message.command, 'account_offers');
        assert.strictEqual(message.account, addresses.VALID);
        assert.strictEqual(message.ledger_index, 'validated');
        assert.strictEqual(message.marker, void(0));
        assert.notEqual(message.limit, 'all');
        conn.send(fixtures.accountOrdersResponse(message,{
          ledger: LEDGER,
          marker: NEXT_MARKER
        }));
      } else {
        assert.strictEqual(message.command, 'account_offers');
        assert.strictEqual(message.account, addresses.VALID);
        assert.strictEqual(message.ledger_index, LEDGER);
        assert.strictEqual(message.marker, NEXT_MARKER);
        assert.notEqual(message.limit, 'all');
        conn.send(fixtures.accountOrdersResponse(message,{
          ledger: LEDGER,
          marker: void(0)
        }));
      }
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?limit=all')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) return done(err);

      assert.strictEqual(res.body.orders.length, 34);
      assert.strictEqual(res.body.limit, void(0));
      assert.strictEqual(res.body.marker, void(0));
      assert.strictEqual(res.body.ledger, LEDGER);
      assert.strictEqual(res.body.validated, true);

      done();

    });
  });

  test('/accounts/:account/orders -- with invalid ledger', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert.strictEqual(message.command, 'account_offers');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.accountOrdersResponse(message));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?ledger=foo')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountOrdersResponse()))
    .end(done);
  });

  test('/accounts/:account/orders -- with ledger (sequence)', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert.strictEqual(message.command, 'account_offers');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      conn.send(fixtures.accountOrdersResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?ledger=' + LEDGER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountOrdersResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/orders -- with ledger (hash)', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert.strictEqual(message.command, 'account_offers');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_hash, LEDGER_HASH);
      conn.send(fixtures.accountOrdersResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?ledger=' + LEDGER_HASH)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountOrdersResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/orders -- with invalid marker', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=abcd')
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/orders -- with valid marker and invalid limit', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=' + MARKER + '&limit=foo')
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/orders -- with valid marker and valid limit', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=' + MARKER + '&limit=' + LIMIT)
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/orders -- with valid marker and valid ledger', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert.strictEqual(message.command, 'account_offers');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      assert.strictEqual(message.marker, MARKER);
      conn.send(fixtures.accountOrdersResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=' + MARKER + '&ledger=' + LEDGER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountOrdersResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/orders -- valid ledger and valid limit', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert.strictEqual(message.command, 'account_offers');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 9592219);
      assert.strictEqual(message.limit, LIMIT);
      conn.send(fixtures.accountOrdersResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?ledger=' + LEDGER + '&limit=' + LIMIT)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountOrdersResponse({
      marker: NEXT_MARKER,
      ledger: LEDGER
    })))
    .end(done);
  });

  test('/accounts/:account/orders -- with valid marker, valid limit, and invalid ledger', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=foo')
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/orders -- with valid marker, valid limit, and ledger=validated', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=validated')
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/orders -- with valid marker, valid limit, and ledger=current', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=current')
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/orders -- with valid marker, valid limit, and ledger=closed', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=closed')
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/orders -- with valid marker, valid limit, and valid ledger', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert.strictEqual(message.command, 'account_offers');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 9592219);
      assert.strictEqual(message.limit, LIMIT);
      assert.strictEqual(message.marker, MARKER);
      conn.send(fixtures.accountOrdersResponse(message, {
        marker: NEXT_MARKER
      }));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=' + LEDGER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountOrdersResponse({
      marker: NEXT_MARKER
    })))
    .end(done);
  });

  test('/accounts/:account/orders -- invalid account', function(done) {
    self.wss.once('request_account_offers', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get('/v1/accounts/' + addresses.INVALID + '/orders')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });
});

suite('post orders', function() {
  var self = this;

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/orders?validated=true', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));

      process.nextTick(function () {
        conn.send(fixtures.submitTransactionVerifiedResponse({
          hash: hash
        }));
      });
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders?validated=true')
    .send(fixtures.order())
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      state: 'validated',
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders?validated=true -- unfunded offer', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.rippledSubmitErrorResponse(message, {
        engine_result: 'tecUNFUNDED_OFFER',
        engine_result_code: 103,
        engine_result_message: 'Insufficient balance to fund created offer.',
        hash: hash
      }));

      process.nextTick(function() {
        conn.send(fixtures.unfundedOrderFinalizedResponse({
          hash: hash
        }));
      });
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders?validated=true')
    .send(fixtures.order())
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'transaction',
      error: 'tecUNFUNDED_OFFER',
      message: 'Insufficient balance to fund created offer.'
    })))
    .end(done);
  });

  test('/orders', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Account, addresses.VALID);
      assert.strictEqual(so.TransactionType, 'OfferCreate');
      assert.deepEqual(so.TakerPays, {
        value: '100',
        currency: 'USD',
        issuer: addresses.ISSUER
      });
      assert.deepEqual(so.TakerGets, {
        value: '100',
        currency: 'USD',
        issuer: addresses.ISSUER
      });

      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order())
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- taker_gets -- hex currency', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    var options = {
      hash: hash,
      last_ledger: lastLedger,
      taker_gets: {
        currency: HEX_CURRENCY,
        value: VALUE,
        issuer: ISSUER
      }
    };

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function (message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(so.TakerGets.value, VALUE);
      assert.strictEqual(so.TakerGets.currency, HEX_CURRENCY);
      assert.strictEqual(so.TakerGets.issuer, ISSUER);
      assert.strictEqual(message.command, 'submit');

      conn.send(fixtures.requestSubmitResponse(message, options));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      taker_gets: {
        currency: HEX_CURRENCY,
        value: VALUE,
        counterparty: ISSUER
      }
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) return done(err);

      assert.strictEqual(res.body.order.taker_gets.currency, HEX_CURRENCY);
      assert.strictEqual(res.body.order.taker_gets.value, VALUE);
      assert.strictEqual(res.body.order.taker_gets.counterparty, ISSUER);

      done();
    });
  });

  test('/orders -- taker_pays -- hex currency', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    var options = {
      hash: hash,
      last_ledger: lastLedger,
      taker_pays: {
        currency: HEX_CURRENCY,
        value: VALUE,
        issuer: ISSUER
      }
    };

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function (message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(so.TakerPays.value, VALUE);
      assert.strictEqual(so.TakerPays.currency, HEX_CURRENCY);
      assert.strictEqual(so.TakerPays.issuer, ISSUER);
      assert.strictEqual(message.command, 'submit');

      conn.send(fixtures.requestSubmitResponse(message, options));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({ 
      taker_pays: {
        currency: HEX_CURRENCY,
        counterparty: ISSUER,
        value: VALUE
      }
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) return done(err);

      assert.strictEqual(res.body.order.taker_pays.currency, HEX_CURRENCY);
      assert.strictEqual(res.body.order.taker_pays.value, VALUE);
      assert.strictEqual(res.body.order.taker_pays.counterparty, ISSUER);

      done();
    });
  });

  test('/orders -- ledger sequence too high', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order())
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/orders -- secret invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false)
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      secret: 'foo'
    }))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidSecret))
    .end(done);
  });

  test('/orders -- type sell', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert((so.Flags & ripple.Transaction.flags.OfferCreate.Sell) > 0);

      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      type: 'sell'
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- passive true', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert((so.Flags & ripple.Transaction.flags.OfferCreate.Passive) > 0);

      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      passive: true
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- fill_or_kill true', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert((so.Flags & ripple.Transaction.flags.OfferCreate.FillOrKill) > 0);

      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      fill_or_kill: true
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- immediate_or_cancel true', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert((so.Flags & ripple.Transaction.flags.OfferCreate.ImmediateOrCancel) > 0);

      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      immediate_or_cancel: true
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- passive false', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Flags & ripple.Transaction.flags.OfferCreate.Passive, 0);

      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      passive: false
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- fill_or_kill false', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Flags & ripple.Transaction.flags.OfferCreate.FillOrKill, 0);

      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      fill_or_kill: false
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- immediate_or_cancel false', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Flags & ripple.Transaction.flags.OfferCreate.ImmediateOrCancel, 0);

      conn.send(fixtures.requestSubmitResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      immediate_or_cancel: false
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- passive invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      passive: 'test'
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a boolean: passive'
    })))
    .end(done);
  });

  test('/orders -- immediate_or_cancel invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      immediate_or_cancel: 'test'
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a boolean: immediate_or_cancel'
    })))
    .end(done);
  });

  test('/orders -- fill_or_kill invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      fill_or_kill: 'test'
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a boolean: fill_or_kill'
    })))
    .end(done);
  });

  test('/orders -- taker_gets -- xrp', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    var options = {
      hash: hash,
      taker_gets: '100000000000'
    };

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Account, addresses.VALID);
      assert.strictEqual(so.TransactionType, 'OfferCreate');
      assert.deepEqual(so.TakerGets, options.taker_gets);

      conn.send(fixtures.requestSubmitResponse(message, options));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      taker_gets: {
        currency: 'XRP',
        value: '100000',
        counterparty: ''
      }
    }))
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger,
      taker_gets: {
        currency: 'XRP',
        counterparty: '',
        value: '100000'
      }
    })))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/orders -- taker_pays -- xrp', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    var options = {
      hash: hash,
      taker_pays: '100000000000'
    };

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.Account, addresses.VALID);
      assert.strictEqual(so.TransactionType, 'OfferCreate');
      assert.deepEqual(so.TakerPays, options.taker_pays);

      conn.send(fixtures.requestSubmitResponse(message, options));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      taker_pays: {
        currency: 'XRP',
        value: '100000'
      }
    }))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger,
      taker_pays: {
        currency: 'XRP',
        counterparty: '',
        value: '100000'
      }
    })))
    .end(done);
  });

  test('/orders -- unfunded offer', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.rippledSubmitErrorResponse(message, {
        engine_result: 'tecUNFUNDED_OFFER',
        engine_result_code: 103,
        engine_result_message: 'Insufficient balance to fund created offer.',
        hash: hash
      }));
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order())
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTSubmitTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders -- secret missing', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send({})
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTMissingSecret))
    .end(done);
  });

  test('/orders -- secret invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
        secret: 'foo'
    }))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidSecret))
    .end(done);
  });

  test('/orders -- order missing', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Missing parameter: order. Submission must have order object in JSON form'
    })))
    .end(done);
  });

  test('/orders -- type missing', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      type: 'test'
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be "buy" or "sell": type'
    })))
    .end(done);
  });

  test('/orders -- taker_gets invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      taker_gets: 'test'
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a valid Amount object: taker_gets'
    })))
    .end(done);
  });

  test('/orders -- taker_gets -- currency without issuer', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      taker_gets: {
        currency: 'USD',
        value: '100'
      }
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a valid Amount object: taker_gets'
    })))
    .end(done);
  });

  test('/orders -- taker_pays invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      taker_pays: 'test'
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a valid Amount object: taker_pays'
    })))
    .end(done);
  });

  test('/orders -- taker_pays -- currency without issuer', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.VALID + '/orders')
    .send(fixtures.order({
      taker_pays: {
        currency: 'USD',
        value: '100'
      }
    }))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a valid Amount object: taker_pays'
    })))
    .end(done);
  });

  test('/orders -- account invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .post('/v1/accounts/' + addresses.INVALID + '/orders?validated=true')
    .send(fixtures.order())
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });
});

suite('delete orders', function() {
  var self = this;

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/orders/:sequence?validated=true', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.TransactionType, 'OfferCancel');
      assert.strictEqual(so.OfferSequence, 99);
      conn.send(fixtures.requestCancelResponse(message, {
        hash: hash
      }));

      process.nextTick(function() {
        conn.send(fixtures.cancelTransactionVerifiedResponse({
          hash: hash
        }))
      });
    });

    self.app
    .del('/v1/accounts/' + addresses.VALID + '/orders/99?validated=true')
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTCancelTransactionResponse({
      state: 'validated',
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders/:sequence -- ledger sequence too high', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .del('/v1/accounts/' + addresses.VALID + '/orders/99')
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/orders/:sequence -- secret invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false)
    });

    self.app
    .del('/v1/accounts/' + addresses.VALID + '/orders/99')
    .send(fixtures.order({
      secret: 'foo'
    }))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidSecret))
    .end(done);
  });

  test('/orders/:sequence', function(done) {
    var lastLedger = self.remote._ledger_current_index;
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.TransactionType, 'OfferCancel');
      assert.strictEqual(so.OfferSequence, 99);
      conn.send(fixtures.requestCancelResponse(message, {
        hash: hash
      }));
    });

    self.app
    .del('/v1/accounts/' + addresses.VALID + '/orders/99')
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTCancelTransactionResponse({
      hash: hash,
      last_ledger: lastLedger
    })))
    .end(done);
  });

  test('/orders/:sequence -- bad sequence', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      var so = new ripple.SerializedObject(message.tx_blob).to_json();
      assert.strictEqual(message.command, 'submit');
      assert.strictEqual(so.TransactionType, 'OfferCancel');
      assert.strictEqual(so.OfferSequence, 99);
      conn.send(fixtures.rippledCancelErrorResponse(message, {
        engine_result: 'temBAD_SEQUENCE',
        engine_result_code: -283,
        engine_result_message: 'Malformed: Sequence is not in the past.',
        hash: hash
      }));
    });

    self.app
    .del('/v1/accounts/' + addresses.VALID + '/orders/99')
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'transaction',
      error: 'temBAD_SEQUENCE',
      message: 'Malformed: Sequence is not in the past.'
    })))
    .end(done);
  });

  test('/orders/:sequence -- sequence invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .del('/v1/accounts/' + addresses.VALID + '/orders/foo')
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Invalid parameter: sequence. Sequence must be a positive number'
    })))
    .end(done);
  });

  test('/orders/:sequence -- secret missing', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .del('/v1/accounts/' + addresses.VALID + '/orders/99')
    .send({})
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTMissingSecret))
    .end(done);
  });

  test('/orders/:sequence -- secret invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .del('/v1/accounts/' + addresses.VALID + '/orders/99')
    .send({
      secret: 'foo'
    })
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidSecret))
    .end(done);
  });

  test('/orders/:sequence -- account invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .del('/v1/accounts/' + addresses.INVALID + '/orders/99?validated=true')
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });
});

suite('get order book', function() {
  var self = this;

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('v1/accounts/:account/order_book/:base/:counter', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.requestLedgerResponse(message, {
        ledger: LEDGER
      }));
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert.strictEqual(message.command, 'book_offers');
      assert.strictEqual(message.ledger_index, LEDGER);
      assert.strictEqual(message.taker, addresses.VALID);

      if (message.taker_gets.currency === Currency.from_human('USD').to_hex()) {
        // Bids
        conn.send(fixtures.requestBookOffersBidsResponse(message));
      } else {
        // Asks
        conn.send(fixtures.requestBookOffersAsksResponse(message));
      }
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/BTC+' + addresses.ISSUER + '/USD+' + addresses.ISSUER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTOrderBookResponse({
      ledger: LEDGER
    })))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with partially funded ask', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.requestLedgerResponse(message, {
        ledger: LEDGER
      }));
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert.strictEqual(message.command, 'book_offers');
      assert.strictEqual(message.ledger_index, LEDGER);

      if (message.taker_gets.currency === Currency.from_human('USD').to_hex()) {
        // Bids
        conn.send(fixtures.requestBookOffersBidsResponse(message));
      } else {
        // Asks
        conn.send(fixtures.requestBookOffersAsksPartialFundedResponse(message));
      }
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/BTC+' + addresses.ISSUER + '/USD+' + addresses.ISSUER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTOrderBookPartialAskResponse()))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with partially funded bid', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.requestLedgerResponse(message, {
        ledger: LEDGER
      }));
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert.strictEqual(message.command, 'book_offers');
      assert.strictEqual(message.ledger_index, LEDGER);

      if (message.taker_gets.currency === Currency.from_human('USD').to_hex()) {
        // Bids
        conn.send(fixtures.requestBookOffersBidsPartialFundedResponse(message));
      } else {
        // Asks
        conn.send(fixtures.requestBookOffersAsksResponse(message));
      }
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/BTC+' + addresses.ISSUER + '/USD+' + addresses.ISSUER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTOrderBookPartialBidResponse()))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with limit', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.requestLedgerResponse(message, {
        ledger: LEDGER
      }));
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert.strictEqual(message.command, 'book_offers');
      assert.strictEqual(message.ledger_index, LEDGER);

      if (message.taker_gets.currency === Currency.from_human('USD').to_hex()) {
        // Bids
        assert.strictEqual(message.limit, LIMIT);
        conn.send(fixtures.requestBookOffersBidsResponse(message));
      } else {
        // Asks
        assert.strictEqual(message.limit, LIMIT);
        conn.send(fixtures.requestBookOffersAsksResponse(message));
      }
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/BTC+' + addresses.ISSUER + '/USD+' + addresses.ISSUER + '?limit=' + LIMIT)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTOrderBookResponse()))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with XRP as base', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.requestLedgerResponse(message, {
        ledger: LEDGER
      }));
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert.strictEqual(message.command, 'book_offers');
      assert.strictEqual(message.ledger_index, LEDGER);
      assert.strictEqual(message.taker, addresses.VALID);

      if (message.taker_gets.currency === Currency.from_human('USD').to_hex()) {
        // Bids
        conn.send(fixtures.requestBookOffersXRPBaseResponse(message));
      } else {
        // Asks
        conn.send(fixtures.requestBookOffersXRPCounterResponse(message));
      }
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/XRP/USD+' + addresses.COUNTERPARTY)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTOrderBookXRPBaseResponse({
      ledger: LEDGER
    })))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with XRP as counter', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.requestLedgerResponse(message, {
        ledger: LEDGER
      }));
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert.strictEqual(message.command, 'book_offers');
      assert.strictEqual(message.ledger_index, LEDGER);
      assert.strictEqual(message.taker, addresses.VALID);

      if (message.taker_gets.currency === Currency.from_human('XRP').to_hex()) {
        // Bids
        conn.send(fixtures.requestBookOffersXRPCounterResponse(message));
      } else {
        // Asks
        conn.send(fixtures.requestBookOffersXRPBaseResponse(message));
      }
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/USD+' + addresses.COUNTERPARTY + '/XRP')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTOrderBookXRPCounterResponse({
      ledger: LEDGER
    })))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with invalid currency as base', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert(false, 'Should not request ledger info');
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert(false, 'Should not request book offers');
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/' + 'AAAA+' + addresses.ISSUER + '/BTC+' + addresses.ISSUER)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidBase))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with invalid currency as counter', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert(false, 'Should not request ledger info');
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert(false, 'Should not request book offers');
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/' + 'BTC+' + addresses.ISSUER + '/AAAA+' + addresses.ISSUER)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidCounter))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with invalid base counterparty', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert(false, 'Should not request ledger info');
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert(false, 'Should not request book offers');
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/' + 'BTC+' + addresses.INVALID + '/USD+' + addresses.ISSUER)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidBase))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with invalid counter counterparty', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert(false, 'Should not request ledger info');
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert(false, 'Should not request book offers');
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/' + 'BTC+' + addresses.ISSUER + '/USD+' + addresses.INVALID)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidCounter))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with XRP as base with counterparty', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert(false, 'Should not request ledger info');
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert(false, 'Should not request book offers');
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/' + 'XRP+' + addresses.ISSUER + '/USD+' + addresses.ISSUER)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidXRPBase))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with XRP as counter with issuer', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert(false, 'Should not request ledger info');
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert(false, 'Should not request book offers');
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/order_book/' + 'BTC+' + addresses.ISSUER + '/XRP+' + addresses.ISSUER)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidXRPCounter))
    .end(done);
  });

  test('v1/accounts/:account/order_book/:base/:counter -- with invalid account', function(done) {
    self.wss.on('request_ledger', function(message, conn) {
      assert(false, 'Should not request ledger info');
    });

    self.wss.on('request_book_offers', function(message, conn) {
      assert(false, 'Should not request book offers');
    });

    self.app
    .get('/v1/accounts/' + addresses.INVALID + '/order_book/BTC+' + addresses.ISSUER + '/XRP')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });
});

suite('get order', function() {
  var self = this
  var hash = testutils.generateHash();

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('v1/accounts/:account/order/:identifier', function(done) {
    self.wss.on('request_tx', function(message, conn) {
      assert.strictEqual(message.transaction, hash);
      conn.send(fixtures.requestTxOfferCreateResponse(message, {
        hash: hash,
        account: addresses.VALID
      }));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders/' + hash)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTOrderResponse({
      hash: hash,
      account: addresses.VALID
    })))
    .end(done);
  });

  test('v1/accounts/:account/order_change/:identifier -- invalid transaction hash', function(done) {
    self.wss.on('request_tx', function(message, conn) {
      assert(false, 'should not submit request');
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders/foo')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidTransactionHash))
    .end(done);
  });

  test('v1/accounts/:account/order_change/:identifier -- invalid transaction (payment)', function(done) {
    var requestTxPaymentResponse = require('./fixtures').payments.transactionResponse;

    self.wss.on('request_tx', function(message, conn) {
      conn.send(requestTxPaymentResponse(message));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/orders/' + hash)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidTransactionNotAnOrder))
    .end(done);
  });

  test('v1/accounts/:account/order_change/:identifier -- invalid account', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert(false, 'Should not request transaction');
    });

    self.app
    .get('/v1/accounts/' + addresses.INVALID + '/orders/' + hash)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });
});
