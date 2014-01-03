WebSocket = require('ws')
EventEmitter = require('events').EventEmitter
Payment = require('./payment')

function AccountListener(options) {
  this.accounts = options.accounts
  this.url = options.url || 'wss://s1.ripple.com' 
  this.webSocket = new WebSocket(this.url)
}

AccountListener.prototype.__proto__ = EventEmitter.prototype

AccountListener.prototype.connect = function() {
  handlers = this.getHandlers()
  try {
    this.webSocket.on('open', handlers.onOpen)
    this.webSocket.on('message', handlers.onMessage)
    this.webSocket.on('close', handlers.onClose)
  } catch(e) {
    delete this.webSocket
    this.webSocket = new WebSocket(this.url)
    this.connect()
  }
  accounts = JSON.stringify(this.accounts)
  this.webSocket.send('{"command":"subscribe","id":0,"accounts":'+accounts+'}')
}


AccountListener.prototype.getHandlers = function(){
  listener = this

  function onOpen() {
    console.log('onOpen')
  }
  function onClose(){
    console.log('onClose');
  }
  function onMessage(data){
    try {
      payment = new Payment(data) 
      listener.emit('payment', payment.toJSON())
    } catch(e) {
      console.log(e)
    }
  }

  return { onOpen: onOpen, onClose: onClose, onMessage: onMessage }
}

module.exports = AccountListener
