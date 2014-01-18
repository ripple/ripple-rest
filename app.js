var express = require('express'),
  app = express(),
  ripple = require('ripple-lib'),
  config = require('./config'),
  TxCtrl = require('./controllers/txCtrl.js');

/* Connect to ripple-lib */
var remote = new ripple.Remote(config.remoteOptions);
remote.connect();

/* Initialize controllers */
var tx = new TxCtrl(remote);

/* Express middleware */
app.use(express.bodyParser());




/* Routes */
app.get('/api/v1/address/:address/tx/:txHash', tx.getTx);
app.get('/api/v1/address/:address/next_notification/:prevTxHash', tx.getNextNotification);

// app.post('/api/v1/address/:address/tx/', tx.submitTx);


app.listen(5990);
console.log('Listening on port: ' + 5990);


/* Export for testing purposes */
module.exports = app;
