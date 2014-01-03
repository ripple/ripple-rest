var fixtures = require('./fixtures'),
		Payment = require('../lib/payment'),
		assert = require('assert')
		
var transactions = {
	xrpToXrp: JSON.parse(fixtures['xrpToXrp']),
  IouToSameIou: JSON.parse(fixtures['IouToSameIou']),
  IouToXrp: JSON.parse(fixtures['IouToXrp'])
}

describe('Payment', function() {

  it('should properly format a xrp to xrp payment', function(){
    var payment = new Payment(fixtures['xrpToXrp']);

    assert.equal(payment.toCurrency, 'XRP');
    assert.equal(payment.fromCurrency, 'XRP');
    assert.equal(payment.toAmount, 10);
    assert.equal(payment.fromAmount, 10);
    assert.equal(payment.toAddress, 'rpL9vgUH7NBphD5H3FFqLQDhbtzEELS88n');
    assert.equal(payment.fromAddress, 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB');
    assert.equal(payment.txState, 'tesSUCCESS');
    assert.equal(payment.txHash, '58B02124F7118B5E6E4384CD016DE4DB316C18F8DDC71E9B1001AE787CAC3C7B');

  });

  it('should format a IOU to XRP payment', function(){

    var payment = new Payment(fixtures['IouToXrp']);

    assert.equal(payment.toCurrency, 'XRP');
    assert.equal(payment.fromCurrency, 'EUR');
    assert.equal(payment.toAmount, 100);
    assert.equal(payment.fromAmount, 0.2226444);
    assert.equal(payment.toAddress, 'rpL9vgUH7NBphD5H3FFqLQDhbtzEELS88n');
    assert.equal(payment.fromAddress, 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB');
    assert.equal(payment.txState, 'tesSUCCESS');
    assert.equal(payment.txHash, '238235BE2DDA2F3E044000B7C96CE2ED6703CC0410878E21500E1F87C925C562');
  });

  it('should format an IOU to same IOU payment', function(){
    var payment = new Payment(fixtures['IouToSameIou']);
    payment = payment.toJSON();

    assert.equal(payment.toCurrency, 'XAG');
    assert.equal(payment.fromCurrency, 'XAG');
    assert.equal(payment.toAmount, 1);
    assert.equal(payment.fromAmount, 1.01);
    assert.equal(payment.toAddress, 'rpL9vgUH7NBphD5H3FFqLQDhbtzEELS88n');
    assert.equal(payment.fromAddress, 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB');
    assert.equal(payment.txState, 'tesSUCCESS');
    assert.equal(payment.txHash, '10F868E02B370769F6D9FA4C5D56960D72FF98A6D86A7F56785065E100F3E5BA');
  });

  it.skip('should format an IOU to different IOU payment', function(){
    throw new Error();
  });

  it.skip('should format an XRP to IOU payment', function(){
    throw new Error();
  });
});

