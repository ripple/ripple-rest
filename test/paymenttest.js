var request = require('request'),
  async = require('async'),
  accounts = require('../accounts.json');

var prev_tx_hash,
  this_tx_hash;

async.series([


  function(callback) {
    request.get({
      url: 'http://localhost:5990/api/v1/status'
    }, function(err, message, res){
      // console.log('GET status... err: ' + err + ' res: ' + res + '\n');
      callback();
    });
  },


  function(callback) {
    request.get({
      url: 'http://localhost:5990/api/v1/addresses/' + accounts[0].address + '/next_notification/'
    }, function(err, message, res){
        console.log('GET next_notification... err: ' + err + ' res: ' + res + '\n');
        prev_tx_hash = JSON.parse(res).notification.tx_hash;
        callback();
      });
  }, 

  function(callback) {

    console.log('POSTing payment from ' + accounts[0].address + ' to ' + accounts[1].address);

    request.post({
      url: 'http://localhost:5990/api/v1/addresses/' + accounts[0].address + '/payments/',
      json: {
        src_address: accounts[0].address,
        dst_address: accounts[1].address,
        dst_amount: {
          value: '1',
          currency: 'XRP'
        },
        secret: accounts[0].secret
      }
    }, function(err, message, res){
      console.log('POST payment... err: ' + err + ' res: ' + JSON.stringify(res) + '\n');
      callback();
    });
  }, 

  // function(callback) {
  //   request.post({
  //     url: 'http://localhost:5990/api/v1/addresses/' + accounts[0].address + '/tx/',
  //     json: {
  //       type: 'payment',
  //       from: accounts[0].address,
  //       to: accounts[1].address,
  //       amount: {
  //         value: '1',
  //         currency: 'XRP'
  //       },
  //       secret: accounts[0].secret
  //     }
  //   }, function(err, message, res){
  //     console.log('POST tx... err: ' + err + ' res: ' + JSON.stringify(res) + '\n');
  //     callback();
  //   });
  // }, 


  function(callback) {
    console.log('Waiting 10 sec before checking next_notification');
    setTimeout(callback, 10000);
  }, 


  function(callback) {
    request.get({
      url: 'http://localhost:5990/api/v1/addresses/' + accounts[0].address + '/next_notification/' + prev_tx_hash
    }, function(err, message, res){
        console.log('GET next_notification... err: ' + err + ' res: ' + res + '\n');
        this_tx_hash = JSON.parse(res).notification.tx_hash;
        callback();
      });
  },


  // function(callback) {
  //   request.get({
  //     url: 'http://localhost:5990/api/v1/addresses/' + accounts[0].address + '/payments/' + this_tx_hash
  //   }, function(err, message, res){
  //     console.log('GET payment... err: ' + err + ' res: ' + res + '\n');
  //   })
  // }

]);
