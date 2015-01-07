var supertest     = require('supertest');
var _app          = require('./../lib/express_app');
var app           = supertest(_app);
var assert        = require('assert');
var ws            = require('ws');
var route         = new (require('events').EventEmitter);
var fixtures      = require('./fixtures')._payments;
var RL            = require('ripple-lib');

var testutils = { };

// check if obj has keys
testutils.hasKeys = function(obj,keys) {
    var list = Object.keys(obj);
    var hasAllKeys = true;
    var missing = {};
    keys.forEach(function(key) {
        if (list.indexOf(key) == -1) {
            hasAllKeys = false
            missing[key] = true;
        }
    })
    return { hasAllKeys : hasAllKeys, missing : missing }
}

// used to mark the orderings and count of incoming rippled
testutils.orderlist = function(list) {
    // list = [{command:<command>}, ... ]
    var _list = list;
    var idx = 0;
    this.isMock = true;
    this.create = function(list) {
        _list = list;
        idx = 0
    }
    this.mark = function(command) {
        if ((_list[idx]) && (_list[idx].command === command)) {
            idx++
        } else {
            throw new Error("out of order rippled command",command)
        }
    }
    this.test = function() {
        if (this.isMock)
        return (idx === _list.length)
        else return true
    }
    this.reset = function() {
        _list = []
        idx = 0;
    }
};

var orderlist = new testutils.orderlist;

/**
 * Payment tests
 * This file, _payment-test.js describes tests in a different format from other other tests
 *
 * If you consider making changes to a test in this file, consider moving the tests over
 * to payment-test.js and adopting the structure we have for the other tests
 *
 * New tests should not be added in the structure laid out here, but in the structure we
 * use in the other test files.
 */


