const ripple     = require('ripple-lib');
const express    = require('express');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const logger     = require('./logger.js');
const config     = require('./config-loader');
const remote     = require('./remote.js');
const router     = require('./router.js');
const errors     = require('./errors.js');

var app = express();

app.remote = remote;
app.set('remote', remote);
app.set('json spaces', 2);
app.disable('x-powered-by');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  next();
});

if (config.get('NODE_ENV') !== 'test') {
  app.use(morgan('dev', { stream: logger.loggerStream }));
}

app.use('/v1', router);
app.use(require('./error-handler'));

module.exports = app;
