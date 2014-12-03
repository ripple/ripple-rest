var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').trustlines;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

// Transaction LastLedgerSequence offset from current ledger sequence
const LEDGER_OFFSET = 8;
const MARKER = '29F992CC252056BF690107D1E8F2D9FBAFF29FF107B62B1D1F4E4E11ADF2CC73';
const NEXT_MARKER = '0C812C919D343EAE789B29E8027C62C5792C22172D37EA2B2C0121D2381F80E1';
const LIMIT = 5;

suite('get trustlines', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/trustlines', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountLinesResponse(message));
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountTrustlinesResponse()))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with invalid ledger', function(done) {
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
    .get(fixtures.requestPath(addresses.VALID, '?ledger=foo'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountTrustlinesResponse()))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with ledger', function(done) {
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
    .get(fixtures.requestPath(addresses.VALID, '?ledger=9592219'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountTrustlinesResponse({
      marker: NEXT_MARKER
    })))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with invalid marker', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false);
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '?marker=abcd'))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with valid marker and invalid limit', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false);
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=foo'))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with valid marker and valid limit', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false);
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with valid marker and valid ledger', function(done) {
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
    .get(fixtures.requestPath(addresses.VALID, '?marker=' + MARKER + '&ledger=9592219'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountTrustlinesResponse({
      marker: NEXT_MARKER
    })))
    .end(done);
  });

  test('/accounts/:account/trustlines -- valid ledger and valid limit', function(done) {
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
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER
      }));
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '?ledger=9592219&limit=5'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountTrustlinesResponse({
      marker: NEXT_MARKER,
      limit: LIMIT
    })))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with valid marker, valid limit, and invalid ledger', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_account_lines', function(message, conn) {
      assert(false);
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=foo'))
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTLedgerMissingWithMarker))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with valid marker, valid limit, and valid ledger', function(done) {
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
    .get(fixtures.requestPath(addresses.VALID, '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=9592219'))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountTrustlinesResponse({
      marker: NEXT_MARKER,
      limit: LIMIT
    })))
    .end(done);
  });

  test('/accounts/:account/trustlines -- invalid account', function(done) {
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

  test('/accounts/:account/trustlines -- invalid counterparty', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '?counterparty=' + addresses.INVALID))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidCounterparty))
    .end(done);
  });

  test('/accounts/:account/trustlines -- invalid currency', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert(false, 'Should not request account lines');
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '?currency=invalid'))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidCurrency))
    .end(done);
  });

  test('/accounts/:account/trustlines -- non-existent account', function(done) {
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

suite('post trustlines', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/trustlines -- with validated true, transaction verified response, and transaction validated response', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));
      conn.send(fixtures.submitTrustlineResponse(message));

      process.nextTick(function() {
        conn.send(fixtures.setTrustValidatedResponse());
      });
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID, "?validated=true"))
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
      assert.strictEqual(body.trustline.state, 'validated');
    })
    .end(done);
  });

  test('/accounts/:account/trustlines -- with validated true and ledger sequence too high error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID, "?validated=true"))
    .send({
      secret: addresses.SECRET,
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with validated true and invalid secret error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false);
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID, "?validated=true"))
    .send({
      secret: addresses.INVALID,
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidSecret))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with validated false and transaction verified response', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));

      conn.send(fixtures.submitTrustlineResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID, "?validated=false"))
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
      assert.strictEqual(body.trustline.state, 'pending');
    })
    .end(done);
  });

  test('/accounts/:account/trustlines -- with validated false and ledger sequence too high error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'));
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID, "?validated=false"))
    .send({
      secret: addresses.SECRET,
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTResponseLedgerSequenceTooHigh))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with validated false and invalid secret error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert(false);
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID, "?validated=false"))
    .send({
      secret: addresses.INVALID,
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY
      }
    })
    .expect(testutils.checkStatus(500))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidSecret))
    .end(done);
  });

  test('/accounts/:account/trustlines', function(done) {
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
      assert.strictEqual(typeof body.trustline.ledger, 'string');
      assert.strictEqual(body.trustline.hash, '0F480D344CFC610DFA5CAC62CC1621C92953A05FE8C319281CA49C5C162AF40E');
      assert.strictEqual(body.trustline.state, 'pending');
    })
    .end(done);
  });

  test('/accounts/:account/trustlines -- no-rippling', function(done) {
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

      conn.send(fixtures.submitTrustlineResponse(message, {
        flags: 2147614720
      }));
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

  test('/accounts/:account/trustlines -- frozen trustline', function(done) {
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

      conn.send(fixtures.submitTrustlineResponse(message, {
        flags: 2148532224
      }));
    });

    self.app
    .post(fixtures.requestPath(addresses.VALID))
    .send({
      secret: addresses.SECRET,
      trustline: {
        limit: '1',
        currency: 'USD',
        counterparty: addresses.COUNTERPARTY,
        account_trustline_frozen: true
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
      assert.strictEqual(body.trustline.account_trustline_frozen, true);
    })
    .end(done);
  });

  test('/accounts/:account/trustlines -- invalid account', function(done) {
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

  test('/accounts/:account/trustlines -- missing secret', function(done) {
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

  test('/accounts/:account/trustlines -- missing trustline', function(done) {
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

  test('/accounts/:account/trustlines -- missing limit amount', function(done) {
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

  test('/accounts/:account/trustlines -- missing limit currency', function(done) {
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

  test('/accounts/:account/trustlines -- missing limit currency', function(done) {
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

  test('/accounts/:account/trustlines -- missing limit counterparty', function(done) {
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

  test('/accounts/:account/trustlines -- invalid limit amount', function(done) {
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

  test('/accounts/:account/trustlines -- invalid limit currency', function(done) {
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

  test('/accounts/:account/trustlines -- invalid limit counterparty', function(done) {
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
