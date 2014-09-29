var supertest = require('supertest');
var _app = require('./../lib/express_app');
var app = supertest(_app);
var assert = require('assert');
var ws = require('ws');
var ee = require('events').EventEmitter;
var lib = require('./_fixtures.js');
var inspect = function(item) {
};

var rippled;
var route = new ee;

describe('payments errors and edgecases', function() {

  before(function(done) {

    rippled = new ws.Server({port: 5150});

    route.on('ping', lib.ping);
    route.on('subscribe', lib.subscribe);
    route.on('server_info',lib.server_info);
    route.on('account_info', lib.account_info);
    route.on('ripple_path_find',lib.ripple_path_find);
    route.on('account_lines', lib.account_lines);
    route.on('submit',lib.submit);
    route.on('tx', lib.tx);

    rippled.on('connection', lib.connection.bind({route:route}));

    _app.remote.once('connect', function() {
      _app.remote.getServer().once('ledger_closed', function() {
        // proceed to the tests, api is ready
        done();
      });
    });

    _app.remote._servers = [ ];
    _app.remote.addServer('ws://localhost:5150');
    _app.remote.connect();

  });

  after(function(done) {
    _app.remote.once('disconnect', function() {
      lib.clearInterval();
      rippled.close();
      done();
    });

    _app.remote.disconnect();

  });

  var store = {};

  it('path find populate carol with missing sum',function(done) {
    app.get('/v1/accounts/'+lib.accounts.genesis.address+'/payments/paths/'+lib.accounts.carol.address+'/+XRP')
    .end(function(err, resp) {
        assert.equal(resp.status,400);
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'invalid_request',
          error: 'Invalid parameter: destination_amount',
          message: 'Must be an amount string in the form value+currency+issuer' })
        done()
    })
  })

  it('path find populate carol with missing currency',function(done) {
    app.get('/v1/accounts/'+lib.accounts.genesis.address+'/payments/paths/'+lib.accounts.carol.address+'/400')
    .end(function(err, resp) {
        assert.equal(resp.status,400);
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'invalid_request',
          error: 'Invalid parameter: destination_amount',
          message: 'Must be an amount string in the form value+currency+issuer' })
        done()
    })
  });

  it('path find populate carol with all missing endpoint value',function(done) {
    app.get('/v1/accounts/'+lib.accounts.genesis.address+'/payments/paths/'+lib.accounts.carol.address+'/')
    .end(function(err, resp) {
        assert.equal(resp.status,404);
        done()
    })
  });

  it('path find populate carol with 400',function(done) {
    app.get('/v1/accounts/'+lib.accounts.genesis.address+'/payments/paths/'+lib.accounts.carol.address+'/400+XRP')
    .end(function(err, resp) {
        store.paymentGenesisToCarol = {
            "secret": lib.accounts.genesis.secret,
            "client_resource_id": "asdfg",
            "payment": resp.body.payments[0]
        };
        done();
    })
  });

  it('Posting XRP from genesis to carol',function(done) {
    app.post('/v1/payments')
    .send(store.paymentGenesisToCarol)
    .end(function(err,resp) {
        done();
    })
  });

  // miss the client resource id
  it('path find populate dan with 600',function(done) {
    app.get('/v1/accounts/'+lib.accounts.genesis.address+'/payments/paths/'+lib.accounts.dan.address+'/600+XRP')
    .end(function(err, resp) {
        store.paymentGenesisToDan = {
            "secret": lib.accounts.genesis.secret,
            "payment": resp.body.payments[0]
        };
        done();
    })
  });

  it('Posting XRP from genesis to dan with missing client resource id',function(done) {
    app.post('/v1/payments')
    .send(store.paymentGenesisToDan)
    .end(function(err,resp) {
        assert.deepEqual(resp.body,{ success: false,
              error_type: 'invalid_request',
              error: 'Missing parameter: client_resource_id',
              message: 'All payments must be submitted with a client_resource_id to prevent duplicate payments' })
        done()
    })
  });

  it('Posting XRP from genesis to dan with empty client resource id',function(done) {
    store.paymentGenesisToDan["client_resource_id"] = "";
    app.post('/v1/payments')
    .send(store.paymentGenesisToDan)
    .end(function(err,resp) {
        assert.deepEqual(resp.body, { success: false,
  error_type: 'invalid_request',
  error: 'Missing parameter: client_resource_id',
  message: 'All payments must be submitted with a client_resource_id to prevent duplicate payments' })
        done()
    })
  });

  it('Posting XRP from genesis to dan with valid client resource id',function(done) {
    store.paymentGenesisToDan["client_resource_id"] = "qwerty";
    app.post('/v1/payments')
    .send(store.paymentGenesisToDan)
    .end(function(err,resp) {
        assert.deepEqual(resp.body, { success: true,
          client_resource_id: 'qwerty',
          status_url: 'http://127.0.0.1:5990/v1/accounts/rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh/payments/qwerty' })
        done()
    })
  });

  it('Double posting XRP from genesis to dan with valid client resource id',function(done) {
    store.paymentGenesisToDan["client_resource_id"] = "qwerty";
    app.post('/v1/payments')
    .send(store.paymentGenesisToDan)
    .end(function(err,resp) {
        assert.equal(resp.status, 402)
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'transaction',
          error: 'Duplicate Transaction',
          message: 'A record already exists in the database for a transaction of this type with the same client_resource_id. If this was not an accidental resubmission please submit the transaction again with a unique client_resource_id' })
        done()
    })
  });

  it('post a non-xrp payment without issuer',function(done) {
    app.post('/v1/payments')
    .send({ secret: 'snoPBrXtMeMyMHUVTgbuqAfg1SUTb',
     client_resource_id : '123456',
     payment:
      { source_account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
        source_tag: '',
        source_amount: { value: '600', currency: 'USD', issuer: '' },
        source_slippage: '0',
        destination_account: 'rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V',
        destination_tag: '',
        destination_amount: { value: '600', currency: 'USD', issuer: '' },
        invoice_id: '',
        paths: '[]',
        partial_payment: false,
        no_direct_ripple: false } })
    .end(function(err,resp) {
        assert.equal(resp.status,402)
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'transaction',
          error: 'tecPATH_DRY',
          message: 'Path could not send partial amount. Please ensure that the source_address has sufficient funds (in the source_amount currency, if specified) to execute this transaction.' })
        done()
    })
  });

  // PROBLEM no response, secret approximation takes very long, no response for over 10 seconds
  it.skip('dan grants a trustline of 10 usd towards carol but uses carols address in the accounts setting', function(done) {
    // mocha is NOT overriding the timeout contrary to documentation
    this.timeout(1000);
    app.post('/v1/accounts/'+lib.accounts.carol.address+'/trustlines')
    .send({
      "secret": lib.accounts.dan.secret,
      "trustline": {
      "limit": "10",
      "currency": "USD",
      "counterparty": lib.accounts.carol.address,
      "allows_rippling": false
      }
    })
    .end(function(err, resp) {
        inspect(resp.body);
        done();
    })
  });

  it('dan grants a trustline of 10 usd towards carol and uses correct address in the accounts setting but no secret', function(done) {
    app.post('/v1/accounts/'+lib.accounts.dan.address+'/trustlines')
    .send({
      "secret": '',
      "trustline": {
      "limit": "10",
      "currency": "USD",
      "counterparty": lib.accounts.carol.address,
      "allows_rippling": false
      }
    })
    .end(function(err, resp) {
        inspect(resp.body);
        assert.equal(resp.status, 400)
        assert.deepEqual(resp.body,{ success: false,
          error_type: 'invalid_request',
          error: 'Parameter missing: secret' })
        done();
    })
  });

  // PROBLEM no response, secret approximation takes very long, no response for over 10 seconds
  it.skip('dan grants a trustline of 10 usd towards carol and uses correct address in the accounts setting but incorrect secret', function(done) {
    app.post('/v1/accounts/'+lib.accounts.dan.address+'/trustlines')
    .send({
      "secret": 'asdf',
      "trustline": {
      "limit": "10",
      "currency": "USD",
      "counterparty": lib.accounts.carol.address,
      "allows_rippling": false
      }
    })
    .end(function(err, resp) {
        inspect(resp.body);
        done();
    })
  });

  it('dan grants a trustline of 10 usd towards carol and uses correct address in the accounts setting', function(done) {
    app.post('/v1/accounts/'+lib.accounts.dan.address+'/trustlines')
    .send({
      "secret": lib.accounts.dan.secret,
      "trustline": {
      "limit": "10",
      "currency": "USD",
      "counterparty": lib.accounts.carol.address,
      "allows_rippling": false
      }
    })
    .end(function(err, resp) {
        assert.equal(resp.status,201)
        inspect(resp.body)
        delete resp.body.hash
        delete resp.body.ledger
        assert.deepEqual(resp.body,{ success: true,
          trustline:
           { account: 'rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V',
             limit: '10',
             currency: 'USD',
             counterparty: 'r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ',
             account_allows_rippling: true }
        })
        done();
    })
  });

  it('dan grants an additional trustline of 10 usd towards carol and uses correct address in the accounts setting', function(done) {
    app.post('/v1/accounts/'+lib.accounts.dan.address+'/trustlines')
    .send({
      "secret": lib.accounts.dan.secret,
      "trustline": {
      "limit": "10",
      "currency": "USD",
      "counterparty": lib.accounts.carol.address,
      "allows_rippling": false
      }
    })
    .end(function(err, resp) {
        assert.equal(resp.status,201)
        delete resp.body.hash
        delete resp.body.ledger
        assert.deepEqual(resp.body,{ success: true,
          trustline:
           { account: 'rsE6ZLDkXhSvfJHvSqFPhdazsoMgCEC52V',
             limit: '10',
             currency: 'USD',
             counterparty: 'r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ',
             account_allows_rippling: true },
        });
        done();
    })
  });

  it('get path for carol to dan 10USD/carol with trust', function(done) {
    app.get('/v1/accounts/'+lib.accounts.carol.address+'/payments/paths/'+lib.accounts.dan.address+'/10+USD+'+lib.accounts.carol.address)
    .end(function(err, resp) {
        inspect(resp.body)
        store.paymentCarolToDan = {
            secret: 'asdfkje',
            client_resource_id : 'abc',
            payment: resp.body.payments[0]
        }
        inspect(store.paymentCarolToDan)
        done()
    })
  });

  // PROBLEM, no response for over 10 seconds
  it.skip('Posting 10USD from carol to dan with valid client resource id but incorrect secret',function(done) {
    app.post('/v1/payments')
    .send(store.paymentCarolToDan)
    .end(function(err,resp) {
        done()
    })
  });

  it('Posting 10USD from carol to dan with valid client resource id and correct secret but missing fields on payment object',function(done) {
    store.paymentCarolToDan.secret = lib.accounts.carol.secret;
    store.value = store.paymentCarolToDan.payment.destination_amount.value
    delete store.paymentCarolToDan.payment.destination_amount.value
    app.post('/v1/payments')
    .send(store.paymentCarolToDan)
    .end(function(err,resp) {
        assert.equal(resp.status,400)
        assert.deepEqual(resp.body, { success: false,
          error_type: 'invalid_request',
          error: 'Invalid parameter: destination_amount',
          message: 'Must be a valid Amount object' })
        done()
    })
  });

  it('Posting 10USD from carol to dan with valid client resource id and correct secret but client resource id already used',function(done) {
    store.paymentCarolToDan.payment.destination_amount.value = store.value
    store.paymentCarolToDan.secret = lib.accounts.carol.secret;
    store.client_resource_id = store.paymentCarolToDan.client_resource_id;
    store.paymentCarolToDan.client_resource_id = 'asdfg';
    app.post('/v1/payments')
    .send(store.paymentCarolToDan)
    .end(function(err,resp) {
        done()
    })
  });

  it('Posting 10USD from carol to dan with valid client resource id and correct secret',function(done) {
    store.paymentCarolToDan.payment.destination_amount.value = store.value
    store.paymentCarolToDan.secret = lib.accounts.carol.secret;
    store.paymentCarolToDan.client_resource_id = 'abc'
    app.post('/v1/payments')
    .send(store.paymentCarolToDan)
    .end(function(err,resp) {
        assert.equal(resp.status, 200)
        assert.deepEqual(resp.body,{ success: true,
          client_resource_id: 'abc',
          status_url: 'http://127.0.0.1:5990/v1/accounts/r3YHFNkQRJDPc9aCkRojPLwKVwok3ihgBJ/payments/abc' })
        done()
    })
  })
})
