var express = require('express'),
  app = express();

var RippleTxCtrl = require('./controllers/rippletx');

/* Express middleware */
app.use(express.bodyParser());


/* Routes */
app.get('/api/v1/address/:address/tx/:txHash', RippleTxCtrl.getTx);
app.post('/api/v1/address/:address/tx/:secret', RippleTxCtrl.submitTx);



app.listen(5990);
console.log('Listening on port: ' + 5990);