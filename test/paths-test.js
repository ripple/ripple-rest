var assert = require('assert');
var ripple = require('ripple-lib');
var _ = require('lodash');
var testutils = require('./testutils');
var fixtures = require('./fixtures').payments;
var pathFixtures = require('./fixtures').paths;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var requestPath = fixtures.requestPath;
var Payments = require('./../api/payments');

suite('get payment paths', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid source account', function(done) {
    self.app
    .get('/v1/accounts/' + addresses.INVALID + '/payments/paths/' + addresses.VALID + '/100+USD')
    .expect(testutils.checkBody(errors.RESTInvalidAccount))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid destination account', function(done) {
    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.INVALID + '/100+USD')
    .expect(testutils.checkBody(errors.RESTInvalidDestinationAccount))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- missing destination currnecy', function(done) {
    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100')
    .expect(testutils.checkBody(errors.RESTInvalidDestinationAmount))
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid amount currency', function(done) {
    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100-USD')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidDestinationAmount))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid amount issuer', function(done) {
    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.INVALID)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidDestinationAmount))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- XRP amount', function(done) {
    self.wss.once('request_ripple_path_find', function(message, conn) {
      assert.strictEqual(message.command, 'ripple_path_find');
      assert.strictEqual(message.source_account, addresses.VALID);
      assert.strictEqual(message.destination_account, addresses.VALID);
      conn.send(pathFixtures.generateXRPPaymentPaths(message.id, message.source_account, message.destination_account, message.destination_amount));
    });

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+XRP')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) return done(err);

      _.each(res.body.payments, function(paymentObj) {
        assert.strictEqual(paymentObj.source_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_amount.issuer, '');
      });

      done();
    });
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- with non-XRP source amount', function(done) {
    self.wss.once('request_ripple_path_find', function(message, conn) {
      assert.strictEqual(message.command, 'ripple_path_find');
      assert.strictEqual(message.source_account, addresses.VALID);
      assert.strictEqual(message.destination_account, addresses.VALID);
      conn.send(pathFixtures.generateIOUPaymentPaths(message.id, message.source_account, message.destination_account, message.destination_amount));
    });

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+XRP')
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) return done(err);

      assert.strictEqual(res.body.payments[0].source_amount.issuer, addresses.VALID);
      assert.strictEqual(res.body.payments[1].source_amount.issuer, addresses.VALID);
      assert.strictEqual(res.body.payments[2].source_amount.issuer, '');

      _.each(res.body.payments, function(paymentObj) {
        assert.strictEqual(paymentObj.source_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_account, addresses.VALID);
      });

      done();
    });
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- IOU amount', function(done) {
    self.wss.once('request_ripple_path_find', function(message, conn) {
      assert.strictEqual(message.command, 'ripple_path_find');
      assert.strictEqual(message.source_account, addresses.VALID);
      assert.strictEqual(message.destination_account, addresses.VALID);
      conn.send(pathFixtures.generateIOUPaymentPaths(message.id, message.source_account, message.destination_account, message.destination_amount));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.ISSUER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) return done(err);

      _.each(res.body.payments, function(paymentObj) {
        assert.strictEqual(paymentObj.source_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_amount.issuer, addresses.ISSUER);
      });

      done();
    });
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- destination as issuer', function(done) {
    self.wss.once('request_ripple_path_find', function(message, conn) {
      assert.strictEqual(message.command, 'ripple_path_find');
      assert.strictEqual(message.source_account, addresses.VALID);
      assert.strictEqual(message.destination_account, addresses.VALID);
      conn.send(pathFixtures.generateIOUPaymentPaths(message.id, message.source_account, message.destination_account, message.destination_amount));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.VALID)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) return done(err);

      _.each(res.body.payments, function(paymentObj) {
        assert.strictEqual(paymentObj.destination_amount.issuer, addresses.VALID);
      });

      done();
    });
  });
});
