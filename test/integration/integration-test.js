'use strict';
var _ = require('lodash');
var assert = require('assert');
var supertest = require('supertest');
var wallet = require('./wallet');
var fixtures = require('../fixtures');

var PREFIX = '/v1';
var TIMEOUT = 20000;   // how long before each test case times out
var INTERVAL = 2000;   // how long to wait between checks for validated ledger
var API = supertest('http://localhost:5990');


function verifyTransaction(hash, verify, done) {
  API.get(PREFIX + '/transactions/' + hash).end(function(error, response) {
    if (error) {
      done(error);
      return;
    }
    var body = response.res.body;
    if (body && body.transaction && body.transaction.validated === true) {
      verify(body);
      done(null, response);
    } else {
      console.log('NOT VALIDATED YET...');
      setTimeout(_.partial(verifyTransaction, hash, verify, done), INTERVAL);
    }
  });
}

function testTransaction(url, postData, verify, done) {
  var isDELETE = (url.indexOf('orders/') !== -1);
  var method = isDELETE ? API.del : API.post;
  method(url).send(postData).end(function(error, response) {
    console.log('PREPARED...');
    if (error) {
      done(error);
      return;
    }
    var body = response.res.body;
    var hash = body.hash;
    var tx_blob = body.tx_blob;
    API.post(PREFIX + '/transaction/submit').send({
      tx_blob: tx_blob
    }).end(function(_error, _response) {
      console.log('SUBMITTED...');
      if (_error) {
        done(_error);
        return;
      }
      var _body = _response.res.body;
      assert.strictEqual(_body.engine_result, 'tesSUCCESS');
      setTimeout(_.partial(verifyTransaction, hash, verify, done), INTERVAL);
    });
  });
}

function setSecret(fixture) {
  return _.assign({}, fixture, {secret: wallet.getSecret()});
}

function getURL(type, extra) {
  var tail = (extra !== undefined ? '/' + extra : '');
  return PREFIX + '/accounts/' + wallet.getAddress() + '/' + type +
         tail + '?submit=false';
}

function verifyResult(transactionType, body) {
  assert(body && body.transaction);
  assert.strictEqual(body.transaction.Account, wallet.getAddress());
  assert.strictEqual(body.transaction.TransactionType, transactionType);
  assert.strictEqual(body.transaction.meta.TransactionResult, 'tesSUCCESS');
}

suite.skip('integration tests', function() {
  this.timeout(TIMEOUT);

  test('settings', function(done) {
    var postData = setSecret(fixtures.settings.prepareSettingsRequest);
    var verify = _.partial(verifyResult, 'AccountSet');
    testTransaction(getURL('settings'), postData, verify, done);
  });

  test('trustline', function(done) {
    var postData = setSecret(fixtures.trustlines.prepareTrustLineRequest);
    var verify = _.partial(verifyResult, 'TrustSet');
    testTransaction(getURL('trustlines'), postData, verify, done);
  });

  test('payment', function(done) {
    var postData = setSecret(_.omit(fixtures.payments.payment({
      value: '0.000001',
      sourceAccount: wallet.getAddress(),
      destinationAccount: 'rKmBGxocj9Abgy25J51Mk1iqFzW9aVF9Tc'
    }), 'client_resource_id'));
    var verify = _.partial(verifyResult, 'Payment');
    testTransaction(getURL('payments'), postData, verify, done);
  });

  test('order', function(done) {
    var request = fixtures.orders.order({taker_gets: {
      currency: 'XRP',
      value: '0.000001',
      counterparty: ''
    }});
    var postData = setSecret(request);
    var verify = _.partial(verifyResult, 'OfferCreate');
    testTransaction(getURL('orders'), postData, verify, function(err, data) {
      if (err) {
        done(err);
        return;
      }
      var sequence = data.res.body.transaction.Sequence;
      var url = getURL('orders', sequence);
      var _verify = _.partial(verifyResult, 'OfferCancel');
      testTransaction(url, setSecret({}), _verify, done);
    });
  });

  // the 'order' test case already tests order cancellation
  // this is just for cancelling orders if something goes wrong during testing
  test.skip('cancel order', function(done) {
    var sequence = 66;
    var url = getURL('orders', sequence);
    var _verify = _.partial(verifyResult, 'OfferCancel');
    testTransaction(url, setSecret({}), _verify, done);
  });
});

