var WebSocket = require('ws'),
    Payment = require('./payment');
var websocketUrl = 'wss://s1.ripple.com';
var rippleAddress = process.env.RIPPLE_ADDRESS;
var request = require('request');
var Coinbase = require('../coinbase-node/lib/coinbase');

var coinbaseClient = new Coinbase.Client({
  api_key: process.env.COINBASE_API_KEY
});

function handlePayment(payment) {
  if (payment.toIssuer == rippleAddress) {
    console.log('issued by this account');
    if (payment.toCurrency == 'BTC') {
      console.log('is BTC');
      if (payment.destinationTag) {
        var tag = payment.destinationTag;
        console.log("look up the bridge for destination tag", tag);
        
        var url = 'https://www.sendthembitcoins.com/api/ripple_bridges/'+tag;
        request.get(url, function(err, resp, body) {
          if (!error && response.statusCode == 200) {
            var bitcoin_address = body.bitcoin_address;
            coinbaseClient.send_money(bitcoin_address, payment.toAmount);
          }
        })
      }
    }
  } else {
    console.log('issued by some other account', payment.toIssuer);
  }
}

function onOpen() {
  console.log('connection opened');
  this.send('{"command":"subscribe","id":0,"accounts":["'+rippleAddress+'"]}');
  console.log('listening for activity for account: '+ rippleAddress);
}

function onMessage(data, flags) {
  var response = JSON.parse(data);
  if (response.type == 'transaction') {
    try {
      var payment = new Payment(data);
      handlePayment(payment);
      console.log(payment.toJSON());
    } catch(e) {
      console.log(e);
    }
  }
}

function onClose() {
  console.log('connection closed');
  delete this;
  connectWebsocket(websocketUrl);
}

function connectWebsocket(url) {
  console.log('connecting to '+url);
  try {
    var ws = new WebSocket(url);
    ws.on('open', onOpen);
    ws.on('message', onMessage);
    ws.on('close', onClose);
  } catch(e) {
    console.log('error connecting', e);
    console.log('trying again...');
    connectWebsocket(url);
  }
}

connectWebsocket(websocketUrl);
