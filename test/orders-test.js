var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').orders;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var requestPath = fixtures.requestPath;
var Currency = ripple.Currency;

suite('get orders', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/orders/:taker_pays/:taker_gets', function(done) {
    self.wss.once('request_book_offers', function(message, conn) {
      assert.strictEqual(message.taker_gets.issuer, addresses.VALID);
      assert.strictEqual(message.taker_gets.currency, Currency.from_human('BTC').to_hex());
      assert.strictEqual(message.taker_pays.issuer, addresses.VALID);
      assert.strictEqual(message.taker_pays.currency, Currency.from_human('USD').to_hex());
      assert.strictEqual(message.command, 'book_offers');
      conn.send(fixtures.bookOffersResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTOrdersResponse))
    .end(done);
  });
});
