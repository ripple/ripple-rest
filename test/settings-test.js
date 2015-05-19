/* eslint-disable new-cap */
'use strict';
var _ = require('lodash');
var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').settings;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

suite('prepare settings', function() {
  var self = this;
  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('set domain', function(done) {
    self.wss.on('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    testutils.withDeterministicPRNG(function(_done) {
      self.app
        .post(fixtures.requestPath(addresses.VALID, '?submit=false'))
        .send(fixtures.prepareSettingsRequest)
        .expect(testutils.checkStatus(200))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(fixtures.prepareSettingsResponse))
        .end(_done);
    }, done);
  });

  test('set domain -- no secret', function(done) {
    self.wss.on('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    testutils.withDeterministicPRNG(function(_done) {
      self.app
        .post(fixtures.requestPath(addresses.VALID, '?submit=false'))
        .send(_.omit(fixtures.prepareSettingsRequest, 'secret'))
        .expect(testutils.checkStatus(200))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(testutils.withoutSigning(
          fixtures.prepareSettingsResponse)))
        .end(_done);
    }, done);
  });
});

suite('get settings', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/settings', function(done) {
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

  test('/accounts/:account/settings -- invalid account', function(done) {
    self.app
    .get(fixtures.requestPath(addresses.INVALID))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });

  test('/accounts/:account/settings -- non-existent account', function(done) {
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

suite('post settings', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/settings?validated=true', function(done) {
    var currentLedger = self.remote._ledger_current_index;
    var lastLedger = currentLedger + testutils.LEDGER_OFFSET;

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
      assert.strictEqual(so.LastLedgerSequence, lastLedger);

      conn.send(fixtures.submitSettingsResponse(message, {
        last_ledger: lastLedger
      }));

      setImmediate(function() {
        conn.send(fixtures.settingsValidatedResponse({
          last_ledger: lastLedger
        }));
      });
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID, '?validated=true'))
    .send({
      // XXX Should set client_resource_id
      secret: addresses.SECRET,
      settings: fixtures.settings()
    })
    .expect(testutils.checkBody(fixtures.RESTAccountSettingsSubmitResponse({
      current_ledger: currentLedger,
      state: 'validated'
    })))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/settings -- invalid account', function(done) {
    self.app
    .post(fixtures.requestPath(addresses.INVALID))
    .send({
      secret: addresses.SECRET,
      settings: fixtures.settings()
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });

  test('/accounts/:account/settings -- settings missing', function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter missing: settings'
    })))
    .end(done);
  });

  test('/accounts/:account/settings -- secret missing', function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      // secret: addresses.SECRET,
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
      .expect(testutils.checkBody(errors.RESTMissingSecret))
      .end(done);
  });

  test('/accounts/:account/settings -- secret invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET + 'test',
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
      .expect(testutils.checkBody(errors.RESTInvalidSecret))
      .end(done);
  });

  test('/accounts/:account/settings -- require_destination_tag invalid',
      function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: fixtures.settings({
        require_destination_tag: 1
      })
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a boolean: require_destination_tag'
    })))
    .end(done);
  });

  test('/accounts/:account/settings -- require_authorization invalid',
      function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: fixtures.settings({
        require_authorization: 1
      })
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a boolean: require_authorization'
    })))
    .end(done);
  });

  test('/accounts/:account/settings -- disallow_xrp invalid', function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: fixtures.settings({
        disallow_xrp: 1
      })
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a boolean: disallow_xrp'
    })))
    .end(done);
  });

  test('/accounts/:account/settings -- domain invalid', function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: fixtures.settings({
        domain: 1
      })
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a string: domain'
    })))
    .end(done);
  });

  test('/accounts/:account/settings -- transfer_rate invalid', function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: fixtures.settings({
        transfer_rate: 'asdf'
      })
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter must be a number: transfer_rate'
    })))
    .end(done);
  });

  test('/accounts/:account/settings -- no_freeze and global_freeze',
      function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        no_freeze: true,
        global_freeze: true
      }})
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'invalid_request',
        error: 'restINVALID_PARAMETER',
        message: 'Unable to set/clear no_freeze and global_freeze'
      })))
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  test('/accounts/:account/settings -- clear no_freeze and global_freeze',
      function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        no_freeze: false,
        global_freeze: false
      }})
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'invalid_request',
        error: 'restINVALID_PARAMETER',
        message: 'Unable to set/clear no_freeze and global_freeze'
      })))
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  test('/accounts/:account/settings -- password_spent invalid', function(done) {
    self.app
      .post(fixtures.requestPath(addresses.VALID))
      .send({
        secret: addresses.SECRET,
        settings: fixtures.settings({
          password_spent: 'not a boolean'
        })
      })
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'invalid_request',
        error: 'restINVALID_PARAMETER',
        message: 'Parameter must be a boolean: password_spent'
      })))
      .end(done);
  });

  test('/accounts/:account/settings -- disable_master invalid', function(done) {
    self.app
      .post(fixtures.requestPath(addresses.VALID))
      .send({
        secret: addresses.SECRET,
        settings: fixtures.settings({
          disable_master: 'not a boolean'
        })
      })
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'invalid_request',
        error: 'restINVALID_PARAMETER',
        message: 'Parameter must be a boolean: disable_master'
      })))
      .end(done);
  });

  test('/accounts/:account/settings -- email_hash too long', function(done) {
    self.app
      .post(fixtures.requestPath(addresses.VALID))
      .send({
        secret: addresses.SECRET,
        settings: fixtures.settings({
          email_hash: '23463B99B62A72F26ED677CC556C44E8F'
        })
      })
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'invalid_request',
        error: 'restINVALID_PARAMETER',
        message: 'Parameter length exceeded: EmailHash'
      })))
      .end(done);
  });

  test('/accounts/:account/settings -- require_destination_tag'
        + ' -- no op setting', function(done) {
    var hash = testutils.generateHash();

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
      assert.strictEqual(so.Flags &
        ripple.Transaction.flags.AccountSet.RequireDestTag, 0);

      conn.send(fixtures.submitSettingsResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: undefined
      }
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/settings -- require_destination_tag'
        + ' -- clear setting', function(done) {
    var hash = testutils.generateHash();

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
      assert((so.Flags
              & ripple.Transaction.flags.AccountSet.OptionalDestTag) > 0);

      conn.send(fixtures.submitSettingsResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        require_destination_tag: false
      }
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/settings -- domain -- clear setting',
      function(done) {
    var hash = testutils.generateHash();

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
      assert.strictEqual(so.Domain, '');

      conn.send(fixtures.submitSettingsResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        domain: ''
      }
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/settings -- email_hash -- clear setting',
      function(done) {
    var hash = testutils.generateHash();

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
      assert.strictEqual(so.EmailHash, new Array(32 + 1).join('0'));

      conn.send(fixtures.submitSettingsResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        email_hash: ''
      }
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/settings -- wallet_locator -- clear setting',
      function(done) {
    var hash = testutils.generateHash();

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
      assert.strictEqual(so.WalletLocator, new Array(64 + 1).join('0'));

      conn.send(fixtures.submitSettingsResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        wallet_locator: ''
      }
    })
    .expect(testutils.checkHeaders)
    .expect(testutils.checkStatus(200))
    .end(done);
  });

  test('/accounts/:account/settings -- transfer_rate -- clear setting',
      function(done) {
    var hash = testutils.generateHash();

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
      assert.strictEqual(so.TransferRate, 0);

      conn.send(fixtures.submitSettingsResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        transfer_rate: ''
      }
    })
    .expect(testutils.checkHeaders)
    .expect(testutils.checkStatus(200))
    .end(done);
  });

  test('/accounts/:account/settings -- no_freeze -- clear setting',
      function(done) {
    var hash = testutils.generateHash();

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
      assert.strictEqual(so.ClearFlag, 6);

      conn.send(fixtures.submitSettingsResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        no_freeze: false
      }
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/settings -- default_ripple -- clear setting',
      function(done) {
    var hash = testutils.generateHash();

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
      assert.strictEqual(so.ClearFlag, 8);

      conn.send(fixtures.submitSettingsResponse(message, {
        hash: hash
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        default_ripple: false
      }
    })
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/settings -- no_freeze and global_freeze'
        + ' -- clear settings', function(done) {
    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      settings: {
        no_freeze: false,
        global_freeze: false
      }})
      .expect(testutils.checkBody(errors.RESTErrorResponse({
        type: 'invalid_request',
        error: 'restINVALID_PARAMETER',
        message: 'Unable to set/clear no_freeze and global_freeze'
      })))
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  test('/accounts/:account/settings -- transfer_rate', function(done) {
    var currentLedger = self.remote._ledger_current_index;
    var lastLedger = currentLedger + testutils.LEDGER_OFFSET;

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransferRate, 1200000000);

      conn.send(fixtures.submitSettingsResponse(message, lastLedger));
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
        transfer_rate: 1.2,
        no_freeze: false,
        global_freeze: true
      }})
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .end(done);
  });

  test('/accounts/:account/settings?validated=true -- ledger sequence too high',
      function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));
      testutils.closeLedgers(conn);
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID, '?validated=true'))
    .send({
      secret: addresses.SECRET,
      settings: fixtures.settings()
    })
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/settings -- secret invalid', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET + 'test',
      settings: fixtures.settings()
    })
    .expect(testutils.checkBody(errors.RESTInvalidSecret))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });
});
