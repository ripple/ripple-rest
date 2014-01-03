AccountListener = require('../lib/account_listener.js')
Fixtures = require('./fixtures')
Payment = require('../lib/payment')
sinon = require('sinon')
assert = require('assert')


describe('AccountListener', function(){
  it('#connect should listen for account activity', function(){
    listener = new AccountListener({
      accounts: ['r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk']
    }) 

    desiredMessage = '{"command":"subscribe","id":0,"accounts":["r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk"]}'
    
    listener.webSocket.send = sinon.spy()
    listener.connect()
    assert(listener.webSocket.send.calledWith(desiredMessage))
  })

  it('#connect should listen on multiple accounts', function(){
    listener = new AccountListener({
      accounts: [
        'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
        'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB'
      ]
    }) 

    desiredMessage = '{"command":"subscribe","id":0,"accounts":["r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk","rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB"]}'
    
    listener.webSocket.send = sinon.spy()
    listener.connect()
    assert(listener.webSocket.send.calledWith(desiredMessage))
  })

  it('should notify of an incoming payment with an event', function(done){
    listener.on('payment', function(payment){
      assert.equal(payment.fromAddress, 'rHKueQebtVU9cEamhBbMV8AEViqKjXcBcB')
      assert.equal(payment.toCurrency, 'XAG')
      done()
    })

    listener.webSocket.onmessage(Fixtures.IouToSameIou)
  })
})
