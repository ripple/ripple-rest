const ripple      = require('ripple-lib');
const express     = require('express');
const bodyParser  = require('body-parser');
const morgan      = require('morgan');
const logger      = require('./logger.js');
const config      = require('./config-loader');
const remote      = require('./remote.js');
const router      = require('./router.js');
const errors      = require('./errors.js');

var app           = express();
app.remote        = remote;

/* validate the correctness of ripple address params */
function validateAddressParam(param) {
  return function(req, res, next, address) {
    if (ripple.UInt160.is_valid(address)) {
      next();
    } else {
      next(new errors.InvalidRequestError('Specified address is invalid: ' + param));
    }
  };
}

app.use(morgan('dev', {stream: logger.winstonStream}))

app.param('account', validateAddressParam('account'));
app.param('destination_account', validateAddressParam('destination account'));

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/v1', router);
app.use(require('./error-handler'));
app.set('json spaces', 2);

module.exports = app;

