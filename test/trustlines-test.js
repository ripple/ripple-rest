var _          = require('lodash');
var assert     = require('assert');
var ripple     = require('ripple-lib');
var expect     = require('chai').expect;
var trustlines = require('../api/trustlines');

function createInterface() {
  var server = new process.EventEmitter;

  server._connected = true;
  server._lastLedgerClose = Date.now() - 1;
  server._opts = { url: 'wss://example.com' };

  server._computeFee = function() {
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

describe('trustlines', function() {
  var $;

  beforeEach(function() {
    $ = createInterface();
  });

  var accountLines = {
    "account": "r45r1T2utToqmputeEe2ErKqE1rEFDoccH",
    "lines": [
      {
      "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
      "balance": "0",
      "currency": "ASP",
      "limit": "0",
      "limit_peer": "10",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
      "balance": "0",
      "currency": "XAU",
      "limit": "0",
      "limit_peer": "0",
      "no_ripple": true,
      "no_ripple_peer": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
      "balance": "0",
      "currency": "USD",
      "limit": "5",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rHpXfibHgSb64n8kK9QWDpdbfqSpYbM9a4",
      "balance": "481.992867407479",
      "currency": "MXN",
      "limit": "1000",
      "limit_peer": "0",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun",
      "balance": "0.793598266778297",
      "currency": "EUR",
      "limit": "1",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
      "balance": "0",
      "currency": "CNY",
      "limit": "3",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rGwUWgN5BEg3QGNY3RX2HfYowjUTZdid3E",
      "balance": "1.294889190631542",
      "currency": "DYM",
      "limit": "3",
      "limit_peer": "0",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "balance": "0.3488146605801446",
      "currency": "CHF",
      "limit": "0",
      "limit_peer": "0",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "balance": "2.114103174931847",
      "currency": "BTC",
      "limit": "3",
      "limit_peer": "0",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "balance": "2.497605752725159",
      "currency": "USD",
      "limit": "5000",
      "limit_peer": "0",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd",
      "balance": "-0.00111",
      "currency": "BTC",
      "limit": "0",
      "limit_peer": "10",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rBJ3YjwXi2MGbg7GVLuTXUWQ8DjL7tDXh4",
      "balance": "-0.1010780000080207",
      "currency": "BTC",
      "limit": "0",
      "limit_peer": "10",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun",
      "balance": "1",
      "currency": "USD",
      "limit": "1",
      "limit_peer": "0",
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",
      "balance": "8.07619790068559",
      "currency": "CNY",
      "limit": "100",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "balance": "7.292695098901099",
      "currency": "JPY",
      "limit": "0",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "r3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z",
      "balance": "0",
      "currency": "AUX",
      "limit": "0",
      "limit_peer": "0",
      "no_ripple": true,
      "no_ripple_peer": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "r9vbV3EHvXWjSkeQ6CAcYVPGeq7TuiXY2X",
      "balance": "0",
      "currency": "USD",
      "limit": "1",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "balance": "12.41688780720394",
      "currency": "EUR",
      "limit": "100",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rfF3PNkwkq1DygW2wum2HK3RGfgkJjdPVD",
      "balance": "35",
      "currency": "USD",
      "limit": "500",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rwUVoVMSURqNyvocPCcvLu3ygJzZyw8qwp",
      "balance": "-5",
      "currency": "JOE",
      "limit": "0",
      "limit_peer": "50",
      "no_ripple_peer": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2",
      "balance": "0",
      "currency": "USD",
      "limit": "0",
      "limit_peer": "100",
      "no_ripple_peer": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2",
      "balance": "0",
      "currency": "JOE",
      "limit": "0",
      "limit_peer": "100",
      "no_ripple_peer": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rs9M85karFkCRjvc6KMWn8Coigm9cbcgcx",
      "balance": "0",
      "currency": "015841551A748AD2C1F76FF6ECB0CCCD00000000",
      "limit": "10.01037626125837",
      "limit_peer": "0",
      "no_ripple": true,
      "quality_in": 0,
      "quality_out": 0
    },
    {
      "account": "rEhDDUUNxpXgEHVJtC2cjXAgyx5VCFxdMF",
      "balance": "0",
      "currency": "USD",
      "limit": "0",
      "limit_peer": "1",
      "quality_in": 0,
      "quality_out": 0
    }
    ]
  }

  it('getTrustlines', function(done) {
    var testLines = accountLines.lines.map(function(line) {
      return {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH',
        counterparty: line.account,
        currency: line.currency,
        limit: line.limit,
        reciprocated_limit: line.limit_peer,
        account_allows_rippling: !Boolean(line.no_ripple),
        counterparty_allows_rippling: !Boolean(line.no_ripple_peer),
      }
    });

    $.remote.request = function(request) {
      expect(request.message).to.be.an('object');
      expect(request.message).to.have.property('command', 'account_lines');
      request.emit('success', accountLines);
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {},
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.trustlines).to.be.an('array');
        expect(obj.trustlines).to.deep.equal(testLines);
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getTrustlines -- specify counterparty', function(done) {
    var filteredAccountLines = accountLines;

    filteredAccountLines.lines = filteredAccountLines.lines.filter(function(line) {
      return line.account  === 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B';
    });

    var testLines = accountLines.lines
    .map(function(line) {
      return {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH',
        counterparty: line.account,
        currency: line.currency,
        limit: line.limit,
        reciprocated_limit: line.limit_peer,
        account_allows_rippling: !Boolean(line.no_ripple),
        counterparty_allows_rippling: !Boolean(line.no_ripple_peer),
      }
    });

    $.remote.request = function(request) {
      expect(request.message).to.be.an('object');
      expect(request.message).to.have.property('command', 'account_lines');
      expect(request.message).to.have.property('peer', 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B');
      request.emit('success', filteredAccountLines);
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.trustlines).to.be.an('array');
        expect(obj.trustlines).to.deep.equal(testLines);
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getTrustlines -- specify currency', function(done) {
    var testLines = accountLines.lines
    .filter(function(line) {
      return line.currency === 'USD';
    })
    .map(function(line) {
      return {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH',
        counterparty: line.account,
        currency: line.currency,
        limit: line.limit,
        reciprocated_limit: line.limit_peer,
        account_allows_rippling: !Boolean(line.no_ripple),
        counterparty_allows_rippling: !Boolean(line.no_ripple_peer),
      }
    });

    $.remote.request = function(request) {
      expect(request.message).to.be.an('object');
      expect(request.message).to.have.property('command', 'account_lines');
      request.emit('success', accountLines);
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        currency: 'USD'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.trustlines).to.be.an('array');
        expect(obj.trustlines).to.deep.equal(testLines);
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getTrustlines -- specify non-existent currency', function(done) {
    $.remote.request = function(request) {
      expect(request.message).to.be.an('object');
      expect(request.message).to.have.property('command', 'account_lines');
      request.emit('success', accountLines);
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        currency: 'BRB'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.trustlines).to.be.an('array');
        expect(obj.trustlines).to.deep.equal([]);
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getTrustlines -- specify counterparty and currency', function(done) {
    var filteredAccountLines = accountLines;

    filteredAccountLines.lines = filteredAccountLines.lines.filter(function(line) {
      return line.account  === 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' && line.currency === 'USD';
    });

    var testLines = accountLines.lines
    .map(function(line) {
      return {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH',
        counterparty: line.account,
        currency: line.currency,
        limit: line.limit,
        reciprocated_limit: line.limit_peer,
        account_allows_rippling: !Boolean(line.no_ripple),
        counterparty_allows_rippling: !Boolean(line.no_ripple_peer),
      }
    });

    $.remote.request = function(request) {
      expect(request.message).to.be.an('object');
      expect(request.message).to.have.property('command', 'account_lines');
      expect(request.message).to.have.property('peer', 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B');
      request.emit('success', filteredAccountLines);
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        currency: 'USD'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.trustlines).to.be.an('array');
        expect(obj.trustlines).to.deep.equal(testLines);
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getTrustlines -- missing account', function(done) {
    $.remote.request = function(request) {
      assert(false, 'Account lines should not be requested');
    };

    var req = {
      params: {
        //account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        //counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        //currency: 'USD'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a valid Ripple address: account');
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getTrustlines -- invalid account', function(done) {
    $.remote.request = function(request) {
      assert(false, 'Account lines should not be requested');
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccHX'
      },
      query: {
        //counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
        //currency: 'USD'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a valid Ripple address: account');
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getTrustlines -- invalid counterparty', function(done) {
    $.remote.request = function(request) {
      assert(false, 'Account lines should not be requested');
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59BX',
        //currency: 'USD'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a valid Ripple address: counterparty');
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('getTrustlines -- invalid currency', function(done) {
    $.remote.request = function(request) {
      assert(false, 'Account lines should not be requested');
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        currency: 'rippleses'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a valid currency: currency');
        done();
      }
    };

    trustlines.get($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline', function(done) {
    var txResult = {
      engine_result: 'tesSUCCESS',
      engine_result_code: 0,
      engine_result_message: 'The transaction was applied.',
      ledger_hash: 'BC53F86C05263EF2EE667862C3840145BF375D765EE28E9DD810630C83DCC204',
      ledger_index: 6756018,
      status: 'closed',
      type: 'transaction',
      validated: true,
      metadata: {
        AffectedNodes: [ ],
        TransactionIndex: 1,
        TransactionResult: 'tesSUCCESS'
      },
      tx_json: {
        Account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH',
        Fee: '12',
        Flags: 2147483648,
        LastLedgerSequence: 6756025,
        LimitAmount: {
          currency: 'USD',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
          value: '1' },
          Sequence: 2950,
          SigningPubKey: 'F306E9F38DF114X2953A5B030C1AE8A88C47E348170C3B8EC6C8D775E797168462',
          TransactionType: 'TrustSet',
          TxnSignature: '3045022100AC2F7E1EAC7305484CA171030AA0AED456346A04EB8D516E077733CDD34D6B6F02203ECA06845EB0A930E1248D254ACA91D2DAEF7A5FA4AD8C676F6C7FA8D249CBBC',
          date: 454020000,
          hash: '253EF47AD6C2ZFD0A1D54BE332C989889A604E0EB59AB18A736BE0530BB5995X7'
      }
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      expect(tx).to.be.an('object');
      expect(tx.tx_json).to.be.an('object');
      expect(tx.tx_json).to.have.property('Flags', 2147483648)
      expect(tx.tx_json).to.have.property('TransactionType', 'TrustSet');
      expect(tx.tx_json).to.have.deep.property('LimitAmount.value', '1');
      expect(tx.tx_json).to.have.deep.property('LimitAmount.currency', 'USD');
      expect(tx.tx_json).to.have.deep.property('LimitAmount.issuer', 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B');
      tx.emit('proposed', txResult);
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(201);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- specify NoRipple', function(done) {
    var txResult = {
      engine_result: 'tesSUCCESS',
      engine_result_code: 0,
      engine_result_message: 'The transaction was applied.',
      ledger_hash: 'BC53F86C05263EF2EE667862C3840145BF375D765EE28E9DD810630C83DCC204',
      ledger_index: 6756018,
      status: 'closed',
      type: 'transaction',
      validated: true,
      metadata: {
        AffectedNodes: [ ],
        TransactionIndex: 1,
        TransactionResult: 'tesSUCCESS'
      },
      tx_json: {
        Account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH',
        Fee: '12',
        Flags: 2147483648,
        LastLedgerSequence: 6756025,
        LimitAmount: {
          currency: 'USD',
          issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
          value: '1' },
          Sequence: 2950,
          SigningPubKey: 'F306E9F38DF114X2953A5B030C1AE8A88C47E348170C3B8EC6C8D775E797168462',
          TransactionType: 'TrustSet',
          TxnSignature: '3045022100AC2F7E1EAC7305484CA171030AA0AED456346A04EB8D516E077733CDD34D6B6F02203ECA06845EB0A930E1248D254ACA91D2DAEF7A5FA4AD8C676F6C7FA8D249CBBC',
          date: 454020000,
          hash: '253EF47AD6C2ZFD0A1D54BE332C989889A604E0EB59AB18A736BE0530BB5995X7'
      }
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
          account_allows_rippling: false
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      expect(tx).to.be.an('object');
      expect(tx.tx_json).to.be.an('object');
      expect(tx.tx_json).to.have.property('Flags', 2147614720)
      expect(tx.tx_json).to.have.property('TransactionType', 'TrustSet');
      expect(tx.tx_json).to.have.deep.property('LimitAmount.value', '1');
      expect(tx.tx_json).to.have.deep.property('LimitAmount.currency', 'USD');
      expect(tx.tx_json).to.have.deep.property('LimitAmount.issuer', 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B');
      tx.emit('proposed', txResult);
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(201);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- missing account', function(done) {
    var req = {
      params: {
        //account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a Ripple address: account');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- invalid account', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccHX'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a Ripple address: account');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- missing secret', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        //secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter missing: secret');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- missing trustline', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
//        trustline: {
//          limit: '1',
//          currency: 'USD',
//          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
//        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter missing: trustline');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- missing trustline.limit', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          //limit: '1',
          currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter missing: trustline.limit');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- invalid trustline.limit', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: 'asdf',
          currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a number: trustline.limit');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- missing trustline.currency', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          //currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter missing: trustline.currency');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- invalid trustline.currency', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          currency: 'asdf',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a valid currency: trustline.currency');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- missing trustline.counterparty', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          currency: 'USD',
          //counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter missing: trustline.counterparty');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it('addTrustline -- invalid trustline.counterparty', function(done) {
    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      body: {
        secret: 'snkisrZ4QvDvUv8Xk6nf8br8wecEd',
        trustline: {
          limit: '1',
          currency: 'USD',
          counterparty: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59BX'
        }
      }
    };

    var transactionManager = $.remote.account(req.params.account)._transactionManager;

    transactionManager._nextSequence = 1;

    transactionManager._request = function(tx) {
      assert(false, 'Transaction should not be requested');
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.have.property('success', false);
        expect(obj).to.have.property('message', 'Parameter is not a Ripple address: trustline.counterparty');
        done();
      }
    };

    trustlines.add($, req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });
});

