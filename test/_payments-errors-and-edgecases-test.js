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

    it('populate alice with 429',function(done) {
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
})
