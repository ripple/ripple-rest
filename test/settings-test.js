var _        = require('lodash');
var ripple   = require('ripple-lib');
var expect   = require('chai').expect;
var settings = require('../api/settings');

function createInterface() {
  var server = new process.EventEmitter;

  server._connected = true;
  server._lastLedgerClose = Date.now() - 1;
  server._opts = { url: 'wss://example.com' };

  server.computeFee = function() {
    return '12';
  };

  var remote = new ripple.Remote({
    servers: [ ]
  });

  remote._servers.push(server);

  remote._getServer = function() {
    return server;
  };

  return { remote: remote }
};

describe('settings', function() {
  var $;

  beforeEach(function() {
    $ = createInterface();
  });

  it('getSettings', function(done) {
    var accountInfo = {
      "account_data": {
        "Account": "r45r1T2utToqmputeEe2ErKqE1rEFDoccH",
        "Balance": "922913243",
        "Domain": "6578616D706C652E636F6D",
        "EmailHash": "23463B99B62A72F26ED677CC556C44E8",
        "Flags": 655360,
        "LedgerEntryType": "AccountRoot",
        "OwnerCount": 1,
        "PreviousTxnID": "19899273706A9E040FDB5885EE991A1DC2BAD878A0D6E7DBCFB714E63BF737F7",
        "PreviousTxnLgrSeq": 6614625,
        "Sequence": 2938,
        "WalletLocator": "00000000000000000000000000000000000000000000000000000000DEADBEEF",
        "index": "396400950EA27EB5710C0D5BE1D2B4689139F168AC5D07C13B8140EC3F82AE71",
        "urlgravatar": "http://www.gravatar.com/avatar/23463b99b62a72f26ed677cc556c44e8"
      },
      "ledger_current_index": 6614628
    };

    $.remote.request = function(request) {
      request.emit('success', accountInfo);
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.settings).to.be.an('object');
        expect(obj.settings).to.have.property('account', accountInfo.account_data.Account);
        expect(obj.settings).to.have.property('transfer_rate', '');
        expect(obj.settings).to.have.property('password_spent', false);
        expect(obj.settings).to.have.property('require_destination_tag', true);
        expect(obj.settings).to.have.property('require_authorization', false);
        expect(obj.settings).to.have.property('disallow_xrp', true);
        expect(obj.settings).to.have.property('transaction_sequence', accountInfo.account_data.Sequence);
        expect(obj.settings).to.have.property('email_hash', accountInfo.account_data.EmailHash);
        expect(obj.settings).to.have.property('wallet_locator', accountInfo.account_data.WalletLocator);
        expect(obj.settings).to.have.property('wallet_size', '');
        expect(obj.settings).to.have.property('message_key', '');
        expect(obj.settings).to.have.property('domain', 'example.com');
        expect(obj.settings).to.have.property('signers', '');
        done();
      }
    };

    settings.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getSettings -- missing account', function(done) {
    var req = {
      params: { account: void(0) },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(false);
        expect(obj.message).to.equal('Parameter is not a valid Ripple address: account');
        done();
      }
    }

    settings.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getSettings -- invalid account', function(done) {
    var req = {
      params: { account: 'asdf' },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(false);
        expect(obj.message).to.equal('Parameter is not a valid Ripple address: account');
        done();
      }
    }

    settings.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH',
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          require_destination_tag: true,
          require_authorization: true,
          disallow_xrp: true,
          domain: 'example.com',
          email_hash: '23463B99B62A72F26ED677CC556C44E8',
          wallet_locator: 'DEADBEEF',
          wallet_size: 1,
          transfer_rate: 1010000000
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      expect(tx).to.be.an('object');
      expect(tx.tx_json).to.be.an('object');
      expect(tx.tx_json).to.have.property('TransactionType', 'AccountSet');
      expect(tx.tx_json).to.have.property('Sequence', 1);
      expect(tx.tx_json).to.have.property('Flags', 2148859904);
      expect(tx.tx_json).to.have.property('Domain', '6578616D706C652E636F6D');
      expect(tx.tx_json).to.have.property('EmailHash', '23463B99B62A72F26ED677CC556C44E8');
      expect(tx.tx_json).to.have.property('WalletLocator', '00000000000000000000000000000000000000000000000000000000DEADBEEF');
      expect(tx.tx_json).to.have.property('WalletSize', 1);
      expect(tx.tx_json).to.have.property('TransferRate', 1010000000);
      tx.emit('proposed');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.settings).to.be.an('object');
        expect(obj.settings).to.have.property('require_destination_tag', true);
        expect(obj.settings).to.have.property('require_authorization', true);
        expect(obj.settings).to.have.property('disallow_xrp', true);
        expect(obj.settings).to.have.property('email_hash', '23463B99B62A72F26ED677CC556C44E8');
        expect(obj.settings).to.have.property('wallet_locator', 'DEADBEEF');
        expect(obj.settings).to.have.property('wallet_size', 1);
        expect(obj.settings).to.have.property('domain', 'example.com');
        expect(obj.settings).to.have.property('transfer_rate', 1010000000);
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- missing account', function(done) {
    var req = {
      params: {
        account: void(0)
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          require_destination_tag: true,
          require_authorization: true,
          disallow_xrp: true,
          domain: 'example.com',
          email_hash: '23463B99B62A72F26ED677CC556C44E8',
          wallet_locator: 'DEADBEEF',
          wallet_size: 1,
          transfer_rate: 2
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      tx.emit('proposed');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(false);
        expect(obj.message).to.equal('Parameter is not a valid Ripple address: account');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- invalid account', function(done) {
    var req = {
      params: {
        account: 'asfd'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          require_destination_tag: true,
          require_authorization: true,
          disallow_xrp: true,
          domain: 'example.com',
          email_hash: '23463B99B62A72F26ED677CC556C44E8',
          wallet_locator: 'DEADBEEF',
          wallet_size: 1,
          transfer_rate: 2
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      tx.emit('proposed');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(false);
        expect(obj.message).to.equal('Parameter is not a valid Ripple address: account');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- missing settings', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEdX',
        settings: void(0)
      }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(false);
        expect(obj.message).to.equal('Parameter missing: settings');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- invalid secret', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEdX',
        settings: {
          require_destination_tag: true,
          require_authorization: true,
          disallow_xrp: true,
          domain: 'example.com',
          email_hash: '23463B99B62A72F26ED677CC556C44E8',
          wallet_locator: 'DEADBEEF',
          wallet_size: 1,
          transfer_rate: 2
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      tx.emit('proposed');
    };

    var res = {
      json: function(statusCode, obj) { }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.exist;
      expect(err).to.have.property('result', 'tejSecretInvalid');
      expect(err).to.have.property('message', 'Invalid secret');
      done();
    });
  });

  it('changeSettings -- invalid flag', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          require_destination_tag: '1',
        }
      }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not boolean: require_destination_tag');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- invalid field (domain)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          domain: 1
        }
      }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter must be a string: domain');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- invalid field (email_hash)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          email_hash: false
        }
      }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter must be a string: email_hash');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- invalid field (wallet_locator)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          wallet_locator: false
        }
      }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter must be a string: wallet_locator');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- invalid field (wallet_size)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          wallet_size: 'a'
        }
      }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter must be a number: wallet_size');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- invalid field (transfer_rate)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          transfer_rate: 'a'
        }
      }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter must be a number: transfer_rate');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- clear field (domain)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          domain: '',
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      expect(tx).to.be.an('object');
      expect(tx.tx_json).to.be.an('object');
      expect(tx.tx_json).to.have.property('TransactionType', 'AccountSet');
      expect(tx.tx_json).to.have.property('Sequence', 1);
      expect(tx.tx_json).to.have.property('Domain', '');
      tx.emit('proposed');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.settings).to.be.an('object');
        expect(obj.settings).to.have.property('domain', '');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- clear field (email_hash)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          email_hash: ''
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      expect(tx).to.be.an('object');
      expect(tx.tx_json).to.be.an('object');
      expect(tx.tx_json).to.have.property('TransactionType', 'AccountSet');
      expect(tx.tx_json).to.have.property('Sequence', 1);
      expect(tx.tx_json).to.have.property('EmailHash', new Array(32 + 1).join('0'));
      tx.emit('proposed');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.settings).to.be.an('object');
        expect(obj.settings).to.have.property('email_hash', '');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- clear field (wallet_locator)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          wallet_locator: ''
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      expect(tx).to.be.an('object');
      expect(tx.tx_json).to.be.an('object');
      expect(tx.tx_json).to.have.property('TransactionType', 'AccountSet');
      expect(tx.tx_json).to.have.property('Sequence', 1);
      expect(tx.tx_json).to.have.property('WalletLocator', new Array(64 + 1).join('0'));
      tx.emit('proposed');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.settings).to.be.an('object');
        expect(obj.settings).to.have.property('wallet_locator', '');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('changeSettings -- clear field (transfer_rate)', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        settings: {
          transfer_rate: ''
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      expect(tx).to.be.an('object');
      expect(tx.tx_json).to.be.an('object');
      expect(tx.tx_json).to.have.property('TransactionType', 'AccountSet');
      expect(tx.tx_json).to.have.property('Sequence', 1);
      expect(tx.tx_json).to.have.property('TransferRate', 0);
      tx.emit('proposed');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.settings).to.be.an('object');
        expect(obj.settings).to.have.property('transfer_rate', '');
        done();
      }
    };

    settings.change($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });
});
