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

describe('get payment paths', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  describe('sending account is not valid', function () {
    it('should not get payment paths', function (done) {
      self.app
        .get('/v1/accounts/' + addresses.INVALID + '/payments/paths/' + addresses.VALID + '/100+USD')
        .expect(testutils.checkStatus(400))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(errors.RESTInvalidAccount))
        .end(done);
    });
  });

  describe('destination account is not valid', function () {
    it ('should not get payment paths', function (done) {
      self.app
        .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.INVALID + '/100+USD')
        .expect(testutils.checkStatus(400))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(errors.RESTInvalidDestinationAccount))
        .end(done);
    });
  });

  describe('destination amount is not valid', function () {
    it ('should not get payment paths with missing destination currency', function (done) {
      self.app
        .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100')
        .expect(testutils.checkStatus(400))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(errors.RESTInvalidDestinationAmount))
        .end(done);
    });

    it ('should not get payment paths with incorrectly formatted amount', function (done) {
      self.app
        .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100-USD')
        .expect(testutils.checkStatus(400))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(errors.RESTInvalidDestinationAmount))
        .end(done);
    });

    it ('should not get payment paths with an invalid destination issuer', function (done) {
      self.app
        .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.INVALID)
        .expect(testutils.checkStatus(400))
        .expect(testutils.checkHeaders)
        .expect(testutils.checkBody(errors.RESTInvalidDestinationAmount))
        .end(done);
    });
  });

  describe ('sending account, destination account, destination amount are all valid', function () {
    describe ('getting paths for XRP destination amount', function () {
      it ('should find that destination amount issuer equals destination account', function (done) {
        self.wss.once('request_ripple_path_find', function (message, conn) {
          conn.send(pathFixtures.generateXRPPaymentPaths(message.source_account, message.destination_account, message.destination_amount));
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
          .end(function (err, res) {
            if (err) return done(err);

            _.each(res.body.payments, function (paymentObj) {
              assert.strictEqual(paymentObj.destination_amount.issuer, addresses.VALID);
            });

            done();
          });
      });
    });

    describe ('getting paths for IOU destination amount', function () {
      it ('should find that destination amount issuer equals provided destination issuer', function (done) {
        self.wss.once('request_ripple_path_find', function (message, conn) {
          conn.send(pathFixtures.generateIOUPaymentPaths(message.source_account, message.destination_account, message.destination_amount));
        });

        self.app
          .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.ISSUER)
          .expect(testutils.checkStatus(200))
          .expect(testutils.checkHeaders)
          .end(function (err, res) {
            if (err) return done(err);

            _.each(res.body.payments, function (paymentObj) {
              assert.strictEqual(paymentObj.destination_amount.issuer, addresses.ISSUER);
            });

            done();
          });
      });

      it ('should find that destination amount issuer equals provided destination issuer when issuer is same as destination account', function (done) {
        self.wss.once('request_ripple_path_find', function (message, conn) {
          conn.send(pathFixtures.generateIOUPaymentPaths(message.source_account, message.destination_account, message.destination_amount));
        });

        self.app
          .get('/v1/accounts/' + addresses.VALID + '/payments/paths/' + addresses.VALID + '/100+USD+' + addresses.VALID)
          .expect(testutils.checkStatus(200))
          .expect(testutils.checkHeaders)
          .end(function (err, res) {
            if (err) return done(err);

            _.each(res.body.payments, function (paymentObj) {
              assert.strictEqual(paymentObj.destination_amount.issuer, addresses.VALID);
            });

            done();
          });
      });
    });
  });
}); 