suite('payments', function() {
  var rippled;

  suiteSetup(function(done) {
    rippled = new ws.Server({port: 5150});

    route.on('ping', fixtures.ping);
    route.on('subscribe', fixtures.subscribe);
    route.on('response', fixtures.response);
    route.on('server_info',fixtures.server_info);
    route.on('account_info', fixtures.account_info);
    route.on('ripple_path_find',fixtures.ripple_path_find);
    route.on('account_lines', fixtures.account_lines);
    route.on('submit',fixtures.submit);
    route.on('tx', fixtures.tx);

    rippled.on('connection', fixtures.connection.bind({route:route}));

    _app.remote.once('connect', function() {
      _app.remote.getServer().once('ledger_closed', function() {
        // proceed to the tests, api is ready
        done();
      });

      _app.remote.getServer().emit('message', fixtures.sample_ledger);
    });

    _app.remote._servers = [ ];
    _app.remote.addServer('ws://localhost:5150');
    _app.remote.connect();

  });

  suiteTeardown(function(done) {
    _app.remote.once('disconnect', function() {
      rippled.close();
      done()
    });

    _app.remote.disconnect();

  });

  var store = {};

  test('Pathfinding:XRP', function(done) {

    // genesis initially gives Alice 429 XRP
    orderlist.create([{command:'ripple_path_find'}]);

    var incoming = function(data,ws) {
      delete data.id;
      assert.deepEqual(data, {
        command: 'ripple_path_find',
        source_account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
        destination_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
        destination_amount: '429000000'
      });

      orderlist.mark('ripple_path_find');
    };

    route.once('ripple_path_find',incoming);

    app.get('/v1/accounts/'+fixtures.accounts.genesis.address+'/payments/paths/'+fixtures.accounts.alice.address+'/429+XRP')
      .end(function(err, resp) {
        assert.strictEqual(resp.body.success, true);
        var keyresp = testutils.hasKeys(resp.body, ['payments','success']);
        assert.equal(keyresp.hasAllKeys,true);
        store.paymentGenesisToAlice =
        {
          "secret": fixtures.accounts.genesis.secret,
          "client_resource_id": "foobar24",
          "payment": resp.body.payments[0]
        };

        assert.equal(orderlist.test(),true);
        orderlist.reset();
        done();
      })
  });

  test('Posting XRP from genesis to alice',function(done) {
    var _subscribe = function(data,ws) {
      delete data.id;
      assert.deepEqual(data,{
        command: 'subscribe',
        accounts: [ 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' ]
      });

      orderlist.mark('subscribe');
    };

    var _accountinfo = function(data,ws) {
      delete data.id;

      assert.deepEqual(data, {
        command: 'account_info',
        account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
      });

      orderlist.mark('account_info');
    };

    var _submit = function(data,ws) {
      delete data.id;
      var so = new RL.SerializedObject(data.tx_blob).to_json();

      delete so.TxnSignature; // sigs won't match ever
      assert.deepEqual(so, {
        TransactionType: 'Payment',
        Flags: 2147483648,
        Sequence: 1,
        LastLedgerSequence: 8804619,
        Amount: '429000000',
        Fee: '12',
        SigningPubKey: '0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020',
        Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
        Destination: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U'
      });

      orderlist.mark('submit');
     };


    orderlist.create([
      {command:'subscribe'},
      {command:'account_info'},
      {command:'submit'}
    ]);

    route.once('subscribe',_subscribe);
    route.once('account_info',_accountinfo);
    route.once('submit',_submit);

    // actually post a XRP payment of 429 from genesis to alice
    app.post('/v1/accounts/' + fixtures.accounts.genesis.address + '/payments')
      .send(store.paymentGenesisToAlice)
      .expect(function(resp) {
        assert.strictEqual(resp.body.success, true);
        var keys = Object.keys(fixtures.nominal_xrp_post_response);
        assert.equal(testutils.hasKeys(resp.body, keys).hasAllKeys,true);
        assert.equal(orderlist.test(),true);
        orderlist.reset();
      })
      .end(done);

  });

  test('check amount alice has',function(done) {
    // we check that alice has 429 XRP

    orderlist.create([
      {command:'account_info'},
      {command:'account_lines'}
    ]);

    var _account_info = function(data,ws) {
        delete data.id;
        assert.deepEqual(data, {
          command: 'account_info',
          account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
          ledger_index: 'validated'
        });
        orderlist.mark('account_info');
    };

    var _account_lines = function(data,ws) {
        delete data.id;
        assert.deepEqual(data, {
          command: 'account_lines',
          account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
          ledger_index: 'validated',
          limit: 200
        });
        orderlist.mark('account_lines');
    };

    route.once('account_info',_account_info);
    route.once('account_lines',_account_lines);

    app.get('/v1/accounts/'+fixtures.accounts.alice.address+'/balances')
      .end(function(err, resp) {
        assert.equal(resp.body.balances[0].value,429);
        assert.equal(orderlist.test(),true);
        orderlist.reset();
        done()
      });
  });


  test('Pathfinding: from alice to bob XRP',function(done) {

    // Now alice gives bob 1 drop XRP
    orderlist.create([
      {command:'ripple_path_find'},
      {command:'account_info'}
    ]);

    var _ripple_path_find = function(data,ws) {
      orderlist.mark('ripple_path_find');
      delete data.id;
      assert.deepEqual(data, {
        command: 'ripple_path_find',
        source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
        destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        destination_amount: '1'
      });
    };

    var _account_info = function(data,ws) {
        orderlist.mark('account_info')
        delete data.id
        assert.deepEqual(data, {
          command: 'account_info',
          account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U'
        });
    };

    route.once('ripple_path_find', _ripple_path_find);
    route.once('account_info', _account_info);

    app.get('/v1/accounts/'+fixtures.accounts.alice.address+'/payments/paths/'+fixtures.accounts.bob.address+'/0.000001+XRP')
      .end(function(err, resp) {
        assert.strictEqual(resp.body.success, true);
        var keyresp = testutils.hasKeys(resp.body, ['payments','success']);
        assert.equal(keyresp.hasAllKeys,true);
        store.paymentAliceToBob = {
          "secret": fixtures.accounts.alice.secret,
          "client_resource_id": "foobar25",
          "payment": resp.body.payments[0]
        };

        assert.equal(orderlist.test(),true);
        orderlist.reset();
        done();
      });
  });

  test('discover the reserve_base_xrp', function(done) {
    var _server_info = function(data,ws) {
      orderlist.mark('server_info');
      delete data.id;
      assert.deepEqual(data, {
        command: 'server_info'
      });
    };

    route.once('server_info', _server_info);
    orderlist.create([{command:'server_info'}]);

    app.get('/v1/server')
      .end(function(err, resp) {
        store.reserve_base_xrp = resp.body.rippled_server_status.validated_ledger.reserve_base_xrp;
        assert.equal(orderlist.test(),true);
        orderlist.reset();
        done();
      });
  });

  test('Pathfinding: from alice to bob XRP',function(done) {
    // Now alice gives bob exactly the reserve_base_xrp XRP
    orderlist.create([
      {command:'ripple_path_find'},
      {command:'account_info'}
    ]);

    var _ripple_path_find = function(data,ws) {
      orderlist.mark('ripple_path_find');
      delete data.id;
      assert.deepEqual(data, {
        command: 'ripple_path_find',
        source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
        destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        destination_amount: (store.reserve_base_xrp*1000000).toString()
      });
    };

    var _account_info = function(data,ws) {
      orderlist.mark('account_info');
      delete data.id;
      assert.deepEqual(data, {
        command: 'account_info',
        account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U'
      })
    };

    route.once('ripple_path_find',_ripple_path_find);
    route.once('account_info',_account_info);

    app.get('/v1/accounts/'+fixtures.accounts.alice.address+'/payments/paths/'+fixtures.accounts.bob.address+'/'+store.reserve_base_xrp+'+XRP')
      .end(function(err, resp) {
        assert.strictEqual(resp.body.success, true);

        var keyresp = testutils.hasKeys(resp.body, ['payments','success']);
        assert.equal(keyresp.hasAllKeys,true);

        store.paymentAliceToBob = {
          "secret": fixtures.accounts.alice.secret,
          "client_resource_id": "foobar26",
          "payment": resp.body.payments[0]
        };

        assert.equal(orderlist.test(),true);
        orderlist.reset();
        done();
      });
  });

  test('send bob reserve_base_xrp XRP from Alice to bob', function(done) {
    // sending bob reserve_base_xrp XRP from alice
    orderlist.create([{command:'submit'}])

    var _submit = function(data,ws) {
      var so = new RL.SerializedObject(data.tx_blob).to_json();
      orderlist.mark('submit');
      delete so.TxnSignature;
      assert.deepEqual(so,{
        TransactionType: 'Payment',
        Flags: 2147483648,
        Sequence: 1,
        LastLedgerSequence: 8804619,
        Amount: (store.reserve_base_xrp*1000000).toString(),
        Fee: '12',
        SigningPubKey: '022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB',
        Account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
        Destination: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5'
      });
    };

    route.once('submit',_submit);
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentAliceToBob)
      .expect(function(resp) {
        assert.deepEqual(resp.body, {
          success: true,
          client_resource_id: 'foobar26',
          status_url: 'http://127.0.0.1:5990/v1/accounts/'+fixtures.accounts.alice.address+'/payments/foobar26'
        });
        store.status_url = '/v1/accounts/'+fixtures.accounts.alice.address+'/payments/foobar26';
        assert.equal(orderlist.test(),true);
        orderlist.reset();
      })
      .end(done);
  });

  // confirm payment via client resource ID
  test('check status url of the reserve_base_xrp transfer from alice to bob', function(done) {
    orderlist.create([{command:'tx'}])
    var _tx = function(data,ws) {
      delete data.id;
      delete data.transaction;
      assert.deepEqual(data,  { command: 'tx' });
      orderlist.mark('tx');
    };

    route.once('tx',_tx);

    app.get(store.status_url)
      .expect(function(resp) {
      assert.equal(resp.status,200);
      assert.equal(resp.body.success,true);
      var payment = resp.body.payment;
      var statusPayment = {
        source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
        source_tag: '',
        source_amount: { value: '200', currency: 'XRP', issuer: '' },
        source_slippage: '0',
        destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        destination_tag: '',
        destination_amount: { value: '200', currency: 'XRP', issuer: '' },
        invoice_id: '',
        paths: '[]',
        no_direct_ripple: false,
        partial_payment: false,
        direction: 'outgoing',
        result: '',
        timestamp: '',
        fee: '0.000012',
        source_balance_changes: [],
        destination_balance_changes: []
      };

      store.hash = resp.body.hash;
      var keys = Object.keys(statusPayment);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        assert.deepEqual(payment[key], statusPayment[key]);
      }
      assert.equal(resp.body.hash, '8EA3CF4D854669007058EB45E9860611CC24FEB655895E418A5C8BC5EA901D01');
      assert.equal(resp.body.ledger, 'undefined');
      assert.equal(resp.body.state, '');
      assert.equal(orderlist.test(),true);
      orderlist.reset();
    })
    .end(done);
  });

  // confirm payment via transaction hash
  test('confirm payment via transaction hash', function(done) {
    orderlist.create([{command:'tx'}]);
    var _tx = function(data,ws) {
      orderlist.mark('tx');
    };

    route.once('tx',_tx)

    app.get('/v1/accounts/'+fixtures.accounts.alice.address+'/payments/'+store.hash)
      .expect(function(resp) {
        assert.equal(resp.status,200);
        assert.equal(resp.body.success,true);
        var payment = resp.body.payment;
        var statusPayment = {
          source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
          source_tag: '',
          source_amount: { value: '200', currency: 'XRP', issuer: '' },
          source_slippage: '0',
          destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
          destination_tag: '',
          destination_amount: { value: '200', currency: 'XRP', issuer: '' },
          invoice_id: '',
          paths: '[]',
          no_direct_ripple: false,
          partial_payment: false,
          direction: 'outgoing',
          result: '',
          timestamp: '',
          fee: '0.000012',
          source_balance_changes: [],
          destination_balance_changes: []
        };

        var keys = Object.keys(statusPayment);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          assert.deepEqual(payment[key], statusPayment[key]);
        };
        assert.equal(resp.body.hash, '8EA3CF4D854669007058EB45E9860611CC24FEB655895E418A5C8BC5EA901D01');
        assert.equal(resp.body.ledger, 'undefined');
        assert.equal(resp.body.state, '');
        assert.equal(orderlist.test(),true);
        orderlist.reset();
      })
      .end(done);
  });

  test('check amount bob has',function(done) {
    orderlist.create([
      {command:'account_info'},
      {command:'account_lines'}
    ]);

    var _account_info = function(data,ws) {
      delete data.id;
      assert.deepEqual(data, {
        command: 'account_info',
        account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        ledger_index: 'validated'
      });
      orderlist.mark('account_info');
    };

    var _account_lines = function(data,ws) {
      delete data.id;
      assert.deepEqual(data, {
        command: 'account_lines',
        account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        ledger_index: 'validated',
        limit: 200
      });
      orderlist.mark('account_lines');
    };

    route.once('account_info', _account_info);
    route.once('account_lines',_account_lines);

    app.get('/v1/accounts/'+fixtures.accounts.bob.address+'/balances')
      .end(function(err, resp) {
        var balance = resp.body.balances[0];
        // change all instances of 200 with reserve base xrp
        assert.equal(balance.value,'200');
        store.bob_balance = balance.value;
        assert.equal(orderlist.test(),true);
        orderlist.reset();
        done();
      });
  });


  // bob should try to send all money back to alice
  test('try to send all of bobs money to alice below reserve', function(done) {
    orderlist.create([
      {command:'ripple_path_find'},
      {command:'account_info'}
    ]);

    var _ripple_path_find = function(data,ws) {
      orderlist.mark('ripple_path_find');
      delete data.id;
      assert.deepEqual(data,{ command: 'ripple_path_find',
        source_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        destination_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
        destination_amount: '200000000'
      });
    };

    var _account_info = function(data,ws) {
      orderlist.mark('account_info');
      delete data.id;
      assert.deepEqual(data, {
        command: 'account_info',
        account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5'
      });
    };

    route.once('ripple_path_find',_ripple_path_find);
    route.once('account_info',_account_info);

    var sendamount = store.bob_balance;
    app.get('/v1/accounts/'+fixtures.accounts.bob.address+'/payments/paths/'+fixtures.accounts.alice.address+'/'+sendamount+'+XRP')
      .end(function(err, resp) {
        assert.equal(404, resp.status);
        assert.deepEqual(resp.body, {
          success: false,
          error_type: 'invalid_request',
          error: 'restNOT_FOUND',
          message: 'No paths found. Please ensure that the source_account has sufficient funds to execute the payment. If it does there may be insufficient liquidity in the network to execute this payment right now'
        });
        assert.equal(orderlist.test(),true);
        orderlist.reset();
        done();
      });
  });


  // TODO: bob should try to send all money back to alice
  test.skip('try to send 95% of bobs money to alice below reserve', function(done) {
    var sendamount = store.bob_balance * 0.95;
    app.get('/v1/accounts/'+fixtures.accounts.bob.address+'/payments/paths/'+fixtures.accounts.alice.address+'/'+sendamount+'+XRP')
      .end(function(err, resp) {
        assert.equal(404, resp.status);
        assert.deepEqual(resp.body, {
          success: false,
          error_type: 'invalid_request',
          error: 'No paths found',
          message: 'Please ensure that the source_account has sufficient funds to execute the payment. If it does there may be insufficient liquidity in the network to execute this payment right now'
        });
        done();
      });
  });

  // have alice send bob 10 USD/alice
  test('alice sends bob 10USD/alice without trust', function(done) {
    orderlist.create([
      {command:'ripple_path_find'}
    ]);

    var _ripple_path_find = function(data,ws) {
      orderlist.mark('ripple_path_find');
      delete data.id;
      assert.deepEqual(data,{
        command: 'ripple_path_find',
        source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
        destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        destination_amount: {
          value: '10',
          currency: 'USD',
          issuer: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U'
        }
      });
    };

    route.once('ripple_path_find',_ripple_path_find);
    app.get('/v1/accounts/'+fixtures.accounts.alice.address+'/payments/paths/'+fixtures.accounts.bob.address+'/10+USD+'+fixtures.accounts.alice.address)
      .expect(function(resp) {
        assert.deepEqual(resp.body, {
          success: false,
          error_type: 'invalid_request',
          error: 'restNOT_FOUND',
          message: 'No paths found. The destination_account does not accept USD, they only accept: XRP'
        });
        assert.equal(orderlist.test(),true);
        orderlist.reset();
      })
      .end(done);
  });

  test.skip('grant a trustline of 10 usd towards alice', function(done) {
    orderlist.create([
      {command:'subscribe'},
      {command:'account_info'},
      {command:'submit'}
    ]);

    var _subscribe = function(data,ws) {
      orderlist.mark('subscribe');
      delete data.id;
      assert.deepEqual(data, {
        command: 'subscribe',
        accounts: [ 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5' ]
      });
    };

    var _account_info = function(data,ws) {
      delete data.id;
      orderlist.mark('account_info');
      assert.deepEqual(data, {
        command: 'account_info',
        account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5'
      });
    };

    var _submit = function(data,ws) {
      orderlist.mark('submit');
      var so = new RL.SerializedObject(data.tx_blob).to_json();
      delete so.TxnSignature; // sigs won't match ever
      assert.deepEqual(so, {
        Flags: 2147483648,
        TransactionType: 'TrustSet',
        Account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        LimitAmount: {
          value: '10',
          currency: 'USD',
          issuer: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U'
        },
        Sequence: 1,
        SigningPubKey: '03BC02F6C0F2C50EF5DB02C2C17062B7449B34FBD669A75362E41348C9FAE3DDE1',
        Fee: '12',
        LastLedgerSequence: 8804624
      });
    };

    route.once('subscribe',_subscribe);
    route.once('account_info',_account_info);
    route.once('submit',_submit);

    app.post('/v1/accounts/'+fixtures.accounts.bob.address+'/trustlines')
      .send({
        "secret": fixtures.accounts.bob.secret,
        "trustline": {
          "limit": "10",
          "currency": "USD",
          "counterparty": fixtures.accounts.alice.address,
          "allows_rippling": false
        }
      })
    .expect(function(resp) {
      assert.strictEqual(typeof resp.body.trustline.hash, 'string');
      assert.strictEqual(typeof resp.body.trustline.hash, 'string');

      delete resp.body.trustline.hash;
      delete resp.body.trustline.ledger;

      assert.deepEqual(resp.body,{
        "success": true,
        "trustline": {
          "account": "rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5",
          "limit": "10",
          "currency": "USD",
          "counterparty": "rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U",
          "account_allows_rippling": true,
          "account_trustline_frozen": false,
          "state": "pending"
        }
      });
      assert.equal(orderlist.test(),true);
      orderlist.reset();
    })
    .end(done);
  });


  // have alice send bob 10 USD/alice
  test('get path for alice to bob 10USD/alice with trust', function(done) {
    orderlist.create([
      {command:'ripple_path_find'}
    ]);

    var _ripple_path_find = function (data,ws) {
    delete data.id;
      assert.deepEqual(data, { command: 'ripple_path_find',
        source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
        destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
        destination_amount: {
          value: '10',
          currency: 'USD',
          issuer: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U'
        }
      });
      orderlist.mark('ripple_path_find');
    };

    route.once('ripple_path_find',_ripple_path_find);

    app.get('/v1/accounts/'+fixtures.accounts.alice.address+'/payments/paths/'+fixtures.accounts.bob.address+'/10+USD+'+fixtures.accounts.alice.address)
      .expect(function(resp) {
        assert.deepEqual(resp.body,{
          success: true,
          payments: [
            {
              source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              source_tag: '',
              source_amount: {
                value: '10',
                currency: 'USD',
                issuer: ''
              },
              source_slippage: '0',
              destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              destination_tag: '',
              destination_amount: {
                value: '10',
                currency: 'USD',
                issuer: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U'
              },
              invoice_id: '',
              paths: '[]',
              partial_payment: false,
              no_direct_ripple: false
            }
          ]
        });
        assert.equal(orderlist.test(),true);
        orderlist.reset();
      })
      .end(done);
  });


  /**
   *  The tests below don't test the input for rippled
   *  These should be rewritten in the payments.js class
   */

  test('path find populate carol with missing sum',function(done) {
    app.get('/v1/accounts/'+fixtures.accounts.genesis.address+'/payments/paths/'+fixtures.accounts.carol.address+'/+XRP')
      .end(function(err, resp) {
        assert.equal(resp.status,400);
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'invalid_request',
          error: 'restINVALID_PARAMETER',
          message: 'Invalid parameter: destination_amount. Must be an amount string in the form value+currency+issuer' })
        done()
      })
  });

  test('path find populate carol with missing currency',function(done) {
    app.get('/v1/accounts/'+fixtures.accounts.genesis.address+'/payments/paths/'+fixtures.accounts.carol.address+'/400')
      .end(function(err, resp) {
        assert.equal(resp.status,400);
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'invalid_request',
          error: 'restINVALID_PARAMETER',
          message: 'Invalid parameter: destination_amount. Must be an amount string in the form value+currency+issuer' })
        done()
      })
  });

  test('path find populate carol with all missing endpoint value',function(done) {
    app.get('/v1/accounts/'+fixtures.accounts.genesis.address+'/payments/paths/'+fixtures.accounts.carol.address+'/')
      .expect(function(resp) {
        assert.equal(resp.status,404);
      })
      .end(done);
  });

  test('path find populate carol with 400',function(done) {
    app.get('/v1/accounts/'+fixtures.accounts.genesis.address+'/payments/paths/'+fixtures.accounts.carol.address+'/400+XRP')
      .end(function(err, resp) {
        store.paymentGenesisToCarol = {
          "secret": fixtures.accounts.genesis.secret,
          "client_resource_id": "asdfg",
          "payment": resp.body.payments[0]
        };
        done();
      })
  });

  test('Posting XRP from genesis to carol',function(done) {
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentGenesisToCarol)
      .end(function(err,resp) {
        done();
      })
  });

  // miss the client resource id
  test('path find populate dan with 600',function(done) {
    app.get('/v1/accounts/'+fixtures.accounts.genesis.address+'/payments/paths/'+fixtures.accounts.dan.address+'/600+XRP')
      .end(function(err, resp) {
        store.paymentGenesisToDan = {
          "secret": fixtures.accounts.genesis.secret,
          "payment": resp.body.payments[0]
        };
        done();
      })
  });

  test('Posting XRP from genesis to dan with missing client resource id',function(done) {
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentGenesisToDan)
      .end(function(err,resp) {
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'invalid_request',
          error: 'restINVALID_PARAMETER',
          message: 'Missing parameter: client_resource_id. All payments must be submitted with a client_resource_id to prevent duplicate payments' })
        done()
      })
  });

  test('Posting XRP from genesis to dan with empty client resource id',function(done) {
    store.paymentGenesisToDan["client_resource_id"] = "";
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentGenesisToDan)
      .end(function(err,resp) {
        assert.deepEqual(resp.body, { success: false,
          error_type: 'invalid_request',
          error: 'restINVALID_PARAMETER',
          message: 'Missing parameter: client_resource_id. All payments must be submitted with a client_resource_id to prevent duplicate payments' })
        done()
      })
  });

  test('Posting XRP from genesis to dan with valid client resource id',function(done) {
    store.paymentGenesisToDan["client_resource_id"] = "qwerty";
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentGenesisToDan)
      .end(function(err,resp) {
        assert.deepEqual(resp.body, { success: true,
          client_resource_id: 'qwerty',
          status_url: 'http://127.0.0.1:5990/v1/accounts/rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh/payments/qwerty' })
        done()
      })
  });

  test('Double posting XRP from genesis to dan with valid client resource id',function(done) {
    store.paymentGenesisToDan["client_resource_id"] = "qwerty";
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentGenesisToDan)
      .expect(function(resp,err) {
        assert.equal(resp.status, 500);
        assert.deepEqual(resp.body, {
          "success": false,
          "error_type":"server",
          "error": "restDUPLICATE_TRANSACTION",
          "message":"Duplicate Transaction. A record already exists in the database for a transaction of this type with the same client_resource_id. If this was not an accidental resubmission please submit the transaction again with a unique client_resource_id"
        })
      })
      .end(done);
  });

  test.skip('dan grants a trustline of 10 usd towards carol but uses carols address in the accounts setting', function(done) {
    // mocha is NOT overriding the timeout contrary to documentation
    this.timeout(1000);
    app.post('/v1/accounts/'+fixtures.accounts.carol.address+'/trustlines')
      .send({
        "secret": fixtures.accounts.dan.secret,
        "trustline": {
          "limit": "10",
          "currency": "USD",
          "counterparty": fixtures.accounts.carol.address,
          "allows_rippling": false
        }
      })
      .expect(function(resp) {
        assert.deepEqual(resp.body,
          {
            success: false,
            error_type: 'transaction',
            error: 'Invalid secret'
          });
      })
      .end(done);
  });

  test('dan grants a trustline of 10 usd towards carol and uses correct address in the accounts setting but no secret', function(done) {
    app.post('/v1/accounts/'+fixtures.accounts.dan.address+'/trustlines')
      .send({
        "secret": '',
        "trustline": {
          "limit": "10",
          "currency": "USD",
          "counterparty": fixtures.accounts.carol.address,
          "allows_rippling": false
        }
      })
      .expect(function(resp) {
        assert.equal(resp.status, 400)
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'invalid_request',
          error: 'restINVALID_PARAMETER',
          message: 'Parameter missing: secret' })
      })
      .end(done);
  });

  test.skip('dan grants a trustline of 10 usd towards carol and uses correct address in the accounts setting but incorrect secret', function(done) {
    app.post('/v1/accounts/'+fixtures.accounts.dan.address+'/trustlines')
      .send({
        "secret": fixtures.accounts.carol.secret,
        "trustline": {
          "limit": "10",
          "currency": "USD",
          "counterparty": fixtures.accounts.carol.address,
          "allows_rippling": false
        }
      })
      .expect(function(resp) {
        assert.deepEqual(resp.body,
          {
            success: false,
            error_type: 'transaction',
            error: 'Invalid secret'
          });
      })
      .end(done);
  });

  test('dan grants a trustline of 10 usd towards carol and uses correct address in the accounts setting', function(done) {
    app.post('/v1/accounts/'+fixtures.accounts.dan.address+'/trustlines')
      .send({
        "secret": fixtures.accounts.dan.secret,
        "trustline": {
          "limit": "10",
          "currency": "USD",
          "counterparty": fixtures.accounts.carol.address,
          "allows_rippling": false
        }
      })
      .expect(function(resp) {
        assert.equal(resp.status,201);
        assert.strictEqual(typeof resp.body.hash, 'string');
        assert.strictEqual(typeof resp.body.ledger, 'string');

        delete resp.body.hash;
        delete resp.body.ledger;
        assert.deepEqual(resp.body,{
          "success": true,
          "trustline": {
            "account": "rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V",
            "limit": "10",
            "currency": "USD",
            "counterparty": "r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ",
            "account_allows_rippling": true,
            "account_trustline_frozen": false
          },
          "state": "pending"
        });
      })
      .end(done);
  });

  test('dan grants an additional trustline of 10 usd towards carol and uses correct address in the accounts setting', function(done) {
    app.post('/v1/accounts/'+fixtures.accounts.dan.address+'/trustlines')
      .send({
        "secret": fixtures.accounts.dan.secret,
        "trustline": {
          "limit": "10",
          "currency": "USD",
          "counterparty": fixtures.accounts.carol.address,
          "allows_rippling": false
        }
      })
      .expect(function(resp) {
        assert.equal(resp.status,201);
        assert.strictEqual(typeof resp.body.hash, 'string');
        assert.strictEqual(typeof resp.body.ledger, 'string');

        delete resp.body.hash;
        delete resp.body.ledger;
        assert.deepEqual(resp.body, {
          "success": true,
          "trustline": {
            "account": "rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V",
            "limit": "10",
            "currency": "USD",
            "counterparty": "r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ",
            "account_allows_rippling": true,
            "account_trustline_frozen": false
          },
          "state": "pending"
        });
      })
      .end(done);
  });

  test('get path for carol to dan 10USD/carol with trust', function(done) {
    app.get('/v1/accounts/'+fixtures.accounts.carol.address+'/payments/paths/'+fixtures.accounts.dan.address+'/10+USD+'+fixtures.accounts.carol.address)
      .end(function(err, resp) {
        store.paymentCarolToDan = {
          secret: 'asdfkje',
          client_resource_id : 'abc',
          payment: resp.body.payments[0]
        }
        done()
      })
  });

  test.skip('Posting 10USD from carol to dan with valid client resource id but incorrect secret',function(done) {
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentCarolToDan)
      .expect(function(resp) {
        assert.deepEqual(resp.body,
          {
            success: false,
            error_type: 'transaction',
            error: 'Invalid secret'
          });
      })
      .end(done);
  });

  test('Posting 10USD from carol to dan with valid client resource id and correct secret but missing fields on payment object',function(done) {
    store.paymentCarolToDan.secret = fixtures.accounts.carol.secret;
    store.value = store.paymentCarolToDan.payment.destination_amount.value;
    delete store.paymentCarolToDan.payment.destination_amount.value;
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentCarolToDan)
      .expect(function(resp,err) {
        assert.equal(resp.status,400);
        assert.deepEqual(resp.body, {
          success: false,
          error_type: 'invalid_request',
          error: 'restINVALID_PARAMETER',
          message: 'Invalid parameter: destination_amount. Must be a valid Amount object'
        });
      })
      .end(done);
  });

  test('Posting 10USD from carol to dan with valid client resource id and correct secret',function(done) {
    store.paymentCarolToDan.payment.destination_amount.value = store.value;
    store.paymentCarolToDan.secret = fixtures.accounts.carol.secret;
    store.paymentCarolToDan.client_resource_id = 'abc';
    app.post('/v1/accounts/' + fixtures.accounts.alice.address + '/payments')
      .send(store.paymentCarolToDan)
      .expect(function(resp,err) {
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.body,{
          success: true,
          client_resource_id: 'abc',
          status_url: 'http://127.0.0.1:5990/v1/accounts/r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ/payments/abc'
        });

      })
      .end(done);
  });

});
