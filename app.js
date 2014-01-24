var express = require('express'),
  app = express(),
  ripple = require('ripple-lib'),
  config = require('./config');

/* Connect to ripple-lib */
var remote = new ripple.Remote(config.remoteOptions);
remote.connect();

remote.on('error', function(err){
  console.log('ripple-lib Remote error: ' + err);
});

remote.once('connect', function(){

  console.log('Connected to ripple-lib');

  /* Initialize controllers */
  var TxCtrl = require('./controllers/txCtrl')(remote),
    NotificationCtrl = require('./controllers/notificationCtrl')(remote),
    PaymentCtrl = require('./controllers/paymentCtrl')(remote);


  /* Express middleware */
  app.use(express.json());
  app.use(express.urlencoded());

  app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });


  /* Server Routes */
  app.get('/api/v1/status', function(req, res){
    if (remote._connected) {
      res.send('connected');
    } else {
      res.send('disconnected');
    }
  });

  /* Ripple Tx Routes */
  app.get('/api/v1/addresses/:address/txs/:tx_hash', TxCtrl.getTx);
  app.post('/api/v1/addresses/:address/txs/', TxCtrl.submitTx);

  /* Notifications */
  app.get('/api/v1/addresses/:address/next_notification', NotificationCtrl.getNextNotification);
  app.get('/api/v1/addresses/:address/next_notification/:prev_tx_hash', NotificationCtrl.getNextNotification);

  /* Payments */
  app.get('/api/v1/addresses/:address/payments/:tx_hash', PaymentCtrl.getPayment);
  app.post('/api/v1/addresses/:address/payments', PaymentCtrl.submitPayment);

  // app.post('/api/v1/addresses/:address/payments/options', PaymentCtrl.paymentOptions);


  var port = process.env.PORT || 5990;
  app.listen(port);
  console.log('Listening on port: ' + port);

});


/* Export for testing purposes */
module.exports = app;
