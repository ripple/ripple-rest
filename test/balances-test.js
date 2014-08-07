var _        = require('lodash');
var ripple   = require('ripple-lib');
var expect   = require('chai').expect;
var assert   = require('assert');
var bignum   = require('bignumber.js')
var balances = require('../api/balances');

var createInterface = require(__dirname+'/helpers/create_interface.js');

describe('balances', function() {
  var $;

  beforeEach(function() {
    $ = createInterface();
  });

  var accountInfo = {
    "account_data": {
      "Account": "r45r1T2utToqmputeEe2ErKqE1rEFDoccH",
      "Balance": "27389517749",
      "Flags": 0,
      "LedgerEntryType": "AccountRoot",
      "OwnerCount": 18,
      "PreviousTxnID": "B6B410172C0B65575D89E464AF5B99937CC568822929ABF87DA75CBD11911932",
      "PreviousTxnLgrSeq": 6592159,
      "Sequence": 1400,
      "index": "4F83A2CF7E70F77F79A307E6A472BFC2585B806A70833CCD1C26105BAE0D6E05"
    },
    "ledger_current_index": 6735718
  }

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
      "balance": "2.497605752725159",
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
      "balance": "0",
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

  it.skip('getBalances', function(done) {
    var testBalances = [
      {
      counterparty: '',
      currency: 'XRP',
      value: bignum(accountInfo.account_data.Balance).dividedBy('1000000').toString()
    }
    ];

    testBalances = testBalances.concat(accountLines.lines.map(function(line) {
      return {
        counterparty: line.account,
        currency: line.currency,
        value: line.balance
      }
    }));

    $.remote.request = function(request) {
      expect(request).to.be.an('object');
      expect(request.message).to.be.an('object');
      expect(request.message.command).to.be.a('string');

      switch (request.message.command) {
        case 'account_info':
          request.emit('success', accountInfo);
        break;
        case 'account_lines':
          request.emit('success', accountLines);
        break;
      }
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.balances).to.deep.equal(testBalances);
        done();
      }
    };

    balances.get(req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it.skip('setBalances -- specify account currency', function(done) {
    var testBalances = [
      {
      counterparty: '',
      currency: 'XRP',
      value: bignum(accountInfo.account_data.Balance).dividedBy('1000000').toString()
    }
    ];

    $.remote.request = function(request) {
      expect(request).to.be.an('object');
      expect(request.message).to.be.an('object');
      expect(request.message.command).to.be.a('string');

      switch (request.message.command) {
        case 'account_info':
          request.emit('success', accountInfo);
        break;
        case 'account_lines':
          assert(false, 'account_lines should not be requested');
        break;
      }
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        currency: 'XRP'
      },
      body: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.balances).to.deep.equal(testBalances);
        done();
      }
    };

    balances.get(req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it.skip('getBalances -- specify line currency', function(done) {
    var testBalances = accountLines.lines
    .filter(function(line) {
      return line.currency === 'EUR';
    })
    .map(function(line) {
      return {
        counterparty: line.account,
        currency: line.currency,
        value: line.balance
      }
    });

    $.remote.request = function(request) {
      expect(request).to.be.an('object');
      expect(request.message).to.be.an('object');
      expect(request.message.command).to.be.a('string');

      switch (request.message.command) {
        case 'account_info':
          assert(false, 'account_info should not be requested');
        break;
        case 'account_lines':
          request.emit('success', accountLines);
        break;
      }
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        currency: 'EUR'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.balances).to.deep.equal(testBalances);
        done();
      }
    };

    balances.get(req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it.skip('getBalances -- specify non-existent currency', function(done) {
    var testBalances = [
      {
      counterparty: '',
      currency: 'XRP',
      value: bignum(accountInfo.account_data.Balance).dividedBy('1000000').toString()
    }
    ];

    testBalances = testBalances.concat(accountLines.lines.map(function(line) {
      return {
        counterparty: line.account,
        currency: line.currency,
        value: line.balance
      }
    }));

    $.remote.request = function(request) {
      expect(request).to.be.an('object');
      expect(request.message).to.be.an('object');
      expect(request.message.command).to.be.a('string');

      switch (request.message.command) {
        case 'account_info':
          request.emit('success', accountInfo);
        break;
        case 'account_lines':
          request.emit('success', accountLines);
        break;
      }
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
        expect(obj).to.deep.equal({ success: true, balances: [ ] });
        done();
      }
    };

    balances.get(req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it.skip('getBalances -- specify counterparty', function(done) {
    var testBalances = accountLines.lines
    .filter(function(line) {
      return line.currency === 'EUR';
    })
    .map(function(line) {
      return {
        counterparty: line.account,
        currency: line.currency,
        value: line.balance
      }
    });

    $.remote.request = function(request) {
      expect(request).to.be.an('object');
      expect(request.message).to.be.an('object');
      expect(request.message.command).to.be.a('string');

      switch (request.message.command) {
        case 'account_info':
          assert(false, 'Account XRP balance should not be requested');
        break;
        case 'account_lines':
          request.emit('success', accountLines);
        break;
      }
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        currency: 'EUR'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(200);
        expect(obj).to.be.an('object');
        expect(obj.success).to.equal(true);
        expect(obj.balances).to.deep.equal(testBalances);
        done();
      }
    };

    balances.get(req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it.skip('getBalances -- missing account', function(done) {
    $.remote.request = function(request) {
      assert(false, 'No requests should be sent');
    };

    var req = {
      params: {
        //account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: { },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.deep.equal({ success: false, message: 'Parameter is not a valid Ripple address: account' });
        expect(obj.success).to.equal(false);
        done();
      }
    };

    balances.get(req, res, function(err) {
      assert(false);
      expect(err).to.equal(null, err);
    });
  });

  it.skip('getBalances -- invalid account', function(done) {
    $.remote.request = function(request) {
      assert(false, 'No requests should be sent');
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccHX'
      },
      query: { },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.deep.equal({ success: false, message: 'Parameter is not a valid Ripple address: account' });
        expect(obj.success).to.equal(false);
        done();
      }
    };

    balances.get(req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it.skip('getBalances -- invalid counterparty', function(done) {
    $.remote.request = function(request) {
      assert(false, 'No requests should be sent');
    };

    var req = {
      params: {
        account: 'r45r1T2utToqmputeEe2ErKqE1rEFDoccH'
      },
      query: {
        counterparty: 'rInVaLiD'
      },
      body: { },
      param: { }
    };

    var res = {
      json: function(statusCode, obj) {
        expect(statusCode).to.equal(400);
        expect(obj).to.be.an('object');
        expect(obj).to.deep.equal({ success: false, message: 'Parameter is not a valid Ripple address: counterparty' });
        expect(obj.success).to.equal(false);
        done();
      }
    };

    balances.get(req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });

  it.skip('getBalances -- invalid currency', function(done) {
    $.remote.request = function(request) {
      assert(false, 'No requests should be sent');
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
        expect(obj).to.deep.equal({ success: false, message: 'Parameter is not a valid currency: currency' });
        expect(obj.success).to.equal(false);
        done();
      }
    };

    balances.get(req, res, function(err) {
      expect(err).to.equal(null, err);
    });
  });
});
