
describe('payments', function() {
    var path = require('path');

    // override config.json with test one
    process.env['TEST_CONFIG'] = path.join(__dirname, '/config.json');

    var supertest = require('supertest');
    var _app = require('./../lib/express_app')
    var app = supertest(_app)
    var assert = require('assert')
    var ws = require('ws');
    var ee = require('events').EventEmitter;
    var lib = require('./_fixtures.js')
    var testutils = require('./utils')
    var RL = require('ripple-lib')
    var util = require('util');
    var inspect = function(item) {
        console.log(util.inspect(item, { showHidden: true, depth: null }))
    }
    var orderlist = new testutils.orderlist;

    this.timeout(10000)

  var rippled;
  var route = new ee;

  before(function(done) {


    rippled = new ws.Server({port: 5150});

    route.on('ping', lib.ping)
    route.on('subscribe', lib.subscribe)
    route.on('server_info',lib.server_info)
    route.on('account_info', lib.account_info)
    route.on('ripple_path_find',lib.ripple_path_find)
    route.on('account_lines', lib.account_lines)
    route.on('submit',lib.submit)
    route.on('tx', lib.tx)

    rippled.on('connection', lib.connection.bind({route:route}));
    rippled.on('close',function(){
      console.log("WS closed")
    })

    _app.remote.once('connect', function() {
      console.log("Setting on ledger_closed from server")
      _app.remote.getServer().once('ledger_closed', function() {
        console.log("got server's ledger_closed")
        // proceed to the tests, api is ready
        done()
      });
    });

//    _app.remote._servers = [ ];
//    _app.remote.addServer('ws://localhost:5006');

    console.log("Connecting remote")
    _app.remote.connect();

  })

  after(function(done) {
    console.log("Cleanup: closing down")

    _app.remote.once('disconnect', function() {
      console.log("GOT DISCONNECT")
      rippled.close();
      done()
    });

    _app.remote.disconnect();

  })

    var store = {}

    it('Pathfinding:XRP',function(done) {
        // genesis initially gives Alice 429 XRP 
        console.log("genesis initially gives alice 429 XRP")
        orderlist.create([{command:'ripple_path_find'}])
        var incoming = function(data,ws) {
            delete data.id
            assert.deepEqual(data, { command: 'ripple_path_find',
  source_account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  destination_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
  destination_amount: '429000000' })
            orderlist.mark('ripple_path_find')
        }
        route.once('ripple_path_find',incoming)
        app.get('/v1/accounts/'+lib.accounts.genesis.address+'/payments/paths/'+lib.accounts.alice.address+'/429+XRP')
        .end(function(err, resp) {
            console.log(resp.status, resp.body)
            assert.strictEqual(resp.body.success, true);
            var keyresp = testutils.hasKeys(resp.body, ['payments','success'])
            assert.equal(keyresp.hasAllKeys,true)
            store.paymentGenesisToAlice = {
                "secret": lib.accounts.genesis.secret,
                "client_resource_id": "foobar24",
                "payment": resp.body.payments[0]
            }
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('Posting XRP from genesis to alice',function(done) {
        console.log("Posting payment Genesis to Alice", store.paymentGenesisToAlice)
        var _subscribe = function(data,ws) {
            delete data.id
            console.log("INCOMING DATA SUBSCRIBE:", data)
            assert.deepEqual(data,{ command: 'subscribe',
  accounts: [ 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' ] })
            orderlist.mark('subscribe')
        } 
        var _accountinfo = function(data,ws) {
            delete data.id
            console.log("INCOMING DATA accountin:", data)
            assert.deepEqual(data,{ command: 'account_info',
  ident: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
            orderlist.mark('account_info')
        }
        var _submit = function(data,ws) {
            delete data.id
            var so = new RL.SerializedObject(data.tx_blob).to_json();
            console.log("INCOMING DATA submit:", so)
            delete so.TxnSignature; // sigs won't match ever
            assert.deepEqual(so, { TransactionType: 'Payment',
              Flags: 0,
              Sequence: 1,
              LastLedgerSequence: 8804622,
              Amount: '429000000',
              Fee: '12',
              SigningPubKey: '0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020',
              Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
              Destination: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' })
            orderlist.mark('submit')
        }
        orderlist.create([{command:'subscribe'},{command:'account_info'},{command:'submit'}])
        route.once('subscribe',_subscribe)
        route.once('account_info',_accountinfo)
        route.once('submit',_submit)
        
        // actually post a XRP payment of 429 from genesis to alice
        app.post('/v1/payments')
        .send(store.paymentGenesisToAlice)
        .end(function(err,resp) {
            console.log(resp.status, resp.body)
            assert.strictEqual(resp.body.success, true);
            var keys = Object.keys(lib.nominal_xrp_post_response)
            assert.equal(testutils.hasKeys(resp.body, keys).hasAllKeys,true)
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('check amount alice has',function(done) {
        // we check that alice has 429 XRP
        console.log("checking amount alice has") 
        orderlist.create([{command:'account_info'},{command:'account_lines'}])
        var _account_info = function(data,ws) {
            console.log("INCOMING DATA accountin:", data)
            delete data.id;
            assert.deepEqual(data, { command: 'account_info',
              ident: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' })
            orderlist.mark('account_info')
        }
        var _account_lines = function(data,ws) {
            console.log("INCOMING DATA accountlines:", data)
            delete data.id;
            assert.deepEqual(data, { command: 'account_lines',
              ident: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' })
            orderlist.mark('account_lines')
        }
        route.once('account_info',_account_info) 
        route.once('account_lines',_account_lines)
        app.get('/v1/accounts/'+lib.accounts.alice.address+'/balances')
        .end(function(err, resp) {
            console.log("Balances of alice", resp.body)
            var balance = resp.body.balances[0]
            assert.equal(balance.value,429)
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('Pathfinding: from alice to bob XRP',function(done) {
        // Now alice gives bob 1 drop XRP 
        console.log("Pathfinding from alice to bob for 1 DROP")
        orderlist.create([{command:'ripple_path_find'},{command:'account_info'}]);
        var _ripple_path_find = function(data,ws) {
            console.log("INCOMING DATA accountlines:", data)
            orderlist.mark('ripple_path_find') 
            delete data.id
            assert.deepEqual(data,{ command: 'ripple_path_find',
              source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              destination_amount: '1' })
        }
        var _account_info = function(data,ws) {
            console.log("INCOMING DATA accountinfo:", data)
            orderlist.mark('account_info')
            delete data.id
            assert.deepEqual(data,{ command: 'account_info',
              ident: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' })
        }
        route.once('ripple_path_find', _ripple_path_find);
        route.once('account_info', _account_info);
        app.get('/v1/accounts/'+lib.accounts.alice.address+'/payments/paths/'+lib.accounts.bob.address+'/0.000001+XRP')
        .end(function(err, resp) {
            console.log("1 DROP PATHFIND:", resp.status)
            inspect(resp.body)
            assert.strictEqual(resp.body.success, true);
            var keyresp = testutils.hasKeys(resp.body, ['payments','success'])
            assert.equal(keyresp.hasAllKeys,true)
            store.paymentAliceToBob = {
                "secret": lib.accounts.alice.secret,
                "client_resource_id": "foobar25",
                "payment": resp.body.payments[0]
            }
            console.log("storePaymentAliceToBob:", store.paymentAliceToBob)
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('send bob 1 drop from Alice', function(done) {
        console.log("sending bob 1 drop from alice")
        // sending bob 1 drop from alice
        // however this should fail since bob, who does not exist on the ledger,
        // is recieving a payment that is too small to be created on the ledger
        orderlist.create([{command:'subscribe'},
        {command:'account_info'},
        {command:'submit'}])
        var _subscribe = function(data,ws) {
            console.log("INCOMING DATA subscribe:", data)
            orderlist.mark('subscribe') 
            delete data.id;
            assert.deepEqual(data,{ command: 'subscribe',
              accounts: [ 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' ] })
        }
        var _account_info = function(data,ws) {
            console.log("INCOMING DATA account_info:", data)
            orderlist.mark('account_info')
            delete data.id
            assert.deepEqual(data, { command: 'account_info',
              ident: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' })
        }
        var _submit = function(data,ws) {
            var so = new RL.SerializedObject(data.tx_blob).to_json();
            console.log("INCOMING DATA submit:", so)
            delete so.TxnSignature; // sigs won't match ever
            orderlist.mark('submit')
            assert.deepEqual(so, { Flags: 0,
              TransactionType: 'Payment',
              Account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              Amount: '1',
              Destination: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              LastLedgerSequence: 8804622,
              Sequence: 1,
              SigningPubKey: '022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB',
              Fee: '12'
              })
        }
        route.once('subscribe',_subscribe);
        route.once('account_info',_account_info)
        route.once('submit',_submit)
        app.post('/v1/payments')
        .send(store.paymentAliceToBob)
        .end(function(err,resp) {
            console.log(resp.status, resp.body)
            assert.equal(resp.status, 402)
            assert.strictEqual(resp.body.success, false);
            assert.deepEqual(resp.body,{ success: false,
  error_type: 'transaction',
  error: 'tecNO_DST_INSUF_XRP',
  message: 'Destination does not exist. Too little XRP sent to create it.' })
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('discover the reserve_base_xrp', function(done) {
        console.log("Discover the rserve_base_xrp")
        var _server_info = function(data,ws) {
            console.log("incoming data: server_info:", data)
            orderlist.mark('server_info')
            delete data.id;
            assert.deepEqual(data, { command: 'server_info' })
        }
        route.once('server_info', _server_info)
        orderlist.create([{command:'server_info'}])
        app.get('/v1/server')
        .end(function(err, resp) {
            console.log("Discovering reserve_base_xrp", resp.body)
            store.reserve_base_xrp = resp.body.rippled_server_status.validated_ledger.reserve_base_xrp
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('Pathfinding: from alice to bob XRP',function(done) {
        // Now alice gives bob exactly the reserve_base_xrp XRP 
        console.log("Now alice gives bob exactly the reserve_base_xrp XRP")
        orderlist.create([{command:'ripple_path_find'},{command:'account_info'}])
        var _ripple_path_find = function(data,ws) {
            console.log("incoming data: ripple_path:", data)
            orderlist.mark('ripple_path_find')
            delete data.id;
            assert.deepEqual(data,{ command: 'ripple_path_find',
              source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              destination_amount: (store.reserve_base_xrp*1000000).toString() })
        }
        var _account_info = function(data,ws) {
            console.log("incoming data: account_info:", data)
            orderlist.mark('account_info')
            delete data.id;
            assert.deepEqual(data, { command: 'account_info',
              ident: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' })
        }
        route.once('ripple_path_find',_ripple_path_find)
        route.once('account_info',_account_info)
        app.get('/v1/accounts/'+lib.accounts.alice.address+'/payments/paths/'+lib.accounts.bob.address+'/'+store.reserve_base_xrp+'+XRP')
        .end(function(err, resp) {
            console.log(store.reserve_base_xrp + " XRP PATHFIND:", resp.status)
            inspect(resp.body)
            assert.strictEqual(resp.body.success, true);
            var keyresp = testutils.hasKeys(resp.body, ['payments','success'])
            assert.equal(keyresp.hasAllKeys,true)
            store.paymentAliceToBob = {
                "secret": lib.accounts.alice.secret,
                "client_resource_id": "foobar26",
                "payment": resp.body.payments[0]
            }
            console.log("The generated payment is ", store.paymentAliceToBob)
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('send bob reserve_base_xrp XRP from Alice to bob', function(done) {
        // sending bob reserve_base_xrp XRP from alice
        console.log("sending bob reserve_base_xrp XRP from alice")
        orderlist.create([{command:'submit'}])
        var _submit = function(data,ws) {
            var so = new RL.SerializedObject(data.tx_blob).to_json();
            console.log("INCOMING DATA submit:", so)
            orderlist.mark('submit')
            delete so.TxnSignature
            assert.deepEqual(so,{ TransactionType: 'Payment',
              Flags: 0,
              Sequence: 2,
              LastLedgerSequence: 8804622,
              Amount: (store.reserve_base_xrp*1000000).toString(),
              Fee: '12',
              SigningPubKey: '022E3308DCB75B17BEF734CE342AC40FF7FDF55E3FEA3593EE8301A70C532BB5BB',
              Account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              Destination: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5' })
        }
        route.once('submit',_submit);
        app.post('/v1/payments')
        .send(store.paymentAliceToBob)
        .end(function(err,resp) {
            console.log(resp.status, resp.body)
            assert.deepEqual(resp.body, { 
            success: true,
            client_resource_id: 'foobar26',
            status_url: 'http://127.0.0.1/v1/accounts/'+lib.accounts.alice.address+'/payments/foobar26' })
            store.status_url = '/v1/accounts/'+lib.accounts.alice.address+'/payments/foobar26';
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    // confirm payment via client resource ID
    it('check status url of the reserve_base_xrp transfer from alice to bob', function(done) {
        
        console.log('confirm payment via client resource ID')
        orderlist.create([{command:'tx'}])
        var _tx = function(data,ws) {
            console.log("incoming tx data:", data)
            delete data.id;
            delete data.transaction
            assert.deepEqual(data,  { command: 'tx' })
            orderlist.mark('tx')
        }
        route.once('tx',_tx)
        app.get(store.status_url)
        .end(function(err, resp) {
            console.log(resp.status, resp.body)
            assert.equal(resp.status,200)
            assert.equal(resp.body.success,true)
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
                state: '',
                result: '',
                ledger: 'undefined',
                hash: payment.hash,
                timestamp: '',
                fee: '0.000012',
                source_balance_changes: [],
                destination_balance_changes: [] 
            }
            store.hash = payment.hash;
            var keys = Object.keys(statusPayment);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i]
                console.log(i + "/" + keys.length, "key:",key, payment[key], statusPayment[key])
                assert.deepEqual(payment[key], statusPayment[key])
            }
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    // confirm payment via transaction hash 
    it('confirm payment via transaction hash', function(done) {
        console.log("payment to confirm:", store.paymentAliceToBob)
        orderlist.create([{command:'tx'}])
        var _tx = function(data,ws) {
            console.log("incoming tx data:", data)
            orderlist.mark('tx')
        }
        route.once('tx',_tx)
        app.get('/v1/accounts/'+lib.accounts.alice.address+'/payments/'+store.hash)
        .end(function(err, resp) {
            console.log(resp.status, resp.body)
            assert.equal(resp.status,200)
            assert.equal(resp.body.success,true)
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
                state: '',
                result: '',
                ledger: 'undefined',
                hash: store.hash,
                timestamp: '',
                fee: '0.000012',
                source_balance_changes: [],
                destination_balance_changes: [] 
            }
            var keys = Object.keys(statusPayment);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i]
                console.log(i + "/" + keys.length, "key:",key, payment[key], statusPayment[key])
                assert.deepEqual(payment[key], statusPayment[key])
            }
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('check amount bob has',function(done) {
        console.log("checking amount bob has") 
        orderlist.create([
            {command:'account_info'},
            {command:'account_lines'}
        ])
        var _account_info = function(data,ws) {
            console.log("incomin accont info :" , data)
            delete data.id;
            assert.deepEqual(data,{ command: 'account_info',
              ident: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5' })
            orderlist.mark('account_info') 
        }
        var _account_lines = function(data,ws) {
            console.log('incoming account lines :', data)
            delete data.id;
            assert.deepEqual(data, { command: 'account_lines',
              ident: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5' })
            orderlist.mark('account_lines') 
        }
        route.once('account_info', _account_info)
        route.once('account_lines',_account_lines) 
        app.get('/v1/accounts/'+lib.accounts.bob.address+'/balances')
        .end(function(err, resp) {
            console.log("Balances of bob", resp.body)
            var balance = resp.body.balances[0]
// change all instances of 200 with reserve base xrp
            assert.equal(balance.value,'200')
            store.bob_balance = balance.value
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    // bob should try to send all money back to alice
    it('try to send all of bobs money to alice below reserve', function(done) {
        console.log("Calling paths for bob back to alice.")
        orderlist.create([
            {command:'ripple_path_find'},
            {command:'account_info'}
        ])
        var _ripple_path_find = function(data,ws) { 
            console.log("incoming ripple_path_find", data)
            orderlist.mark('ripple_path_find')
            delete data.id;
            assert.deepEqual(data,{ command: 'ripple_path_find',
              source_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              destination_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              destination_amount: '200000000' } )
        }
        var _account_info = function(data,ws) { 
            console.log("incoming account_info", data)
            orderlist.mark('account_info')
            delete data.id;
            assert.deepEqual(data, { command: 'account_info',
              ident: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5' })
        }
        route.once('ripple_path_find',_ripple_path_find);
        route.once('account_info',_account_info)
        var sendamount = store.bob_balance;
        app.get('/v1/accounts/'+lib.accounts.bob.address+'/payments/paths/'+lib.accounts.alice.address+'/'+sendamount+'+XRP')
        .end(function(err, resp) {
            inspect(resp.body)
            assert.equal(404, resp.status)
            assert.deepEqual(resp.body, { success: false,
              error_type: 'invalid_request',
              error: 'No paths found',
              message: 'Please ensure that the source_account has sufficient funds to execute the payment. If it does there may be insufficient liquidity in the network to execute this payment right now' })
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    // bob should try to send all money back to alice
    it.skip('try to send 95% of bobs money to alice below reserve', function(done) {
        console.log("Calling paths for bob 95% back to alice.")
        var sendamount = store.bob_balance * 0.95;
        app.get('/v1/accounts/'+lib.accounts.bob.address+'/payments/paths/'+lib.accounts.alice.address+'/'+sendamount+'+XRP')
        .end(function(err, resp) {
            console.log("Bob sends back 95% of his money to alice..")
            inspect(resp.body)
            assert.equal(404, resp.status)
            assert.deepEqual(resp.body, { success: false,
  error_type: 'invalid_request',
  error: 'No paths found',
  message: 'Please ensure that the source_account has sufficient funds to execute the payment. If it does there may be insufficient liquidity in the network to execute this payment right now' })
            done()
        })
    })
    // have alice send bob 10 USD/alice
    it('alice sends bob 10USD/alice without trust', function(done) {
        console.log('alice sends bob 10usd/alice without trust')
        orderlist.create([
            {command:'ripple_path_find'}
        ])
        var _ripple_path_find = function(data,ws) {
            orderlist.mark('ripple_path_find')
            console.log("incoming ripple path find",data)
            delete data.id;
            assert.deepEqual(data,{ command: 'ripple_path_find',
              source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              destination_amount: 
               { value: '10',
                 currency: 'USD',
                 issuer: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' } } )
        }
        route.once('ripple_path_find',_ripple_path_find);
        app.get('/v1/accounts/'+lib.accounts.alice.address+'/payments/paths/'+lib.accounts.bob.address+'/10+USD+'+lib.accounts.alice.address)
        .end(function(err, resp) {
            inspect(resp.body)
            assert.deepEqual(resp.body, { success: false,
  error_type: 'invalid_request',
  error: 'No paths found',
  message: 'The destination_account does not accept USD, they only accept: XRP' })
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
    it('grant a trustline of 10 usd towards alice', function(done) {
        console.log("granting a trustline towards alice from bob")
        orderlist.create([
            {command:'subscribe'},
            {command:'account_info'},
            {command:'submit'}
        ])
        var _subscribe = function(data,ws) {
            console.log("incoming subscribe", data)
            orderlist.mark('subscribe')
            delete data.id;
            assert.deepEqual(data,{ command: 'subscribe',
              accounts: [ 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5' ] })
        }
        var _account_info = function(data,ws) {
            console.log("incoming account_info", data)
            delete data.id
            orderlist.mark('account_info')
            assert.deepEqual(data,{ command: 'account_info',
              ident: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5' })
        }
        var _submit = function(data,ws) {
            orderlist.mark('submit')
            var so = new RL.SerializedObject(data.tx_blob).to_json();
            delete so.TxnSignature; // sigs won't match ever
            assert.deepEqual(so, { Flags: 2147483648,
              TransactionType: 'TrustSet',
              Account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              LimitAmount: 
               { value: '10',
                 currency: 'USD',
                 issuer: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' },
              Sequence: 1,
              SigningPubKey: '03BC02F6C0F2C50EF5DB02C2C17062B7449B34FBD669A75362E41348C9FAE3DDE1',
              Fee: '12',
              LastLedgerSequence: 8804624 })
        }
        route.once('subscribe',_subscribe);
        route.once('account_info',_account_info);
        route.once('submit',_submit);
        app.post('/v1/accounts/'+lib.accounts.bob.address+'/trustlines')
        .send({
          "secret": lib.accounts.bob.secret,
          "trustline": {
          "limit": "10",
          "currency": "USD",
          "counterparty": lib.accounts.alice.address,
          "allows_rippling": false
          }
        })
        .end(function(err, resp) {
            inspect(resp.body);
            delete resp.body.ledger;
            delete resp.body.hash;
            assert.deepEqual(resp.body,{ success: true,
              trustline: 
               { account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
                 limit: '10',
                 currency: 'USD',
                 counterparty: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
                 account_allows_rippling: true }})
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done();
        })
    })
    // have alice send bob 10 USD/alice
    it('get path for alice to bob 10USD/alice with trust', function(done) {
        console.log('get path for alice to bob 10usd/alice with trust')
        orderlist.create([
            {command:'ripple_path_find'}
        ]);
        var _ripple_path_find = function (data,ws) {
            console.log("incoming pathfind:", data);
            delete data.id;
            assert.deepEqual(data, { command: 'ripple_path_find',
              source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
              destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
              destination_amount: 
               { value: '10',
                 currency: 'USD',
                 issuer: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' } })
            orderlist.mark('ripple_path_find')
        }
        route.once('ripple_path_find',_ripple_path_find);
        app.get('/v1/accounts/'+lib.accounts.alice.address+'/payments/paths/'+lib.accounts.bob.address+'/10+USD+'+lib.accounts.alice.address)
        .end(function(err, resp) {
            inspect(resp.body)
            assert.deepEqual(resp.body, 
                { success: true,
                  payments: 
                   [ { source_account: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U',
                       source_tag: '',
                       source_amount: { value: '10', currency: 'USD', issuer: '' },
                       source_slippage: '0',
                       destination_account: 'rwmityd4Ss34DBUsRy7Pacv6UA5n7yjfe5',
                       destination_tag: '',
                       destination_amount: 
                        { value: '10',
                          currency: 'USD',
                          issuer: 'rJRLoJSErtNRFnbCyHEUYnRUKNwkVYDM7U' },
                       invoice_id: '',
                       paths: '[]',
                       partial_payment: false,
                       no_direct_ripple: false }
                    ]
                })
            assert.equal(orderlist.test(),true)
            orderlist.reset()
            done()
        })
    })
})
