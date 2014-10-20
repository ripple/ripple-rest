var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').settings;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

// Transaction LastLedgerSequence offset from current ledger sequence
const LEDGER_OFFSET = 8;

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

  it('/accounts/:account/settings -- non-existent account', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountNotFoundResponse(message));
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
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
    var lastLedger = self.app.remote._ledger_current_index;

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'AccountSet');
      assert.strictEqual(so.Flags, 2148859904);
      assert.strictEqual(so.ClearFlag, 6);
      assert.strictEqual(so.SetFlag, 7);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.LastLedgerSequence, lastLedger + LEDGER_OFFSET);
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE');

      conn.send(fixtures.submitSettingsResponse(message, lastLedger + LEDGER_OFFSET));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      //XXX Should set client_resource_id
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: true,
        require_authorization: true,
        disallow_xrp: true,
        domain: 'example.com',
        email_hash: '23463B99B62A72F26ED677CC556C44E8',
        wallet_locator: 'DEADBEEF',
        wallet_size: 1,
        transfer_rate: 2,
        no_freeze: false,
        global_freeze: true
      }})
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTAccountSettingsSubmitResponse(lastLedger)))
      .end(done);
  });

  it('/accounts/:account/settings -- invalid account', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.INVALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: true,
        require_authorization: true,
        disallow_xrp: true,
        domain: 'example.com',
        email_hash: '23463B99B62A72F26ED677CC556C44E8',
        wallet_locator: 'DEADBEEF',
        wallet_size: 1,
        transfer_rate: 2
      }})
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(errors.RESTInvalidAccount))
      .end(done);
  });

  it('/accounts/:account/settings -- missing settings', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTMissingSettingsResponse))
    .end(done);
  });

  it('/accounts/:account/settings -- missing secret', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      //secret: addresses.SECRET,
      settings: {
        require_destination_tag: true,
        require_authorization: true,
        disallow_xrp: true,
        domain: 'example.com',
        email_hash: '23463B99B62A72F26ED677CC556C44E8',
        wallet_locator: 'DEADBEEF',
        wallet_size: 1,
        transfer_rate: 2
      }})
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTMissingSecretResponse))
      .end(done);
  });

  it('/accounts/:account/settings -- invalid setting -- require_destination_tag', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: 1,
        require_authorization: true,
        disallow_xrp: true,
        domain: 'example.com',
        email_hash: '23463B99B62A72F26ED677CC556C44E8',
        wallet_locator: 'DEADBEEF',
        wallet_size: 1,
        transfer_rate: 2
      }})
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTInvalidDestTagResponse))
      .end(done);
  });

  it('/accounts/:account/settings -- invalid setting -- domain', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: true,
        require_authorization: true,
        disallow_xrp: true,
        domain: 1,
        email_hash: '23463B99B62A72F26ED677CC556C44E8',
        wallet_locator: 'DEADBEEF',
        wallet_size: 1,
        transfer_rate: 2
      }})
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTInvalidDomainResponse))
      .end(done);
  });

  it('/accounts/:account/settings -- invalid setting -- transfer_rate', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: true,
        require_authorization: true,
        disallow_xrp: true,
        domain: 'example.com',
        email_hash: '23463B99B62A72F26ED677CC556C44E8',
        wallet_locator: 'DEADBEEF',
        wallet_size: 1,
        transfer_rate: 'asdf'
      }})
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTInvalidTransferRateResponse))
      .end(done);
  });

  it('/accounts/:account/settings -- invalid setting -- no_freeze and global_freeze', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        no_freeze: true,
        global_freeze: true
      }})
      .expect(testutils.checkBody(fixtures.RESTInvalidFreezeResponse))
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  it('/accounts/:account/settings -- invalid setting -- clear no_freeze and global_freeze', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        no_freeze: false,
        global_freeze: false
      }})
      .expect(testutils.checkBody(fixtures.RESTInvalidFreezeResponse))
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  it('/accounts/:account/settings -- clear setting -- require_destination_tag', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'AccountSet');
      assert.strictEqual(so.Flags, 2147614720);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE');

      conn.send(fixtures.submitSettingsResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: false,
      }})
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  it('/accounts/:account/settings -- clear setting -- domain', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'AccountSet');
      assert.strictEqual(so.Flags, 2147483648);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);
      assert.strictEqual(so.Domain, '');
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE');

      conn.send(fixtures.submitSettingsResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        domain: ''
      }})
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  it('/accounts/:account/settings -- clear setting -- email_hash', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'AccountSet');
      assert.strictEqual(so.Flags, 2147483648);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.EmailHash, new Array(32 + 1).join('0'));
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE');

      conn.send(fixtures.submitSettingsResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        email_hash: ''
      }})
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  it('/accounts/:account/settings -- clear setting -- wallet_locator', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'AccountSet');
      assert.strictEqual(so.Flags, 2147483648);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.WalletLocator, new Array(64 + 1).join('0'));
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE');

      conn.send(fixtures.submitSettingsResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        wallet_locator: ''
      }})
      .expect(testutils.checkHeaders)
      .expect(testutils.checkStatus(200))
      .end(done);
  });

  it('/accounts/:account/settings -- clear setting -- transfer_rate', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'AccountSet');
      assert.strictEqual(so.Flags, 2147483648);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.TransferRate, 0);
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE');

      conn.send(fixtures.submitSettingsResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        transfer_rate: ''
      }})
      .expect(testutils.checkHeaders)
      .expect(testutils.checkStatus(200))
      .end(done);
  });

  it('/accounts/:account/settings -- clear setting -- no_freeze', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'AccountSet');
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.ClearFlag, 6);
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE');

      conn.send(fixtures.submitSettingsResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        no_freeze: false
      }})
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  it('/accounts/:account/settings -- clear settings -- no_freeze and global_freeze', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        no_freeze: false,
        global_freeze: false
      }})
      .expect(testutils.checkBody(fixtures.RESTInvalidFreezeResponse))
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .end(done);
  });
});
