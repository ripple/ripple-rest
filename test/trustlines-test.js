/* eslint-disable max-len */
/* eslint-disable new-cap */
'use strict';

var _ = require('lodash');
var assert = require('assert');
var ripple = require('ripple-lib');
var testutils = require('./testutils');
var fixtures = require('./fixtures').trustlines;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

var DEFAULT_LIMIT = 200;
var LIMIT = 5;

var MARKER = '29F992CC252056BF690107D1E8F2D9FBAFF29FF107B62B1D1F4E4E11ADF2CC73';
var NEXT_MARKER = '0C812C919D343EAE789B29E8027C62C5792C22172D37EA2B2C0121D2381F80E1';
var LEDGER = 9592219;
var LEDGER_HASH = 'FD22E2A8D665A01711C0147173ECC0A32466BA976DE697E95197933311267BE8';

suite('prepare trustLine', function() {
  var self = this;
  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('USD with COUNTERPARTY', function(done) {
    self.wss.on('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    testutils.withDeterministicPRNG(function(_done) {
      self.app
        .post(fixtures.requestPath(addresses.VALID, '?submit=false'))
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
        .expect(testutils.checkBody(fixtures.prepareTrustLineResponse))
        .end(_done);
    }, done);
  });
});

suite('get trustlines', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  // does a GET request to /v1/accounts/:account/trustlines
  // with the specified query string and checks that the status code and
  // response body are returned as expected
  function testGetRequest(options, done) {
    assert(done && options,
      'Error in test code: must specify done function and options');
    assert(options.account && options.expectedStatus,
      'Error in test code: must specify account,'
      + ' queryString and expectedStatus');
    assert(!(options.expectedBody && options.expectFn),
      'Error in test code: cannot specify both expectedBody and expectFn');
    if (options.expectedBody) {
      options.expectFn = testutils.checkBody(options.expectedBody);
    }
    testutils.loadArguments(options, {
      account: null,
      queryString: '',
      expectedBody: null,
      expectedStatus: null,
      expectFn: function() {}
    });
    return self.app
    .get(fixtures.requestPath(options.account, options.queryString || ''))
    .expect(options.expectFn)
    .expect(testutils.checkStatus(options.expectedStatus))
    .expect(testutils.checkHeaders)
    .end(done);
  }

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/trustlines', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 'validated');
      assert.strictEqual(message.limit, DEFAULT_LIMIT);
      conn.send(fixtures.accountLinesResponse(message, {
        ledger: LEDGER,
        marker: NEXT_MARKER
      }));
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '',
      expectedBody: fixtures.RESTAccountTrustlinesResponse({
        ledger: LEDGER,
        marker: NEXT_MARKER,
        limit: DEFAULT_LIMIT
      }),
      expectedStatus: 200
    }, done);
  });

  test('/accounts/:account/trustlines -- with limit=all', function(done) {
    self.wss.on('request_account_lines', function(message, conn) {
      if (message.ledger_index === 'validated') {
        assert.strictEqual(message.command, 'account_lines');
        assert.strictEqual(message.account, addresses.VALID);
        assert.strictEqual(message.ledger_index, 'validated');
        assert.strictEqual(message.marker, undefined);
        assert.notEqual(message.limit, 'all');
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
    .get('/v1/accounts/' + addresses.VALID + '/trustlines?limit=all')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }

      assert.strictEqual(res.body.trustlines.length, 48);
      assert.strictEqual(res.body.marker, undefined);
      assert.strictEqual(res.body.ledger, LEDGER);
      assert.strictEqual(res.body.validated, true);

      done();
    });
  });

  test('/accounts/:account/trustlines -- with invalid ledger', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, 'validated');
      conn.send(fixtures.accountLinesResponse(message));
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?ledger=foo',
      expectedBody: errors.restInvalidParameter('ledger'),
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- with ledger (sequence)', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      conn.send(fixtures.accountLinesResponse(message));
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?ledger=' + LEDGER,
      expectedBody: fixtures.RESTAccountTrustlinesResponse(),
      expectedStatus: 200
    }, done);
  });

  test('/accounts/:account/trustlines -- with ledger (hash)', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_hash, LEDGER_HASH);
      conn.send(fixtures.accountLinesResponse(message, {
        ledger: LEDGER
      }));
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?ledger=' + LEDGER_HASH,
      expectedBody: fixtures.RESTAccountTrustlinesResponse({
        ledger: LEDGER
      }),
      expectedStatus: 200
    }, done);
  });

  test('/accounts/:account/trustlines -- with non-validated ledger', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      conn.send(fixtures.accountLinesResponse(message, {
        validated: false
      }));
    });

    self.app
    .get(fixtures.requestPath(addresses.VALID, '?ledger=' + LEDGER))
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTAccountTrustlinesResponse({
      validated: false
    })))
    .end(done);
  });

  test('/accounts/:account/trustlines -- with invalid marker', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=abcd',
      expectedStatus: 400,
      expectedBody: errors.restInvalidParameter('ledger')
    }, done);
  });

  test('/accounts/:account/trustlines -- with valid marker and invalid limit', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=' + MARKER + '&limit=foo',
      expectedStatus: 400,
      expectedBody: errors.restInvalidParameter('limit')
    }, done);
  });

  test('/accounts/:account/trustlines -- with valid marker and valid limit', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=' + MARKER + '&limit=' + LIMIT,
      expectedStatus: 400,
      expectedBody: errors.restInvalidParameter('ledger')
    }, done);
  });

  test('/accounts/:account/trustlines -- with valid marker and valid ledger', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      assert.strictEqual(message.marker, MARKER);
      conn.send(fixtures.accountLinesResponse(message, {
        ledger: LEDGER,
        marker: NEXT_MARKER
      }));
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=' + MARKER + '&ledger=' + LEDGER,
      expectedBody: fixtures.RESTAccountTrustlinesResponse({
        marker: NEXT_MARKER,
        ledger: LEDGER
      }),
      expectedStatus: 200
    }, done);
  });

  test('/accounts/:account/trustlines -- valid ledger and valid limit', function(done) {
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

    testGetRequest({
      account: addresses.VALID,
      queryString: '?ledger=' + LEDGER + '&limit=' + LIMIT,
      expectedBody: fixtures.RESTAccountTrustlinesResponse({
        marker: NEXT_MARKER,
        limit: LIMIT,
        ledger: LEDGER
      }),
      expectedStatus: 200
    }, done);
  });

  test('/accounts/:account/trustlines -- with valid marker, valid limit, and invalid ledger', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=foo',
      expectedStatus: 400,
      expectedBody: errors.restInvalidParameter('ledger')
    }, done);
  });

  test('/accounts/:account/trustlines -- with valid marker, valid limit, and ledger=validated', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=validated',
      expectedStatus: 400,
      expectedBody: errors.restInvalidParameter('ledger')
    }, done);
  });

  test('/accounts/:account/trustlines -- with valid marker, valid limit, and ledger=current', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=current',
      expectedStatus: 400,
      expectedBody: errors.restInvalidParameter('ledger')
    }, done);
  });

  test('/accounts/:account/trustlines -- with valid marker, valid limit, and ledger=closed', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false);
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=closed',
      expectedStatus: 400,
      expectedBody: errors.restInvalidParameter('ledger')
    }, done);
  });

  test('/accounts/:account/trustlines -- with valid marker, valid limit, and valid ledger', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      assert.strictEqual(message.ledger_index, LEDGER);
      assert.strictEqual(message.limit, LIMIT);
      assert.strictEqual(message.marker, MARKER);
      conn.send(fixtures.accountLinesResponse(message, {
        marker: NEXT_MARKER,
        ledger: LEDGER
      }));
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?marker=' + MARKER + '&limit=' + LIMIT + '&ledger=' + LEDGER,
      expectedBody: fixtures.RESTAccountTrustlinesResponse({
        marker: NEXT_MARKER,
        limit: LIMIT,
        ledger: LEDGER
      }),
      expectedStatus: 200
    }, done);
  });

  test('/accounts/:account/trustlines -- invalid account', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false, 'Should not request account lines');
    });

    testGetRequest({
      account: addresses.INVALID,
      queryString: '',
      expectedStatus: 400,
      expectedBody: errors.RESTInvalidAccount
    }, done);
  });

  test('/accounts/:account/trustlines -- invalid counterparty', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false, 'Should not request account lines');
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?counterparty=' + addresses.INVALID,
      expectedStatus: 400,
      expectedBody: errors.RESTInvalidCounterparty
    }, done);
  });

  test('/accounts/:account/trustlines -- invalid currency', function(done) {
    self.wss.once('request_account_lines', function() {
      assert(false, 'Should not request account lines');
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '?currency=invalid',
      expectedStatus: 400,
      expectedBody: errors.RESTInvalidCurrency
    }, done);
  });

  test('/accounts/:account/trustlines -- non-existent account', function(done) {
    self.wss.once('request_account_lines', function(message, conn) {
      assert.strictEqual(message.command, 'account_lines');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountNotFoundResponse(message));
    });

    testGetRequest({
      account: addresses.VALID,
      queryString: '',
      expectedStatus: 404,
      expectedBody: errors.RESTAccountNotFound
    }, done);
  });
});

