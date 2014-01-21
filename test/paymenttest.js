var request = require('request'),
  accounts = require('../accounts.json');


request.post({
  url: 'http://localhost:5990/api/v1/address/' + accounts[0].address + '/tx/',
  json: {
    type: 'payment',
    from: accounts[0].address,
    to: accounts[1].address,
    amount: '1XRP',
    secret: accounts[0].secret
  }
}, function(err, message, res){
  console.log('err: ' + err + ' res: ' + JSON.stringify(res));
});