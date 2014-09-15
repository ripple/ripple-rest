var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').settings;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

describe('get settings', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/settings', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountSettingsResponse))
    .end(done);
  });

  it('/accounts/:account/settings -- invalid account', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.app
    .get(fixtures.requestPath(addresses.INVALID))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });
});

describe('post settings', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/settings', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);

      var account = self.app.remote.getAccount(addresses.VALID);
      assert(account, 'Account missing');
      assert.strictEqual(account.constructor.name, 'Account');

      var transactionManager = account._transactionManager;
      assert(transactionManager, 'Account missing');
      assert.strictEqual(transactionManager.constructor.name, 'TransactionManager');

      var request = transactionManager._request;

      transactionManager._request = function(tx) {
        assert(tx, 'Transaction missing');
        assert.strictEqual(tx.constructor.name, 'Transaction');
        assert.deepEqual(tx.tx_json, {
          Flags: 2147549184,
          TransactionType: 'AccountSet',
          Account: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
          Sequence: 2938,
          SigningPubKey: '02F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D8',
          Fee: '12'
        });

        request.apply(transactionManager, arguments);
      };

      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));
      conn.send(fixtures.submitSettingsResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      //XXX Should set client_resource_id
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: true
      }})
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountSettingsSubmitResponse))
    .end(done);
  });
});
