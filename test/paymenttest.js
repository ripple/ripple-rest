var request = require('request'),
  async = require('async'),
  accounts = require('../accounts.json');

var host = 'http://ripple-simple.herokuapp.com/', 
  prev_tx_hash,
  tx_url;

async.series([


  function(callback) {
    request.get({
      url: host + 'api/v1/status'
    }, function(err, message, res){
      // console.log('GET status... err: ' + err + ' res: ' + res + '\n');
      callback();
    });
  },


  function(callback) {
    request.get({
      url: host + 'api/v1/addresses/' + accounts[0].address + '/next_notification/'
    }, function(err, message, res){
        console.log('GET next_notification... err: ' + err + ' res: ' + res + '\n');
        prev_tx_hash = JSON.parse(res).notification.tx_hash;
        callback();
      });
  }, 

  function(callback) {

    console.log('POSTing payment from ' + accounts[0].address + ' to ' + accounts[1].address);

    request.post({
      url: host + 'api/v1/addresses/' + accounts[1].address + '/payments/',
      json: {
        src_address: accounts[1].address,
        dst_address: accounts[0].address,
        src_amount: {
          value: '.0001',
          currency: 'XRP',
          issuer: ''
        },
        dst_amount: {
          value: '.001',
          currency: 'USD'
        },
        flag_partial_payment: true,
        // flag_no_direct_ripple: true,
        secret: accounts[1].secret
      }
    }, function(err, message, res){
      console.log('POST payment... err: ' + err + ' res: ' + JSON.stringify(res) + '\n');
      callback();
    });
  }, 

  // function(callback) {
  //   request.post({
  //     url: host + 'api/v1/addresses/' + accounts[0].address + '/tx/',
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
      url: host + 'api/v1/addresses/' + accounts[0].address + '/next_notification/' + prev_tx_hash
    }, function(err, message, res){
        console.log('GET next_notification... err: ' + err + ' res: ' + res + '\n');
        tx_url = JSON.parse(res).notification.tx_url;
        callback();
      });
  },


  function(callback) {
    request.get({
      url: tx_url
    }, function(err, message, res){
      console.log('GET payment... err: ' + err + ' res: ' + res + '\n');
    });
  }

]);
