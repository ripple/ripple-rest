/* eslint-disable new-cap */
/* eslint-disable max-len */
'use strict';

var assert = require('assert');
var _ = require('lodash');
var testutils = require('./testutils');
var fixtures = require('./fixtures').payments;
var pathFixtures = require('./fixtures').paths;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;

suite('get payment paths', function() {
  var self = this;

  // self.wss: rippled mock
  // self.app: supertest-enabled REST handler

  setup(testutils.setup.bind(self));
  teardown(testutils.teardown.bind(self));

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid source account', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.INVALID + '/payments/paths/' + addresses.VALID + '/100+USD')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter is not a valid Ripple address: account'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid destination account', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.INVALID + '/100+USD')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Parameter is not a valid Ripple address: destination_account'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- missing destination currency', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Invalid parameter: destination_amount. Must be an amount string in the form value+currency+issuer'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid destination currency format', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100-USD')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Invalid parameter: destination_amount. Must be an amount string in the form value+currency+issuer'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid destination currency issuer', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.INVALID)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Invalid parameter: destination_amount. Must be an amount string in the form value+currency+issuer'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- invalid IOU source currency without issuer', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.VALID + '?source_currencies=test')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Invalid parameter: source_currencies. Must be a list of valid currencies'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- valid IOU source currency with invalid issuer', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.VALID + '?source_currencies=USD+' + addresses.INVALID)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Invalid parameter: source_currencies. Must be a list of valid currencies'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- valid IOU source currency with valid issuer', function(done) {
    self.wss.once('request_ripple_path_find', function(message, conn) {
      assert.strictEqual(message.command, 'ripple_path_find');
      assert.strictEqual(message.source_account, addresses.VALID);
      assert.strictEqual(message.destination_account, addresses.VALID);
      assert.strictEqual(message.source_currencies.length, 1);
      assert.deepEqual(message.source_currencies[0], {
        issuer: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        currency: '0000000000000000000000005553440000000000'
      });

      conn.send(pathFixtures.generateXRPPaymentPaths(message.id, message.source_account, message.destination_account, message.destination_amount));
    });

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.VALID + '?source_currencies=USD+' + addresses.VALID)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- multiple valid IOU source currencies with valid issuer', function(done) {
    self.wss.once('request_ripple_path_find', function(message, conn) {
      assert.strictEqual(message.command, 'ripple_path_find');
      assert.strictEqual(message.source_account, addresses.VALID);
      assert.strictEqual(message.destination_account, addresses.VALID);
      assert.strictEqual(message.source_currencies.length, 2);
      assert.deepEqual(message.source_currencies[0], {
        issuer: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        currency: '0000000000000000000000005553440000000000'
      });
      assert.deepEqual(message.source_currencies[1], {
        issuer: 'r3GgMwvgvP8h4yVWvjH1dPZNvC37TjzBBE',
        currency: '0000000000000000000000004944520000000000'
      });

      conn.send(pathFixtures.generateXRPPaymentPaths(message.id, message.source_account, message.destination_account, message.destination_amount));
    });

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.VALID + '?source_currencies=USD+' + addresses.VALID + ',IDR+' + addresses.VALID)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- mutliple source currencies with invalid last source currency', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.VALID + '?source_currencies=USD+' + addresses.VALID + ',IDR+' + addresses.VALID + ',test')
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Invalid parameter: source_currencies. Must be a list of valid currencies'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- multiple source currencies with invalid last source currency issuer', function(done) {
    self.wss.once('request_ripple_path_find', function() {
      assert(false);
    });

    self.wss.once('request_account_info', function() {
      assert(false);
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.VALID + '?source_currencies=USD+' + addresses.VALID + ',IDR+' + addresses.VALID + ',JPY+' + addresses.INVALID)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTErrorResponse({
      type: 'invalid_request',
      error: 'restINVALID_PARAMETER',
      message: 'Invalid parameter: source_currencies. Must be a list of valid currencies'
    })))
    .end(done);
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- XRP source amount response has source account, destination account, and destination amount issuer correctly set', function(done) {
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
      if (err) {
        return done(err);
      }

      _.each(res.body.payments, function(paymentObj) {
        assert.strictEqual(paymentObj.source_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_amount.issuer, '');
      });

      done();
    });
  });

  // radqi6ppXFxVhJdjzaATRBxdrPcVTf1Ung/payments/paths/rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s/0.0001+0158415500000000C1F76FF6ECB0BAC600000000

  test('/accounts/:account/payments/paths/:destination/:amount -- hex currency gold source amount response has source account, destination account, and destination amount issuer correctly set', function(done) {
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
      .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/0.001+0158415500000000C1F76FF6ECB0BAC600000000')
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        _.each(res.body.payments, function(paymentObj) {
          assert.strictEqual(paymentObj.source_account, addresses.VALID);
          assert.strictEqual(paymentObj.destination_account, addresses.VALID);
          assert.strictEqual(paymentObj.destination_amount.issuer, addresses.VALID);
        });

        done();
      });
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- IOU destination amount response has source amount issuer set to alternative\'s source amount issuer but defaults to source account for all non-XRP source amounts', function(done) {
    self.wss.once('request_ripple_path_find', function(message, conn) {
      assert.strictEqual(message.command, 'ripple_path_find');
      assert.strictEqual(message.source_account, addresses.COUNTERPARTY);
      assert.strictEqual(message.destination_account, addresses.VALID);
      conn.send(pathFixtures.generateIOUPaymentPaths(message.id, message.source_account, message.destination_account, message.destination_amount));
    });

    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.COUNTERPARTY);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.app
    .get('/v1/accounts/' + addresses.COUNTERPARTY + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.ISSUER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }

      assert.strictEqual(res.body.payments[0].source_amount.issuer, '');
      assert.strictEqual(res.body.payments[1].source_amount.issuer, addresses.VALID);
      assert.strictEqual(res.body.payments[2].source_amount.issuer, '');

      _.each(res.body.payments, function(paymentObj) {
        assert.strictEqual(paymentObj.source_account, addresses.COUNTERPARTY);
        assert.strictEqual(paymentObj.destination_account, addresses.VALID);
      });

      done();
    });
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- IOU destination amount has source account, destination account, and destination amount issuer correctly set', function(done) {
    self.wss.once('request_ripple_path_find', function(message, conn) {
      assert.strictEqual(message.command, 'ripple_path_find');
      assert.strictEqual(message.source_account, addresses.VALID);
      assert.strictEqual(message.destination_account, addresses.VALID);
      conn.send(pathFixtures.generateIOUPaymentPaths(
        message.id, message.source_account, message.destination_account,
        message.destination_amount));
    });

    self.app
    .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.ISSUER)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }

      _.each(res.body.payments, function(paymentObj) {
        assert.strictEqual(paymentObj.source_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_account, addresses.VALID);
        assert.strictEqual(paymentObj.destination_amount.issuer, addresses.ISSUER);
      });

      done();
    });
  });

  test('/accounts/:account/payments/paths/:destination/:amount -- IOU destination amount sets destination amount issuer to destination account when they are the same', function(done) {
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
      if (err) {
        return done(err);
      }

      _.each(res.body.payments, function(paymentObj) {
        assert.strictEqual(paymentObj.destination_amount.issuer, addresses.VALID);
      });

      done();
    });
  });
});
