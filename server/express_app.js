const ripple     = require('ripple-lib');
const express    = require('express');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const logger     = require('./logger.js');
const config     = require('../api/lib/config');
const router     = require('./router.js');
const version    = require('./version.js');
const compress   = require('compression');

var app = express();

app.set('json spaces', 2);
app.disable('x-powered-by');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(compress());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
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

app.use('/v' + version.getApiVersion(), router);
app.use('/', (new express.Router()).get('/', router.generateIndexPage));
app.use(require('./error-handler'));


module.exports = app;