suite('post trustlines', function() {
  var self = this;

  var defaultData = {
    secret: addresses.SECRET,
    trustline: {
      limit: '1',
      currency: 'USD',
      counterparty: addresses.COUNTERPARTY
    }
  };

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  // does a POST request to /v1/accounts/:account/trustlines
  // with the specified query string & post data and checks that the status
  // code and response body are returned as expected
  function testPostRequest(options, done) {
    assert(done && options,
      'Error in test code: must specify done function and options');
    assert(options.account && options.expectedStatus && options.data,
      'Error in test code: must specify account,'
      + ' queryString, data, and expectedStatus');
    assert(!(options.expectedBody && options.expectFn),
      'Error in test code: cannot specify both expectedBody and expectFn');
    if (options.expectedBody) {
      options.expectFn = testutils.checkBody(options.expectedBody);
    }
    testutils.loadArguments(options, {
      account: null,
      queryString: '',
      data: null,
      expectedStatus: null,
      expectedBody: null,
      expectFn: function() {}
    });
    self.app
    .post(fixtures.requestPath(options.account, options.queryString || ''))
    .send(options.data)
    .expect(options.expectFn)
    .expect(testutils.checkStatus(options.expectedStatus))
    .expect(testutils.checkHeaders)
    .end(done);
  }

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/trustlines?validated=true', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'),
        'Missing signed transaction blob');
      conn.send(fixtures.submitTrustlineResponse(message));

      process.nextTick(function() {
        conn.send(fixtures.setTrustValidatedResponse());
      });
    });

    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.state, 'validated');
    }

    testPostRequest({
      account: addresses.VALID,
      queryString: '?validated=true',
      data: defaultData,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- complex currency', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'),
        'Missing signed transaction blob');
      var options = {
        currency: '015841551A748AD2C1F76FF6ECB0CCCD00000000',
        hash: hash
      };
      conn.send(fixtures.submitTrustlineResponse(message, options));

      process.nextTick(function() {
        conn.send(fixtures.setTrustValidatedResponse({hash: hash}));
      });
    });

    var data = _.cloneDeep(defaultData);
    data.trustline.currency = '015841551A748AD2C1F76FF6ECB0CCCD00000000';
    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.state, 'pending');
    }
    testPostRequest({
      account: addresses.VALID,
      data: defaultData,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- complex currency, remove trustline', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'), 'Missing signed transaction blob');
      var options = {
        currency: '015841551A748AD2C1F76FF6ECB0CCCD00000000',
        limit: '0',
        hash: hash
      };
      conn.send(fixtures.submitTrustlineResponse(message, options));
    });

    var data = _.cloneDeep(defaultData);
    data.trustline.limit = '0';
    data.trustline.currency = '015841551A748AD2C1F76FF6ECB0CCCD00000000';
    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.state, 'pending');
    }
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- with validated false and transaction verified response', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'), 'Missing signed transaction blob');
      conn.send(fixtures.submitTrustlineResponse(message));
    });

    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.state, 'pending');
    }
    testPostRequest({
      account: addresses.VALID,
      queryString: '?validated=false',
      data: defaultData,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- ledger sequence too high error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'), 'Missing signed transaction blob');
      conn.send(fixtures.ledgerSequenceTooHighResponse(message));

      testutils.closeLedgers(conn);
    });

    testPostRequest({
      account: addresses.VALID,
      data: defaultData,
      expectedStatus: 500,
      expectedBody: errors.RESTResponseLedgerSequenceTooHigh
    }, done);
  });

  test('/accounts/:account/trustlines -- invalid secret error', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function() {
      assert(false);
    });

    var data = _.cloneDeep(defaultData);
    data.secret = addresses.INVALID;
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 400,
      expectedBody: errors.RESTInvalidSecret
    }, done);
  });

  test('/accounts/:account/trustlines', function(done) {
    var hash = testutils.generateHash();
    var currentLedger = self.remote._ledger_current_index;
    var lastLedger = currentLedger + testutils.LEDGER_OFFSET;

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'), 'Missing signed transaction blob');

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert.strictEqual(so.Flags, 2147483648);
      assert.strictEqual(typeof so.Sequence, 'number');
      assert.deepEqual(so.LimitAmount, {
        value: '1',
        currency: 'USD',
        issuer: addresses.COUNTERPARTY
      });
      assert.strictEqual(so.Fee, '12');
      assert.strictEqual(so.Account, addresses.VALID);
      assert.strictEqual(so.LastLedgerSequence, lastLedger);

      conn.send(fixtures.submitTrustlineResponse(message, {
        hash: hash
      }));
    });

    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.trustline.account, addresses.VALID);
      assert.strictEqual(body.trustline.counterparty, addresses.COUNTERPARTY);
      assert.strictEqual(body.trustline.limit, '1');
      assert.strictEqual(body.trustline.currency, 'USD');
      assert.strictEqual(body.trustline.account_allows_rippling, true);
      assert.strictEqual(typeof body.ledger, 'string');
      assert.strictEqual(body.hash, hash);
      assert.strictEqual(body.state, 'pending');
    }
    testPostRequest({
      account: addresses.VALID,
      data: defaultData,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- limit 0', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert.strictEqual(so.LimitAmount.value, '0');

      conn.send(fixtures.submitTrustlineResponse(message, {
        hash: hash
      }));
    });

    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
    }

    var data = _.cloneDeep(defaultData);
    data.trustline.limit = 0;

    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- no-rippling', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'), 'Missing signed transaction blob');

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert((so.Flags & ripple.Transaction.flags.TrustSet.NoRipple) > 0);

      conn.send(fixtures.submitTrustlineResponse(message, {
        hash: hash,
        flags: so.Flags
      }));
    });

    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.trustline.account_allows_rippling, false);
    }
    var data = _.cloneDeep(defaultData);
    data.trustline.account_allows_rippling = false;
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- frozen trustline', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'), 'Missing signed transaction blob');

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert((so.Flags & ripple.Transaction.flags.TrustSet.SetFreeze) > 0);

      conn.send(fixtures.submitTrustlineResponse(message, {
        hash: hash,
        flags: so.Flags
      }));
    });

    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.trustline.account_trustline_frozen, true);
    }
    var data = _.cloneDeep(defaultData);
    data.trustline.account_trustline_frozen = true;
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- unfreeze trustline', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'), 'Missing signed transaction blob');

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert((so.Flags & ripple.Transaction.flags.TrustSet.ClearFreeze) > 0);

      conn.send(fixtures.submitTrustlineResponse(message, {
        hash: hash,
        flags: so.Flags
      }));
    });

    var data = _.cloneDeep(defaultData);
    data.trustline.account_trustline_frozen = false;
    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.trustline.account_trustline_frozen, false);
    }
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- authorized', function(done) {
    var hash = testutils.generateHash();

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      assert(message.hasOwnProperty('tx_blob'), 'Missing signed transaction blob');

      var so = new ripple.SerializedObject(message.tx_blob).to_json();

      assert.strictEqual(so.TransactionType, 'TrustSet');
      assert((so.Flags & ripple.Transaction.flags.TrustSet.SetAuth) > 0);

      conn.send(fixtures.submitTrustlineResponse(message, {
        hash: hash,
        flags: so.Flags
      }));
    });

    var data = _.cloneDeep(defaultData);
    data.trustline.authorized = true;
    function expectFn(res) {
      var body = res.body;
      assert.strictEqual(body.success, true);
      assert(body.hasOwnProperty('trustline'));
      assert.strictEqual(body.trustline.authorized, true);
    }
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 201,
      expectFn: expectFn
    }, done);
  });

  test('/accounts/:account/trustlines -- invalid account', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    testPostRequest({
      account: addresses.INVALID,
      data: defaultData,
      expectedStatus: 400,
      expectedBody: errors.RESTInvalidAccount
    }, done);
  });

  test('/accounts/:account/trustlines -- missing secret', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    testPostRequest({
      account: addresses.VALID,
      data: _.omit(defaultData, 'secret'),
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- missing trustline', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    testPostRequest({
      account: addresses.VALID,
      data: {secret: addresses.SECRET},
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- missing limit amount', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    var data = _.cloneDeep(defaultData);
    delete data.trustline.limit;
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- missing limit currency', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    var data = _.cloneDeep(defaultData);
    delete data.trustline.limit;
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- missing limit currency', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    var data = _.cloneDeep(defaultData);
    delete data.trustline.currency;
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- missing limit counterparty', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    var data = _.cloneDeep(defaultData);
    delete data.trustline.counterparty;
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- invalid limit amount', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    var data = _.cloneDeep(defaultData);
    data.trustline.limit = 'asdf';
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- invalid limit currency', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    var data = _.cloneDeep(defaultData);
    data.trustline.currency = 'usd2';
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 400
    }, done);
  });

  test('/accounts/:account/trustlines -- invalid limit counterparty', function(done) {
    self.wss.once('request_account_info', function() {
      assert(false, 'Should not request account info');
    });

    self.wss.once('request_submit', function() {
      assert(false, 'Should not request submit');
    });

    var data = _.cloneDeep(defaultData);
    data.trustline.counterparty = addresses.INVALID;
    testPostRequest({
      account: addresses.VALID,
      data: data,
      expectedStatus: 400
    }, done);
  });
});
