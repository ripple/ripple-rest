var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').trustlines;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

// Transaction LastLedgerSequence offset from current ledger sequence
const LEDGER_OFFSET = 8;

describe('get trustlines', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/trustlines', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountLinesResponse(message));
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountTrustlinesResponse))
    .end(done);
  });

  it('/accounts/:account/trustlines -- invalid account', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get(fixtures.requestPath(addresses.INVALID))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });

  it('/accounts/:account/trustlines -- non-existent account', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountNotFoundResponse(message));
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID))
    .expect(testutils.checkStatus(404))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTAccountNotFound))
    .end(done);
  });
});

describe('post trustlines', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/trustlines', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert.strictEqual(so.Flags, 2147483648);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);

      assert.deepEqual(so.LimitAmount, {
        value: '1',
        currency: 'USD',
        issuer: addresses.COUNTERPARTY
      });
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, addresses.VALID);

      conn.send(fixtures.submitTrustlineResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(201))
    .expect(testutils.checkHeaders)
    .expect(function(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.trustline.account, addresses.VALID);
      assert.strictEqual(body.trustline.counterparty, addresses.COUNTERPARTY);
      assert.strictEqual(body.trustline.limit, '1');
      assert.strictEqual(body.trustline.currency, 'USD');
      assert.strictEqual(body.trustline.account_allows_rippling, true);
    })
    .end(done);
  });

  it('/accounts/:account/trustlines -- no-rippling', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert.strictEqual(so.Flags, 2147614720);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);

      assert.deepEqual(so.LimitAmount, {
        value: '1',
        currency: 'USD',
        issuer: addresses.COUNTERPARTY
      });
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, addresses.VALID);

      conn.send(fixtures.submitTrustlineResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY,
        account_allows_rippling: false
      }
    })
    .expect(testutils.checkStatus(201))
    .expect(testutils.checkHeaders)
    .expect(function(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.trustline.account, addresses.VALID);
      assert.strictEqual(body.trustline.counterparty, addresses.COUNTERPARTY);
      assert.strictEqual(body.trustline.limit, '1');
      assert.strictEqual(body.trustline.currency, 'USD');
      assert.strictEqual(body.trustline.account_allows_rippling, false);
    })
    .end(done);
  });

  it('/accounts/:account/trustlines -- frozen trustline', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert.strictEqual(so.Flags, 2148532224);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.strictEqual(so.LastLedgerSequence, self.app.remote._ledger_current_index + LEDGER_OFFSET);

      assert.deepEqual(so.LimitAmount, {
        value: '1',
        currency: 'USD',
        issuer: addresses.COUNTERPARTY
      });
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, addresses.VALID);

      conn.send(fixtures.submitTrustlineResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY,
        account_froze_trustline: true
      }
    })
    .expect(testutils.checkStatus(201))
    .expect(testutils.checkHeaders)
    .expect(function(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.trustline.account, addresses.VALID);
      assert.strictEqual(body.trustline.counterparty, addresses.COUNTERPARTY);
      assert.strictEqual(body.trustline.limit, '1');
      assert.strictEqual(body.trustline.currency, 'USD');
      assert.strictEqual(body.trustline.account_froze_trustline, true);
    })
    .end(done);
  });

  it('/accounts/:account/trustlines -- invalid account', function(done) {
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
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .end(done);
  });

  it('/accounts/:account/trustlines -- missing secret', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false, 'Should not request submit');
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  it('/accounts/:account/trustlines -- missing trustline', function(done) {
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
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  it('/accounts/:account/trustlines -- missing limit amount', function(done) {
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
      trustline: {
        //limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  it('/accounts/:account/trustlines -- missing limit currency', function(done) {
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
      trustline: {
        //limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  it('/accounts/:account/trustlines -- missing limit currency', function(done) {
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
      trustline: {
        limit: '1',
        //currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  it('/accounts/:account/trustlines -- missing limit counterparty', function(done) {
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
      trustline: {
        limit: '1',
        currency: 'USD',
        //counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  it('/accounts/:account/trustlines -- invalid limit amount', function(done) {
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
      trustline: {
        limit: 'asdf',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  it('/accounts/:account/trustlines -- invalid limit currency', function(done) {
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
      trustline: {
        limit: '1',
        currency: 'usd',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  it('/accounts/:account/trustlines -- invalid limit counterparty', function(done) {
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
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.INVALID
      }
    })
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });
});

