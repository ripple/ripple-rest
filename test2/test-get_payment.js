var supertest = require('supertest');
var _app = require('../lib/express_app')
var app = supertest(_app)
var assert = require('assert')
var ws = require('ws');
var ee = require('events').EventEmitter;
var lib = require('./fixtures')
var testutils = require('./utils')
var util = require('util');
var inspect = function(item) {
    console.log(util.inspect(item, { showHidden: true, depth: null }))
}

describe('payments', function() {
    this.timeout(0)
    var route = new ee;
    var rippled = new ws.Server({port: 5150});
    var store = {}
    before(function(done) {
        this.timeout(0)
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

        console.log("Connecting remote")
        _app.remote.connect(function() {
            console.log("requesting a manual ledger accept")
            _app.remote.requestLedgerAccept()
        })

    })
    it('Pathfinding:XRP',function(done) {
        // genesis initially gives Alice 429 XRP 
        console.log("genesis initially gives alice 429 XRP")
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
            done()
        })
    })
    it('Posting XRP from genesis to alice',function(done) {
        console.log("Posting payment Genesis to Alice", store.paymentGenesisToAlice)
        // actually post a XRP payment of 429 from genesis to alice
        app.post('/v1/payments')
        .send(store.paymentGenesisToAlice)
        .end(function(err,resp) {
            console.log(resp.status, resp.body)
            assert.strictEqual(resp.body.success, true);
            var keys = Object.keys(lib.nominal_xrp_post_response)
            assert.equal(testutils.hasKeys(resp.body, keys).hasAllKeys,true)
            done()
        })
    })
    it('check amount alice has',function(done) {
        // we check that alice has 429 XRP
        console.log("checking amount alice has") 
        app.get('/v1/accounts/'+lib.accounts.alice.address+'/balances')
        .end(function(err, resp) {
            console.log("Balances of alice", resp.body)
            var balance = resp.body.balances[0]
            assert.equal(balance.value,429)
            done()
        })
    })
    it('Pathfinding: from alice to bob XRP',function(done) {
        // Now alice gives bob 1 drop XRP 
        console.log("Pathfinding from alice to bob for 1 DROP")
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
            done()
        })
    })
    it('send bob 1 drop from Alice', function(done) {
        console.log("sending bob 1 drop from alice")
        // sending bob 1 drop from alice
        // however this should fail since bob, who does not exist on the ledger,
        // is recieving a payment that is too small to be created on the ledger
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
            done()
        })
    })
    it('discover the reserve_base_xrp', function(done) {
        console.log("Discover the rserve_base_xrp")
        app.get('/v1/server')
        .end(function(err, resp) {
            console.log("Discovering reserve_base_xrp", resp.body)
            store.reserve_base_xrp = resp.body.rippled_server_status.validated_ledger.reserve_base_xrp
            done()
        })
    })
    it('Pathfinding: from alice to bob XRP',function(done) {
        // Now alice gives bob exactly the reserve_base_xrp XRP 
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
            done()
        })
    })
    it('send bob reserve_base_xrp XRP from Alice to bob', function(done) {
        // sending bob reserve_base_xrp XRP from alice
        app.post('/v1/payments')
        .send(store.paymentAliceToBob)
        .end(function(err,resp) {
            console.log(resp.status, resp.body)
            assert.deepEqual(resp.body, { 
            success: true,
            client_resource_id: 'foobar26',
            status_url: 'http://127.0.0.1/v1/accounts/'+lib.accounts.alice.address+'/payments/foobar26' })
            store.status_url = '/v1/accounts/'+lib.accounts.alice.address+'/payments/foobar26';
            done()
        })
    })
    // confirm payment via client resource ID
    it('check status url of the reserve_base_xrp transfer from alice to bob', function(done) {
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
            done()
        })
    })
    // confirm payment via transaction hash 
    it('confirm payment via transaction hash', function(done) {
        console.log("payment to confirm:", store.paymentAliceToBob)
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
            done()
        })
    })
    it('check amount bob has',function(done) {
        console.log("checking amount bob has") 
        app.get('/v1/accounts/'+lib.accounts.bob.address+'/balances')
        .end(function(err, resp) {
            console.log("Balances of bob", resp.body)
            var balance = resp.body.balances[0]
// change all instances of 200 with reserve base xrp
    //        assert.equal(balance.value,store.reserve_base_xrp)
            store.bob_balance = balance.value
            done()
        })
    })
    // bob should try to send all money back to alice
    it('try to send all of bobs money to alice below reserve', function(done) {
        console.log("Calling paths for bob back to alice.")
        var sendamount = store.bob_balance;
        app.get('/v1/accounts/'+lib.accounts.bob.address+'/payments/paths/'+lib.accounts.alice.address+'/'+sendamount+'+XRP')
        .end(function(err, resp) {
            inspect(resp.body)
            assert.equal(404, resp.status)
            assert.deepEqual(resp.body, { success: false,
  error_type: 'invalid_request',
  error: 'No paths found',
  message: 'Please ensure that the source_account has sufficient funds to execute the payment. If it does there may be insufficient liquidity in the network to execute this payment right now' })
            done()
        })
    })
/*
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
*/
    // have alice send bob 10 USD/alice
    it('alice sends bob 10USD/alice without trust', function(done) {
        console.log('alice sends bob 10usd/alice without trust')
        app.get('/v1/accounts/'+lib.accounts.alice.address+'/payments/paths/'+lib.accounts.bob.address+'/10+USD+'+lib.accounts.alice.address)
        .end(function(err, resp) {
            inspect(resp.body)
            assert.deepEqual(resp.body, { success: false,
  error_type: 'invalid_request',
  error: 'No paths found',
  message: 'The destination_account does not accept USD, they only accept: XRP' })
            done()
        })
    })

    it('grant a trustline of 10 usd towards alice', function(done) {
        console.log("granting a trustline towards alice from bob")
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
            done()
        })
    })
    after(function(done) {
        console.log("Cleanup: closing down")
        _app.remote.disconnect()
//        rippled.close()
        done()
    })
})
