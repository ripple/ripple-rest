const ripple     = require('ripple-lib');
const express    = require('express');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const logger     = require('./logger.js');
const config     = require('./config');
const remote     = require('./remote.js');
const router     = require('./router.js');
const errors     = require('./errors.js');
const utils      = require('./utils.js');

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

if (config.get('debug')) {
  app.use(function (req, res, next) {
    logger.logger.info(req.method, req.url, req.body);
    next();
  })
}

app.use('/v'+utils.getApiVersion(), router);
app.use('/', (new express.Router()).get('/', router.generateIndexPage));
app.use(require('./error-handler'));


module.exports = app;
