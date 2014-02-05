var fs = require('fs');
var https = require('https');
var express = require('express'),
  app = express(),
  ripple = require('ripple-lib'),
  config = require('./config.json'),
  OutgoingTx = require('./models/outgoingTx');

var port = process.env.PORT || 5990,
  environment = process.env.NODE_ENV;

/* Connect to ripple-lib */
if (!config.rippled_opts) {
  throw(new Error('config.json must include "rippled_opts" to connect to the Ripple Network'));
}
var remote = new ripple.Remote(config.rippled_opts);
remote.connect();

remote.on('error', function(err){
  console.log('ripple-lib Remote error: ' + err);
});

remote.once('connect', function(){
  console.log('Connected to ripple-lib');
});


/* Initialize controllers */
var TxCtrl = require('./controllers/txCtrl')({
  remote: remote, 
  OutgoingTx: OutgoingTx
}),
NotificationCtrl = require('./controllers/notificationCtrl')({
  remote: remote, 
  OutgoingTx: OutgoingTx,
  port: port,
  environment: environment
}),
PaymentCtrl = require('./controllers/paymentCtrl')({
  remote: remote,
  OutgoingTx: OutgoingTx
}),
PathfindCtrl = require('./controllers/pathfindCtrl')({
  remote: remote
}),
StatusCtrl = require('./controllers/statusCtrl')({
  remote: remote
});






/* Express middleware */
app.use(express.json());
app.use(express.urlencoded());

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

/* Status */
app.get('/', StatusCtrl.getStatus);
app.get('/api/v1/status', StatusCtrl.getStatus);


/* Ripple Txs */
app.get('/api/v1/addresses/:address/txs/:tx_hash', TxCtrl.getTx);
app.post('/api/v1/addresses/:address/txs/', TxCtrl.submitTx);


/* Notifications */
app.get('/api/v1/addresses/:address/next_notification', NotificationCtrl.getNextNotification);
app.get('/api/v1/addresses/:address/next_notification/:prev_tx_hash', NotificationCtrl.getNextNotification);


/* Pathfinding */
app.get('/api/v1/addresses/:address/payments/options', PathfindCtrl.getPathFind);


/* Payments */
app.get('/api/v1/addresses/:address/payments/:tx_hash', PaymentCtrl.getPayment);
app.post('/api/v1/addresses/:address/payments', PaymentCtrl.submitPayment);



var sslOptions = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt')
};

https.createServer(sslOptions, app).listen(port);

console.log('Listening on port ' + port + ' in ' + environment + ' mode');

