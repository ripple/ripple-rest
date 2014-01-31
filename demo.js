var request = require('request'),
  async = require('async'),
  accounts = require('./accounts.json');

var host = 'http://localhost:5990/', // 'http://ripple-simple.herokuapp.com/', 
  sender = accounts[1].address,
  senderSecret = accounts[1].secret,
  receiver = accounts[0].address,
  prev_tx_hash,
  possiblePayments,
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
      url: host + 'api/v1/addresses/' + sender + '/next_notification/'
    }, function(err, message, res){
        console.log('GET next_notification... err: ' + err + ' res: ' + res + '\n');
        prev_tx_hash = JSON.parse(res).notification.tx_hash;
        callback();
      });
  }, 


  function(callback) {
    console.log('Getting payment options...');
    var start = new Date().getTime();

    request.get({
      url: host + 'api/v1/addresses/' + sender + '/payments/options',
      qs: {
        src_address: sender,
        dst_address: receiver,
        dst_amount: {
          value: '.001',
          currency: 'USD',
          issuer: ''
        }
      }
    }, function(err, message, res){
        var end = new Date().getTime();
        console.log('...took ' + ((end - start) / 1000) + ' seconds');
        
        console.log('GET payment options... err: ' + err + ' res: ' + res + '\n');
        possiblePayments = JSON.parse(res).payments;
        callback();
      });
  },


  function(callback) {

    if (possiblePayments && possiblePayments.length > 0) {

      console.log('POSTing payment from ' + sender + ' to ' + receiver);

      request.post({
        url: host + 'api/v1/addresses/' + sender + '/payments/',
        json: {
          payment: possiblePayments[0],
          secret: senderSecret
        }
      }, function(err, message, res){
        console.log('POST payment... err: ' + err + ' res: ' + JSON.stringify(res) + '\n');
        callback();
      });

    } else {
      console.log('No paths found \n');
      callback(new Error('No paths found'));
      return;
    }
  }, 


  function getNotif(callback) {
    request.get({
      url: host + 'api/v1/addresses/' + sender + '/next_notification/' + prev_tx_hash
    }, function(err, message, res){
        console.log('GET next_notification... err: ' + err + ' res: ' + res + '\n');

        var notification = JSON.parse(res).notification;

        if (notification.type === 'none' || notification.tx_state === 'unexpected') {
          console.log('Waiting 5 sec before checking next_notification...\n');
          setTimeout(function(){
            getNotif(callback);
          }, 5000);
        } else {
          tx_url = JSON.parse(res).notification.tx_url;
          callback();
        } 
        
      });
  },


  function (callback) {
    
    request.get({
      url: tx_url
    }, function(err, message, res){
      console.log('GET payment... err: ' + err + ' res: ' + res + '\n');
    });
  }

]);
