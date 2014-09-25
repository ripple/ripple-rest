var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').balances;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var requestPath = fixtures.requestPath;

describe('get balances', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/balances', function(done) {
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
    .expect(testutils.checkBody(fixtures.RESTAccountBalancesResponse))
    .end(done);
  });

  it('/accounts/:account/balances -- invalid account', function(done) {
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

  it('/accounts/:account/balances -- non-existent account', function(done) {
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
    //XXX .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTAccountNotFound))
    .end(done);
  });

  it('/accounts/:account/balances?currency', function(done) {
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

  it('/accounts/:account/balances?currency -- native currency', function(done) {
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

  it('/accounts/:account/balances?currency -- invalid currency', function(done) {
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

  it('/accounts/:account/balances?counterparty', function(done) {
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

  it('/accounts/:account/balances?counterparty -- invalid counterparty', function(done) {
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

  it('/accounts/:account/balances?counterparty -- non-existent counterparty', function(done) {
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

  it('/accounts/:account/balances?counterparty&currency', function(done) {
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
